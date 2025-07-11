

    // ==UserScript==
    // @name         Youtube Gruvbox
    // @namespace    Youtube Gruvbox
    // @version      1
    // @description  Makes youtube the best theme.
    // @author       giuseppesec
    // @match        *://*youtube.com/*
    // @icon         https://www.google.com/s2/favicons?domain=youtube.com
    // @grant        none
    // ==/UserScript==

(function() {
    'use strict';

    const css = `
html {
    --background-primary: #282828;
    --background-secondary: #32302f;
    --background-tertiary: #1d2021;
    --current-line: #282828;
    --selection: #8f3f71;
    --foreground: #ebdbb2;
    --comment: #928374;
    --inactive: #bdae93;
    --cyan: #689d6a;
    --green: #98971a;
    --orange: #d65d0e;
    --pink: #b16286;
    --purple: #bd93f9;
    --red: #cc241d;
    --yellow: #d79921;
    --blue: #83a598;
}
html:not(.style-scope)[dark],
:not(.style-scope)[dark] {
    --yt-spec-brand-background-primary: var(--background-secondary);
    --yt-spec-brand-background-secondary: var(--background-tertiary);
    --yt-spec-brand-background-solid: var(--background-primary);
    --yt-spec-general-background-a: var(--background-tertiary);
    --yt-spec-general-background-b: var(--background-secondary);
    --yt-spec-general-background-c: var(--background-primary);
    --yt-spec-error-background: var(--red);
    --yt-spec-text-primary: var(--foreground);
    --yt-spec-text-primary-inverse: var(--background-primary);
    --yt-spec-text-secondary: var(--comment);
    --yt-spec-text-disabled: var(--comment);
    --yt-spec-call-to-action: var(--orange);
    --yt-spec-icon-active-other: var(--yellow);
    --yt-spec-icon-inactive: var(--inactive);
    --yt-spec-icon-disabled: var(--comment);
    --yt-spec-badge-chip-background: var(--background-secondary);
    --yt-spec-verified-badge-background: var(--blue);
    --yt-spec-suggested-action: var(--background-tertiary);
    --yt-spec-button-chip-background-hover: var(--selection);
    --yt-spec-touch-response: var(--foreground);
    --yt-spec-paper-tab-ink: var(--pink);
    --yt-spec-filled-button-text: var(--orange);
    --yt-spec-call-to-action-inverse: var(--cyan);
    --yt-spec-brand-icon-active: var(--green);
    --yt-spec-brand-icon-inactive: var(--inactive);
    --yt-spec-brand-button-background: var(--orange);
    --yt-spec-brand-link-text: var(--green);
    --yt-spec-filled-button-focus-outline: var(--background-tertiary);
    --yt-spec-call-to-action-button-focus-outline: var(--blue);
    --yt-spec-brand-text-button-focus-outline: var(--red);
    --yt-spec-inactive-text-button-focus-outline: var(--inactive);
    --yt-spec-ad-indicator: var(--cyan);
    --yt-spec-brand-subscribe-button-background: var(--orange);
    --yt-spec-wordmark-text: var(--blue);
    --yt-spec-10-percent-layer: var(--background-secondary);
    --yt-spec-selected-nav-text: var(--selection);
    --yt-spec-themed-blue: var(--blue);
    --yt-spec-themed-green: var(--green);
    --yt-spec-themed-overlay-background: var(--background-tertiary);
    --yt-spec-base-background: var(--background-primary);
    --ytd-searchbox-background: var(--background-secondary);
    --ytd-searchbox-legacy-border-color: var(--cyan);
    --ytd-searchbox-legacy-button-border-color: var(--cyan);
    --ytd-searchbox-legacy-button-color: var(--blue);
}
#container.ytd-searchbox {
    background: var(--background-primary) !important;
    border: 2px solid var(--background-primary) !important;
    border-radius: 4px;
    color: var(--foreground) !important;
}
#container.ytd-searchbox:hover,
#container.ytd-searchbox:focus,
#container.ytd-searchbox:active {
    border: 2px solid var(--background-secondary) !important;
}
#search-icon-legacy.ytd-searchbox {
    border-radius: 4px;
    margin-left: 5px;
    background: var(--orange);
    border-color: var(--orange);
    color: var(--foreground) !important;
}
#search-icon-legacy.ytd-searchbox:hover,
#search-icon-legacy.ytd-searchbox:focus {
    background: var(--yellow) !important;
    border: 2px solid var(--yellow);
}
ytd-searchbox[system-icons] #search-icon-legacy.ytd-searchbox yt-icon.ytd-searchbox {
    color: var(--background-primary);
    font-weight: bolder;
}
tp-yt0app-drawer {
    background: var(--background-primary);
}
ytd-masthead {
    --paper-input-container-input-align: baseline;
    display: block;
    width: 100%;
    background: var(--background-primary);
}
paper-toggle-button[checked]:not([disabled]) .toggle-bar.paper-toggle-button {
    opacity: 1;
    background-color: var(--background-primary);
}
.guide-entry-badge.ytd-guide-entry-renderer {
    color: var(--yt-spec-brand-link-text);
}
#progress.ytd-thumbnail-overlay-resume-playback-renderer {
    background-color: var(--yt-spec-themed-blue);
}
#notification-count.ytd-notification-topbar-button-renderer {
    background-color: var(--yt-spec-themed-blue);
}
#button.yt-icon-button {
    color: var(--cyan);
}
.sbdd_b,
.sbsb_a,
.sbfl_b,
.sbsb_c {
    background: var(--yt-spec-brand-background-primary);
}
.gsfs,
.sbfl_b {
    color: var(--foreground);
}
.sbsb_d {
    background-color: var(--yt-spec-general-background-c);
}
.sbdd_b {
    border: 1px solid transparent;
}
.sbpqs_a {
    color: var(--pink);
}
.sbsb_i {
    color: var(--blue);
}
.sbfl_b {
    color: var(--cyan);
}
#cinematics {
    display: none;
}
#chips-wrapper {
    background: var(--background-primary) !important;
}
`;

        const style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);

})();
