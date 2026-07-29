// ==UserScript==
// @name         Medium Paywall Bypass
// @namespace    https://github.com/rix4uni
// @version      1.0
// @description  Redirect Medium and InfoSec Writeups articles to Freedium Mirror
// @author       rix4uni
// @match        https://medium.com/*
// @match        https://*.medium.com/*
// @match        https://infosecwriteups.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=medium.com
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    const MIRROR = 'https://freedium-mirror.cfd/';

    // Prevent redirect loop
    if (window.location.hostname === 'freedium-mirror.cfd') {
        return;
    }

    const target = MIRROR + window.location.href;
    window.location.replace(target);
})();
