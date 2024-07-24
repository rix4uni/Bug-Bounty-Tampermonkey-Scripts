// ==UserScript==
// @name         Remove Crunchbase Paywall
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Automatically Remove Crunchbase Paywall
// @author       rix4uni
// @match        https://www.crunchbase.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Your code here...
    setTimeout(() => {
        localStorage.clear()
        document.querySelector('paywall.ng-star-inserted').remove();
    }, 100)
})();