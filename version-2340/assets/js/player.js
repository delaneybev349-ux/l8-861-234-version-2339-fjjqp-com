import { H as Hls } from './hls-vendor-dru42stk.js';

const setupPlayer = (player) => {
    const video = player.querySelector('video');
    const button = player.querySelector('[data-play-button]');
    const status = player.querySelector('[data-player-status]');
    const stream = player.dataset.stream || (video ? video.dataset.stream : '');
    let hls = null;
    let ready = false;

    if (!video || !button || !stream) {
        return;
    }

    const setStatus = (message) => {
        if (status) {
            status.textContent = message;
        }
    };

    const attachStream = () => new Promise((resolve, reject) => {
        if (ready) {
            resolve();
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = stream;
            ready = true;
            resolve();
            return;
        }

        if (Hls && Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: false,
                maxBufferLength: 30
            });
            hls.loadSource(stream);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                ready = true;
                resolve();
            });
            hls.on(Hls.Events.ERROR, (event, data) => {
                if (data && data.fatal) {
                    reject(new Error(data.details || 'HLS 加载失败'));
                }
            });
            return;
        }

        video.src = stream;
        ready = true;
        resolve();
    });

    const play = async () => {
        button.disabled = true;
        setStatus('正在加载播放源...');
        try {
            await attachStream();
            video.controls = true;
            button.classList.add('is-hidden');
            await video.play();
            setStatus('正在播放');
        } catch (error) {
            button.disabled = false;
            button.classList.remove('is-hidden');
            setStatus('播放源加载失败，请稍后重试');
        }
    };

    button.addEventListener('click', play);
    video.addEventListener('play', () => {
        button.classList.add('is-hidden');
        setStatus('正在播放');
    });
    video.addEventListener('pause', () => {
        if (!video.ended) {
            setStatus('已暂停');
        }
    });
    video.addEventListener('ended', () => {
        setStatus('播放结束');
    });
    window.addEventListener('pagehide', () => {
        if (hls) {
            hls.destroy();
        }
    });
};

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-player]').forEach(setupPlayer);
});
