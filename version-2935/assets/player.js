(function () {
  function attach(video, stream) {
    if (!video || !stream) {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = stream;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
      video.hlsInstance = hls;
      return;
    }

    video.src = stream;
  }

  window.initStreamPlayer = function (videoId, coverId, stream) {
    var video = document.getElementById(videoId);
    var cover = document.getElementById(coverId);

    if (!video) {
      return;
    }

    function start() {
      if (!video.getAttribute("data-ready")) {
        attach(video, stream);
        video.setAttribute("data-ready", "1");
      }

      if (cover) {
        cover.classList.add("is-hidden");
      }

      var playCall = video.play();
      if (playCall && playCall.catch) {
        playCall.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener("click", start);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
  };
})();
