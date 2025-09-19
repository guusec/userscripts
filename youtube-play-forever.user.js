    // ==UserScript==
    // @name         Youtube 'Video paused. Continue watching?' Auto confirmer
    // @namespace    Youtube 'Video paused. Continue watching?' Auto confirmer
    // @version      1
    // @description  Automatically clicks 'Ok' when the 'Video paused. Continue watching?' dialog pops up and pauses your videos.
    // @author       giuseppesec
    // @match        *://*youtube.com/*
    // @icon         https://www.google.com/s2/favicons?domain=youtube.com
    // @grant        none
    // ==/UserScript==

(function() {
    'use strict';

    function simulateActivity() {
        const mouseEvent = new MouseEvent('mousemove', {
            view: window,
            bubbles: true,
            cancelable: true
        });
        document.dispatchEvent(mouseEvent);

        const keyboardEvent = new KeyboardEvent('keydown', {
            key: 'Shift',
            code: 'ShiftLeft',
            keyCode: 16,
            bubbles: true
        });
        document.dispatchEvent(keyboardEvent);

        window.dispatchEvent(new Event('focus'));

        console.log('[YouTube Anti-Idle] Simulated activity.');
    }

    setInterval(simulateActivity, 5 * 60 * 1000); // Every 5 minutes

    Object.defineProperty(document, 'hidden', { get: () => false });
    Object.defineProperty(document, 'visibilityState', { get: () => 'visible' });

})();

