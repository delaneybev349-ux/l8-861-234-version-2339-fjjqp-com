(function () {
    var header = document.querySelector(".site-header");
    var toggle = document.querySelector("[data-nav-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (toggle && mobileNav) {
        toggle.addEventListener("click", function () {
            mobileNav.classList.toggle("is-open");
        });
    }

    if (header) {
        var setHeader = function () {
            if (window.scrollY > 12) {
                header.classList.add("is-scrolled");
            } else {
                header.classList.remove("is-scrolled");
            }
        };
        setHeader();
        window.addEventListener("scroll", setHeader, { passive: true });
    }

    document.querySelectorAll("img").forEach(function (image) {
        image.addEventListener("error", function () {
            image.classList.add("is-empty");
        });
    });

    document.querySelectorAll("[data-carousel]").forEach(function (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-slide]"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-slide-dot]"));
        var prev = carousel.querySelector("[data-carousel-prev]");
        var next = carousel.querySelector("[data-carousel-next]");
        var index = 0;
        var timer = null;

        if (!slides.length) {
            return;
        }

        var show = function (nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        };

        var start = function () {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        };

        var restart = function () {
            if (timer) {
                window.clearInterval(timer);
            }
            start();
        };

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

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                restart();
            });
        });

        show(0);
        start();
    });

    document.querySelectorAll(".movie-search").forEach(function (input) {
        input.addEventListener("input", function () {
            var term = input.value.trim().toLowerCase();
            var scope = input.closest("main") || document;
            scope.querySelectorAll("[data-movie-card]").forEach(function (card) {
                var text = (card.getAttribute("data-filter") || card.textContent || "").toLowerCase();
                card.style.display = text.indexOf(term) >= 0 ? "" : "none";
            });
        });
    });
})();
