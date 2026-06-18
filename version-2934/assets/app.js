(function () {
  const menuButton = document.querySelector("[data-menu-button]");
  const mobilePanel = document.querySelector("[data-mobile-panel]");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function () {
      mobilePanel.classList.toggle("open");
    });
  }

  const hero = document.querySelector("[data-hero]");

  if (hero) {
    const slides = Array.from(hero.querySelectorAll("[data-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    let activeIndex = 0;
    let timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === activeIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === activeIndex);
      });
    }

    function startTimer() {
      clearInterval(timer);
      timer = setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
        startTimer();
      });
    });

    showSlide(0);
    startTimer();
  }

  const filterInputs = Array.from(document.querySelectorAll("[data-filter-input]"));

  filterInputs.forEach(function (input) {
    const scopeSelector = input.getAttribute("data-filter-scope") || "body";
    const scope = document.querySelector(scopeSelector) || document.body;
    const cards = Array.from(scope.querySelectorAll("[data-card]"));
    const empty = scope.querySelector("[data-no-results]");

    function applyFilter() {
      const query = input.value.trim().toLowerCase();
      let visible = 0;

      cards.forEach(function (card) {
        const haystack = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
        const matched = !query || haystack.includes(query);
        card.hidden = !matched;

        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("show", visible === 0);
      }
    }

    input.addEventListener("input", applyFilter);

    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");

    if (q && input.hasAttribute("data-load-query")) {
      input.value = q;
    }

    applyFilter();
  });
})();
