const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

const setupMobileMenu = () => {
    const toggle = $('[data-menu-toggle]');
    const panel = $('[data-mobile-panel]');
    if (!toggle || !panel) {
        return;
    }
    toggle.addEventListener('click', () => {
        const isOpen = panel.classList.toggle('open');
        toggle.setAttribute('aria-expanded', String(isOpen));
    });
};

const setupImageFallback = () => {
    $$('img[data-poster]').forEach((image) => {
        image.addEventListener('error', () => {
            image.classList.add('is-hidden');
            const frame = image.closest('.poster-frame');
            if (frame) {
                frame.classList.add('is-missing');
            }
        }, { once: true });
    });
};

const setupHero = () => {
    const hero = $('[data-hero]');
    if (!hero) {
        return;
    }
    const slides = $$('[data-slide]', hero);
    const dots = $$('[data-hero-dot]', hero);
    const previous = $('[data-hero-prev]', hero);
    const next = $('[data-hero-next]', hero);
    let active = 0;
    let timer = null;

    const show = (index) => {
        if (!slides.length) {
            return;
        }
        active = (index + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle('active', slideIndex === active);
        });
        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle('active', dotIndex === active);
        });
    };

    const start = () => {
        stop();
        timer = window.setInterval(() => show(active + 1), 5200);
    };

    const stop = () => {
        if (timer) {
            window.clearInterval(timer);
        }
    };

    if (previous) {
        previous.addEventListener('click', () => {
            show(active - 1);
            start();
        });
    }
    if (next) {
        next.addEventListener('click', () => {
            show(active + 1);
            start();
        });
    }
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            show(index);
            start();
        });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
};

const setupFilters = () => {
    const panel = $('[data-filter-panel]');
    const grid = $('[data-filter-grid]');
    if (!panel || !grid) {
        return;
    }
    const keywordInput = $('[data-filter-keyword]', panel);
    const regionSelect = $('[data-filter-region]', panel);
    const typeSelect = $('[data-filter-type]', panel);
    const yearSelect = $('[data-filter-year]', panel);
    const cards = $$('.movie-card', grid);
    const emptyState = $('[data-empty-state]');

    const normalize = (value) => String(value || '').trim().toLowerCase();

    const apply = () => {
        const keyword = normalize(keywordInput ? keywordInput.value : '');
        const region = normalize(regionSelect ? regionSelect.value : '');
        const type = normalize(typeSelect ? typeSelect.value : '');
        const year = normalize(yearSelect ? yearSelect.value : '');
        let visible = 0;

        cards.forEach((card) => {
            const text = normalize([
                card.dataset.title,
                card.dataset.region,
                card.dataset.type,
                card.dataset.year,
                card.dataset.genre,
                card.dataset.tags
            ].join(' '));
            const matchedKeyword = !keyword || text.includes(keyword);
            const matchedRegion = !region || normalize(card.dataset.region) === region;
            const matchedType = !type || normalize(card.dataset.type) === type;
            const matchedYear = !year || normalize(card.dataset.year) === year;
            const matched = matchedKeyword && matchedRegion && matchedType && matchedYear;
            card.hidden = !matched;
            if (matched) {
                visible += 1;
            }
        });

        if (emptyState) {
            emptyState.style.display = visible ? 'none' : 'block';
        }
    };

    [keywordInput, regionSelect, typeSelect, yearSelect].forEach((control) => {
        if (control) {
            control.addEventListener('input', apply);
            control.addEventListener('change', apply);
        }
    });
    apply();
};

const movieCardMarkup = (movie) => {
    const tags = (movie.tags || []).slice(0, 5).join(' ');
    return `
        <article class="movie-card" data-title="${escapeHtml(movie.title)}" data-region="${escapeHtml(movie.region)}" data-type="${escapeHtml(movie.type)}" data-year="${escapeHtml(movie.year)}" data-genre="${escapeHtml(movie.genre)}" data-tags="${escapeHtml(tags)}">
            <a class="poster-frame" href="${escapeHtml(movie.detail)}" aria-label="观看 ${escapeHtml(movie.title)}">
                <img src="${escapeHtml(movie.poster)}" alt="${escapeHtml(movie.title)}" loading="lazy" data-poster>
                <span class="poster-fallback">${escapeHtml(movie.title)}</span>
                <span class="type-badge">${escapeHtml(movie.type)}</span>
            </a>
            <div class="movie-card-body">
                <a class="movie-title" href="${escapeHtml(movie.detail)}">${escapeHtml(movie.title)}</a>
                <p class="movie-desc">${escapeHtml(movie.oneLine)}</p>
                <div class="meta-row">
                    <span>${escapeHtml(movie.region)}</span>
                    <span>${escapeHtml(movie.year)}</span>
                    <span>${escapeHtml(movie.genre)}</span>
                </div>
            </div>
        </article>`;
};

const escapeHtml = (value) => String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

const setupSearchPage = () => {
    const form = $('[data-search-form]');
    const input = $('[data-search-input]');
    const results = $('[data-search-results]');
    const empty = $('[data-search-empty]');
    if (!form || !input || !results || !Array.isArray(window.MOVIE_INDEX)) {
        return;
    }

    const params = new URLSearchParams(window.location.search);
    input.value = params.get('q') || '';

    const render = () => {
        const keyword = input.value.trim().toLowerCase();
        const movies = window.MOVIE_INDEX.filter((movie) => {
            if (!keyword) {
                return true;
            }
            const haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.oneLine, ...(movie.tags || [])]
                .join(' ')
                .toLowerCase();
            return haystack.includes(keyword);
        }).slice(0, 120);
        results.innerHTML = movies.map(movieCardMarkup).join('');
        if (empty) {
            empty.style.display = movies.length ? 'none' : 'block';
        }
        setupImageFallback();
    };

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const params = new URLSearchParams(window.location.search);
        if (input.value.trim()) {
            params.set('q', input.value.trim());
        } else {
            params.delete('q');
        }
        const nextUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
        window.history.replaceState({}, '', nextUrl);
        render();
    });

    input.addEventListener('input', render);
    render();
};

document.addEventListener('DOMContentLoaded', () => {
    setupMobileMenu();
    setupImageFallback();
    setupHero();
    setupFilters();
    setupSearchPage();
});
