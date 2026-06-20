(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var button = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".mobile-nav");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
      button.textContent = open ? "×" : "☰";
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(next) {
      slides[index].classList.remove("active");
      dots[index].classList.remove("active");
      index = (next + slides.length) % slides.length;
      slides[index].classList.add("active");
      dots[index].classList.add("active");
    }
    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        if (timer) {
          window.clearInterval(timer);
        }
        show(dotIndex);
        start();
      });
    });
    start();
  }

  function setupCatalog() {
    var input = document.getElementById("catalog-search");
    var sort = document.getElementById("sort-mode");
    var grid = document.querySelector(".catalog-grid");
    var empty = document.getElementById("empty-state");
    if (!grid) {
      return;
    }
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card, .rank-item"));
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    if (input && query) {
      input.value = query;
    }
    function filter() {
      var keyword = input ? input.value.trim().toLowerCase() : "";
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = card.textContent.toLowerCase();
        var matched = !keyword || haystack.indexOf(keyword) !== -1;
        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.style.display = visible ? "none" : "block";
      }
    }
    function reorder() {
      if (!sort) {
        return;
      }
      var mode = sort.value;
      var sorted = cards.slice();
      if (mode === "score") {
        sorted.sort(function (a, b) {
          return Number(b.dataset.score || 0) - Number(a.dataset.score || 0);
        });
      } else if (mode === "year") {
        sorted.sort(function (a, b) {
          return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
        });
      } else if (mode === "title") {
        sorted.sort(function (a, b) {
          return (a.dataset.title || "").localeCompare(b.dataset.title || "", "zh-Hans-CN");
        });
      } else {
        sorted.sort(function (a, b) {
          return cards.indexOf(a) - cards.indexOf(b);
        });
      }
      sorted.forEach(function (card) {
        grid.appendChild(card);
      });
      filter();
    }
    if (input) {
      input.addEventListener("input", filter);
    }
    if (sort) {
      sort.addEventListener("change", reorder);
    }
    filter();
  }

  window.initMoviePlayer = function (videoId, sourceUrl) {
    var video = document.getElementById(videoId);
    if (!video) {
      return;
    }
    var box = video.closest(".player-box");
    var button = box ? box.querySelector(".player-play") : null;
    var status = box ? box.querySelector(".player-status") : null;
    var instance = null;
    function setStatus(message) {
      if (status) {
        status.textContent = message || "";
      }
    }
    function prepare() {
      if (video.dataset.ready === "1") {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        instance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        instance.loadSource(sourceUrl);
        instance.attachMedia(video);
        instance.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            instance.recoverMediaError();
          } else if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            instance.startLoad();
          } else {
            setStatus("暂时无法播放，请稍后重试");
          }
        });
      } else {
        video.src = sourceUrl;
      }
      video.dataset.ready = "1";
    }
    function start() {
      prepare();
      setStatus("");
      if (box) {
        box.classList.add("is-loading");
      }
      video.controls = true;
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {
          setStatus("点击画面即可继续播放");
        });
      }
    }
    if (button) {
      button.addEventListener("click", start);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener("playing", function () {
      if (box) {
        box.classList.remove("is-loading");
        box.classList.add("is-playing");
      }
      setStatus("");
    });
    video.addEventListener("pause", function () {
      if (box && !video.ended) {
        box.classList.remove("is-playing");
      }
    });
    video.addEventListener("waiting", function () {
      if (box) {
        box.classList.add("is-loading");
      }
    });
    video.addEventListener("canplay", function () {
      if (box) {
        box.classList.remove("is-loading");
      }
    });
    video.addEventListener("ended", function () {
      if (box) {
        box.classList.remove("is-playing");
      }
    });
    window.addEventListener("beforeunload", function () {
      if (instance) {
        instance.destroy();
      }
    });
  };

  ready(function () {
    setupMenu();
    setupHero();
    setupCatalog();
  });
})();
