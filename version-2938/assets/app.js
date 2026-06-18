(function () {
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
      return;
    }
    document.addEventListener('DOMContentLoaded', callback);
  }

  function setupNavigation() {
    var button = document.querySelector('.nav-toggle');
    var panel = document.querySelector('.mobile-panel');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      var open = panel.classList.toggle('is-open');
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function setupHero() {
    var root = document.querySelector('[data-hero]');
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('.hero-dot'));
    var prev = root.querySelector('[data-hero-prev]');
    var next = root.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function move(step) {
      show(index + step);
    }

    function restart() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        move(1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot') || 0));
        restart();
      });
    });
    if (prev) {
      prev.addEventListener('click', function () {
        move(-1);
        restart();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        move(1);
        restart();
      });
    }
    restart();
  }

  function setupFilterLists() {
    document.querySelectorAll('[data-filter-list]').forEach(function (list) {
      var keyword = list.querySelector('[data-filter-keyword]');
      var type = list.querySelector('[data-filter-type]');
      var year = list.querySelector('[data-filter-year]');
      var region = list.querySelector('[data-filter-region]');
      var cards = Array.prototype.slice.call(list.querySelectorAll('[data-card]'));
      var empty = list.querySelector('[data-empty-state]');

      function apply() {
        var q = keyword ? keyword.value.trim().toLowerCase() : '';
        var t = type ? type.value : '';
        var y = year ? year.value : '';
        var r = region ? region.value : '';
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title') || '',
            card.getAttribute('data-genre') || '',
            card.textContent || ''
          ].join(' ').toLowerCase();
          var ok = true;
          if (q && haystack.indexOf(q) === -1) {
            ok = false;
          }
          if (t && card.getAttribute('data-type') !== t) {
            ok = false;
          }
          if (y && card.getAttribute('data-year') !== y) {
            ok = false;
          }
          if (r && card.getAttribute('data-region') !== r) {
            ok = false;
          }
          card.classList.toggle('is-hidden', !ok);
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      [keyword, type, year, region].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
    });
  }

  function movieCard(movie) {
    var tag = [movie.type, movie.genre, movie.year].filter(Boolean).join(' · ');
    return [
      '<a class="movie-card" href="' + escapeHtml(movie.url) + '">',
      '  <span class="poster-wrap">',
      '    <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="poster-shade"></span>',
      '    <span class="play-mark">▶</span>',
      '    <span class="year-badge">' + escapeHtml(movie.year) + '</span>',
      '  </span>',
      '  <span class="movie-card-body">',
      '    <strong>' + escapeHtml(movie.title) + '</strong>',
      '    <em>' + escapeHtml(tag) + '</em>',
      '    <span>' + escapeHtml(movie.oneLine) + '</span>',
      '  </span>',
      '</a>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function setupSearchPage() {
    var form = document.querySelector('[data-search-page-form]');
    var results = document.getElementById('search-results');
    var empty = document.getElementById('search-empty');
    if (!form || !results || !empty || !window.MOVIE_DATA) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var input = form.querySelector('input[name="q"]');
    var type = form.querySelector('select[name="type"]');
    input.value = params.get('q') || '';
    type.value = params.get('type') || '';

    function run() {
      var q = input.value.trim().toLowerCase();
      var t = type.value;
      var items = window.MOVIE_DATA.filter(function (movie) {
        var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine]
          .join(' ')
          .toLowerCase();
        if (q && text.indexOf(q) === -1) {
          return false;
        }
        if (t && movie.type !== t) {
          return false;
        }
        return q || t;
      }).slice(0, 120);
      results.innerHTML = items.map(movieCard).join('');
      empty.textContent = q || t ? '没有找到匹配影片' : '请输入关键词搜索片库';
      empty.classList.toggle('is-visible', items.length === 0);
      var next = new URLSearchParams();
      if (q) {
        next.set('q', input.value.trim());
      }
      if (t) {
        next.set('type', t);
      }
      var suffix = next.toString();
      try {
        history.replaceState(null, '', suffix ? 'search.html?' + suffix : 'search.html');
      } catch (error) {}
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      run();
    });
    input.addEventListener('input', run);
    type.addEventListener('change', run);
    run();
  }

  function setupPlayer() {
    var wrapper = document.querySelector('[data-player]');
    var video = document.getElementById('movieVideo');
    if (!wrapper || !video) {
      return;
    }
    var url = wrapper.getAttribute('data-video-url');
    var overlay = wrapper.querySelector('[data-play-overlay]');
    var loaded = false;
    var hls = null;

    function attach() {
      if (loaded || !url) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(url);
        hls.attachMedia(video);
      } else {
        video.src = url;
      }
      loaded = true;
    }

    function start() {
      attach();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      video.controls = true;
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener('click', start);
    }
    video.addEventListener('play', attach);
    video.addEventListener('click', function () {
      if (!loaded) {
        start();
      }
    });
    window.addEventListener('pagehide', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  }

  ready(function () {
    setupNavigation();
    setupHero();
    setupFilterLists();
    setupSearchPage();
    setupPlayer();
  });
})();
