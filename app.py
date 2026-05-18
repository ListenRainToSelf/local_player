import os
import json
import re
from collections import defaultdict, Counter

from flask import (
    Flask,
    render_template,
    jsonify,
    request,
    Response,
    abort,
)

import markdown
from pygments.formatters import HtmlFormatter

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OTHER_DIR = os.path.join(BASE_DIR, 'other')
CLASS_TEMPLATE_DIR = os.path.join(BASE_DIR, 'class_template')
TAGS_FILE = os.path.join(BASE_DIR, 'tags_data.json')

app = Flask(__name__, static_folder='static', template_folder='templates')

VIDEO_EXTENSIONS = {'.mp4', '.webm', '.avi', '.mkv', '.mov'}
AUDIO_EXTENSIONS = {'.mp3', '.wav', '.flac', '.ogg', '.aac', '.m4a'}
DOC_EXTENSIONS = {'.md'}

SUPPORTED_EXTENSIONS = VIDEO_EXTENSIONS | AUDIO_EXTENSIONS | DOC_EXTENSIONS

MIME_TYPES = {
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.avi': 'video/x-msvideo',
    '.mkv': 'video/x-matroska',
    '.mov': 'video/quicktime',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.flac': 'audio/flac',
    '.ogg': 'audio/ogg',
    '.aac': 'audio/aac',
    '.m4a': 'audio/mp4',
}


def get_file_type(ext):
    ext = ext.lower()
    if ext in VIDEO_EXTENSIONS:
        return 'video'
    elif ext in AUDIO_EXTENSIONS:
        return 'audio'
    elif ext in DOC_EXTENSIONS:
        return 'markdown'
    return 'unknown'


def safe_resolve(base_dir, relative_path):
    full_path = os.path.abspath(os.path.join(base_dir, relative_path))
    real_base = os.path.realpath(base_dir)
    real_path = os.path.realpath(full_path)
    if not real_path.startswith(real_base + os.sep) and real_path != real_base:
        return None
    return real_path


def scan_directory(base_dir):
    files = []
    for root, dirs, filenames in os.walk(base_dir):
        for fn in filenames:
            ext = os.path.splitext(fn)[1].lower()
            if ext not in SUPPORTED_EXTENSIONS:
                continue
            full_path = os.path.join(root, fn)
            rel_path = os.path.relpath(full_path, base_dir).replace(os.sep, '/')
            rel_dir = os.path.dirname(rel_path)
            folder = rel_dir if rel_dir and rel_dir != '.' else ''
            file_type = get_file_type(ext)
            size = os.path.getsize(full_path)
            files.append({
                'filename': fn,
                'path': rel_path,
                'folder': folder,
                'type': file_type,
                'size': size,
                'ext': ext,
            })
    return files


def read_tags():
    if not os.path.exists(TAGS_FILE):
        return {}
    try:
        with open(TAGS_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError):
        return {}


def write_tags(tags):
    os.makedirs(os.path.dirname(TAGS_FILE), exist_ok=True)
    with open(TAGS_FILE, 'w', encoding='utf-8') as f:
        json.dump(tags, f, ensure_ascii=False, indent=2)


def generate_pygments_css():
    return HtmlFormatter(style='default').get_style_defs('.codehilite')


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/api/files')
def api_files():
    all_files = scan_directory(OTHER_DIR)
    return jsonify({'files': all_files, 'total': len(all_files)})


@app.route('/api/media/<path:filepath>')
def api_media(filepath):
    real_path = safe_resolve(OTHER_DIR, filepath)
    if real_path is None:
        abort(403)
    if not os.path.isfile(real_path):
        abort(404)

    ext = os.path.splitext(real_path)[1].lower()
    mime_type = MIME_TYPES.get(ext, 'application/octet-stream')
    file_size = os.path.getsize(real_path)

    range_header = request.headers.get('Range', None)
    if range_header:
        match = re.match(r'bytes=(\d+)-(\d*)', range_header)
        if not match:
            abort(400)
        start = int(match.group(1))
        end = int(match.group(2)) if match.group(2) else file_size - 1
        if start >= file_size or end >= file_size:
            abort(416)
        length = end - start + 1
        with open(real_path, 'rb') as f:
            f.seek(start)
            data = f.read(length)

        response = Response(data, 206, mimetype=mime_type, direct_passthrough=True)
        response.headers.add('Content-Range', f'bytes {start}-{end}/{file_size}')
        response.headers.add('Accept-Ranges', 'bytes')
        response.headers.add('Content-Length', str(length))
        return response

    def generate():
        with open(real_path, 'rb') as f:
            while True:
                chunk = f.read(8192)
                if not chunk:
                    break
                yield chunk

    response = Response(generate(), mimetype=mime_type)
    response.headers.add('Accept-Ranges', 'bytes')
    response.headers.add('Content-Length', str(file_size))
    return response


@app.route('/api/markdown/<path:filepath>')
def api_markdown(filepath):
    real_path = safe_resolve(OTHER_DIR, filepath)
    if real_path is None:
        abort(403)
    if not os.path.isfile(real_path):
        abort(404)
    ext = os.path.splitext(real_path)[1].lower()
    if ext != '.md':
        abort(400)

    with open(real_path, 'r', encoding='utf-8') as f:
        content = f.read()

    extensions = ['fenced_code', 'tables', 'codehilite', 'toc', 'nl2br', 'sane_lists']
    html = markdown.markdown(content, extensions=extensions)

    return jsonify({
        'html': html,
        'filename': os.path.basename(real_path),
    })


@app.route('/api/tags', methods=['GET'])
def api_tags_get():
    tags = read_tags()
    return jsonify({'tags': tags})


@app.route('/api/tags', methods=['POST'])
def api_tags_add():
    data = request.get_json(silent=True)
    if not data:
        abort(400)
    filename = data.get('filename')
    tag = data.get('tag')
    if not filename or not tag:
        abort(400)

    tags = read_tags()
    if filename not in tags:
        tags[filename] = []
    if tag not in tags[filename]:
        tags[filename].append(tag)
    write_tags(tags)
    return jsonify({'status': 'ok'})


@app.route('/api/tags', methods=['DELETE'])
def api_tags_delete():
    data = request.get_json(silent=True)
    if not data:
        abort(400)
    filename = data.get('filename')
    tag = data.get('tag')
    if not filename or not tag:
        abort(400)

    tags = read_tags()
    if filename in tags and tag in tags[filename]:
        tags[filename].remove(tag)
        if not tags[filename]:
            del tags[filename]
    write_tags(tags)
    return jsonify({'status': 'ok'})


@app.route('/api/classify')
def api_classify():
    user_templates = []
    if os.path.isdir(CLASS_TEMPLATE_DIR):
        for fn in sorted(os.listdir(CLASS_TEMPLATE_DIR)):
            if not fn.endswith('.json') or fn == 'config.json':
                continue
            filepath = os.path.join(CLASS_TEMPLATE_DIR, fn)
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    data = json.load(f)
            except (json.JSONDecodeError, IOError):
                continue
            user_templates.append({
                'name': os.path.splitext(fn)[0],
                'categories': list(data.keys()),
                '_data': data,
            })

    all_files = scan_directory(OTHER_DIR)

    classified_by_template = {}

    for tmpl in user_templates:
        tmpl_name = tmpl['name']
        tmpl_classified = defaultdict(list)
        for file_entry in all_files:
            fn_no_ext = os.path.splitext(file_entry['filename'])[0].lower()
            best_category = '\u672a\u5206\u7c7b'
            best_count = 0
            for category, keywords in tmpl['_data'].items():
                match_count = 0
                for kw in keywords:
                    if kw.lower() in fn_no_ext:
                        match_count += 1
                if match_count > best_count:
                    best_count = match_count
                    best_category = category
            tmpl_classified[best_category].append(file_entry['filename'])
        classified_by_template[tmpl_name] = dict(tmpl_classified)

    subfolder_classified = defaultdict(list)
    for f in all_files:
        key = f['folder'] if f['folder'] else '\u6839\u76ee\u5f55'
        subfolder_classified[key].append(f['filename'])
    classified_by_template['_子文件夹'] = dict(subfolder_classified)

    word_counter = Counter()
    file_word_map = defaultdict(list)
    for f in all_files:
        fn_clean = os.path.splitext(f['filename'])[0].lower()
        words = re.findall(r'[\u4e00-\u9fff]{2,}|[a-zA-Z]{2,}', fn_clean)
        for w in words:
            word_counter[w] += 1
            if f['filename'] not in file_word_map[w]:
                file_word_map[w].append(f['filename'])

    freq_classified = {}
    freq_threshold = 2
    config_path = os.path.join(CLASS_TEMPLATE_DIR, 'config.json')
    if os.path.isfile(config_path):
        try:
            with open(config_path, 'r', encoding='utf-8') as f:
                config = json.load(f)
            freq_threshold = config.get('keyword_frequency_threshold', 2)
        except (json.JSONDecodeError, IOError):
            pass

    for word, cnt in word_counter.items():
        if cnt >= freq_threshold:
            freq_classified[word] = list(file_word_map[word])
    classified_by_template['_关键词频率'] = freq_classified

    templates_out = [{'name': t['name'], 'categories': t['categories']} for t in user_templates]
    templates_out.append({'name': '_子文件夹', 'categories': list(subfolder_classified.keys())})
    templates_out.append({'name': '_关键词频率', 'categories': list(freq_classified.keys())})

    return jsonify({
        'templates': templates_out,
        'classified': classified_by_template,
    })


@app.route('/api/search')
def api_search():
    q = request.args.get('q', '').strip()
    if not q:
        return jsonify({'results': []})

    q_lower = q.lower()
    all_files = scan_directory(OTHER_DIR)
    tags = read_tags()

    results = []
    for file_entry in all_files:
        fn = file_entry['filename']
        fn_no_ext = os.path.splitext(fn)[0].lower()
        score = 0
        matched_in = None

        if q_lower in fn_no_ext:
            score = 10
            matched_in = 'filename'

        file_tags = tags.get(fn, [])
        for tag_item in file_tags:
            if q_lower in tag_item.lower():
                score = max(score, 5)
                matched_in = 'tag'

        if score > 0:
            results.append({
                'filename': fn,
                'path': file_entry['path'],
                'type': file_entry['type'],
                'score': score,
                'matched_in': matched_in,
            })

    results.sort(key=lambda x: x['score'], reverse=True)
    return jsonify({'results': results})


@app.route('/api/subfolders')
def api_subfolders():
    all_files = scan_directory(OTHER_DIR)
    folders = defaultdict(list)
    for f in all_files:
        folder_key = f['folder'] if f['folder'] else '根目录'
        folders[folder_key].append(f['filename'])
    return jsonify(dict(folders))


@app.errorhandler(400)
def bad_request(e):
    return jsonify({'error': 'Bad request'}), 400


@app.errorhandler(403)
def forbidden(e):
    return jsonify({'error': 'Forbidden'}), 403


@app.errorhandler(404)
def not_found(e):
    return jsonify({'error': 'Not found'}), 404


@app.errorhandler(416)
def range_not_satisfiable(e):
    return jsonify({'error': 'Range not satisfiable'}), 416


if __name__ == '__main__':
    print('=' * 60)
    print('  SOLO \u7f51\u9875\u64ad\u653e\u5668 \u540e\u7aef\u670d\u52a1')
    print('=' * 60)
    print(f'  \u8bbf\u95ee\u5730\u5740: http://127.0.0.1:5000')
    print(f'  LAN \u8bbf\u95ee: http://0.0.0.0:5000')
    print('=' * 60)
    app.run(host='0.0.0.0', port=5000, debug=True, threaded=True)
