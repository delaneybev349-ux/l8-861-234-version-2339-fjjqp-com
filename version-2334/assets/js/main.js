(function () {
  var header = document.querySelector('[data-header]');
  var menuButton = document.querySelector('[data-mobile-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');
  var backToTop = document.querySelector('[data-back-to-top]');

  function updateHeader() {
    if (!header) {
      return;
    }
    header.classList.toggle('is-scrolled', window.scrollY > 20);
  }

  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  if (backToTop) {
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function startAutoPlay() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        startAutoPlay();
      });
    });

    if (slides.length > 1) {
      startAutoPlay();
    }
  }

  document.querySelectorAll('[data-filter-form]').forEach(function (form) {
    var input = form.querySelector('[data-filter-input]');
    var typeSelect = form.querySelector('[data-filter-type]');
    var yearSelect = form.querySelector('[data-filter-year]');
    var countOutput = form.querySelector('[data-filter-count]');
    var section = form.closest('.section') || document;
    var cards = Array.prototype.slice.call(section.querySelectorAll('[data-movie-card]'));

    function matchYear(cardYear, selectedYear) {
      if (!selectedYear) {
        return true;
      }
      if (selectedYear === '2022') {
        return Number(cardYear) <= 2022;
      }
      return cardYear === selectedYear;
    }

    function applyFilter() {
      var keyword = (input && input.value ? input.value : '').trim().toLowerCase();
      var selectedType = typeSelect ? typeSelect.value : '';
      var selectedYear = yearSelect ? yearSelect.value : '';
      var visibleCount = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.genre
        ].join(' ').toLowerCase();
        var typeValue = card.dataset.type || '';
        var yearValue = card.dataset.year || '';
        var isVisible = true;

        if (keyword && haystack.indexOf(keyword) === -1) {
          isVisible = false;
        }
        if (selectedType && typeValue.indexOf(selectedType) === -1) {
          isVisible = false;
        }
        if (!matchYear(yearValue, selectedYear)) {
          isVisible = false;
        }

        card.hidden = !isVisible;
        if (isVisible) {
          visibleCount += 1;
        }
      });

      if (countOutput) {
        countOutput.textContent = '共 ' + visibleCount + ' 部';
      }
    }

    ['input', 'change'].forEach(function (eventName) {
      if (input) {
        input.addEventListener(eventName, applyFilter);
      }
      if (typeSelect) {
        typeSelect.addEventListener(eventName, applyFilter);
      }
      if (yearSelect) {
        yearSelect.addEventListener(eventName, applyFilter);
      }
    });

    applyFilter();
  });
}());
