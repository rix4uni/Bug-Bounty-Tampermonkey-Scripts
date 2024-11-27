// ==UserScript==
// @name         Remove No Results TAB in Google
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Remove No Results TAB in Google
// @author       rix4uni
// @match        https://www.google.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=google.com
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