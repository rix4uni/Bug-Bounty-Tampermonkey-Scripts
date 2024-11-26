// ==UserScript==
// @name         Get Clean Youtube, Focus mode
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Get Clean Youtube, Focus mode
// @author       rix4uni
// @match        https://www.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const interval = setInterval(() => {
        // Check if URL is a specific page on YouTube (not just the homepage)
        if (window.location.href !== 'https://www.youtube.com/') {
            // Show elements
            document.querySelector('#page-manager').style.display = '';
            document.querySelector("#start").style.visibility = "visible";
            document.querySelector("#end").style.visibility = "visible";
            document.querySelector("#guide").style.visibility = "visible";
        } else {
            // Hide elements
            document.querySelector('#page-manager').style.display = 'none';
            document.querySelector("#start").style.visibility = "hidden";
            document.querySelector("#end").style.visibility = "hidden";
            document.querySelector("#guide").style.visibility = "hidden";
        }
    }, 100); // Check every 100 milliseconds
})();
