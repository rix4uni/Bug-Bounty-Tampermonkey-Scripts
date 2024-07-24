// ==UserScript==
// @name         Remove No Results TAB in Google
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Remove No Results TAB in Google
// @author       rix4uni
// @match        https://www.google.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Your code here...
    // Check if the document contains a <div class="card-section">
    if (document.querySelector('.card-section')) {
        // Close the current tab
        window.close();
    } else {
        console.log('No element with class "card-section" found.');
    }

})();