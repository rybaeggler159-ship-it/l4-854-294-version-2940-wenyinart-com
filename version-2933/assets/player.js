(function () {
  window.initMoviePlayer = function (videoId, buttonId, source) {
    const video = document.getElementById(videoId);
    const button = document.getElementById(buttonId);
    let loaded = false;

    if (!video || !button || !source) {
      return;
    }

    const loadVideo = function () {
      if (loaded) {
        return;
      }

      loaded = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls({
          lowLatencyMode: true,
          enableWorker: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        return;
      }

      video.src = source;
    };

    const start = function () {
      loadVideo();
      video.setAttribute('controls', 'controls');
      button.classList.add('is-hidden');
      const playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          button.classList.remove('is-hidden');
        });
      }
    };

    button.addEventListener('click', start);
    video.addEventListener('click', function () {
      if (!loaded || video.paused) {
        start();
      }
    });
  };
})();
