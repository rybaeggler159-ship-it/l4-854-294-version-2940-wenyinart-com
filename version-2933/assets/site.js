(function () {
  const navToggle = document.querySelector('[data-nav-toggle]');
  const navMenu = document.querySelector('[data-nav-menu]');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      navMenu.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-hero-carousel]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('.hero-slide'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let index = 0;
    let timer = null;

    const showSlide = function (nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    };

    const restart = function () {
      if (timer) {
        window.clearInterval(timer);
      }

      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    };

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    restart();
  }

  const searchInput = document.querySelector('[data-search-input]');
  const regionFilter = document.querySelector('[data-filter-region]');
  const typeFilter = document.querySelector('[data-filter-type]');
  const yearFilter = document.querySelector('[data-filter-year]');
  const cards = Array.from(document.querySelectorAll('.movie-card, .rank-table-row'));

  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get('q');

  if (searchInput && initialQuery) {
    searchInput.value = initialQuery;
  }

  const applyFilters = function () {
    const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const region = regionFilter ? regionFilter.value : '';
    const type = typeFilter ? typeFilter.value : '';
    const year = yearFilter ? yearFilter.value : '';

    cards.forEach(function (card) {
      const haystack = [
        card.getAttribute('data-title') || '',
        card.getAttribute('data-genre') || '',
        card.getAttribute('data-tags') || '',
        card.getAttribute('data-region') || '',
        card.getAttribute('data-type') || '',
        card.getAttribute('data-year') || ''
      ].join(' ').toLowerCase();

      const matchQuery = !query || haystack.indexOf(query) !== -1;
      const matchRegion = !region || (card.getAttribute('data-region') || '') === region;
      const matchType = !type || (card.getAttribute('data-type') || '') === type;
      const matchYear = !year || (card.getAttribute('data-year') || '') === year;

      card.hidden = !(matchQuery && matchRegion && matchType && matchYear);
    });
  };

  [searchInput, regionFilter, typeFilter, yearFilter].forEach(function (node) {
    if (node) {
      node.addEventListener('input', applyFilters);
      node.addEventListener('change', applyFilters);
    }
  });

  if (searchInput || regionFilter || typeFilter || yearFilter) {
    applyFilters();
  }
})();
