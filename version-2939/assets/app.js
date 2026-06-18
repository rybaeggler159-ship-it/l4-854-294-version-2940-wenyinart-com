(function () {
  function qs(selector, parent) {
    return (parent || document).querySelector(selector);
  }

  function qsa(selector, parent) {
    return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var toggle = qs('[data-menu-toggle]');
    if (!toggle) {
      return;
    }
    toggle.addEventListener('click', function () {
      document.body.classList.toggle('menu-open');
    });
  }

  function setupHero() {
    var slides = qsa('.hero-slide');
    var dots = qsa('.hero-dot');
    if (slides.length < 2) {
      return;
    }
    var index = Math.max(0, slides.findIndex(function (slide) {
      return slide.classList.contains('is-active');
    }));
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        show(i);
        start();
      });
    });

    start();
  }

  function setupSearchForms() {
    qsa('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = qs('input[name="q"]', form);
        if (!input || !input.value.trim()) {
          event.preventDefault();
          if (input) {
            input.focus();
          }
        }
      });
    });
  }

  function setupListFilter() {
    var filterInput = qs('[data-filter-input]');
    if (!filterInput) {
      return;
    }
    var cards = qsa('[data-movie-card]');
    var yearSelect = qs('[data-filter-year]');
    var regionSelect = qs('[data-filter-region]');

    function update() {
      var keyword = filterInput.value.trim().toLowerCase();
      var year = yearSelect ? yearSelect.value : '';
      var region = regionSelect ? regionSelect.value : '';
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search-text') || '').toLowerCase();
        var cardYear = card.getAttribute('data-year') || '';
        var cardRegion = card.getAttribute('data-region') || '';
        var visible = (!keyword || text.indexOf(keyword) !== -1) && (!year || cardYear === year) && (!region || cardRegion === region);
        card.style.display = visible ? '' : 'none';
      });
    }

    filterInput.addEventListener('input', update);
    if (yearSelect) {
      yearSelect.addEventListener('change', update);
    }
    if (regionSelect) {
      regionSelect.addEventListener('change', update);
    }
  }

  function cardHtml(movie) {
    var prefix = document.body.getAttribute('data-root-prefix') || '';
    var href = prefix + 'video/' + movie.id + '.html';
    var cover = prefix + movie.cover;
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span class="tag">' + escapeHtml(tag) + '</span>';
    }).join('');
    return [
      '<a class="movie-card" href="' + href + '">',
      '  <span class="poster-wrap">',
      '    <img src="' + cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="poster-gradient"></span>',
      '    <span class="play-icon">▶</span>',
      '    <span class="year-badge">' + escapeHtml(movie.year) + '</span>',
      '  </span>',
      '  <span class="movie-card-body">',
      '    <strong>' + escapeHtml(movie.title) + '</strong>',
      '    <em>' + escapeHtml(movie.type) + ' · ' + escapeHtml(movie.region) + '</em>',
      '    <small>' + escapeHtml(movie.genre) + '</small>',
      '    <span class="card-tags">' + tags + '</span>',
      '  </span>',
      '</a>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function setupSearchPage() {
    var results = qs('[data-search-results]');
    if (!results || !window.MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var q = (params.get('q') || '').trim();
    var input = qs('[data-search-page-input]');
    var status = qs('[data-search-status]');
    if (input) {
      input.value = q;
    }
    var list = [];
    if (q) {
      var keyword = q.toLowerCase();
      list = window.MOVIES.filter(function (movie) {
        return [movie.title, movie.region, movie.genre, movie.categoryName, movie.oneLine, (movie.tags || []).join(' ')]
          .join(' ')
          .toLowerCase()
          .indexOf(keyword) !== -1;
      });
    }
    if (status) {
      status.textContent = q ? '关键词 “' + q + '” 的相关影片' : '输入关键词查找影片';
    }
    if (!q) {
      results.innerHTML = '<div class="empty-state"><h2>搜索影片</h2><p>输入片名、地区、类型或标签，即可浏览相关内容。</p></div>';
      return;
    }
    if (!list.length) {
      results.innerHTML = '<div class="empty-state"><h2>未找到相关内容</h2><p>可以尝试更换关键词继续搜索。</p></div>';
      return;
    }
    results.innerHTML = list.map(cardHtml).join('');
  }

  function setupPlayer() {
    var video = qs('video[data-stream-url]');
    if (!video) {
      return;
    }
    var overlay = qs('[data-play-trigger]');
    var loaded = false;
    var hls = null;

    function loadStream() {
      if (loaded) {
        return;
      }
      var url = video.getAttribute('data-stream-url');
      if (!url) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        loaded = true;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        loaded = true;
        return;
      }
      video.src = url;
      loaded = true;
    }

    function play() {
      loadStream();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      var action = video.play();
      if (action && typeof action.catch === 'function') {
        action.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener('click', play);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupSearchForms();
    setupListFilter();
    setupSearchPage();
    setupPlayer();
  });
})();
