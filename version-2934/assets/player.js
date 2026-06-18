function setupVideoPlayer(sourceUrl) {
  const video = document.getElementById("moviePlayer");
  const cover = document.querySelector("[data-player-cover]");
  const startButton = document.querySelector("[data-player-start]");
  let hlsPlayer = null;

  if (!video || !sourceUrl) {
    return;
  }

  function prepareVideo() {
    if (video.getAttribute("data-ready") === "1") {
      return Promise.resolve();
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = sourceUrl;
    } else if (typeof Hls !== "undefined" && Hls.isSupported()) {
      hlsPlayer = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hlsPlayer.loadSource(sourceUrl);
      hlsPlayer.attachMedia(video);
    } else {
      video.src = sourceUrl;
    }

    video.setAttribute("data-ready", "1");
    return new Promise(function (resolve) {
      setTimeout(resolve, 80);
    });
  }

  async function startPlayback() {
    await prepareVideo();

    if (cover) {
      cover.classList.add("is-hidden");
    }

    video.controls = true;

    try {
      await video.play();
    } catch (error) {
      video.controls = true;
    }
  }

  if (cover) {
    cover.addEventListener("click", startPlayback);
  }

  if (startButton) {
    startButton.addEventListener("click", function (event) {
      event.stopPropagation();
      startPlayback();
    });
  }

  video.addEventListener("click", function () {
    if (video.paused) {
      startPlayback();
    }
  });

  video.addEventListener("play", function () {
    if (cover) {
      cover.classList.add("is-hidden");
    }
  });

  video.addEventListener("emptied", function () {
    if (hlsPlayer) {
      hlsPlayer.destroy();
      hlsPlayer = null;
    }
  });
}
