export function attachMoviePlayer(Hls, streamUrl) {
    var video = document.getElementById('movie-player');
    var layer = document.getElementById('play-layer');
    var status = document.getElementById('player-status');
    var hls = null;
    var prepared = false;
    var requested = false;

    if (!video || !layer || !streamUrl) {
        return;
    }

    function showStatus(text) {
        if (status) {
            status.textContent = text || '';
        }
    }

    function restoreLayer() {
        layer.classList.remove('is-hidden');
    }

    function prepare() {
        if (prepared) {
            return;
        }
        prepared = true;

        if (Hls && Hls.isSupported()) {
            hls = new Hls({ enableWorker: true, lowLatencyMode: true });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, function () {
                if (requested) {
                    video.play().catch(function () {
                        restoreLayer();
                    });
                }
            });
            hls.on(Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    showStatus('播放遇到问题，请稍后再试');
                    restoreLayer();
                }
            });
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
            return;
        }

        showStatus('播放遇到问题，请稍后再试');
    }

    function start() {
        requested = true;
        showStatus('');
        layer.classList.add('is-hidden');
        prepare();
        video.play().catch(function () {
            restoreLayer();
        });
    }

    layer.addEventListener('click', start);

    video.addEventListener('click', function () {
        if (video.paused) {
            start();
        } else {
            video.pause();
        }
    });

    video.addEventListener('play', function () {
        layer.classList.add('is-hidden');
    });

    video.addEventListener('ended', function () {
        restoreLayer();
    });

    window.addEventListener('pagehide', function () {
        if (hls) {
            hls.destroy();
        }
    });
}
