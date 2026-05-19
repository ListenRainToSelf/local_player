function debounce(fn, delay) {
  let timer = null;
  return function (...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

function formatFileSize(bytes) {
  if (bytes == null || isNaN(bytes)) return '未知';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
  return (bytes / 1073741824).toFixed(2) + ' GB';
}

function escapeHTML(str) {
  var div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

function getTypeIconHTML(type) {
  switch (type) {
    case 'video':
      return '<svg viewBox="0 0 32 32" fill="none"><rect x="2" y="4" width="28" height="24" rx="3" stroke="var(--video-color)" stroke-width="1.8" fill="var(--video-color-light)"/><polygon points="12,9 24,16 12,23" fill="var(--video-color)"/></svg>';
    case 'audio':
      return '<svg viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="12" stroke="var(--audio-color)" stroke-width="1.8" fill="var(--audio-color-light)"/><path d="M13 10v12l5 4V14z" fill="var(--audio-color)" opacity="0.7"/><path d="M19 9v14l5-3V12z" fill="var(--audio-color)" opacity="0.5"/></svg>';
    case 'markdown':
      return '<svg viewBox="0 0 32 32" fill="none"><rect x="4" y="2" width="24" height="28" rx="3" stroke="var(--doc-color)" stroke-width="1.8" fill="var(--doc-color-light)"/><path d="M9 10h14M9 16h10M9 22h6" stroke="var(--doc-color)" stroke-width="1.8" stroke-linecap="round"/></svg>';
    default:
      return '<svg viewBox="0 0 32 32" fill="none"><rect x="4" y="2" width="24" height="28" rx="3" stroke="var(--text-muted)" stroke-width="1.8" fill="rgba(0,0,0,0.04)"/><path d="M9 10h14M9 16h10M9 22h6" stroke="var(--text-muted)" stroke-width="1.8" stroke-linecap="round"/></svg>';
  }
}

function getTypeIconSmall(type) {
  switch (type) {
    case 'video':
      return '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><polygon points="4,2 13,8 4,14" fill="currentColor"/></svg>';
    case 'audio':
      return '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 10V6l5-1v7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M11 3v10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
    case 'markdown':
      return '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" stroke-width="1.2"/><path d="M5 6h6M5 9h4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>';
    default:
      return '';
  }
}

function getTypeLabelCN(type) {
  switch (type) {
    case 'video': return '视频';
    case 'audio': return '音频';
    case 'markdown': return '文档';
    default: return type;
  }
}

var state = {
  files: [],
  tags: {},
  classifications: {},
  allTemplates: [],
  currentFile: null,
  currentStyle: 'glass',
  audioOnlyMode: false,
  history: [],
  searchQuery: '',
  activeFilter: null,
  currentTemplate: '',
  highlightedIndex: -1,
  typeFilter: 'all',
  sortBy: 'name-asc',
  darkMode: false,
};

var dom = {};
var currentAudioOnlyVideo = null;

function $(id) {
  return document.getElementById(id);
}

function initDom() {
  dom.searchInput = $('search-input');
  dom.searchClear = $('search-clear');
  dom.fileGrid = $('file-grid');
  dom.emptyState = $('empty-state');
  dom.fileCount = $('file-count');
  dom.activeFilterBadge = $('active-filter-badge');
  dom.detailPanel = $('detail-panel');
  dom.detailTitle = $('detail-title');
  dom.detailPlaceholder = $('detail-placeholder');
  dom.detailClose = $('detail-close');
  dom.mediaArea = $('media-area');
  dom.videoPlayer = $('video-player');
  dom.audioPlayer = $('audio-player');
  dom.audioPlayerContainer = $('audio-player-container');
  dom.audioOnlyArea = $('audio-only-area');
  dom.audioOnlyToggle = $('audio-only-toggle');
  dom.markdownArea = $('markdown-area');
  dom.markdownContent = $('markdown-content');
  dom.fileInfo = $('file-info');
  dom.infoFilename = $('info-filename');
  dom.infoType = $('info-type');
  dom.infoSize = $('info-size');
  dom.tagSection = $('tag-section');
  dom.tagInput = $('tag-input');
  dom.tagAddBtn = $('tag-add-btn');
  dom.tagList = $('tag-list');
  dom.detailError = $('detail-error');
  dom.classifySelect = $('classify-select');
  dom.classifyList = $('classify-list');
  dom.tagCloud = $('tag-cloud');
  dom.historyBtn = $('history-btn');
  dom.historyPanel = $('history-panel');
  dom.historyClose = $('history-close');
  dom.historyList = $('history-list');
  dom.styleToggle = $('style-toggle');
  dom.darkToggle = $('dark-toggle');
  dom.mainContent = $('main-content');
  dom.playerWrapper = $('player-wrapper');
  dom.videoControls = $('video-controls');
  dom.videoPlayBtn = $('video-play-btn');
  dom.videoProgressBar = $('video-progress-bar');
  dom.videoProgressFilled = $('video-progress-filled');
  dom.videoBuffered = $('video-buffered');
  dom.videoProgressThumb = $('video-progress-thumb');
  dom.videoTime = $('video-time');
  dom.videoMuteBtn = $('video-mute-btn');
  dom.videoVolume = $('video-volume');
  dom.videoFullscreenBtn = $('video-fullscreen-btn');
  dom.audioControls = $('audio-controls');
  dom.audioPlayBtn = $('audio-play-btn');
  dom.audioProgressBar = $('audio-progress-bar');
  dom.audioProgressFilled = $('audio-progress-filled');
  dom.audioProgressThumb = $('audio-progress-thumb');
  dom.audioTime = $('audio-time');
  dom.audioMuteBtn = $('audio-mute-btn');
  dom.audioVolume = $('audio-volume');
  dom.typeFilterBar = $('type-filter-bar');
  dom.markdownFullscreenBtn = $('markdown-fullscreen-btn');
  dom.markdownFullscreenClose = $('markdown-fullscreen-close');
  dom.settingsBtn = $('settings-btn');
  dom.settingsOverlay = $('settings-overlay');
  dom.settingsClose = $('settings-close');
  dom.settingsSave = $('settings-save');
  dom.settingThreshold = $('setting-threshold');
  dom.settingLinks = $('setting-links');
  dom.settingsError = $('settings-error');
}

function init() {
  initDom();

  bindVideoControls();
  bindAudioControls();

  var savedStyle = localStorage.getItem('media_player_style');
  if (savedStyle === 'acrylic' || savedStyle === 'glass') {
    state.currentStyle = savedStyle;
  }
  applyStyle(state.currentStyle);

  var savedDark = localStorage.getItem('media_player_dark');
  if (savedDark === 'true') {
    state.darkMode = true;
    document.body.classList.add('dark');
    dom.darkToggle.querySelector('span').textContent = '浅色模式';
  }

  var savedHistory = localStorage.getItem('media_player_history');
  if (savedHistory) {
    try {
      state.history = JSON.parse(savedHistory);
    } catch (e) {
      state.history = [];
    }
  }

  Promise.all([
    fetch('/api/files').catch(function () { return null; }),
    fetch('/api/tags').catch(function () { return null; }),
    fetch('/api/classify').catch(function () { return null; }),
  ]).then(function (responses) {
    return Promise.all(responses.map(function (r) {
      return r ? r.json().catch(function () { return null; }) : null;
    }));
  }).then(function (data) {
    var filesData = data[0];
    var tagsData = data[1];
    var classifyData = data[2];

    if (filesData && filesData.files) {
      state.files = filesData.files;
    } else {
      state.files = [];
    }

    if (tagsData && tagsData.tags) {
      state.tags = tagsData.tags;
    } else {
      state.tags = {};
    }

    if (classifyData) {
      state.allTemplates = classifyData.templates || [];
      state.classifications = classifyData.classified || {};
    } else {
      state.allTemplates = [];
      state.classifications = {};
    }

    renderAll();
  }).catch(function (err) {
    console.error('初始化加载失败:', err);
    state.files = [];
    state.tags = {};
    state.classifications = {};
    state.allTemplates = [];
    renderAll();
  });

  bindEvents();
}

function bindEvents() {
  dom.searchInput.addEventListener('input', debounce(onSearchInput, 300));
  dom.searchInput.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      dom.searchInput.value = '';
      onSearchInput();
    }
  });
  dom.searchClear.addEventListener('click', function () {
    dom.searchInput.value = '';
    onSearchInput();
    dom.searchInput.focus();
  });

  dom.detailClose.addEventListener('click', closeDetailPanel);

  dom.classifySelect.addEventListener('change', function () {
    state.currentTemplate = dom.classifySelect.value;
    renderClassifyList();
    applyClassificationFilter();
  });

  dom.tagAddBtn.addEventListener('click', addTag);
  dom.tagInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      addTag();
    }
  });

  dom.historyBtn.addEventListener('click', toggleHistoryPanel);
  dom.historyClose.addEventListener('click', function () {
    dom.historyPanel.style.display = 'none';
  });

  dom.styleToggle.addEventListener('click', toggleStyle);

  dom.darkToggle.addEventListener('click', function () {
    state.darkMode = !state.darkMode;
    if (state.darkMode) {
      document.body.classList.add('dark');
      dom.darkToggle.querySelector('span').textContent = '浅色模式';
    } else {
      document.body.classList.remove('dark');
      dom.darkToggle.querySelector('span').textContent = '深色模式';
    }
    try {
      localStorage.setItem('media_player_dark', state.darkMode ? 'true' : 'false');
    } catch (e) {}
  });

  dom.audioOnlyToggle.addEventListener('click', function () {
    if (state.audioOnlyMode) {
      exitAudioOnlyMode();
    } else {
      enterAudioOnlyMode();
    }
  });

  bindTypeFilter();
  bindSortBar();

  dom.markdownFullscreenBtn.addEventListener('click', toggleMarkdownFullscreen);
  dom.markdownFullscreenClose.addEventListener('click', toggleMarkdownFullscreen);

  dom.settingsBtn.addEventListener('click', openSettings);
  dom.settingsClose.addEventListener('click', closeSettings);
  dom.settingsOverlay.addEventListener('click', function (e) {
    if (e.target === dom.settingsOverlay) closeSettings();
  });
  dom.settingsSave.addEventListener('click', saveSettings);

  window._immersiveMusicAudio = document.querySelector('#immersive-shell audio');
}

function renderAll() {
  renderFileGrid();
  renderClassifySelect();
  renderClassifyList();
  renderTagCloud();
}

function bindTypeFilter() {
  dom.typeFilterBar.querySelectorAll('.type-filter-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      state.typeFilter = btn.getAttribute('data-type');
      dom.typeFilterBar.querySelectorAll('.type-filter-btn').forEach(function (b) {
        b.classList.remove('active');
      });
      btn.classList.add('active');
      state.searchQuery = '';
      dom.searchInput.value = '';
      dom.searchClear.style.display = 'none';
      renderFileGrid();
    });
  });
}

function bindSortBar() {
  var bar = document.getElementById('sort-bar');
  if (!bar) return;
  bar.querySelectorAll('.sort-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      state.sortBy = btn.getAttribute('data-sort');
      bar.querySelectorAll('.sort-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      renderFileGrid();
    });
  });
}

function sortFiles(files) {
  var sorted = files.slice();
  switch (state.sortBy) {
    case 'name-asc':
      sorted.sort(function (a, b) { return a.filename.localeCompare(b.filename, 'zh-CN'); });
      break;
    case 'name-desc':
      sorted.sort(function (a, b) { return b.filename.localeCompare(a.filename, 'zh-CN'); });
      break;
    case 'size-desc':
      sorted.sort(function (a, b) { return b.size - a.size; });
      break;
    case 'size-asc':
      sorted.sort(function (a, b) { return a.size - b.size; });
      break;
  }
  return sorted;
}

function getFilteredFiles() {
  var files = state.files;

  if (state.typeFilter !== 'all') {
    files = files.filter(function (f) {
      return f.type === state.typeFilter;
    });
  }

  if (state.searchQuery) {
    return files;
  }

  if (state.activeFilter) {
    if (state.activeFilter.type === 'category') {
      var currentClassified = getCurrentClassifications();
      var categoryFiles = currentClassified[state.activeFilter.value] || [];
      files = files.filter(function (f) {
        return categoryFiles.indexOf(f.filename) !== -1;
      });
    } else if (state.activeFilter.type === 'tag') {
      files = files.filter(function (f) {
        var fileTags = state.tags[f.filename] || [];
        return fileTags.indexOf(state.activeFilter.value) !== -1;
      });
    } else if (state.activeFilter.type === 'all') {
      files = files;
    }
  }

  return files;
}

function renderFileGrid() {
  var filteredFiles = getFilteredFiles();
  filteredFiles = sortFiles(filteredFiles);

  dom.fileCount.textContent = filteredFiles.length + ' 个文件';

  if (state.activeFilter) {
    dom.activeFilterBadge.style.display = 'inline-flex';
    dom.activeFilterBadge.textContent = state.activeFilter.value;
    if (state.activeFilter.type === 'category') {
      dom.activeFilterBadge.textContent = '分类: ' + state.activeFilter.value;
    } else if (state.activeFilter.type === 'tag') {
      dom.activeFilterBadge.textContent = '标签: ' + state.activeFilter.value;
    }
    dom.activeFilterBadge.onclick = function () {
      clearFilter();
    };
  } else {
    dom.activeFilterBadge.style.display = 'none';
  }

  if (filteredFiles.length === 0) {
    dom.fileGrid.style.display = 'none';
    dom.emptyState.style.display = 'flex';
  } else {
    dom.fileGrid.style.display = '';
    dom.emptyState.style.display = 'none';

    dom.fileGrid.innerHTML = filteredFiles.map(function (file) {
      var typeLabel = getTypeLabelCN(file.type);
      return '<div class="file-card" data-path="' + escapeHTML(file.path) + '">'
        + '<div class="file-card-icon ' + file.type + '">'
        + getTypeIconHTML(file.type)
        + '</div>'
        + '<div class="file-card-name" title="' + escapeHTML(file.filename) + '">' + escapeHTML(file.filename) + '</div>'
        + '<div class="file-card-meta">'
        + '<span class="file-card-type ' + file.type + '">' + typeLabel + '</span>'
        + '<span>' + formatFileSize(file.size) + '</span>'
        + '</div>'
        + '<div class="file-card-folder">' + (file.folder ? escapeHTML(file.folder) : '') + '</div>'
        + '</div>';
    }).join('');

    var cards = dom.fileGrid.querySelectorAll('.file-card');
    cards.forEach(function (card) {
      card.addEventListener('click', function () {
        var path = card.getAttribute('data-path');
        var file = state.files.find(function (f) { return f.path === path; });
        if (file) {
          selectFile(file);
        }
      });
    });
  }
}

function selectFile(file) {
  state.currentFile = file;
  state.audioOnlyMode = false;
  currentAudioOnlyVideo = null;

  addToHistory(file);

  dom.detailPanel.classList.remove('collapsed');
  dom.detailPlaceholder.style.display = 'none';
  dom.mediaArea.style.display = 'none';
  dom.markdownArea.style.display = 'none';
  dom.fileInfo.style.display = 'flex';
  dom.tagSection.style.display = 'block';
  dom.detailError.style.display = 'none';
  dom.videoPlayer.style.display = 'none';
  dom.audioPlayerContainer.style.display = 'none';
  dom.audioOnlyArea.style.display = 'none';
  dom.playerWrapper.style.display = 'none';
  dom.videoControls.style.display = 'none';
  dom.audioControls.style.display = 'none';
  dom.detailPanel.classList.remove('video-mode');
  dom.videoPlayBtn.classList.remove('playing');
  dom.audioPlayBtn.classList.remove('playing');
  dom.markdownFullscreenBtn.style.display = 'none';
  if (document.fullscreenElement) { document.exitFullscreen(); }
  dom.markdownFullscreenClose.style.display = 'none';

  dom.detailTitle.textContent = file.filename;

  dom.infoFilename.textContent = file.filename;
  dom.infoType.textContent = getTypeLabelCN(file.type) + ' (' + file.ext + ')';
  dom.infoSize.textContent = formatFileSize(file.size);

  dom.videoPlayer.src = '';
  dom.videoPlayer.removeAttribute('src');
  dom.audioPlayer.src = '';
  dom.audioPlayer.removeAttribute('src');

  if (file.type === 'video') {
    dom.mediaArea.style.display = 'block';
    dom.playerWrapper.style.display = 'block';
    dom.videoPlayer.style.display = 'block';
    dom.videoControls.style.display = 'block';
    dom.detailPanel.classList.add('video-mode');
    dom.videoPlayer.src = '/api/media/' + encodeURI(file.path);
    dom.audioOnlyArea.style.display = 'none';
    dom.audioOnlyToggle.textContent = '听视频';
    dom.audioOnlyToggle.style.display = 'block';
  } else if (file.type === 'audio') {
    dom.mediaArea.style.display = 'block';
    dom.playerWrapper.style.display = 'block';
    dom.audioPlayerContainer.style.display = 'flex';
    dom.audioControls.style.display = 'flex';
    dom.audioPlayer.src = '/api/media/' + encodeURI(file.path);
    dom.audioOnlyToggle.style.display = 'none';
  } else if (file.type === 'markdown') {
    dom.markdownArea.style.display = 'block';
    dom.audioOnlyToggle.style.display = 'none';
    dom.markdownFullscreenBtn.style.display = 'flex';
    loadMarkdown(file.path);
  }

  renderFileTags();
  dom.tagInput.value = '';
}

function enterAudioOnlyMode() {
  if (!state.currentFile || state.currentFile.type !== 'video') return;
  state.audioOnlyMode = true;

  var video = dom.videoPlayer;
  video.classList.add('audio-only-hidden');
  dom.videoControls.style.display = 'none';
  dom.audioOnlyArea.style.display = 'flex';
  dom.audioOnlyToggle.textContent = '看视频';
  currentAudioOnlyVideo = video;
}

function exitAudioOnlyMode() {
  state.audioOnlyMode = false;

  if (currentAudioOnlyVideo) {
    currentAudioOnlyVideo.classList.remove('audio-only-hidden');
  }
  dom.videoControls.style.display = 'block';
  dom.audioOnlyArea.style.display = 'none';
  dom.audioOnlyToggle.textContent = '听视频';
  currentAudioOnlyVideo = null;
}

function loadMarkdown(path) {
  dom.markdownContent.innerHTML = '<p style="color:var(--text-muted)">加载中...</p>';
  fetch('/api/markdown/' + encodeURI(path))
    .then(function (resp) {
      if (!resp.ok) throw new Error('加载失败');
      return resp.json();
    })
    .then(function (data) {
      dom.markdownContent.innerHTML = data.html;
    })
    .catch(function (err) {
      dom.markdownContent.innerHTML = '<p style="color:#ef4444">加载文档失败: ' + err.message + '</p>';
    });
}

function closeDetailPanel() {
  dom.detailPanel.classList.add('collapsed');
  dom.videoPlayer.pause();
  dom.videoPlayer.src = '';
  dom.videoPlayer.removeAttribute('src');
  dom.audioPlayer.pause();
  dom.audioPlayer.src = '';
  dom.audioPlayer.removeAttribute('src');
  dom.videoControls.style.display = 'none';
  dom.audioControls.style.display = 'none';
  dom.detailPanel.classList.remove('video-mode');
  dom.markdownFullscreenBtn.style.display = 'none';
  if (document.fullscreenElement) { document.exitFullscreen(); }
  dom.markdownFullscreenClose.style.display = 'none';
  state.currentFile = null;
  state.audioOnlyMode = false;
  currentAudioOnlyVideo = null;
}

function toggleMarkdownFullscreen() {
  var area = dom.markdownArea;
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else if (area.requestFullscreen) {
    area.requestFullscreen();
  }
}

document.addEventListener('fullscreenchange', function () {
  var area = dom.markdownArea;
  if (document.fullscreenElement === area) {
    dom.markdownFullscreenClose.style.display = 'flex';
  } else {
    dom.markdownFullscreenClose.style.display = 'none';
  }
});

function onSearchInput() {
  state.searchQuery = dom.searchInput.value.trim();

  if (state.searchQuery) {
    dom.searchClear.style.display = 'flex';
    performSearch(state.searchQuery);
  } else {
    dom.searchClear.style.display = 'none';
    state.files = [];
    Promise.all([
      fetch('/api/files').catch(function () { return null; }),
    ]).then(function (responses) {
      return Promise.all(responses.map(function (r) {
        return r ? r.json().catch(function () { return null; }) : null;
      }));
    }).then(function (data) {
      if (data[0] && data[0].files) {
        state.files = data[0].files;
      }
      renderFileGrid();
      dom.searchClear.style.display = 'none';
    });
  }
}

function performSearch(query) {
  fetch('/api/search?q=' + encodeURIComponent(query))
    .then(function (resp) {
      if (!resp.ok) throw new Error('搜索失败');
      return resp.json();
    })
    .then(function (data) {
      var results = data.results || [];
      var resultPaths = results.map(function (r) { return r.path; });
      var matchedFiles = state.files.filter(function (f) {
        return resultPaths.indexOf(f.path) !== -1;
      });
      var localFiltered = state.files.filter(function (f) {
        var name = f.filename.toLowerCase();
        var q = query.toLowerCase();
        if (name.indexOf(q) !== -1) return true;
        var fileTags = state.tags[f.filename] || [];
        for (var i = 0; i < fileTags.length; i++) {
          if (fileTags[i].toLowerCase().indexOf(q) !== -1) return true;
        }
        return false;
      });

      var merged = {};
      matchedFiles.forEach(function (f) { merged[f.path] = f; });
      localFiltered.forEach(function (f) { merged[f.path] = f; });

      var displayFiles = Object.values(merged);

      var scoreMap = {};
      results.forEach(function (r) { scoreMap[r.path] = r.score; });
      displayFiles.sort(function (a, b) {
        var sa = scoreMap[a.path] || 0;
        var sb = scoreMap[b.path] || 0;
        return sb - sa;
      });

      displayFiles = sortFiles(displayFiles);

      dom.fileGrid.style.display = '';
      dom.emptyState.style.display = displayFiles.length === 0 ? 'flex' : 'none';
      dom.fileCount.textContent = displayFiles.length + ' 个结果';

      dom.fileGrid.innerHTML = displayFiles.map(function (file) {
        var typeLabel = getTypeLabelCN(file.type);
        return '<div class="file-card" data-path="' + escapeHTML(file.path) + '">'
          + '<div class="file-card-icon ' + file.type + '">'
          + getTypeIconHTML(file.type)
          + '</div>'
          + '<div class="file-card-name" title="' + escapeHTML(file.filename) + '">' + escapeHTML(file.filename) + '</div>'
          + '<div class="file-card-meta">'
          + '<span class="file-card-type ' + file.type + '">' + typeLabel + '</span>'
          + '<span>' + formatFileSize(file.size) + '</span>'
          + '</div>'
          + '<div class="file-card-folder">' + (file.folder ? escapeHTML(file.folder) : '') + '</div>'
          + '</div>';
      }).join('');

      var cards = dom.fileGrid.querySelectorAll('.file-card');
      cards.forEach(function (card) {
        card.addEventListener('click', function () {
          var path = card.getAttribute('data-path');
          var file = state.files.find(function (f) { return f.path === path; });
          if (file) {
            selectFile(file);
          }
        });
      });
    })
    .catch(function () {
      var query = state.searchQuery.toLowerCase();
      var results = state.files.filter(function (f) {
        var name = f.filename.toLowerCase();
        if (name.indexOf(query) !== -1) return true;
        var fileTags = state.tags[f.filename] || [];
        for (var i = 0; i < fileTags.length; i++) {
          if (fileTags[i].toLowerCase().indexOf(query) !== -1) return true;
        }
        return false;
      });

      results = sortFiles(results);

      dom.fileGrid.style.display = '';
      dom.emptyState.style.display = results.length === 0 ? 'flex' : 'none';
      dom.fileCount.textContent = results.length + ' 个结果';

      dom.fileGrid.innerHTML = results.map(function (file) {
        var typeLabel = getTypeLabelCN(file.type);
        return '<div class="file-card" data-path="' + escapeHTML(file.path) + '">'
          + '<div class="file-card-icon ' + file.type + '">'
          + getTypeIconHTML(file.type)
          + '</div>'
          + '<div class="file-card-name" title="' + escapeHTML(file.filename) + '">' + escapeHTML(file.filename) + '</div>'
          + '<div class="file-card-meta">'
          + '<span class="file-card-type ' + file.type + '">' + typeLabel + '</span>'
          + '<span>' + formatFileSize(file.size) + '</span>'
          + '</div>'
          + '<div class="file-card-folder">' + (file.folder ? escapeHTML(file.folder) : '') + '</div>'
          + '</div>';
      }).join('');

      var cards = dom.fileGrid.querySelectorAll('.file-card');
      cards.forEach(function (card) {
        card.addEventListener('click', function () {
          var path = card.getAttribute('data-path');
          var file = state.files.find(function (f) { return f.path === path; });
          if (file) {
            selectFile(file);
          }
        });
      });
    });
}

function renderClassifySelect() {
  dom.classifySelect.innerHTML = '';
  if (state.allTemplates.length === 0) {
    dom.classifySelect.innerHTML = '<option value="" disabled>暂无分类模板</option>';
    return;
  }

  var defaultIdx = 0;
  state.allTemplates.forEach(function (tmpl, idx) {
    if (tmpl.name === 'default') { defaultIdx = idx; }
  });

  if (!state.currentTemplate) {
    state.currentTemplate = state.allTemplates[defaultIdx].name;
  }

  state.allTemplates.forEach(function (tmpl) {
    var selected = state.currentTemplate === tmpl.name ? ' selected' : '';
    dom.classifySelect.innerHTML += '<option value="' + escapeHTML(tmpl.name) + '"' + selected + '>' + escapeHTML(tmpl.name) + '</option>';
  });
}

function getCurrentClassifications() {
  if (!state.currentTemplate) {
    var firstKey = Object.keys(state.classifications)[0];
    if (firstKey) {
      return state.classifications[firstKey] || {};
    }
    return {};
  }
  return state.classifications[state.currentTemplate] || {};
}

function renderClassifyList() {
  var classified = getCurrentClassifications();
  var categories = Object.keys(classified).sort(function (a, b) {
    if (a === '未分类') return 1;
    if (b === '未分类') return -1;
    return a.localeCompare(b, 'zh-CN');
  });

  dom.classifyList.innerHTML = '';

  var allItem = document.createElement('div');
  allItem.className = 'classify-item' + (!state.activeFilter || state.activeFilter.type !== 'category' ? ' active' : '');
  allItem.innerHTML = '<span>全部</span><span class="classify-count">' + state.files.length + '</span>';
  allItem.addEventListener('click', function () {
    state.activeFilter = null;
    state.searchQuery = '';
    dom.searchInput.value = '';
    dom.searchClear.style.display = 'none';
    updateClassificationActive();
    renderFileGrid();
  });
  dom.classifyList.appendChild(allItem);

  categories.forEach(function (cat) {
    var count = (classified[cat] || []).length;
    if (count === 0) return;
    var item = document.createElement('div');
    item.className = 'classify-item';
    var isActive = state.activeFilter && state.activeFilter.type === 'category' && state.activeFilter.value === cat;
    if (isActive) item.classList.add('active');
    item.innerHTML = '<span>' + escapeHTML(cat) + '</span><span class="classify-count">' + count + '</span>';
    item.addEventListener('click', function () {
      state.activeFilter = { type: 'category', value: cat };
      state.searchQuery = '';
      dom.searchInput.value = '';
      dom.searchClear.style.display = 'none';
      updateClassificationActive();
      renderFileGrid();
    });
    dom.classifyList.appendChild(item);
  });
}

function updateClassificationActive() {
  var items = dom.classifyList.querySelectorAll('.classify-item');
  items.forEach(function (item) {
    item.classList.remove('active');
    if (!state.activeFilter && item.firstChild.textContent === '全部') {
      item.classList.add('active');
    }
    if (state.activeFilter && state.activeFilter.type === 'category') {
      if (item.firstChild.textContent === state.activeFilter.value) {
        item.classList.add('active');
      }
    }
  });
}

function applyClassificationFilter() {
  state.activeFilter = null;
  state.searchQuery = '';
  dom.searchInput.value = '';
  dom.searchClear.style.display = 'none';
  renderClassifyList();
  renderFileGrid();
}

function renderTagCloud() {
  var allTags = {};
  Object.keys(state.tags).forEach(function (filename) {
    var tags = state.tags[filename] || [];
    tags.forEach(function (tag) {
      allTags[tag] = (allTags[tag] || 0) + 1;
    });
  });

  var tagEntries = Object.entries(allTags).sort(function (a, b) {
    return b[1] - a[1];
  });

  if (tagEntries.length === 0) {
    dom.tagCloud.innerHTML = '<span style="font-size:12px;color:var(--text-muted);">暂无标签</span>';
    return;
  }

  dom.tagCloud.innerHTML = tagEntries.map(function (entry) {
    var tag = entry[0];
    var count = entry[1];
    var isActive = state.activeFilter && state.activeFilter.type === 'tag' && state.activeFilter.value === tag;
    return '<span class="tag-pill' + (isActive ? ' active' : '') + '" data-tag="' + escapeHTML(tag) + '">'
      + escapeHTML(tag)
      + '<span class="tag-count">' + count + '</span>'
      + '</span>';
  }).join('');

  dom.tagCloud.querySelectorAll('.tag-pill').forEach(function (pill) {
    pill.addEventListener('click', function () {
      var tag = pill.getAttribute('data-tag');
      if (state.activeFilter && state.activeFilter.type === 'tag' && state.activeFilter.value === tag) {
        state.activeFilter = null;
      } else {
        state.activeFilter = { type: 'tag', value: tag };
      }
      state.searchQuery = '';
      dom.searchInput.value = '';
      dom.searchClear.style.display = 'none';
      renderFileGrid();
      renderTagCloud();
    });
  });
}

function renderFileTags() {
  if (!state.currentFile) return;

  var tags = state.tags[state.currentFile.filename] || [];
  dom.tagList.innerHTML = '';

  if (tags.length === 0) {
    dom.tagList.innerHTML = '<span style="font-size:12px;color:var(--text-muted);">暂无标签</span>';
    return;
  }

  tags.forEach(function (tag) {
    var tagEl = document.createElement('span');
    tagEl.className = 'tag-item';
    tagEl.innerHTML = escapeHTML(tag)
      + '<button class="tag-remove" data-tag="' + escapeHTML(tag) + '">'
      + '<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>'
      + '</button>';
    dom.tagList.appendChild(tagEl);
  });

  dom.tagList.querySelectorAll('.tag-remove').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      removeTag(btn.getAttribute('data-tag'));
    });
  });
}

function addTag() {
  if (!state.currentFile) return;
  var tagValue = dom.tagInput.value.trim();
  if (!tagValue) return;

  var filename = state.currentFile.filename;

  fetch('/api/tags', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename: filename, tag: tagValue }),
  })
    .then(function (resp) {
      if (!resp.ok) throw new Error('添加标签失败');
      return resp.json();
    })
    .then(function () {
      if (!state.tags[filename]) {
        state.tags[filename] = [];
      }
      if (state.tags[filename].indexOf(tagValue) === -1) {
        state.tags[filename].push(tagValue);
      }
      dom.tagInput.value = '';
      renderFileTags();
      renderTagCloud();
    })
    .catch(function (err) {
      dom.detailError.style.display = 'block';
      dom.detailError.textContent = err.message;
      setTimeout(function () {
        dom.detailError.style.display = 'none';
      }, 3000);
    });
}

function removeTag(tag) {
  if (!state.currentFile) return;
  var filename = state.currentFile.filename;

  fetch('/api/tags', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename: filename, tag: tag }),
  })
    .then(function (resp) {
      if (!resp.ok) throw new Error('删除标签失败');
      return resp.json();
    })
    .then(function () {
      if (state.tags[filename]) {
        var idx = state.tags[filename].indexOf(tag);
        if (idx !== -1) {
          state.tags[filename].splice(idx, 1);
        }
        if (state.tags[filename].length === 0) {
          delete state.tags[filename];
        }
      }
      renderFileTags();
      renderTagCloud();
    })
    .catch(function (err) {
      dom.detailError.style.display = 'block';
      dom.detailError.textContent = err.message;
      setTimeout(function () {
        dom.detailError.style.display = 'none';
      }, 3000);
    });
}

function addToHistory(file) {
  var idx = -1;
  for (var i = 0; i < state.history.length; i++) {
    if (state.history[i].path === file.path) {
      idx = i;
      break;
    }
  }
  if (idx !== -1) {
    state.history.splice(idx, 1);
  }

  state.history.unshift({
    filename: file.filename,
    path: file.path,
    type: file.type,
    timestamp: Date.now(),
  });

  if (state.history.length > 50) {
    state.history = state.history.slice(0, 50);
  }

  try {
    localStorage.setItem('media_player_history', JSON.stringify(state.history));
  } catch (e) {}
}

function toggleHistoryPanel() {
  if (dom.historyPanel.style.display === 'none') {
    renderHistory();
    dom.historyPanel.style.display = 'block';
  } else {
    dom.historyPanel.style.display = 'none';
  }
}

function renderHistory() {
  if (state.history.length === 0) {
    dom.historyList.innerHTML = '<div style="padding:16px 20px;font-size:12px;color:var(--text-muted);">暂无浏览记录</div>';
    return;
  }

  dom.historyList.innerHTML = state.history.map(function (item) {
    var typeLabel = getTypeLabelCN(item.type);
    var timeStr = formatTime(item.timestamp);
    return '<div class="history-item" data-path="' + escapeHTML(item.path) + '">'
      + '<div class="history-icon ' + item.type + '">' + getTypeIconSmall(item.type) + '</div>'
      + '<span class="history-name" title="' + escapeHTML(item.filename) + '">' + escapeHTML(item.filename) + '</span>'
      + '<span class="history-time">' + timeStr + '</span>'
      + '</div>';
  }).join('');

  dom.historyList.querySelectorAll('.history-item').forEach(function (item) {
    item.addEventListener('click', function () {
      var path = item.getAttribute('data-path');
      var file = state.files.find(function (f) { return f.path === path; });
      if (file) {
        selectFile(file);
        dom.historyPanel.style.display = 'none';
      }
    });
  });
}

function formatTime(timestamp) {
  var now = Date.now();
  var diff = now - timestamp;
  if (diff < 60000) return '刚刚';
  if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前';
  if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前';
  var d = new Date(timestamp);
  var month = d.getMonth() + 1;
  var day = d.getDate();
  return month + '/' + day;
}

function toggleStyle() {
  var nextStyle = state.currentStyle === 'glass' ? 'acrylic' : 'glass';
  state.currentStyle = nextStyle;
  applyStyle(nextStyle);
  try {
    localStorage.setItem('media_player_style', nextStyle);
  } catch (e) {}
}

function applyStyle(style) {
  document.body.classList.remove('glass', 'acrylic');
  document.body.classList.add(style);
  state.currentStyle = style;
}

function clearFilter() {
  state.activeFilter = null;
  state.searchQuery = '';
  dom.searchInput.value = '';
  dom.searchClear.style.display = 'none';
  dom.activeFilterBadge.style.display = 'none';
  updateClassificationActive();
  renderTagCloud();
  renderFileGrid();
}

function formatTimeDisplay(seconds) {
  if (isNaN(seconds)) return '0:00';
  var m = Math.floor(seconds / 60);
  var s = Math.floor(seconds % 60);
  return m + ':' + (s < 10 ? '0' : '') + s;
}

function bindVideoControls() {
  var video = dom.videoPlayer;

  dom.videoPlayBtn.addEventListener('click', function () {
    if (video.paused) { video.play(); } else { video.pause(); }
  });

  video.addEventListener('play', function () {
    dom.videoPlayBtn.classList.add('playing');
  });
  video.addEventListener('pause', function () {
    dom.videoPlayBtn.classList.remove('playing');
  });
  video.addEventListener('ended', function () {
    dom.videoPlayBtn.classList.remove('playing');
  });

  dom.videoProgressBar.addEventListener('click', function (e) {
    var rect = dom.videoProgressBar.getBoundingClientRect();
    var pct = (e.clientX - rect.left) / rect.width;
    video.currentTime = pct * video.duration;
  });

  var draggingVideoProgress = false;
  dom.videoProgressBar.addEventListener('mousedown', function (e) {
    draggingVideoProgress = true;
    var rect = dom.videoProgressBar.getBoundingClientRect();
    var pct = (e.clientX - rect.left) / rect.width;
    video.currentTime = pct * video.duration;
  });
  document.addEventListener('mousemove', function (e) {
    if (draggingVideoProgress) {
      var rect = dom.videoProgressBar.getBoundingClientRect();
      var pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      video.currentTime = pct * video.duration;
    }
  });
  document.addEventListener('mouseup', function () { draggingVideoProgress = false; });

  video.addEventListener('timeupdate', function () {
    if (video.duration) {
      var pct = (video.currentTime / video.duration) * 100;
      dom.videoProgressFilled.style.width = pct + '%';
      dom.videoProgressThumb.style.left = pct + '%';
      dom.videoTime.textContent = formatTimeDisplay(video.currentTime) + ' / ' + formatTimeDisplay(video.duration);
    }
  });

  video.addEventListener('progress', function () {
    if (video.buffered.length > 0) {
      var bufEnd = video.buffered.end(video.buffered.length - 1);
      if (video.duration) {
        dom.videoBuffered.style.width = (bufEnd / video.duration) * 100 + '%';
      }
    }
  });

  video.addEventListener('loadedmetadata', function () {
    dom.videoTime.textContent = '0:00 / ' + formatTimeDisplay(video.duration);
  });

  dom.videoMuteBtn.addEventListener('click', function () {
    video.muted = !video.muted;
    updateVideoMuteUI();
  });
  video.addEventListener('volumechange', updateVideoMuteUI);
  function updateVideoMuteUI() {
    var muted = video.muted || video.volume === 0;
    dom.videoMuteBtn.classList.toggle('muted', muted);
    dom.videoVolume.value = video.muted ? 0 : video.volume;
  }

  dom.videoVolume.addEventListener('input', function () {
    video.volume = parseFloat(dom.videoVolume.value);
    video.muted = video.volume === 0;
    updateVideoMuteUI();
  });

  dom.videoFullscreenBtn.addEventListener('click', function () {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else if (dom.playerWrapper.requestFullscreen) {
      dom.playerWrapper.requestFullscreen();
    }
  });

  video.addEventListener('click', function () {
    if (video.paused) { video.play(); } else { video.pause(); }
  });

  video.addEventListener('dblclick', function () {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else if (dom.playerWrapper.requestFullscreen) {
      dom.playerWrapper.requestFullscreen();
    }
  });

  document.addEventListener('fullscreenchange', function () {
    if (document.fullscreenElement) {
      dom.playerWrapper.style.display = 'flex';
      dom.playerWrapper.style.flexDirection = 'column';
    } else {
      dom.playerWrapper.style.display = '';
      dom.playerWrapper.style.flexDirection = '';
    }
  });
}

function bindAudioControls() {
  var audio = dom.audioPlayer;

  dom.audioPlayBtn.addEventListener('click', function () {
    if (audio.paused) { audio.play(); } else { audio.pause(); }
  });

  audio.addEventListener('play', function () {
    dom.audioPlayBtn.classList.add('playing');
  });
  audio.addEventListener('pause', function () {
    dom.audioPlayBtn.classList.remove('playing');
  });
  audio.addEventListener('ended', function () {
    dom.audioPlayBtn.classList.remove('playing');
  });

  dom.audioProgressBar.addEventListener('click', function (e) {
    var rect = dom.audioProgressBar.getBoundingClientRect();
    var pct = (e.clientX - rect.left) / rect.width;
    audio.currentTime = pct * audio.duration;
  });

  var draggingAudioProgress = false;
  dom.audioProgressBar.addEventListener('mousedown', function (e) {
    draggingAudioProgress = true;
    var rect = dom.audioProgressBar.getBoundingClientRect();
    var pct = (e.clientX - rect.left) / rect.width;
    audio.currentTime = pct * audio.duration;
  });
  document.addEventListener('mousemove', function (e) {
    if (draggingAudioProgress) {
      var rect = dom.audioProgressBar.getBoundingClientRect();
      var pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      audio.currentTime = pct * audio.duration;
    }
  });
  document.addEventListener('mouseup', function () { draggingAudioProgress = false; });

  audio.addEventListener('timeupdate', function () {
    if (audio.duration) {
      var pct = (audio.currentTime / audio.duration) * 100;
      dom.audioProgressFilled.style.width = pct + '%';
      dom.audioTime.textContent = formatTimeDisplay(audio.currentTime) + ' / ' + formatTimeDisplay(audio.duration);
    }
  });

  audio.addEventListener('loadedmetadata', function () {
    dom.audioTime.textContent = '0:00 / ' + formatTimeDisplay(audio.duration);
  });

  dom.audioMuteBtn.addEventListener('click', function () {
    audio.muted = !audio.muted;
    updateAudioMuteUI();
  });
  audio.addEventListener('volumechange', updateAudioMuteUI);
  function updateAudioMuteUI() {
    var muted = audio.muted || audio.volume === 0;
    dom.audioMuteBtn.classList.toggle('muted', muted);
    dom.audioVolume.value = audio.muted ? 0 : audio.volume;
  }

  dom.audioVolume.addEventListener('input', function () {
    audio.volume = parseFloat(dom.audioVolume.value);
    audio.muted = audio.volume === 0;
    updateAudioMuteUI();
  });
}

function openSettings() {
  fetch('/api/config').then(function (r) { return r.json(); }).then(function (cfg) {
    dom.settingThreshold.value = cfg.keyword_frequency_threshold || 2;
  }).catch(function () {});
  fetch('/api/links').then(function (r) { return r.json(); }).then(function (links) {
    dom.settingLinks.value = (links || []).join('\n');
  }).catch(function () {});
  dom.settingsOverlay.style.display = 'flex';
  dom.settingsError.style.display = 'none';
}

function closeSettings() {
  dom.settingsOverlay.style.display = 'none';
}

function saveSettings() {
  var threshold = parseInt(dom.settingThreshold.value, 10);
  if (isNaN(threshold) || threshold < 1) {
    dom.settingsError.style.display = 'block';
    dom.settingsError.textContent = '阈值必须为 ≥ 1 的整数';
    return;
  }

  var linksRaw = dom.settingLinks.value.trim();
  var links = linksRaw ? linksRaw.split('\n').map(function (l) { return l.trim(); }).filter(function (l) { return l; }) : [];

  var configData = { keyword_frequency_threshold: threshold };

  fetch('/api/config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(configData),
  }).then(function (resp) {
    if (!resp.ok) throw new Error('保存配置失败');
    return fetch('/api/links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(links),
    });
  }).then(function (resp) {
    if (!resp.ok) throw new Error('保存链接失败');
    closeSettings();
    window.location.reload();
  }).catch(function (err) {
    dom.settingsError.style.display = 'block';
    dom.settingsError.textContent = err.message;
  });
}

document.addEventListener('DOMContentLoaded', init);
