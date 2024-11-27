// ==UserScript==
// @name         Get Clean Twitter, Focus mode
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Get Clean Twitter, Focus mode
// @author       rix4uni
// @match        https://x.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=x.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const interval = setInterval(() => {
        // Check if URL is a specific page on YouTube (not just the homepage)
        if (window.location.href !== 'https://x.com/home') {
            // Show elements
            document.querySelector(".css-175oi2r.r-lrvibr.r-1g40b8q.r-obd0qt.r-16y2uox").style.visibility = "visible";
            document.querySelector(".css-175oi2r.r-kemksi.r-1kqtdi0.r-1ua6aaf.r-th6na.r-1phboty.r-16y2uox.r-184en5c.r-1abdc3e.r-1lg4w6u.r-f8sm7e.r-13qz1uu.r-1ye8kvj").style.display = '';

            document.querySelectorAll(".css-175oi2r.r-kemksi.r-1kqtdi0.r-1867qdf.r-1phboty.r-rs99b7.r-1ifxtd0.r-1udh08x")
                .forEach(element => {
                    element.style.visibility = "visible";
                });

            document.querySelector(".css-175oi2r.r-1kqtdi0.r-1867qdf.r-1phboty.r-1ifxtd0.r-1udh08x.r-1niwhzg.r-1yadl64").style.visibility = "visible";
            document.querySelector(".css-175oi2r.r-173mn98.r-1rtiivn.r-hvns9x.r-1jte41z.r-5wli1b").style.visibility = "visible";
        } else {
            // Hide elements
            document.querySelector(".css-175oi2r.r-lrvibr.r-1g40b8q.r-obd0qt.r-16y2uox").style.visibility = "hidden";
            document.querySelector(".css-175oi2r.r-kemksi.r-1kqtdi0.r-1ua6aaf.r-th6na.r-1phboty.r-16y2uox.r-184en5c.r-1abdc3e.r-1lg4w6u.r-f8sm7e.r-13qz1uu.r-1ye8kvj").style.display = 'none';

            document.querySelectorAll(".css-175oi2r.r-kemksi.r-1kqtdi0.r-1867qdf.r-1phboty.r-rs99b7.r-1ifxtd0.r-1udh08x")
                .forEach(element => {
                    element.style.visibility = "hidden";
                });

            document.querySelector(".css-175oi2r.r-1kqtdi0.r-1867qdf.r-1phboty.r-1ifxtd0.r-1udh08x.r-1niwhzg.r-1yadl64").style.visibility = "hidden";
            document.querySelector(".css-175oi2r.r-173mn98.r-1rtiivn.r-hvns9x.r-1jte41z.r-5wli1b").style.visibility = "hidden";
        }
    }, 100); // Check every 100 milliseconds
})();
