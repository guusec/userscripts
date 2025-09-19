    // ==UserScript==
    // @name        Remove ads Twitch
    // @match       https://www.twitch.tv/*
    // @grant       none
    // @version     1.0
    // @author      giuseppesec
    // @license MIT
    // @description Continue to view twitch stream when ad
    // ==/UserScript==
    let switched = false
    function antiAdd() {
      const miniVideoparent = document.querySelector("div.picture-by-picture-player")
      const isOpen = !miniVideoparent.className.includes("picture-by-picture-player--collapsed")
      const mainVideo = document.querySelector("div.video-ref video")
      if (!isOpen) {
        if (switched) {
          mainVideo.muted = false
          switched = false
        }
        return;
      }
      const miniVideo = miniVideoparent.querySelector("video")
      // deplacer l'element mini video a coter de main video
      mainVideo.parentElement.appendChild(miniVideo)
      mainVideo.parentElement.appendChild(mainVideo.parentElement.querySelector("div"))
      // unmute mini video
      miniVideo.muted = mainVideo.muted
      mainVideo.muted = true
      switched = true
    }
    setInterval(antiAdd, 500)

