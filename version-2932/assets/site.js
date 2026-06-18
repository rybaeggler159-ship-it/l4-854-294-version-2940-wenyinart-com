(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call(
      (root || document).querySelectorAll(selector),
    );
  }

  function normalize(text) {
    return String(text || "")
      .toLowerCase()
      .trim();
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-button]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = selectAll(".hero-slide", hero);
    var dots = selectAll(".hero-dot", hero);
    var active = 0;
    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === active);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
      });
    });
    if (slides.length > 1) {
      window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }
  }

  function initFiltering() {
    var cards = selectAll("[data-movie-card]");
    var input = document.querySelector("[data-search-input]");
    var chips = selectAll("[data-filter-chip]");
    var empty = document.querySelector("[data-empty-state]");
    var activeFilter = "all";
    if (!cards.length) {
      return;
    }
    function apply() {
      var query = normalize(input ? input.value : "");
      var visible = 0;
      cards.forEach(function (card) {
        var hay = normalize(card.getAttribute("data-search"));
        var type = normalize(card.getAttribute("data-type"));
        var category = normalize(card.getAttribute("data-category"));
        var matchedText = !query || hay.indexOf(query) !== -1;
        var matchedFilter =
          activeFilter === "all" ||
          type.indexOf(activeFilter) !== -1 ||
          category.indexOf(activeFilter) !== -1 ||
          hay.indexOf(activeFilter) !== -1;
        var show = matchedText && matchedFilter;
        card.style.display = show ? "" : "none";
        if (show) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }
    if (input) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      if (q) {
        input.value = q;
      }
      input.addEventListener("input", apply);
    }
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (item) {
          item.classList.remove("is-active");
        });
        chip.classList.add("is-active");
        activeFilter = normalize(chip.getAttribute("data-filter-chip"));
        apply();
      });
    });
    apply();
  }

  function initPlayers() {
    selectAll(".player-box").forEach(function (box) {
      var video = box.querySelector("video");
      var cover = box.querySelector(".player-cover");
      if (!video) {
        return;
      }
      var stream = video.getAttribute("data-stream");
      var ready = false;
      function attach() {
        if (ready || !stream) {
          return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
          ready = true;
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
          ready = true;
          return;
        }
        video.src = stream;
        ready = true;
      }
      function play() {
        attach();
        if (cover) {
          cover.classList.add("is-hidden");
        }
        var result = video.play();
        if (result && result.catch) {
          result.catch(function () {});
        }
      }
      if (cover) {
        cover.addEventListener("click", play);
      }
      video.addEventListener("click", function () {
        if (!ready) {
          play();
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMenu();
    initHero();
    initFiltering();
    initPlayers();
  });
})();
