(function () {
  var menuButton = document.querySelector(".menu-toggle");
  var panel = document.querySelector(".mobile-panel");

  if (menuButton && panel) {
    menuButton.addEventListener("click", function () {
      var open = panel.hasAttribute("hidden");
      if (open) {
        panel.removeAttribute("hidden");
      } else {
        panel.setAttribute("hidden", "");
      }
      menuButton.setAttribute("aria-expanded", String(open));
    });
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function bindFilter(scope) {
    var input = scope.querySelector(".filter-input");
    var select = scope.querySelector(".filter-select");
    var grid = scope.parentElement.querySelector(".filter-results");
    var empty = scope.querySelector(".filter-empty");

    if (!grid || !input) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    if (query) {
      input.value = query;
    }

    function apply() {
      var q = normalize(input.value);
      var type = select ? normalize(select.value) : "";
      var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-year"),
          card.getAttribute("data-tags")
        ].join(" "));
        var cardType = normalize(card.getAttribute("data-type"));
        var matched = (!q || text.indexOf(q) !== -1) && (!type || cardType.indexOf(type) !== -1);

        card.classList.toggle("is-filtered-out", !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        if (visible === 0) {
          empty.removeAttribute("hidden");
        } else {
          empty.setAttribute("hidden", "");
        }
      }
    }

    input.addEventListener("input", apply);
    if (select) {
      select.addEventListener("change", apply);
    }
    apply();
  }

  document.querySelectorAll("[data-filter-scope]").forEach(bindFilter);
})();
