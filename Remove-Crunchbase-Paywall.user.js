// ==UserScript==
// @name         Remove Crunchbase Paywall
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Automatically Remove Crunchbase Paywall
// @author       rix4uni
// @match        https://www.crunchbase.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=crunchbase.com
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