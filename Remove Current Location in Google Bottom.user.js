// ==UserScript==
// @name         Remove Current Location in Google Bottom
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Remove Current Location in Google Bottom
// @author       rix4uni
// @match        https://www.google.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Your code here...
    document.querySelector('#footcnt').remove();
})();