(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    }

    function queryValue() {
        return new URLSearchParams(window.location.search).get("q") || "";
    }

    function normalize(text) {
        return String(text || "").toLowerCase().trim();
    }

    function escapeHTML(text) {
        return String(text || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function setupMenus() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function setupForms() {
        document.querySelectorAll("[data-site-search]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = form.querySelector("input[name='q']");
                var value = input ? input.value.trim() : "";
                var target = form.getAttribute("action") || "search.html";
                if (value) {
                    window.location.href = target + "?q=" + encodeURIComponent(value);
                } else {
                    window.location.href = target;
                }
            });
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        if (slides.length <= 1 || dots.length <= 1) {
            return;
        }
        var active = 0;
        var timer;
        function show(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === active);
            });
        }
        function start() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5200);
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                start();
            });
        });
        show(0);
        start();
    }

    function setupPlayers() {
        document.querySelectorAll("[data-player]").forEach(function (player) {
            var video = player.querySelector("video");
            var button = player.querySelector("[data-play]");
            var stream = player.getAttribute("data-stream");
            var hlsInstance = null;
            if (!video || !button || !stream) {
                return;
            }
            function loadAndPlay() {
                if (video.getAttribute("data-ready") !== "true") {
                    if (video.canPlayType("application/vnd.apple.mpegurl")) {
                        video.src = stream;
                    } else if (window.Hls && window.Hls.isSupported()) {
                        hlsInstance = new window.Hls();
                        hlsInstance.loadSource(stream);
                        hlsInstance.attachMedia(video);
                    } else {
                        video.src = stream;
                    }
                    video.setAttribute("data-ready", "true");
                }
                video.controls = true;
                player.classList.add("is-playing");
                video.play().catch(function () {
                    video.controls = true;
                });
            }
            button.addEventListener("click", loadAndPlay);
            video.addEventListener("click", function () {
                if (video.paused) {
                    loadAndPlay();
                } else {
                    video.pause();
                }
            });
            window.addEventListener("beforeunload", function () {
                if (hlsInstance && typeof hlsInstance.destroy === "function") {
                    hlsInstance.destroy();
                }
            });
        });
    }

    function setupImages() {
        document.querySelectorAll("img").forEach(function (image) {
            image.addEventListener("error", function () {
                image.classList.add("is-hidden");
            });
        });
    }

    function renderSearch() {
        var box = document.querySelector("[data-search-results]");
        if (!box || !window.SITE_MOVIES) {
            return;
        }
        var query = queryValue();
        document.querySelectorAll("input[name='q']").forEach(function (input) {
            input.value = query;
        });
        var words = normalize(query).split(/\s+/).filter(Boolean);
        var source = window.SITE_MOVIES;
        var results = words.length ? source.filter(function (movie) {
            var haystack = normalize([movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.desc].join(" "));
            return words.every(function (word) {
                return haystack.indexOf(word) !== -1;
            });
        }) : source.slice(0, 80);
        var title = document.querySelector("[data-search-title]");
        if (title) {
            title.textContent = query ? "搜索结果" : "推荐浏览";
        }
        if (!results.length) {
            box.innerHTML = '<div class="search-empty">没有找到匹配内容。</div>';
            return;
        }
        box.innerHTML = results.slice(0, 240).map(function (movie) {
            return '<a class="movie-card" href="' + escapeHTML(movie.url) + '">' +
                '<span class="poster"><img src="' + escapeHTML(movie.cover) + '" alt="' + escapeHTML(movie.title) + '" loading="lazy"><span class="poster-shade"></span><span class="poster-type">' + escapeHTML(movie.type || "影片") + '</span><span class="poster-duration">' + escapeHTML(movie.duration) + '</span></span>' +
                '<span class="card-body"><strong class="card-title">' + escapeHTML(movie.title) + '</strong><span class="card-desc">' + escapeHTML(movie.desc || "") + '</span><span class="card-meta"><span>' + escapeHTML(movie.region || "") + '</span><span>' + escapeHTML(movie.year || "") + '</span><span>★ ' + escapeHTML(movie.rating) + '</span></span></span>' +
                '</a>';
        }).join("");
        setupImages();
    }

    ready(function () {
        setupMenus();
        setupForms();
        setupHero();
        setupPlayers();
        setupImages();
        renderSearch();
    });
})();
