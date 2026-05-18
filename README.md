# SOLO 网页播放器

一个基于 Flask 的本地多媒体播放与管理 Web 应用，支持视频、音频和 Markdown 文档的浏览、播放与分类管理。

## 功能特性

- **媒体播放** — 支持视频（mp4、webm、mkv、mov、avi）和音频（mp3、wav、flac、ogg、aac、m4a）的流式播放，带自定义控制栏（播放/暂停、进度拖拽、音量调节、全屏）
- **Markdown 渲染** — 支持 Markdown 文档的实时渲染，带代码高亮（Pygments）、表格、目录等扩展
- **智能分类** — 基于关键词匹配的分类模板系统，支持多模板切换，自动将文件归入不同类别
- **标签系统** — 可为文件添加或移除自定义标签，通过标签快速筛选文件
- **全文搜索** — 支持按文件名和标签搜索，实时过滤结果
- **类型筛选** — 按视频/音频/文档/全部快速过滤文件列表
- **浏览历史** — 自动记录浏览过的文件，支持快速回溯
- **视觉效果** — 玻璃（Glass）与亚克力（Acrylic）两种毛玻璃风格，带动态粒子背景动画
- **深色模式** — 支持明暗主题切换，设置自动持久化

## 快速开始

### 环境要求

- Python 3.8+
- pip

### 安装与运行

```bash
# 1. 创建虚拟环境（推荐）
python -m venv venv

# Windows 激活
venv\Scripts\activate

# 2. 安装依赖
pip install -r requirements.txt

# 3. 将媒体文件放入 other 目录
# other/
#   ├── 视频文件.mp4
#   ├── 音频文件.mp3
#   └── 文档文件.md

# 4. 启动服务
python app.py
```

启动后访问 **<http://127.0.0.1:5000>** 即可使用。

Windows 用户也可直接双击 `run.bat` 启动。

## 项目结构

```file
├── app.py                  # Flask 后端，提供 REST API 和媒体流式传输
├── requirements.txt        # Python 依赖
├── run.bat                 # Windows 一键启动脚本
├── .gitignore
│
├── templates/
│   └── index.html          # 前端主页面（SPA）
│
├── static/
│   ├── css/
│   │   └── style.css       # 全局样式，含玻璃/亚克力/深色模式主题
│   └── js/
│       ├── app.js          # 前端应用逻辑（文件浏览、播放器、标签管理等）
│       └── bg-animation.js # Canvas 粒子背景动画
│
├── other/                  # 【媒体文件目录】将视频、音频、md 文件放入此处
│
├── class_template/         # 分类模板（JSON 格式）
│   ├── config.json         # 分类配置（关键词频率阈值）
│   ├── default.json        # 默认分类模板
│   └── 通用_详细.json      # 详细分类模板
│
└── tags_data.json          # 标签数据（自动生成）
```

## API 接口

| 方法   | 路径                     | 说明                         |
| ------ | ------------------------ | ---------------------------- |
| GET    | `/`                      | 渲染主页面                   |
| GET    | `/api/files`             | 扫描并返回 all 目录文件列表    |
| GET    | `/api/media/<path>`      | 流式传输媒体文件（支持 Range） |
| GET    | `/api/markdown/<path>`   | 渲染 Markdown 文件为 HTML     |
| GET    | `/api/search?q=<query>`  | 按文件名或标签搜索            |
| GET    | `/api/tags`              | 获取所有标签数据              |
| POST   | `/api/tags`              | 为文件添加标签                |
| DELETE | `/api/tags`              | 删除文件的指定标签            |
| GET    | `/api/classify`          | 获取所有分类模板及分类结果     |
| GET    | `/api/subfolders`        | 按子文件夹归类的文件列表       |

## 分类模板

`class_template/` 目录下的 JSON 文件即为分类模板。每个模板定义若干类别，每个类别对应一组关键词。系统会根据文件名中包含的关键词自动将文件归入匹配度最高的类别（关键词命中最多的类）。

例如 `default.json`:

```json
{
  "音乐": ["歌", "曲", "music", "song", "mp3"],
  "视频": ["视频", "video", "mp4", "录制"],
  "教程": ["教程", "tutorial", "教学", "课程"]
}
```

系统内置两个额外分类视图：

- **`_子文件夹`** — 按文件在 `other/` 下的子目录结构归类
- **`_关键词频率`** — 将出现次数 >= 阈值（默认 3 次）的词自动作为类别

## 技术栈

- **后端**: Python / Flask
- **前端**: 原生 JavaScript（无框架）, HTML5, CSS3
- **Markdown**: `markdown` 库 + `Pygments` 代码高亮
- **视觉效果**: CSS `backdrop-filter` 毛玻璃效果, Canvas 粒子动画
