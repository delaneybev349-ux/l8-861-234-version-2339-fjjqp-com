(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var panel = document.querySelector('.mobile-panel');

    if (menuButton && panel) {
        menuButton.addEventListener('click', function () {
            var expanded = menuButton.getAttribute('aria-expanded') === 'true';
            menuButton.setAttribute('aria-expanded', String(!expanded));
            panel.hidden = expanded;
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var prev = hero.querySelector('.hero-prev');
        var next = hero.querySelector('.hero-next');
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === current);
            });
        }

        function play() {
            clearInterval(timer);
            timer = setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                play();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                play();
            });
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                play();
            });
        });

        show(0);
        play();
    }

    var searchInput = document.querySelector('#site-search-input') || document.querySelector('.page-filter');
    var sortSelect = document.querySelector('.sort-select');
    var grid = document.querySelector('.searchable-grid');
    var empty = document.querySelector('.empty-state');

    function applyQueryFromUrl() {
        var pageInput = document.querySelector('#site-search-input');
        if (!pageInput) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q) {
            pageInput.value = q;
        }
    }

    function filterCards() {
        if (!grid || !searchInput) {
            return;
        }
        var keyword = searchInput.value.trim().toLowerCase();
        var cards = Array.prototype.slice.call(grid.querySelectorAll('.search-card'));
        var visible = 0;

        cards.forEach(function (card) {
            var text = [
                card.getAttribute('data-title') || '',
                card.getAttribute('data-region') || '',
                card.getAttribute('data-type') || '',
                card.getAttribute('data-year') || '',
                card.getAttribute('data-tags') || ''
            ].join(' ').toLowerCase();
            var matched = !keyword || text.indexOf(keyword) !== -1;
            card.hidden = !matched;
            if (matched) {
                visible += 1;
            }
        });

        if (empty) {
            empty.hidden = visible !== 0;
        }
    }

    function sortCards() {
        if (!grid || !sortSelect) {
            return;
        }
        var mode = sortSelect.value;
        var cards = Array.prototype.slice.call(grid.querySelectorAll('.search-card'));

        cards.sort(function (a, b) {
            if (mode === 'views') {
                return Number(b.getAttribute('data-views')) - Number(a.getAttribute('data-views'));
            }
            if (mode === 'year') {
                return String(b.getAttribute('data-year')).localeCompare(String(a.getAttribute('data-year')), 'zh-CN', { numeric: true });
            }
            if (mode === 'title') {
                return String(a.getAttribute('data-title')).localeCompare(String(b.getAttribute('data-title')), 'zh-CN');
            }
            return 0;
        });

        cards.forEach(function (card) {
            grid.appendChild(card);
        });
        filterCards();
    }

    applyQueryFromUrl();

    if (searchInput) {
        searchInput.addEventListener('input', filterCards);
        filterCards();
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', sortCards);
    }
})();
