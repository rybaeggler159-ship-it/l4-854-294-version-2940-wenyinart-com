(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuToggle = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuToggle && mobileNav) {
      menuToggle.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
      });
    }

    setupHero();
    setupFiltering();
    setupPlayer();
  });

  function setupHero() {
    var hero = document.querySelector("[data-hero]");

    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupFiltering() {
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    var searchInput = document.querySelector("[data-search-input]");
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-button]"));
    var emptyState = document.querySelector("[data-empty-state]");
    var activeGroup = "all";

    if (!cards.length) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var queryFromUrl = params.get("q");

    if (queryFromUrl && searchInput) {
      searchInput.value = queryFromUrl;
    }

    function apply() {
      var query = searchInput ? searchInput.value.trim().toLowerCase() : "";
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = (card.getAttribute("data-search") || "").toLowerCase();
        var group = card.getAttribute("data-group") || "";
        var queryMatch = !query || haystack.indexOf(query) !== -1;
        var groupMatch = activeGroup === "all" || group === activeGroup;
        var showCard = queryMatch && groupMatch;

        card.style.display = showCard ? "" : "none";

        if (showCard) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle("is-visible", visible === 0);
      }
    }

    if (searchInput) {
      searchInput.addEventListener("input", apply);
    }

    filterButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        activeGroup = button.getAttribute("data-filter-button") || "all";
        filterButtons.forEach(function (item) {
          item.classList.toggle("is-active", item === button);
        });
        apply();
      });
    });

    apply();
  }

  function setupPlayer() {
    var area = document.querySelector("[data-player-area]");

    if (!area) {
      return;
    }

    var video = area.querySelector("video");
    var cover = area.querySelector("[data-player-cover]");
    var src = area.getAttribute("data-src");
    var hls = null;
    var loaded = false;

    if (!video || !src) {
      return;
    }

    function attach() {
      if (loaded) {
        return;
      }

      loaded = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else {
        video.src = src;
      }
    }

    function play() {
      attach();

      if (cover) {
        cover.classList.add("is-hidden");
      }

      var attempt = video.play();

      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
      if (!loaded) {
        play();
      }
    });

    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  }
})();
