(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    ready(function () {
        var toggle = document.querySelector(".menu-toggle");
        var panel = document.querySelector(".mobile-panel");
        if (toggle && panel) {
            toggle.addEventListener("click", function () {
                var open = panel.classList.toggle("is-open");
                toggle.setAttribute("aria-expanded", open ? "true" : "false");
                toggle.textContent = open ? "×" : "☰";
            });
        }

        initHero();
        initCategoryTools();
        initSearchPage();
    });

    function initHero() {
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
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                start();
            });
        });
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function initCategoryTools() {
        var list = document.querySelector("[data-category-list]");
        if (!list) {
            return;
        }
        var input = document.getElementById("category-filter");
        var sort = document.getElementById("category-sort");
        var empty = document.querySelector("[data-empty-state]");
        var cards = Array.prototype.slice.call(list.querySelectorAll("[data-movie-card]"));

        function cardText(card) {
            return [
                card.getAttribute("data-title") || "",
                card.getAttribute("data-year") || "",
                card.getAttribute("data-region") || "",
                card.getAttribute("data-tags") || ""
            ].join(" ").toLowerCase();
        }

        function apply() {
            var query = input ? input.value.trim().toLowerCase() : "";
            var visible = 0;
            cards.forEach(function (card) {
                var match = !query || cardText(card).indexOf(query) !== -1;
                card.style.display = match ? "" : "none";
                if (match) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }

        function applySort() {
            var value = sort ? sort.value : "default";
            var sorted = cards.slice();
            sorted.sort(function (a, b) {
                if (value === "views") {
                    return Number(b.getAttribute("data-views")) - Number(a.getAttribute("data-views"));
                }
                if (value === "year") {
                    return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
                }
                if (value === "title") {
                    return (a.getAttribute("data-title") || "").localeCompare(b.getAttribute("data-title") || "", "zh-Hans-CN");
                }
                return Number(a.getAttribute("data-index")) - Number(b.getAttribute("data-index"));
            });
            sorted.forEach(function (card) {
                list.appendChild(card);
            });
            cards = sorted;
            apply();
        }

        if (input) {
            input.addEventListener("input", apply);
        }
        if (sort) {
            sort.addEventListener("change", applySort);
        }
    }

    function initSearchPage() {
        var results = document.getElementById("search-results");
        var input = document.getElementById("search-input");
        if (!results || !input || !window.searchMovies) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var q = params.get("q") || "";
        var heading = document.getElementById("search-heading");
        var summary = document.getElementById("search-summary");
        var fallback = document.getElementById("search-fallback");
        input.value = q;

        function render(query) {
            var word = query.trim().toLowerCase();
            if (!word) {
                results.innerHTML = "";
                if (fallback) {
                    fallback.style.display = "grid";
                }
                if (heading) {
                    heading.textContent = "搜索结果";
                }
                if (summary) {
                    summary.textContent = "可按片名、地区、标签和年份检索。";
                }
                return;
            }
            var items = window.searchMovies.filter(function (movie) {
                return movie.text.indexOf(word) !== -1;
            }).slice(0, 80);
            if (fallback) {
                fallback.style.display = "none";
            }
            if (heading) {
                heading.textContent = "搜索结果：" + query;
            }
            if (summary) {
                summary.textContent = items.length ? "已为你匹配到相关影片。" : "没有找到匹配影片。";
            }
            results.innerHTML = items.map(function (movie) {
                return [
                    "<article class=\"movie-card\">",
                    "<a class=\"poster-link\" href=\"" + movie.url + "\" aria-label=\"观看" + escapeHtml(movie.title) + "\">",
                    "<img src=\"" + movie.image + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
                    "<span class=\"play-hover\">▶</span>",
                    "<span class=\"duration\">" + escapeHtml(movie.duration) + "</span>",
                    "</a>",
                    "<div class=\"movie-info\">",
                    "<h3><a href=\"" + movie.url + "\">" + escapeHtml(movie.title) + "</a></h3>",
                    "<p>" + escapeHtml(movie.oneLine) + "</p>",
                    "<div class=\"movie-meta\"><a href=\"category-" + movie.categorySlug + ".html\">" + escapeHtml(movie.category) + "</a><span>" + movie.year + "</span><span>" + escapeHtml(movie.region) + "</span></div>",
                    "</div>",
                    "</article>"
                ].join("");
            }).join("");
        }

        var form = document.querySelector("[data-search-form]");
        if (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var value = input.value.trim();
                var nextUrl = value ? "search.html?q=" + encodeURIComponent(value) : "search.html";
                window.history.replaceState(null, "", nextUrl);
                render(value);
            });
        }
        input.addEventListener("input", function () {
            render(input.value);
        });
        render(q);
    }

    function escapeHtml(value) {
        return String(value || "").replace(/[&<>\"]/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "\"": "&quot;"
            }[char];
        });
    }

    window.initMoviePlayer = function (sourceUrl) {
        var video = document.getElementById("movie-player");
        var overlay = document.getElementById("player-overlay");
        var message = document.getElementById("player-message");
        if (!video || !sourceUrl) {
            return;
        }
        var started = false;
        var hlsInstance = null;

        function showMessage(text) {
            if (!message) {
                return;
            }
            message.textContent = text;
            message.classList.add("is-visible");
            setTimeout(function () {
                message.classList.remove("is-visible");
            }, 2800);
        }

        function attach() {
            if (started) {
                return;
            }
            started = true;
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(sourceUrl);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
                    if (data && data.fatal) {
                        showMessage("视频加载暂时不可用，请稍后再试");
                    }
                });
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = sourceUrl;
            } else {
                showMessage("当前设备暂时无法播放该影片");
            }
        }

        function play() {
            attach();
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            video.controls = true;
            var request = video.play();
            if (request && request.catch) {
                request.catch(function () {
                    showMessage("点击视频区域即可继续播放");
                });
            }
        }

        if (overlay) {
            overlay.addEventListener("click", play);
        }
        video.addEventListener("click", function () {
            if (!started || video.paused) {
                play();
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };
})();
