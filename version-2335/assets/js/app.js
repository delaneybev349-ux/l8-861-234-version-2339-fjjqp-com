(function () {
  var state = {
    type: "all",
    year: "all",
    heroTimer: null
  };

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function text(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function initMenu() {
    var button = document.querySelector("[data-nav-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("open");
      document.body.classList.toggle("menu-open", panel.classList.contains("open"));
    });
  }

  function initHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle("active", current === index);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle("active", current === index);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(parseInt(dot.getAttribute("data-hero-dot"), 10) || 0);
      });
    });
    state.heroTimer = window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function searchValue() {
    var input = document.querySelector(".global-search-input");
    return input ? text(input.value) : "";
  }

  function applyFilters() {
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    if (!cards.length) {
      return;
    }
    var query = searchValue();
    var visible = 0;
    cards.forEach(function (card) {
      var haystack = text(card.getAttribute("data-search"));
      var typeOk = state.type === "all" || card.getAttribute("data-type") === state.type;
      var yearOk = state.year === "all" || card.getAttribute("data-year") === state.year;
      var queryOk = !query || haystack.indexOf(query) !== -1;
      var ok = typeOk && yearOk && queryOk;
      card.classList.toggle("hide-card", !ok);
      if (ok) {
        visible += 1;
      }
    });
    var empty = document.querySelector("[data-empty-state]");
    if (empty) {
      empty.classList.toggle("show", visible === 0);
    }
  }

  function initFilters() {
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q") || "";
    var input = document.querySelector(".global-search-input");
    if (input && q) {
      input.value = q;
    }
    if (input) {
      input.addEventListener("input", applyFilters);
    }
    Array.prototype.slice.call(document.querySelectorAll("[data-filter-type]")).forEach(function (button) {
      button.addEventListener("click", function () {
        state.type = button.getAttribute("data-filter-type") || "all";
        Array.prototype.slice.call(document.querySelectorAll("[data-filter-type]")).forEach(function (item) {
          item.classList.toggle("active", item === button);
        });
        applyFilters();
      });
    });
    Array.prototype.slice.call(document.querySelectorAll("[data-filter-year]")).forEach(function (button) {
      button.addEventListener("click", function () {
        state.year = button.getAttribute("data-filter-year") || "all";
        Array.prototype.slice.call(document.querySelectorAll("[data-filter-year]")).forEach(function (item) {
          item.classList.toggle("active", item === button);
        });
        applyFilters();
      });
    });
    applyFilters();
  }

  function attachHls(video, url) {
    if (!video || !url) {
      return;
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(url);
      hls.attachMedia(video);
      video._hls = hls;
      return;
    }
    video.src = url;
  }

  function initPlayers() {
    Array.prototype.slice.call(document.querySelectorAll("[data-video-url]")).forEach(function (box) {
      var video = box.querySelector("video");
      var button = box.querySelector(".player-cover");
      var url = box.getAttribute("data-video-url");
      var attached = false;
      function start() {
        if (!attached) {
          attachHls(video, url);
          attached = true;
        }
        box.classList.add("is-playing");
        var playPromise = video.play();
        if (playPromise && playPromise.catch) {
          playPromise.catch(function () {});
        }
      }
      if (button) {
        button.addEventListener("click", start);
      }
      if (video) {
        video.addEventListener("click", function () {
          if (video.paused) {
            start();
          }
        });
      }
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initPlayers();
  });
})();
