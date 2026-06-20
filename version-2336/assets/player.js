function initMoviePlayer(url) {
    var video = document.getElementById("movie-video");
    var shell = document.getElementById("movie-player-shell");
    var layer = document.getElementById("movie-play-layer");
    var hls = null;
    var loaded = false;

    if (!video || !shell || !url) {
        return;
    }

    var load = function () {
        if (!loaded) {
            loaded = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = url;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(url);
                hls.attachMedia(video);
            } else {
                video.src = url;
            }
        }
        if (layer) {
            layer.classList.add("is-hidden");
        }
        var attempt = video.play();
        if (attempt && typeof attempt.catch === "function") {
            attempt.catch(function () {});
        }
    };

    if (layer) {
        layer.addEventListener("click", function (event) {
            event.preventDefault();
            event.stopPropagation();
            load();
        });
    }

    shell.addEventListener("click", function (event) {
        if (!loaded || event.target === shell) {
            load();
        }
    });

    video.addEventListener("play", function () {
        if (layer) {
            layer.classList.add("is-hidden");
        }
    });

    window.addEventListener("pagehide", function () {
        if (hls) {
            hls.destroy();
        }
    });
}
