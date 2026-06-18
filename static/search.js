(function () {
  var form = document.querySelector('[data-search-form]');
  var results = document.querySelector('[data-search-results]');
  var status = document.querySelector('[data-search-status]');
  var filterRow = document.querySelector('[data-filter-row]');
  var activeFilter = 'all';

  if (!form || !results || !window.SEARCH_DATA) {
    return;
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function card(item) {
    var tags = item.tags.slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card">',
      '  <a class="card-poster" href="' + escapeHtml(item.href) + '" aria-label="观看' + escapeHtml(item.title) + '">',
      '    <img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
      '    <span class="card-score">' + escapeHtml(item.score) + '</span>',
      '  </a>',
      '  <div class="card-body">',
      '    <a class="card-title" href="' + escapeHtml(item.href) + '">' + escapeHtml(item.title) + '</a>',
      '    <p class="card-meta">' + escapeHtml(item.year) + ' · ' + escapeHtml(item.region) + ' · ' + escapeHtml(item.type) + '</p>',
      '    <p class="card-desc">' + escapeHtml(item.desc) + '</p>',
      '    <div class="tag-row">' + tags + '</div>',
      '  </div>',
      '</article>'
    ].join('');
  }

  function matchesFilter(item) {
    if (activeFilter === 'all') {
      return true;
    }
    return item.type.indexOf(activeFilter) !== -1 || item.genre.indexOf(activeFilter) !== -1 || item.tags.join(' ').indexOf(activeFilter) !== -1;
  }

  function runSearch(query) {
    var q = String(query || '').trim().toLowerCase();
    var list = window.SEARCH_DATA.filter(function (item) {
      var text = [item.title, item.region, item.type, item.year, item.genre, item.tags.join(' '), item.desc].join(' ').toLowerCase();
      return matchesFilter(item) && (!q || text.indexOf(q) !== -1);
    }).slice(0, 120);

    results.innerHTML = list.map(card).join('');
    status.textContent = q ? '搜索结果：' + list.length + ' 条' : '精选片单：' + list.length + ' 条';
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    runSearch(new FormData(form).get('q'));
  });

  if (filterRow) {
    filterRow.addEventListener('click', function (event) {
      var button = event.target.closest('[data-filter]');
      if (!button) {
        return;
      }
      activeFilter = button.getAttribute('data-filter');
      filterRow.querySelectorAll('[data-filter]').forEach(function (item) {
        item.classList.toggle('is-active', item === button);
      });
      runSearch(new FormData(form).get('q'));
    });
  }

  var params = new URLSearchParams(window.location.search);
  var q = params.get('q') || '';
  if (q) {
    form.querySelector('input[name="q"]').value = q;
  }
  runSearch(q);
})();
