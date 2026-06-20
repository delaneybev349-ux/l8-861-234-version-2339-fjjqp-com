(function () {
  var header = document.querySelector('[data-header]');
  var toggle = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  function onScroll() {
    if (!header) {
      return;
    }
    if (window.scrollY > 28) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function startHero() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        startHero();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        startHero();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        startHero();
      });
    });

    showSlide(0);
    startHero();
  }

  var localSearch = document.querySelector('[data-local-search]');
  if (localSearch) {
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    localSearch.addEventListener('input', function () {
      var value = localSearch.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search-text') || '').toLowerCase();
        card.style.display = text.indexOf(value) >= 0 ? '' : 'none';
      });
    });
  }

  function renderSearchResults() {
    var results = document.getElementById('search-results');
    var input = document.getElementById('global-search');
    var title = document.querySelector('[data-search-title]');
    if (!results || typeof movieSearchItems === 'undefined') {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    if (input) {
      input.value = query;
    }
    if (!query) {
      return;
    }
    var terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    var matches = movieSearchItems.filter(function (item) {
      var text = item.text.toLowerCase();
      return terms.every(function (term) {
        return text.indexOf(term) >= 0;
      });
    }).slice(0, 96);
    if (title) {
      title.textContent = '搜索：' + query;
    }
    results.innerHTML = matches.map(function (item) {
      return '<a class="movie-card" href="' + item.href + '">' +
        '<div class="poster-wrap"><img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy"><span class="year-badge">' + escapeHtml(item.year) + '</span><span class="play-badge">▶</span></div>' +
        '<div class="movie-body"><div class="movie-tags"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div><h3>' + escapeHtml(item.title) + '</h3><p>' + escapeHtml(item.oneLine) + '</p><div class="movie-meta"><span>' + escapeHtml(item.genre) + '</span></div></div>' +
        '</a>';
    }).join('');
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function (character) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[character];
    });
  }

  renderSearchResults();

  var player = document.getElementById('movie-player');
  if (player) {
    var stage = player.closest('.player-stage');
    var layer = stage ? stage.querySelector('.play-layer') : null;
    var stream = player.getAttribute('data-stream');
    var attached = false;

    function attachStream() {
      if (attached || !stream) {
        return;
      }
      attached = true;
      if (player.canPlayType('application/vnd.apple.mpegurl')) {
        player.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(stream);
        hls.attachMedia(player);
        player._hls = hls;
      } else {
        player.src = stream;
      }
    }

    function startPlayer() {
      attachStream();
      player.controls = true;
      if (layer) {
        layer.classList.add('is-hidden');
      }
      var playback = player.play();
      if (playback && typeof playback.catch === 'function') {
        playback.catch(function () {
          player.controls = true;
          if (layer) {
            layer.classList.remove('is-hidden');
          }
        });
      }
    }

    if (layer) {
      layer.addEventListener('click', startPlayer);
    }

    player.addEventListener('click', function () {
      if (player.paused) {
        startPlayer();
      }
    });

    player.addEventListener('play', function () {
      if (layer) {
        layer.classList.add('is-hidden');
      }
    });
  }
})();
