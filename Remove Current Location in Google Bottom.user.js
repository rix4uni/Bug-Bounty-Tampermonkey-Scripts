// ==UserScript==
// @name         Remove Current Location in Google Bottom
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Remove Current Location in Google Bottom
// @author       rix4uni
// @match        https://www.google.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=google.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Your code here...
    setTimeout(() => {
        document.querySelector('#footcnt').remove();
    }, 100)
})();