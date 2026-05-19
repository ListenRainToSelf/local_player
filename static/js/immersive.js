(function () {
  'use strict';

  var IM = {};

  var state = {
    activePanel: 'music',
    musicFiles: [],
    musicIndex: -1,
    musicPlayMode: 'sequential',
    videoFiles: [],
    videoEpisodes: [],
    videoIndex: -1,
    autoPlayNext: true,
    docFiles: [],
    docIndex: -1,
    curtainVisible: false,
    docTheme: 'cool',
    docFontSize: 15,
    musicCategories: {},
    musicCurrentCategory: null,
    videoCategories: {},
    videoCurrentCategory: null,
    docCategories: {},
    docCurrentCategory: null,
    classifyTemplates: [],
    musicClassifyTemplate: null,
    videoClassifyTemplate: null,
    docClassifyTemplate: null,
    audioCtx: null,
    audioAnalyser: null,
    curtainAnimId: null,
  };

  function $(id) { return document.getElementById(id); }

  initDom();

  function initDom() {
    IM.shell = $('immersive-shell');
    IM.modeSelector = $('immersive-mode-selector');
    IM.immersiveExit = $('immersive-exit');
    IM.immersiveMusic = $('immersive-music');
    IM.immersiveVideo = $('immersive-video');
    IM.immersiveDoc = $('immersive-doc');

    IM.musicClassifySide = $('music-classify-side');
    IM.musicCategoryTabs = $('music-category-tabs');
    IM.musicSongIsland = $('music-song-island');
    IM.musicTitle = $('music-title');
    IM.musicArtist = $('music-artist');
    IM.musicAlbumCover = $('music-album-cover');
    IM.musicPlayBtn = $('music-play-btn');
    IM.musicPrevBtn = $('music-prev-btn');
    IM.musicNextBtn = $('music-next-btn');
    IM.musicModeBtn = $('music-mode-btn');
    IM.musicSilkFilled = $('music-silk-filled');
    IM.musicSilkThumb = $('music-silk-thumb');
    IM.musicSilkBar = $('music-silk-progress');
    IM.musicClassifySelect = $('music-classify-select');
    IM.musicControls = $('music-controls-island');
    IM.musicWaveCanvas = $('music-wave-canvas');

    IM.videoClassifyIsland = $('video-classify-island');
    IM.videoEpisodeIsland = $('video-episode-island');
    IM.ivPlayer = $('immersive-video-player');
    IM.ivPlayBtn = $('iv-play-btn');
    IM.ivSkipBackBtn = $('iv-skip-back-btn');
    IM.ivSkipFwdBtn = $('iv-skip-fwd-btn');
    IM.ivSilkFilled = $('iv-silk-filled');
    IM.ivSilkThumb = $('iv-silk-thumb');
    IM.ivSilkBar = $('iv-silk-progress');
    IM.ivTime = $('iv-time');
    IM.ivPrevEpBtn = $('iv-prev-ep-btn');
    IM.ivNextEpBtn = $('iv-next-ep-btn');
    IM.ivFullscreenBtn = $('iv-fullscreen-btn');
    IM.ivControls = $('immersive-video-controls');
    IM.videoMainIsland = $('video-main-island');
    IM.videoGlowBg = $('video-glow-bg');
    IM.videoClassifySelect = $('video-classify-select');

    IM.docClassifyIsland = $('doc-classify-island');
    IM.docTocIsland = $('doc-toc-island');
    IM.docReadingIsland = $('doc-reading-island');
    IM.docReadingContent = $('doc-reading-content');
    IM.docCapsuleBar = $('doc-capsule-bar');
    IM.docSilkFilled = $('doc-silk-filled');
    IM.docSilkThumb = $('doc-silk-thumb');
    IM.docSilkBar = $('doc-silk-progress');
    IM.docChapterName = $('doc-chapter-name');
    IM.docBookmarkBtn = $('doc-bookmark-btn');
    IM.docPrevBtn = $('doc-prev-btn');
    IM.docNextBtn = $('doc-next-btn');
    IM.docFullscreenBtn = $('doc-fullscreen-btn');
    IM.docClassifySelect = $('doc-classify-select');

    IM.mainCurtain = $('main-curtain');
    IM.curtainAurora = $('curtain-aurora');
    IM.curtainRings = $('curtain-aurora-rings');
    IM.curtainBeatDot = $('curtain-beat-dot');
    IM.curtainClock = $('curtain-clock');
    IM.curtainClose = $('curtain-close');
    IM.curtainDocContent = $('curtain-doc-content');
    IM.curtainDocFooter = $('curtain-doc-footer');
    IM.curtainTime = $('curtain-time');
    IM.curtainProgress = $('curtain-progress');
    IM.curtainMusicControls = $('curtain-music-controls');
    IM.curtainMusicTitle = $('curtain-music-title');
    IM.curtainMusicPlay = $('curtain-music-play');
    IM.curtainMusicPrev = $('curtain-music-prev');
    IM.curtainMusicNext = $('curtain-music-next');
    IM.curtainMusicFilled = $('curtain-music-filled');
    IM.curtainMusicThumb = $('curtain-music-thumb');
    IM.curtainMusicBar = $('curtain-music-progress');
    IM.curtainVideoWrapper = $('curtain-video-wrapper');
    IM.curtainVideo = $('curtain-video');
    IM.curtainVideoControls = $('curtain-video-controls');
    IM.curtainPlayBtn = $('curtain-play-btn');
    IM.curtainPrevEp = $('curtain-prev-ep');
    IM.curtainNextEp = $('curtain-next-ep');
    IM.curtainSilkFilled = $('curtain-silk-filled');
    IM.curtainSilkThumb = $('curtain-silk-thumb');
    IM.curtainSilkBar = $('curtain-silk-progress');
    IM.curtainTimeDisplay = $('curtain-time-display');

    IM.musicAudio = new Audio();
    IM.shellExists = !!IM.shell;
  }

  function switchPanel(panel) {
    if (state.activePanel === 'music') {
      IM.musicAudio.pause();
    }
    if (state.activePanel === 'video') {
      IM.ivPlayer.pause();
    }

    state.activePanel = panel;
    IM.immersiveMusic.style.display = panel === 'music' ? 'block' : 'none';
    IM.immersiveVideo.style.display = panel === 'video' ? 'block' : 'none';
    IM.immersiveDoc.style.display = panel === 'doc' ? 'block' : 'none';

    IM.modeSelector.querySelectorAll('.immersive-dot').forEach(function(d) {
      d.classList.toggle('active', d.getAttribute('data-mode') === panel);
    });

    if (panel === 'music') { loadClassifyAndMusic(); }
    if (panel === 'video') { loadClassifyAndVideo(); }
    if (panel === 'doc') { loadClassifyAndDoc(); }
  }

  function filterCategoriesByType(categories, files) {
    var filenames = {};
    files.forEach(function(f) { filenames[f.filename] = true; });
    var filtered = {};
    Object.keys(categories).forEach(function(cat) {
      var list = (categories[cat] || []).filter(function(fn) { return filenames[fn]; });
      if (list.length > 0) {
        filtered[cat] = list;
      }
    });
    return filtered;
  }

  function loadClassifyAndMusic() {
    Promise.all([
      fetch('/api/files').then(function(r) { return r.json(); }),
      fetch('/api/classify').then(function(r) { return r.json(); }),
    ]).then(function(results) {
      var filesData = results[0];
      var classifyData = results[1];
      state.musicFiles = (filesData.files || []).filter(function(f) { return f.type === 'audio'; });
      state.classifyTemplates = classifyData.templates || [];
      state.musicCategories = classifyData.classified || {};

      if (state.musicClassifyTemplate) {
        state.musicCategories = classifyData.classified[state.musicClassifyTemplate] || {};
      } else {
        var firstKey = Object.keys(state.musicCategories)[0];
        state.musicClassifyTemplate = firstKey || null;
        state.musicCategories = (firstKey && state.musicCategories[firstKey]) ? state.musicCategories[firstKey] : {};
      }

      state.musicCategories = filterCategoriesByType(state.musicCategories, state.musicFiles);

      state.musicCurrentCategory = Object.keys(state.musicCategories).sort(function(a, b) {
        if (a === '未分类') return 1;
        if (b === '未分类') return -1;
        return a.localeCompare(b, 'zh-CN');
      })[0] || null;

      renderMusicCatTabs();
      renderMusicClassifySelect();
      selectFirstMusicCat();
    });
  }

  function selectFirstMusicCat() {
    if (!state.musicCurrentCategory) {
      IM.musicSongIsland.innerHTML = '<div style="padding:40px;text-align:center;color:var(--text-muted);font-size:14px;">暂无歌曲</div>';
      return;
    }
    var files = getCategoryFiles(state.musicCategories, state.musicCurrentCategory, state.musicFiles);
    renderMusicSongList(files);
  }

  function renderMusicClassifySelect() {
    if (!IM.musicClassifySelect) return;
    var sel = IM.musicClassifySelect;
    sel.innerHTML = '';
    state.classifyTemplates.forEach(function(t) {
      var opt = document.createElement('option');
      opt.value = t.name;
      opt.textContent = t.name;
      if (t.name === state.musicClassifyTemplate) opt.selected = true;
      sel.appendChild(opt);
    });
  }

  function renderMusicCatTabs() {
    var container = IM.musicCategoryTabs;
    if (!container) return;

    var categories = Object.keys(state.musicCategories).sort(function(a, b) {
      if (a === '未分类') return 1;
      if (b === '未分类') return -1;
      return a.localeCompare(b, 'zh-CN');
    });

    if (categories.length <= 1 && (categories.length === 0 || categories[0] === '未分类')) {
      container.innerHTML = '';
      var allFiles = state.musicFiles;
      renderMusicSongList(allFiles);
      return;
    }

    container.innerHTML = categories.map(function(cat) {
      var isActive = cat === state.musicCurrentCategory;
      return '<div class="music-category-tab' + (isActive ? ' active' : '') + '" data-cat="' + escapeHTML(cat) + '">' + escapeHTML(cat) + '</div>';
    }).join('');

    container.querySelectorAll('.music-category-tab').forEach(function(tab) {
      tab.addEventListener('click', function() {
        state.musicCurrentCategory = tab.getAttribute('data-cat');
        renderMusicCatTabs();
        var files = getCategoryFiles(state.musicCategories, state.musicCurrentCategory, state.musicFiles);
        renderMusicSongList(files);
      });
    });
  }

  function getCategoryFiles(categories, currentCat, allFiles) {
    if (!currentCat || !categories[currentCat]) return allFiles;
    var filenames = categories[currentCat] || [];
    return allFiles.filter(function(f) { return filenames.indexOf(f.filename) !== -1; });
  }

  function renderMusicSongList(fileList) {
    var list = IM.musicSongIsland;
    if (!list) return;

    if (!fileList || fileList.length === 0) {
      list.innerHTML = '<div style="padding:40px;text-align:center;color:var(--text-muted);font-size:14px;">该分类暂无歌曲</div>';
      return;
    }

    list.innerHTML = fileList.map(function(f) {
      var realIdx = state.musicFiles.indexOf(f);
      if (realIdx < 0) realIdx = 0;
      var isActive = realIdx === state.musicIndex;
      return '<div class="classify-item' + (isActive ? ' active' : '') + '" data-idx="' + realIdx + '">'
        + '<span>' + escapeHTML(f.filename) + '</span>'
        + '<span class="classify-count">' + formatFileSize(f.size) + '</span>'
        + '</div>';
    }).join('');

    list.querySelectorAll('.classify-item').forEach(function(item) {
      item.addEventListener('click', function() {
        playMusicAtIndex(parseInt(item.getAttribute('data-idx'), 10));
      });
    });
  }

  function playMusicAtIndex(idx) {
    if (idx < 0 || idx >= state.musicFiles.length) return;
    state.musicIndex = idx;
    var file = state.musicFiles[idx];
    IM.musicTitle.textContent = file.filename;
    IM.musicArtist.textContent = '';
    IM.musicAudio.currentTime = 0;
    IM.musicAudio.src = '/api/media/' + encodeURI(file.path);
    IM.musicAudio.play().then(function() {
      setupAudioAnalyser();
    }).catch(function() {});
    IM.musicPlayBtn.querySelector('.icon-play').style.display = 'none';
    IM.musicPlayBtn.querySelector('.icon-pause').style.display = 'block';
    updateCurtainMusicInfo(file);
    renderMusicCatTabs();
    var currentFiles = getCategoryFiles(state.musicCategories, state.musicCurrentCategory, state.musicFiles);
    renderMusicSongList(currentFiles);
  }

  function updateCurtainMusicInfo(file) {
    if (IM.curtainMusicTitle) {
      IM.curtainMusicTitle.textContent = file ? file.filename : '';
    }
  }

  if (IM.shellExists) {
    IM.musicPlayBtn.addEventListener('click', function() {
      if (IM.musicAudio.paused) { IM.musicAudio.play(); setupAudioAnalyser(); } else { IM.musicAudio.pause(); }
    });
    IM.musicAudio.addEventListener('play', function() {
      IM.musicPlayBtn.querySelector('.icon-play').style.display = 'none';
      IM.musicPlayBtn.querySelector('.icon-pause').style.display = 'block';
      if (IM.curtainMusicPlay) {
        IM.curtainMusicPlay.querySelector('.icon-play').style.display = 'none';
        IM.curtainMusicPlay.querySelector('.icon-pause').style.display = 'block';
      }
      setupAudioAnalyser();
    });
    IM.musicAudio.addEventListener('pause', function() {
      IM.musicPlayBtn.querySelector('.icon-play').style.display = 'block';
      IM.musicPlayBtn.querySelector('.icon-pause').style.display = 'none';
      if (IM.curtainMusicPlay) {
        IM.curtainMusicPlay.querySelector('.icon-play').style.display = 'block';
        IM.curtainMusicPlay.querySelector('.icon-pause').style.display = 'none';
      }
    });
    IM.musicAudio.addEventListener('ended', function() {
      var file = state.musicFiles[state.musicIndex];
      if (file) { saveProgress(file.path, IM.musicAudio.currentTime); }
      if (state.musicPlayMode === 'single') { IM.musicAudio.currentTime = 0; IM.musicAudio.play(); return; }
      if (state.musicPlayMode === 'random') {
        var next = Math.floor(Math.random() * state.musicFiles.length);
        playMusicAtIndex(next);
      } else {
        playMusicAtIndex(state.musicIndex + 1);
      }
    });
    IM.musicAudio.addEventListener('timeupdate', function() {
      if (IM.musicAudio.duration) {
        var pct = (IM.musicAudio.currentTime / IM.musicAudio.duration) * 100;
        IM.musicSilkFilled.style.width = pct + '%';
        IM.musicSilkThumb.style.left = pct + '%';
        if (IM.curtainMusicFilled) IM.curtainMusicFilled.style.width = pct + '%';
        if (IM.curtainMusicThumb) IM.curtainMusicThumb.style.left = pct + '%';
      }
    });

    IM.musicPrevBtn.addEventListener('click', function() {
      if (state.musicIndex > 0) playMusicAtIndex(state.musicIndex - 1);
      else playMusicAtIndex(state.musicFiles.length - 1);
    });
    IM.musicNextBtn.addEventListener('click', function() {
      if (state.musicIndex < state.musicFiles.length - 1) playMusicAtIndex(state.musicIndex + 1);
      else playMusicAtIndex(0);
    });
    IM.musicModeBtn.addEventListener('click', function() {
      var modes = ['sequential', 'random', 'single'];
      var labels = ['↻', '⇄', '1'];
      var idx = modes.indexOf(state.musicPlayMode);
      state.musicPlayMode = modes[(idx + 1) % 3];
      IM.musicModeBtn.textContent = labels[(idx + 1) % 3];
    });

    setupSilkProgress(IM.musicSilkBar, IM.musicSilkFilled, IM.musicSilkThumb, IM.musicAudio);

    if (IM.musicClassifySelect) {
      IM.musicClassifySelect.addEventListener('change', function() {
        state.musicClassifyTemplate = IM.musicClassifySelect.value;
        state.musicIndex = -1;
        loadClassifyAndMusic();
      });
    }
  }

  if (IM.shellExists && IM.curtainMusicPlay) {
    IM.curtainMusicPlay.addEventListener('click', function() {
      if (IM.musicAudio.paused) { IM.musicAudio.play(); } else { IM.musicAudio.pause(); }
    });
    IM.curtainMusicPrev.addEventListener('click', function() {
      if (state.musicIndex > 0) playMusicAtIndex(state.musicIndex - 1);
      else playMusicAtIndex(state.musicFiles.length - 1);
    });
    IM.curtainMusicNext.addEventListener('click', function() {
      if (state.musicIndex < state.musicFiles.length - 1) playMusicAtIndex(state.musicIndex + 1);
      else playMusicAtIndex(0);
    });
    setupSilkProgress(IM.curtainMusicBar, IM.curtainMusicFilled, IM.curtainMusicThumb, IM.musicAudio);
  }

  function loadClassifyAndVideo() {
    Promise.all([
      fetch('/api/files').then(function(r) { return r.json(); }),
      fetch('/api/classify').then(function(r) { return r.json(); }),
      fetch('/api/episodes').then(function(r) { return r.json(); }),
    ]).then(function(results) {
      var filesData = results[0];
      var classifyData = results[1];
      var episodesData = results[2];

      state.videoFiles = (filesData.files || []).filter(function(f) { return f.type === 'video'; });
      state.videoEpisodes = episodesData.episodes || [];
      state.classifyTemplates = classifyData.templates || [];
      state.videoCategories = classifyData.classified || {};

      if (state.videoClassifyTemplate) {
        state.videoCategories = classifyData.classified[state.videoClassifyTemplate] || {};
      } else {
        var firstKey = Object.keys(state.videoCategories)[0];
        state.videoClassifyTemplate = firstKey || null;
        state.videoCategories = (firstKey && state.videoCategories[firstKey]) ? state.videoCategories[firstKey] : {};
      }

      state.videoCategories = filterCategoriesByType(state.videoCategories, state.videoFiles);

      state.videoCurrentCategory = Object.keys(state.videoCategories).sort(function(a, b) {
        if (a === '未分类') return 1;
        if (b === '未分类') return -1;
        return a.localeCompare(b, 'zh-CN');
      })[0] || null;

      renderVideoClassifyLayout();
      renderVideoClassifySelect();
      renderVideoEpisodeList();
    });
  }

  function renderVideoClassifySelect() {
    if (!IM.videoClassifySelect) return;
    var sel = IM.videoClassifySelect;
    sel.innerHTML = '';
    state.classifyTemplates.forEach(function(t) {
      var opt = document.createElement('option');
      opt.value = t.name;
      opt.textContent = t.name;
      if (t.name === state.videoClassifyTemplate) opt.selected = true;
      sel.appendChild(opt);
    });
  }

  function renderVideoClassifyLayout() {
    var container = document.getElementById('video-classify-tabs');
    if (!container) return;

    var categories = Object.keys(state.videoCategories).sort(function(a, b) {
      if (a === '未分类') return 1;
      if (b === '未分类') return -1;
      return a.localeCompare(b, 'zh-CN');
    });

    if (categories.length === 0) {
      container.innerHTML = '<div style="padding:8px;text-align:center;color:var(--text-muted);font-size:11px;">无分类数据</div>';
      return;
    }

    container.innerHTML = categories.map(function(cat) {
      var isActive = cat === state.videoCurrentCategory;
      return '<div class="music-category-tab' + (isActive ? ' active' : '') + '" data-cat="' + escapeHTML(cat) + '">' + escapeHTML(cat) + '</div>';
    }).join('');

    container.querySelectorAll('.music-category-tab').forEach(function(tab) {
      tab.addEventListener('click', function() {
        state.videoCurrentCategory = tab.getAttribute('data-cat');
        renderVideoClassifyLayout();
        renderVideoEpisodeList();
      });
    });
  }

  function renderVideoEpisodeList() {
    var island = IM.videoEpisodeIsland;
    if (!island) return;

    var episodes = state.videoEpisodes;

    if (state.videoCurrentCategory && state.videoCategories[state.videoCurrentCategory]) {
      var catFilenames = state.videoCategories[state.videoCurrentCategory];
      episodes = state.videoEpisodes.filter(function(ep) {
        return catFilenames.indexOf(ep.filename) !== -1;
      });
    }

    if (episodes.length === 0) {
      island.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-muted);font-size:12px;">暂无剧集</div>';
      return;
    }

    island.innerHTML = '<div style="font-size:11px;font-weight:600;color:var(--text-muted);margin-bottom:8px;text-transform:uppercase;letter-spacing:1px;">剧集列表</div>'
      + episodes.map(function(f) {
        var globalIdx = state.videoEpisodes.indexOf(f);
        var isActive = globalIdx === state.videoIndex;
        return '<div class="episode-item' + (isActive ? ' active' : '') + '" data-idx="' + globalIdx + '">'
          + '<span class="episode-num">' + (f.episode || '?') + '</span>'
          + '<span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + escapeHTML(f.filename) + '</span>'
          + '</div>';
      }).join('');

    island.querySelectorAll('.episode-item').forEach(function(item) {
      item.addEventListener('click', function() {
        playVideoAtIndex(parseInt(item.getAttribute('data-idx'), 10));
      });
    });
  }

  function playVideoAtIndex(idx) {
    if (idx < 0 || idx >= state.videoEpisodes.length) return;
    state.videoIndex = idx;
    var file = state.videoEpisodes[idx];
    IM.ivPlayer.currentTime = 0;
    IM.ivPlayer.src = '/api/media/' + encodeURI(file.path);
    IM.ivPlayer.style.display = 'block';
    IM.ivPlayer.play();
    IM.ivPlayBtn.querySelector('.icon-play').style.display = 'none';
    IM.ivPlayBtn.querySelector('.icon-pause').style.display = 'block';
    renderVideoEpisodeList();
  }

  if (IM.shellExists) {
    IM.ivPlayer.addEventListener('play', function() {
      IM.ivPlayBtn.querySelector('.icon-play').style.display = 'none';
      IM.ivPlayBtn.querySelector('.icon-pause').style.display = 'block';
    });
    IM.ivPlayer.addEventListener('pause', function() {
      IM.ivPlayBtn.querySelector('.icon-play').style.display = 'block';
      IM.ivPlayBtn.querySelector('.icon-pause').style.display = 'none';
    });
    IM.ivPlayer.addEventListener('ended', function() {
      var file = state.videoEpisodes[state.videoIndex];
      if (file) { saveProgress(file.path, IM.ivPlayer.duration); }
      if (state.autoPlayNext && state.videoIndex + 1 < state.videoEpisodes.length) {
        playVideoAtIndex(state.videoIndex + 1);
      }
    });
    IM.ivPlayer.addEventListener('timeupdate', function() {
      if (IM.ivPlayer.duration) {
        var pct = (IM.ivPlayer.currentTime / IM.ivPlayer.duration) * 100;
        IM.ivSilkFilled.style.width = pct + '%';
        IM.ivSilkThumb.style.left = pct + '%';
        IM.ivTime.textContent = formatTimeDisplay(IM.ivPlayer.currentTime) + ' / ' + formatTimeDisplay(IM.ivPlayer.duration);
      }
    });

    IM.ivPlayBtn.addEventListener('click', function() {
      if (IM.ivPlayer.paused) { IM.ivPlayer.play(); } else { IM.ivPlayer.pause(); }
    });
    IM.ivSkipBackBtn.addEventListener('click', function() { IM.ivPlayer.currentTime = Math.max(0, IM.ivPlayer.currentTime - 15); });
    IM.ivSkipFwdBtn.addEventListener('click', function() { IM.ivPlayer.currentTime += 15; });

    if (IM.ivPrevEpBtn) {
      IM.ivPrevEpBtn.addEventListener('click', function() {
        if (state.videoIndex > 0) playVideoAtIndex(state.videoIndex - 1);
      });
    }
    if (IM.ivNextEpBtn) {
      IM.ivNextEpBtn.addEventListener('click', function() {
        if (state.videoIndex + 1 < state.videoEpisodes.length) playVideoAtIndex(state.videoIndex + 1);
      });
    }
    if (IM.ivFullscreenBtn) {
      IM.ivFullscreenBtn.addEventListener('click', function() {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          IM.videoMainIsland.requestFullscreen().catch(function() {});
        }
      });
    }

    var ivBreathTimer = null;
    IM.videoMainIsland.addEventListener('mousemove', function() {
      IM.ivControls.classList.add('visible');
      if (ivBreathTimer) clearTimeout(ivBreathTimer);
      ivBreathTimer = setTimeout(function() { IM.ivControls.classList.remove('visible'); }, 3000);
    });
    IM.videoMainIsland.addEventListener('mouseleave', function() {
      ivBreathTimer = setTimeout(function() { IM.ivControls.classList.remove('visible'); }, 1000);
    });

    IM.ivPlayer.addEventListener('click', function(e) {
      e.stopPropagation();
      if (IM.ivPlayer.paused) { IM.ivPlayer.play(); } else { IM.ivPlayer.pause(); }
    });
    IM.ivPlayer.addEventListener('dblclick', function(e) {
      e.stopPropagation();
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        IM.videoMainIsland.requestFullscreen().catch(function() {});
      }
    });

    setupSilkProgress(IM.ivSilkBar, IM.ivSilkFilled, IM.ivSilkThumb, IM.ivPlayer);

    if (IM.videoClassifySelect) {
      IM.videoClassifySelect.addEventListener('change', function() {
        state.videoClassifyTemplate = IM.videoClassifySelect.value;
        state.videoIndex = -1;
        loadClassifyAndVideo();
      });
    }
  }

  function loadClassifyAndDoc() {
    Promise.all([
      fetch('/api/files').then(function(r) { return r.json(); }),
      fetch('/api/classify').then(function(r) { return r.json(); }),
    ]).then(function(results) {
      var filesData = results[0];
      var classifyData = results[1];
      state.docFiles = (filesData.files || []).filter(function(f) { return f.type === 'markdown'; });
      state.classifyTemplates = classifyData.templates || [];
      state.docCategories = classifyData.classified || {};

      if (state.docClassifyTemplate) {
        state.docCategories = classifyData.classified[state.docClassifyTemplate] || {};
      } else {
        var firstKey = Object.keys(state.docCategories)[0];
        state.docClassifyTemplate = firstKey || null;
        state.docCategories = (firstKey && state.docCategories[firstKey]) ? state.docCategories[firstKey] : {};
      }

      state.docCategories = filterCategoriesByType(state.docCategories, state.docFiles);

      state.docCurrentCategory = Object.keys(state.docCategories).sort(function(a, b) {
        if (a === '未分类') return 1;
        if (b === '未分类') return -1;
        return a.localeCompare(b, 'zh-CN');
      })[0] || null;

      renderDocClassifyLayout();
      renderDocClassifySelect();
      renderDocToc();

      if (state.docFiles.length > 0 && state.docIndex < 0) {
        state.docIndex = 0;
        loadDocAtIndex(0);
      }
    });
  }

  function renderDocClassifySelect() {
    if (!IM.docClassifySelect) return;
    var sel = IM.docClassifySelect;
    sel.innerHTML = '';
    state.classifyTemplates.forEach(function(t) {
      var opt = document.createElement('option');
      opt.value = t.name;
      opt.textContent = t.name;
      if (t.name === state.docClassifyTemplate) opt.selected = true;
      sel.appendChild(opt);
    });
  }

  function renderDocClassifyLayout() {
    var container = document.getElementById('doc-classify-tabs');
    if (!container) return;

    var categories = Object.keys(state.docCategories).sort(function(a, b) {
      if (a === '未分类') return 1;
      if (b === '未分类') return -1;
      return a.localeCompare(b, 'zh-CN');
    });

    if (categories.length === 0) {
      container.innerHTML = '<div style="padding:8px;text-align:center;color:var(--text-muted);font-size:11px;">无分类数据</div>';
      return;
    }

    container.innerHTML = categories.map(function(cat) {
      var isActive = cat === state.docCurrentCategory;
      return '<div class="music-category-tab' + (isActive ? ' active' : '') + '" data-cat="' + escapeHTML(cat) + '">' + escapeHTML(cat) + '</div>';
    }).join('');

    container.querySelectorAll('.music-category-tab').forEach(function(tab) {
      tab.addEventListener('click', function() {
        state.docCurrentCategory = tab.getAttribute('data-cat');
        renderDocClassifyLayout();
        renderDocToc();
      });
    });
  }

  function renderDocToc() {
    var island = IM.docTocIsland;
    if (!island) return;

    var files = state.docFiles;

    if (state.docCurrentCategory && state.docCategories[state.docCurrentCategory]) {
      var catFilenames = state.docCategories[state.docCurrentCategory];
      files = state.docFiles.filter(function(f) {
        return catFilenames.indexOf(f.filename) !== -1;
      });
    }

    if (files.length === 0) {
      island.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-muted);font-size:12px;">暂无文档</div>';
      return;
    }

    island.innerHTML = '<div style="font-size:11px;font-weight:600;color:var(--text-muted);margin-bottom:8px;text-transform:uppercase;letter-spacing:1px;">目录</div>'
      + files.map(function(f) {
        var globalIdx = state.docFiles.indexOf(f);
        return '<div class="toc-item' + (globalIdx === state.docIndex ? ' active' : '') + '" data-idx="' + globalIdx + '">' + escapeHTML(f.filename) + '</div>';
      }).join('');

    island.querySelectorAll('.toc-item').forEach(function(item) {
      item.addEventListener('click', function() {
        var idx = parseInt(item.getAttribute('data-idx'), 10);
        state.docIndex = idx;
        loadDocAtIndex(idx);
        renderDocToc();
      });
    });
  }

  function loadDocAtIndex(idx) {
    if (idx < 0 || idx >= state.docFiles.length) return;
    var file = state.docFiles[idx];
    if (IM.docChapterName) IM.docChapterName.textContent = file.filename;
    fetch('/api/markdown/' + encodeURI(file.path)).then(function(r) { return r.json(); }).then(function(data) {
      IM.docReadingContent.innerHTML = data.html || '<p>内容为空</p>';
      IM.docReadingIsland.scrollTop = 0;
      setDocTheme(state.docTheme);
    });
    renderDocToc();
    updateDocBookmarkState(file);
  }

  function updateDocBookmarkState(file) {
    if (!IM.docBookmarkBtn || !file) return;
    var bookmarks = JSON.parse(localStorage.getItem('doc_bookmarks') || '{}');
    IM.docBookmarkBtn.textContent = bookmarks[file.path] ? '★' : '☆';
  }

  if (IM.shellExists) {
    if (IM.docReadingIsland) {
      IM.docReadingIsland.addEventListener('scroll', function() {
        var scrollTop = IM.docReadingIsland.scrollTop;
        var scrollHeight = IM.docReadingIsland.scrollHeight - IM.docReadingIsland.clientHeight;
        if (scrollHeight > 0 && IM.docSilkFilled) {
          var pct = (scrollTop / scrollHeight) * 100;
          IM.docSilkFilled.style.width = pct + '%';
          if (IM.docSilkThumb) IM.docSilkThumb.style.left = pct + '%';
        }
      });
    }

    var capsuleTimer = null;
    IM.docReadingIsland.addEventListener('mousemove', function(e) {
      if (e.clientY < IM.docReadingIsland.getBoundingClientRect().top + 60) {
        IM.docCapsuleBar.classList.add('visible');
        if (capsuleTimer) clearTimeout(capsuleTimer);
        capsuleTimer = setTimeout(function() { IM.docCapsuleBar.classList.remove('visible'); }, 3000);
      }
    });

    IM.docCapsuleBar.querySelectorAll('.capsule-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var cmd = btn.getAttribute('data-cmd');
        if (cmd === 'font-sm') { state.docFontSize = Math.max(12, state.docFontSize - 1); IM.docReadingContent.style.fontSize = state.docFontSize + 'px'; }
        if (cmd === 'font-lg') { state.docFontSize = Math.min(24, state.docFontSize + 1); IM.docReadingContent.style.fontSize = state.docFontSize + 'px'; }
        if (cmd === 'theme-warm') { setDocTheme('warm'); }
        if (cmd === 'theme-cool') { setDocTheme('cool'); }
        if (cmd === 'theme-dark') { setDocTheme('dark'); }
      });
    });

    if (IM.docPrevBtn) {
      IM.docPrevBtn.addEventListener('click', function() {
        if (state.docIndex > 0) {
          state.docIndex--;
          loadDocAtIndex(state.docIndex);
        }
      });
    }
    if (IM.docNextBtn) {
      IM.docNextBtn.addEventListener('click', function() {
        if (state.docIndex < state.docFiles.length - 1) {
          state.docIndex++;
          loadDocAtIndex(state.docIndex);
        }
      });
    }
    if (IM.docFullscreenBtn) {
      IM.docFullscreenBtn.addEventListener('click', function() {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          IM.docReadingIsland.requestFullscreen().catch(function() {});
        }
      });
    }

    if (IM.docClassifySelect) {
      IM.docClassifySelect.addEventListener('change', function() {
        state.docClassifyTemplate = IM.docClassifySelect.value;
        state.docIndex = -1;
        loadClassifyAndDoc();
      });
    }
  }

  function setDocTheme(theme) {
    state.docTheme = theme;
    IM.docReadingIsland.className = 'doc-reading-island floating-island theme-' + theme;
    IM.docReadingContent.style.color = '';
    IM.docCapsuleBar.querySelectorAll('.capsule-btn').forEach(function(b) {
      b.classList.remove('active');
      var cmd = b.getAttribute('data-cmd');
      if (cmd === 'theme-' + theme) b.classList.add('active');
    });
  }

  if (IM.shellExists) {
    IM.docBookmarkBtn.addEventListener('click', function() {
      var file = state.docFiles[state.docIndex];
      if (!file) return;
      var bookmarks = JSON.parse(localStorage.getItem('doc_bookmarks') || '{}');
      if (bookmarks[file.path]) {
        delete bookmarks[file.path];
        IM.docBookmarkBtn.textContent = '☆';
      } else {
        bookmarks[file.path] = { scrollTop: IM.docReadingIsland.scrollTop, timestamp: Date.now() };
        IM.docBookmarkBtn.textContent = '★';
      }
      localStorage.setItem('doc_bookmarks', JSON.stringify(bookmarks));
    });
  }

  function setupAudioAnalyser() {
    try {
      if (!state.audioCtx || state.audioCtx.state === 'closed') {
        var AudioContext = window.AudioContext || window.webkitAudioContext;
        state.audioCtx = new AudioContext();
        state.audioAnalyser = state.audioCtx.createAnalyser();
        state.audioAnalyser.fftSize = 256;
        var source = state.audioCtx.createMediaElementSource(IM.musicAudio);
        source.connect(state.audioAnalyser);
        state.audioAnalyser.connect(state.audioCtx.destination);
      }
      if (state.audioCtx && state.audioCtx.state === 'suspended') {
        state.audioCtx.resume();
      }
      startCurtainBeat();
      startMusicWave();
    } catch (e) {
      state.audioAnalyser = null;
    }
  }

  var musicWaveId = null;
  function startMusicWave() {
    if (musicWaveId) { cancelAnimationFrame(musicWaveId); }
    var canvas = IM.musicWaveCanvas;
    if (!canvas || !state.audioAnalyser) { musicWaveId = requestAnimationFrame(startMusicWave); return; }
    var ctx = canvas.getContext('2d');
    var w = canvas.width = canvas.offsetWidth;
    var h = canvas.height = canvas.offsetHeight;
    if (w < 2 || h < 2) { musicWaveId = requestAnimationFrame(startMusicWave); return; }

    var dataArray = new Uint8Array(state.audioAnalyser.frequencyBinCount);
    state.audioAnalyser.getByteFrequencyData(dataArray);

    ctx.clearRect(0, 0, w, h);

    var bars = 40;
    var barW = (w / bars) * 0.7;
    var gap = (w / bars) * 0.3;
    var accent = getComputedStyle(document.body).getPropertyValue('--accent').trim() || '#6366f1';

    for (var i = 0; i < bars; i++) {
      var val = dataArray[Math.floor(i / bars * dataArray.length)] || 0;
      var barH = (val / 255) * h * 0.8;
      var x = i * (barW + gap);
      var y = h - barH;
      var grad = ctx.createLinearGradient(x, y, x, h);
      grad.addColorStop(0, accent);
      grad.addColorStop(1, accent + '33');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(x, y, barW, barH, [barW / 2, barW / 2, 0, 0]);
      ctx.fill();
    }

    musicWaveId = requestAnimationFrame(startMusicWave);
  }

  function startCurtainBeat() {
    if (state.curtainAnimId) { cancelAnimationFrame(state.curtainAnimId); }
    function beat() {
      if (!state.curtainVisible || !state.audioAnalyser) {
        state.curtainAnimId = requestAnimationFrame(beat);
        return;
      }
      try {
        var dataArray = new Uint8Array(state.audioAnalyser.frequencyBinCount);
        state.audioAnalyser.getByteFrequencyData(dataArray);
        var sum = 0;
        var max = 0;
        for (var i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
          if (dataArray[i] > max) max = dataArray[i];
        }
        var avg = sum / dataArray.length;
        var intensity = Math.min(1.5, 0.8 + avg / 255);
        if (IM.curtainAurora) {
          IM.curtainAurora.style.opacity = (0.3 + avg / 512).toString();
          IM.curtainAurora.style.transform = 'scale(' + intensity + ')';
          IM.curtainAurora.style.filter = 'hue-rotate(' + ((avg / 255) * 30) + 'deg)';
        }
        if (IM.curtainBeatDot) {
          if (IM.musicAudio.paused || !IM.musicAudio.duration) {
            IM.curtainBeatDot.style.transform = 'translate(-50%, -50%) scale(0)';
            IM.curtainBeatDot.style.opacity = '0';
          } else {
            var peak = Math.pow(max / 255, 2);
            var bs = 0.6 + peak * 2.5;
            IM.curtainBeatDot.style.transform = 'translate(-50%, -50%) scale(' + bs + ')';
            IM.curtainBeatDot.style.opacity = (0.3 + peak * 0.7).toString();
          }
        }
        if (IM.curtainRings) {
          var rings = IM.curtainRings.children;
          for (var r = 0; r < rings.length; r++) {
            var base = 120 + r * 100;
            var rr = base + (avg / 255) * 60;
            rings[r].style.width = rr + 'px';
            rings[r].style.height = rr + 'px';
            rings[r].style.opacity = (0.3 + avg / 510).toString();
            rings[r].style.borderColor = 'rgba(99,102,241,' + (0.06 + avg / 2048) + ')';
          }
        }
      } catch (e) {}
      state.curtainAnimId = requestAnimationFrame(beat);
    }
    state.curtainAnimId = requestAnimationFrame(beat);
  }

  function toggleCurtain() {
    if (state.curtainVisible) { lowerCurtain(); } else { raiseCurtain(state.activePanel); }
  }

  function raiseCurtain(mode) {
    state.curtainVisible = true;
    IM.mainCurtain.classList.add('raised');
    IM.mainCurtain.style.zIndex = '200';

    IM.curtainDocContent.style.display = 'none';
    IM.curtainDocFooter.style.display = 'none';
    if (IM.curtainVideoWrapper) IM.curtainVideoWrapper.style.display = 'none';
    if (IM.curtainMusicControls) IM.curtainMusicControls.style.display = 'none';

    if (mode === 'music') {
      if (IM.curtainMusicControls) {
        IM.curtainMusicControls.style.display = 'flex';
        var file = state.musicFiles[state.musicIndex];
        updateCurtainMusicInfo(file);
      }
    } else if (mode === 'video' && IM.curtainVideoWrapper) {
      IM.curtainVideoWrapper.style.display = 'flex';
      if (IM.ivPlayer.src) {
        IM.curtainVideo.src = IM.ivPlayer.src;
        IM.curtainVideo.currentTime = IM.ivPlayer.currentTime;
        if (!IM.ivPlayer.paused) { IM.curtainVideo.play(); }
      }
    } else if (mode === 'doc') {
      IM.curtainDocContent.style.display = 'block';
      IM.curtainDocContent.innerHTML = IM.docReadingContent.innerHTML;
      IM.curtainDocFooter.style.display = 'flex';
      updateCurtainTime();
      var pct = (IM.docSilkFilled && IM.docSilkFilled.style.width) || '0%';
      IM.curtainProgress.textContent = '阅读进度 ' + pct;
    }

    IM.curtainAurora.style.display = 'block';
    updateCurtainTime();
    startCurtainBeat();

    if (IM.musicControls) IM.musicControls.style.zIndex = '210';
    if (IM.ivControls) IM.ivControls.style.zIndex = '210';
  }

  function lowerCurtain() {
    state.curtainVisible = false;
    IM.mainCurtain.classList.remove('raised');
    IM.curtainDocContent.style.display = 'none';
    IM.curtainDocFooter.style.display = 'none';
    if (IM.curtainMusicControls) IM.curtainMusicControls.style.display = 'none';
    if (IM.curtainVideoWrapper) {
      IM.curtainVideo.pause();
      IM.curtainVideoWrapper.style.display = 'none';
    }
    if (IM.musicControls) IM.musicControls.style.zIndex = '';
    if (IM.ivControls) IM.ivControls.style.zIndex = '';
  }

  function updateCurtainTime() {
    if (!state.curtainVisible) return;
    var now = new Date();
    var h = now.getHours().toString().padStart(2, '0');
    var m = now.getMinutes().toString().padStart(2, '0');
    IM.curtainClock.textContent = h + ':' + m;
    if (IM.curtainTime) IM.curtainTime.textContent = h + ':' + m;
    setTimeout(updateCurtainTime, 30000);
  }

  if (IM.shellExists) {
    IM.curtainClose.addEventListener('click', lowerCurtain);
    IM.musicAlbumCover.addEventListener('click', function() {
      if (state.curtainVisible) { lowerCurtain(); } else { raiseCurtain('music'); }
    });

    IM.docReadingIsland.addEventListener('dblclick', function() {
      if (state.curtainVisible) { lowerCurtain(); } else { raiseCurtain('doc'); }
    });
  }

  if (IM.shellExists && IM.curtainVideo) {
    IM.curtainPlayBtn.addEventListener('click', function() {
      if (IM.curtainVideo.paused) { IM.curtainVideo.play(); } else { IM.curtainVideo.pause(); }
    });
    IM.curtainVideo.addEventListener('play', function() {
      IM.curtainPlayBtn.querySelector('.icon-play').style.display = 'none';
      IM.curtainPlayBtn.querySelector('.icon-pause').style.display = 'block';
    });
    IM.curtainVideo.addEventListener('pause', function() {
      IM.curtainPlayBtn.querySelector('.icon-play').style.display = 'block';
      IM.curtainPlayBtn.querySelector('.icon-pause').style.display = 'none';
    });
    IM.curtainVideo.addEventListener('timeupdate', function() {
      if (IM.curtainVideo.duration) {
        var pct = (IM.curtainVideo.currentTime / IM.curtainVideo.duration) * 100;
        if (IM.curtainSilkFilled) IM.curtainSilkFilled.style.width = pct + '%';
        if (IM.curtainSilkThumb) IM.curtainSilkThumb.style.left = pct + '%';
        if (IM.curtainTimeDisplay) IM.curtainTimeDisplay.textContent = formatTimeDisplay(IM.curtainVideo.currentTime) + ' / ' + formatTimeDisplay(IM.curtainVideo.duration);
      }
    });
    IM.curtainPrevEp.addEventListener('click', function() {
      if (state.videoIndex > 0) {
        playVideoAtIndex(state.videoIndex - 1);
        if (IM.curtainVideoWrapper) {
          IM.curtainVideo.src = IM.ivPlayer.src;
          IM.curtainVideo.currentTime = 0;
          IM.curtainVideo.play();
        }
      }
    });
    IM.curtainNextEp.addEventListener('click', function() {
      if (state.videoIndex + 1 < state.videoEpisodes.length) {
        playVideoAtIndex(state.videoIndex + 1);
        if (IM.curtainVideoWrapper) {
          IM.curtainVideo.src = IM.ivPlayer.src;
          IM.curtainVideo.currentTime = 0;
          IM.curtainVideo.play();
        }
      }
    });
    setupSilkProgress(IM.curtainSilkBar, IM.curtainSilkFilled, IM.curtainSilkThumb, IM.curtainVideo);
  }

  function setupSilkProgress(bar, filled, thumb, media) {
    var dragging = false;
    bar.addEventListener('mousedown', function(e) {
      dragging = true;
      updateFromEvent(e);
    });
    document.addEventListener('mousemove', function(e) {
      if (dragging) updateFromEvent(e);
    });
    document.addEventListener('mouseup', function() { dragging = false; });

    function updateFromEvent(e) {
      var rect = bar.getBoundingClientRect();
      var pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      if (media.duration) {
        media.currentTime = pct * media.duration;
        filled.style.width = (pct * 100) + '%';
        thumb.style.left = (pct * 100) + '%';
      }
    }
  }

  function saveProgress(path, time) {
    fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: path, currentTime: time }),
    });
  }

  if (IM.shellExists) {
    setInterval(function() {
      var file = null, time = 0;
      if (state.activePanel === 'video' && state.videoEpisodes[state.videoIndex]) {
        file = state.videoEpisodes[state.videoIndex];
        time = IM.ivPlayer.currentTime;
      } else if (state.activePanel === 'music' && state.musicFiles[state.musicIndex]) {
        file = state.musicFiles[state.musicIndex];
        time = IM.musicAudio.currentTime;
      }
      if (file && time > 0) saveProgress(file.path, time);
    }, 5000);
  }

  function escapeHTML(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  function formatFileSize(bytes) {
    if (bytes == null || isNaN(bytes)) return '';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
    return (bytes / 1073741824).toFixed(2) + ' GB';
  }

  function formatTimeDisplay(seconds) {
    if (isNaN(seconds)) return '0:00';
    var m = Math.floor(seconds / 60);
    var s = Math.floor(seconds % 60);
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  if (IM.shellExists) {
    if (IM.modeSelector) {
      IM.modeSelector.querySelectorAll('.immersive-dot').forEach(function(dot) {
        dot.addEventListener('click', function() { switchPanel(dot.getAttribute('data-mode')); });
      });
    }
    if (IM.immersiveExit) {
      IM.immersiveExit.addEventListener('click', function() { window.location.href = '/'; });
    }
  }

  var savedDark = localStorage.getItem('media_player_dark');
  if (savedDark === 'true') {
    document.body.classList.add('dark');
  }

  var savedStyle = localStorage.getItem('media_player_style');
  if (savedStyle === 'acrylic' || savedStyle === 'glass') {
    document.body.classList.remove('glass', 'acrylic');
    document.body.classList.add(savedStyle);
  }

  if (IM.shellExists) {
    loadClassifyAndMusic();
  }
})();
