# SOLO 网页播放器

一个基于 Flask 的本地多媒体播放与管理 Web 应用，支持视频、音频和 Markdown 文档的统一浏览、智能分类与沉浸式播放体验。

## 功能特性

### 媒体播放

- **视频播放** — 支持 mp4、webm、mkv、mov、avi 格式的流式传输播放，支持 HTTP Range 请求实现拖动定位
- **音频播放** — 支持 mp3、wav、flac、ogg、aac、m4a 格式，含自定义播放控制条
- **Markdown 渲染** — 实时渲染 Markdown 文档，集成 Pygments 代码高亮，支持 fenced_code、tables、toc 等扩展
- **听视频模式** — 视频可一键切换为纯音频播放模式，隐藏画面仅保留声音

### 智能分类系统

- **关键词分类** — 基于 JSON 模板的分类引擎，根据文件名关键词匹配自动归类，支持多模板切换
- **文件夹分类** — 内置按文件系统目录结构归类视图
- **关键词频率分类** — 自动提取文件名中的高频词汇作为动态分类标签
- **分类阈值可调** — 通过设置面板调整频率分类的灵敏度

### 标签系统

- 为任意文件添加/删除自定义标签
- 通过标签云快速筛选文件
- 标签数据持久化存储（`tags_data.json`）

### 搜索与筛选

- **全文搜索** — 支持按文件名和标签搜索，结果按匹配度排序
- **类型筛选** — 一键筛选视频/音频/文档/全部
- **排序** — 支持按名称 A-Z/Z-A、文件大小升序/降序排列

### 浏览历史

- 自动记录最近 50 条浏览记录
- 支持一键回溯，历史按时间排序

### 沉浸模式

独立的沉浸式全屏界面（`/immersive`），提供无干扰的媒体消费体验：

- **音乐沉浸** — 左侧分类边栏 + 中央歌曲列表 + 底部控制栏，支持 Web Audio API 实时频谱可视化，顺序/随机/单曲循环三种播放模式
- **视频沉浸** — 左侧分类边栏 + 中央全屏视频播放器（支持双击全屏）+ 右侧剧集列表，自动识别剧集编号并排序，支持上一集/下一集导航和 15 秒进退
- **文档沉浸** — 左侧分类边栏 + 中央阅读区（暖灰/月白/墨夜三种主题，字号可调）+ 右侧目录导航，支持书签功能
- **帷幕模式** — 点击音乐封面或双击文档触发全屏帷幕界面，显示时钟、极光背景动画、音频节拍律动响应和媒体控制

### 外部库支持

支持通过 JSON 配置文件链接外部文件夹（如 `E:\视频\`），无需将文件复制到项目目录，外部库文件与本地文件统一管理。

### 剧集识别

智能从文件名中提取剧集编号（支持 `EP01`、`第1集`、`Part 1`、`-01`、`01.` 等多种命名格式），使视频文件按剧集顺序排列。

### 进度保存

后台每隔 5 秒自动保存视频/音频播放进度，下次播放可自动续播。

### 视觉效果

- **Glass 玻璃风格** — 半透明毛玻璃 UI，轻盈通透
- **Acrylic 亚克力风格** — 更厚重的毛玻璃质感，带噪点纹理
- **深色模式** — 完美适配暗光环境，所有主题同步切换
- **粒子背景** — Canvas 动态粒子动画，粒子随鼠标位置产生引力效果，明暗主题下自动适配颜色

## 架构设计

### 整体架构

采用前后端分离的单页应用（SPA）架构：

```
┌─────────────────────┐     REST API      ┌──────────────────┐
│   前端 (浏览器)       │ ◄───────────────► │   后端 (Flask)     │
│  ├─ index.html       │    JSON / Stream  │  ├─ /api/files    │
│  │   (标准模式)       │                   │  ├─ /api/media    │
│  ├─ immersive.html   │                   │  ├─ /api/tags     │
│  │   (沉浸模式)       │                   │  ├─ /api/classify │
│  └─ bg-animation.js  │                   │  ├─ /api/search   │
│     (粒子背景)        │                   │  └─ /api/progress │
└─────────────────────┘                   └──────────────────┘
```

### 双模式前端设计

项目提供两种界面模式，共享同一套后端 API：

1. **标准模式** (`/`) — 侧边栏 + 文件网格 + 详情面板，适合文件浏览与管理
2. **沉浸模式** (`/immersive`) — 全屏浮岛式 UI，分为音乐/视频/文档三个独立面板，带帷幕系统，适合专注消费内容

### 后端模块划分

| 模块 | 文件 | 职责 |
|------|------|------|
| 路由 | `app.py` | Flask 应用，REST API 端点 |
| 文件扫描 | `scan_directory()` / `scan_linked_folders()` | 遍历文件系统收集媒体文件 |
| 安全解析 | `safe_resolve()` / `resolve_link_path()` | 路径安全校验，防止目录穿越攻击 |
| 媒体流式传输 | `/api/media/<path>` | 支持 Range 请求的 HTTP 206 流式传输 |
| Markdown 渲染 | `/api/markdown/<path>` | Python markdown 库 + Pygments 代码高亮 |
| 分类引擎 | `/api/classify` | 关键词匹配 + 子文件夹归类 + 频率分析 |
| 标签管理 | `/api/tags` | CRUD 标签数据（JSON 文件持久化） |
| 配置管理 | `/api/config` / `/api/links` | 读取/写入配置和外部库链接 |
| 剧集解析 | `extract_episode_number()` | 正则提取文件名中的剧集编号 |
| 进度管理 | `/api/progress` | 保存/读取播放进度 |

### 分类引擎工作原理

```
class_template/*.json  ──►  读取关键词模板
         │
         ▼
遍历所有文件，对每个文件名去掉扩展名
         │
         ▼
对每个分类逐一匹配关键词（计数匹配次数）
         │
         ▼
归入匹配次数最多的分类（平局归入"未分类"）
         │
         ▼
内置 _子文件夹 和 _关键词频率 两个额外分类视图
```

## 技术栈

| 层级 | 技术 | 用途 |
|------|------|------|
| **后端** | Python 3 + Flask | Web 服务器与 REST API |
| **前端** | 原生 JavaScript（ES5） | 无框架 SPA，轻量高效 |
| **模板** | Jinja2（Flask 内置） | HTML 模板渲染 |
| **Markdown** | `markdown` + `Pygments` | Markdown 转 HTML + 代码高亮 |
| **CSS** | CSS Custom Properties | 主题系统（glass/acrylic/dark） |
| **动画** | Canvas API + requestAnimationFrame | 粒子背景、频谱可视化 |
| **音频分析** | Web Audio API | 实时频率数据获取与频谱绘制 |
| **存储** | JSON 文件 + localStorage | 标签/配置/历史/书签持久化 |

## 环境要求

- **Python** 3.8 或更高版本
- **pip** 包管理工具
- **操作系统** Windows / macOS / Linux 均可

## 安装部署

### 1. 克隆或下载项目

```bash
git clone <repository-url>
cd SOLO/网页播放器
```

### 2. 创建虚拟环境（强烈推荐）

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS / Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. 安装依赖

```bash
pip install -r requirements.txt
```

依赖清单：`Flask`、`markdown`、`Pygments`

### 4. 准备媒体文件

将媒体文件放入项目根目录下的 `other/` 文件夹：

```
other/
├── 视频/
│   ├── 电影01.mp4
│   └── 教程EP01.mp4
├── 音乐/
│   ├── 歌曲.mp3
│   └── 专辑.flac
└── 笔记/
    └── 学习笔记.md
```

也可以使用外部库功能链接其他目录（见"使用说明 — 设置面板"）。

### 5. 启动服务

```bash
python app.py
```

Windows 用户也可直接双击 `run.bat` 一键启动。

启动后控制台输出：

```
============================================================
  SOLO 网页播放器 后端服务
============================================================
  访问地址: http://127.0.0.1:5000
  LAN 访问: http://0.0.0.0:5000
============================================================
```

在浏览器中打开 **<http://127.0.0.1:5000>** 即可使用。

## 使用说明

### 标准模式

访问 `http://127.0.0.1:5000` 进入标准模式。

**界面布局：**

```
┌──────────┬──────────────────────────────┬────────────┐
│  侧边栏   │        主内容区域              │  详情面板   │
│          │                              │            │
│  分类列表  │  搜索框 + 类型筛选            │ 媒体播放器  │
│  标签云   │  文件网格（卡片视图）          │ Markdown   │
│  浏览历史  │                              │ 文件信息    │
│  风格切换  │                              │ 标签管理    │
│  深色模式  │                              │            │
└──────────┴──────────────────────────────┴────────────┘
```

**基本操作流程：**

1. **浏览文件** — 主内容区以卡片网格展示所有媒体文件，卡片显示文件图标、名称、类型和大小
2. **筛选文件** — 使用顶部类型按钮（全部/视频/音频/文档）或侧边栏分类/标签进行筛选
3. **搜索文件** — 顶部搜索框支持实时搜索，匹配文件名和标签
4. **播放媒体** — 点击文件卡片，右侧详情面板打开，自动播放视频/音频或渲染 Markdown
5. **标签管理** — 在详情面板底部为文件添加或删除自定义标签
6. **视图切换** — 底部切换玻璃/亚克力风格，以及深色/浅色模式

**视频控制：**

- 播放/暂停 — 点击播放按钮或视频画面
- 进度拖动 — 点击或拖拽进度条
- 音量调节 — 悬停音量按钮，滑动音量滑块
- 全屏切换 — 点击全屏按钮或双击视频画面
- 听视频模式 — 点击"听视频"按钮隐藏画面仅保留音频

**Markdown 阅读：**

- 支持代码高亮、表格、引用、图片等标准 Markdown 语法
- 右上角全屏按钮可进入全屏阅读模式

### 沉浸模式

访问 `http://127.0.0.1:5000/immersive` 或点击标准模式侧边栏的"进入沉浸模式"按钮。

**模式切换：**

顶部三个圆点指示器分别代表音乐、视频、文档三种沉浸模式，点击切换。

**音乐沉浸：**

- 左侧分类边栏选择分类
- 中央列表点击歌曲播放
- 底部控制栏显示当前歌曲，支持上一曲/播放暂停/下一曲
- 播放模式切换：顺序播放（↻）/ 随机播放（⇄）/ 单曲循环（1）
- 频谱可视化：底部 Canvas 实时绘制频率条形图
- 封面点击触发帷幕模式

**视频沉浸：**

- 左侧分类边栏 + 中央视频播放器 + 右侧剧集列表
- 支持上下集切换、15 秒快进快退
- 双击视频全屏，全屏时底部控制条自动隐藏（鼠标移动显示）
- 自动播放下一集（可关闭）

**文档沉浸：**

- 左侧分类边栏 + 中央阅读区 + 右侧目录导航
- 阅读区顶部胶囊工具栏：字体缩放、主题切换（暖灰/月白/墨夜）、书签、上下篇导航
- 双击阅读区触发帷幕模式

**帷幕模式：**

全屏极光背景界面，显示实时时钟和媒体信息：

- 音乐：显示歌曲名、播放控制条和进度条
- 视频：全屏播放视频带控制条
- 文档：全屏阅读文档内容

### 设置面板

在标准模式左侧底部点击齿轮图标打开设置面板：

- **关键词频率阈值** — 调整自动分类的灵敏度（值越小分类越细，默认 2）
- **外部库配置** — 添加外部文件夹的绝对路径，每行一个，保存后自动扫描该目录下的媒体文件

示例外部库配置：

```
E:\视频
E:\音乐
D:\纪录片
```

### 分类模板自定义

`class_template/` 目录下的 JSON 文件即为分类模板，可自由添加、修改或删除。

模板格式：

```json
{
  "类别名1": ["关键词1", "关键词2", "关键词3"],
  "类别名2": ["关键词A", "关键词B"]
}
```

系统根据文件名中包含的关键词数量，自动将文件归入匹配最多的类别。可以创建多个模板文件，在界面中随时切换。

## 核心代码示例

### 媒体流式传输（后端）

支持 HTTP Range 请求，实现视频拖动定位：

```python
@app.route('/api/media/<path:filepath>')
def api_media(filepath):
    real_path = safe_resolve(OTHER_DIR, filepath)
    file_size = os.path.getsize(real_path)
    mime_type = MIME_TYPES.get(ext, 'application/octet-stream')

    range_header = request.headers.get('Range')
    if range_header:
        start, end = parse_range(range_header, file_size)
        with open(real_path, 'rb') as f:
            f.seek(start)
            data = f.read(end - start + 1)
        response = Response(data, 206, mimetype=mime_type)
        response.headers.add('Content-Range',
            f'bytes {start}-{end}/{file_size}')
        return response

    return Response(generate(), mimetype=mime_type)
```

### 分类引擎（后端）

基于关键词匹配的智能分类核心逻辑：

```python
def api_classify():
    for file_entry in all_files:
        fn_no_ext = os.path.splitext(file_entry['filename'])[0].lower()
        best_category = '未分类'
        best_count = 0
        for category, keywords in template.items():
            match_count = sum(1 for kw in keywords if kw.lower() in fn_no_ext)
            if match_count > best_count:
                best_count = match_count
                best_category = category
        tmpl_classified[best_category].append(file_entry['filename'])
```

### 剧集编号提取（后端）

自动识别多种剧集命名格式：

```python
def extract_episode_number(filename):
    patterns = [
        (r'[Ee][Pp]?\s*(\d{1,4})', 1),     # EP01, Ep 12
        (r'第\s*(\d{1,4})\s*[集话]', 1),    # 第1集
        (r'[\[\(（](\d{1,2})[\]\)）]', 1),  # [01] (02)
        (r'^(\d{1,4})[-_.\s]', 1),           # 01. 标题
        (r'[-_](\d{1,4})\s*$', 1),           # 标题-01
    ]
    for pattern, group in patterns:
        m = re.search(pattern, filename)
        if m:
            return int(m.group(group))
    return None
```

### 实时频谱可视化（前端）

使用 Web Audio API 实现音频频谱可视化：

```javascript
function setupAudioAnalyser() {
    var AudioContext = window.AudioContext || window.webkitAudioContext;
    state.audioCtx = new AudioContext();
    state.audioAnalyser = state.audioCtx.createAnalyser();
    state.audioAnalyser.fftSize = 256;
    var source = state.audioCtx.createMediaElementSource(IM.musicAudio);
    source.connect(state.audioAnalyser);
    state.audioAnalyser.connect(state.audioCtx.destination);
}

function startMusicWave() {
    var dataArray = new Uint8Array(state.audioAnalyser.frequencyBinCount);
    state.audioAnalyser.getByteFrequencyData(dataArray);
    // 绘制 40 个渐变圆角条形
    for (var i = 0; i < 40; i++) {
        var val = dataArray[Math.floor(i / 40 * dataArray.length)];
        var barH = (val / 255) * h * 0.8;
        // 使用渐变色绘制圆角矩形
        ctx.fillRect(x, h - barH, barW, barH);
    }
}
```

## API 接口完整参考

| 方法 | 路径 | 说明 | 参数 |
|------|------|------|------|
| GET | `/` | 标准模式主页面 | — |
| GET | `/immersive` | 沉浸模式页面 | — |
| GET | `/api/files` | 获取所有媒体文件列表 | — |
| GET | `/api/media/<path>` | 流式传输媒体文件（支持 Range） | 路径 |
| GET | `/api/markdown/<path>` | 渲染 Markdown 为 HTML | 路径 |
| GET | `/api/search?q=` | 搜索文件和标签 | q: 查询关键字 |
| GET | `/api/tags` | 获取所有标签数据 | — |
| POST | `/api/tags` | 添加标签 | `{filename, tag}` |
| DELETE | `/api/tags` | 删除标签 | `{filename, tag}` |
| GET | `/api/classify` | 获取分类模板和分类结果 | — |
| GET | `/api/subfolders` | 按子文件夹归类 | — |
| GET | `/api/episodes` | 获取按剧集排序的视频列表 | — |
| GET | `/api/config` | 获取分类配置 | — |
| POST | `/api/config` | 保存分类配置 | `{keyword_frequency_threshold}` |
| GET | `/api/links` | 获取外部库链接列表 | — |
| POST | `/api/links` | 保存外部库链接 | `["path1", "path2"]` |
| GET | `/api/progress` | 获取所有播放进度 | — |
| POST | `/api/progress` | 保存播放进度 | `{path, currentTime}` |

## 常见问题解决

### 启动后浏览器访问显示空白

检查终端是否有报错信息，确认依赖已安装：

```bash
pip list | findstr Flask
```

### 视频无法播放或只有声音没有画面

- 确认文件格式受支持（mp4、webm、mkv、mov、avi）
- 某些浏览器可能不支持特定编码格式，尝试使用 Chrome 或 Edge
- 大文件首次加载可能需要几秒钟缓冲

### 外部库链接不生效

- 确认 `other/link.json` 中的路径为**绝对路径**且文件夹存在
- 路径中的反斜杠 `\` 需要转义为 `\\` 或使用正斜杠 `/`
- 修改后需要刷新页面重新扫描

### 分类不准确

- 调整分类模板中的关键词，增加更精准的匹配词
- 调整频率阈值，值越小分类越细
- 可以为同一文件添加标签作为补充

### 端口被占用

修改 `app.py` 最后一行的端口号：

```python
app.run(host='0.0.0.0', port=5000, debug=True, threaded=True)
```

## 贡献指南

欢迎提交 Issue 和 Pull Request 来改进项目。

### 开发建议

- 本项目前端使用**原生 JavaScript（ES5 风格）**，未使用任何前端框架，保持代码风格一致
- CSS 使用 CSS 自定义属性（`--variable`）实现主题系统，新增主题时只需定义变量覆盖
- 后端 API 设计保持 RESTful 风格，返回 JSON 格式数据
- 路径处理注意安全性，所有文件访问需通过 `safe_resolve()` 或 `resolve_link_path()` 校验

### 可能的扩展方向

- 为视频/音频添加播放列表管理功能
- 支持更多文件格式（如 PDF、电子书等）
- 添加用户认证系统实现多用户支持
- 集成弹幕评论功能
- 移动端响应式适配优化
- 字幕文件（srt/ass）支持
- 音乐专辑封面自动匹配

## 项目结构

```
├── app.py                      # Flask 后端入口，所有 API 路由
├── requirements.txt            # Python 依赖
├── run.bat                     # Windows 一键启动脚本
├── .gitignore
├── tags_data.json              # 标签数据持久化文件（自动生成）
├── progress_data.json          # 播放进度数据（自动生成）
│
├── templates/
│   ├── index.html              # 标准模式主页面
│   └── immersive.html          # 沉浸模式主页面
│
├── static/
│   ├── css/
│   │   └── style.css           # 全局样式（~2660行），含玻璃/亚克力/沉浸/帷幕主题
│   └── js/
│       ├── app.js              # 标准模式前端逻辑（~1300行）
│       ├── immersive.js        # 沉浸模式前端逻辑（~1150行）
│       └── bg-animation.js     # Canvas 粒子背景动画（~200行）
│
├── other/                      # 媒体文件目录
│   └── link.json               # 外部库链接配置
│
├── class_template/             # 分类模板
│   ├── config.json             # 分类配置（频率阈值）
│   ├── default.json            # 默认 9 类分类模板
│   └── 通用_详细.json          # 详细 9 类分类模板（含大量细分关键词）
│
└── __pycache__/                # Python 缓存（自动生成）
```
