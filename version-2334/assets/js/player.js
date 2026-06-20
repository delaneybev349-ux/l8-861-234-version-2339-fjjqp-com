import { H as Hls } from './hls-dru42stk.js';

function setStatus(root, message) {
  var status = root.querySelector('[data-player-status]');
  if (status) {
    status.textContent = message;
  }
}

function initPlayer(root) {
  var video = root.querySelector('video[data-source]');
  var startButton = root.querySelector('[data-player-start]');
  var source = video ? video.dataset.source : '';
  var hls = null;
  var initialized = false;

  if (!video || !startButton || !source) {
    return;
  }

  function attachSource() {
    if (initialized) {
      return Promise.resolve();
    }
    initialized = true;
    setStatus(root, '正在加载播放源');

    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        setStatus(root, '播放源加载完成');
      });
      hls.on(Hls.Events.ERROR, function (eventName, data) {
        if (data && data.fatal) {
          setStatus(root, '播放源暂时无法加载，请稍后重试');
          if (hls) {
            hls.destroy();
          }
        }
      });
      return Promise.resolve();
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      setStatus(root, '播放源加载完成');
      return Promise.resolve();
    }

    setStatus(root, '当前浏览器不支持 HLS 播放');
    return Promise.reject(new Error('HLS is not supported'));
  }

  function playVideo() {
    attachSource()
      .then(function () {
        video.controls = true;
        return video.play();
      })
      .then(function () {
        startButton.classList.add('is-hidden');
        setStatus(root, '正在播放');
      })
      .catch(function () {
        video.controls = true;
      });
  }

  startButton.addEventListener('click', playVideo);
  video.addEventListener('play', function () {
    startButton.classList.add('is-hidden');
    setStatus(root, '正在播放');
  });
  video.addEventListener('pause', function () {
    setStatus(root, '已暂停');
  });
  video.addEventListener('ended', function () {
    setStatus(root, '播放结束');
  });
  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
}

document.querySelectorAll('[data-player]').forEach(initPlayer);
