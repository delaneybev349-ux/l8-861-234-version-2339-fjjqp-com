(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMobileNav() {
    var button = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function setupHeroSlider() {
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
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });
    show(0);
    restart();
  }

  function setupFilters() {
    var grids = Array.prototype.slice.call(document.querySelectorAll("[data-filter-grid]"));
    if (!grids.length) {
      return;
    }
    var input = document.querySelector("[data-filter-input]");
    var chips = Array.prototype.slice.call(document.querySelectorAll("[data-filter-value]"));
    var activeValue = "";

    function normalize(value) {
      return (value || "").toString().trim().toLowerCase();
    }

    function apply() {
      var query = normalize(input ? input.value : "");
      var chipValue = normalize(activeValue);
      grids.forEach(function (grid) {
        Array.prototype.slice.call(grid.children).forEach(function (card) {
          var text = normalize(card.getAttribute("data-search"));
          var matchText = !query || text.indexOf(query) !== -1;
          var matchChip = !chipValue || text.indexOf(chipValue) !== -1;
          card.classList.toggle("is-hidden", !(matchText && matchChip));
        });
      });
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
          item.classList.remove("active");
        });
        chip.classList.add("active");
        activeValue = chip.getAttribute("data-filter-value") || "";
        apply();
      });
    });
    apply();
  }

  function setupPlayers() {
    var shells = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    shells.forEach(function (shell) {
      var video = shell.querySelector("video");
      var overlay = shell.querySelector(".player-overlay");
      var stream = shell.getAttribute("data-stream");
      var started = false;
      var hls = null;

      function begin() {
        if (!video || !stream) {
          return;
        }
        shell.classList.add("playing");
        if (started) {
          video.play().catch(function () {});
          return;
        }
        started = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
          video.play().catch(function () {});
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(stream);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal && hls) {
              hls.destroy();
              hls = null;
              started = false;
            }
          });
        } else {
          video.src = stream;
          video.play().catch(function () {});
        }
      }

      if (overlay) {
        overlay.addEventListener("click", begin);
      }
      if (video) {
        video.addEventListener("play", function () {
          shell.classList.add("playing");
        });
        video.addEventListener("pause", function () {
          if (!video.currentTime) {
            shell.classList.remove("playing");
          }
        });
      }
    });
  }

  ready(function () {
    setupMobileNav();
    setupHeroSlider();
    setupFilters();
    setupPlayers();
  });
})();
