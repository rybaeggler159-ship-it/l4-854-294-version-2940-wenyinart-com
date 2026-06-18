(function () {
  function loadVideo(player) {
    var video = player.querySelector('video');
    var source = player.getAttribute('data-m3u8');

    if (!video || !source) {
      return;
    }

    if (video.getAttribute('data-ready') === '1') {
      video.play();
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.setAttribute('data-ready', '1');
      video.play();
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      video.setAttribute('data-ready', '1');
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play();
      });
    }
  }

  document.querySelectorAll('[data-player]').forEach(function (player) {
    var button = player.querySelector('[data-play-button]');
    var video = player.querySelector('video');

    function start() {
      player.classList.add('is-playing');
      loadVideo(player);
    }

    if (button) {
      button.addEventListener('click', start);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          start();
        }
      });
      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });
    }
  });
})();
