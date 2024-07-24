// ==UserScript==
// @name         Remove Twitter 'For you' Option
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Automatically Remove Twitter 'For you' Option
// @author       rix4uni
// @match        https://twitter.com/*
// @match        https://x.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=x.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Function to remove the first occurrence of the target element
    function removeFirstElement() {
        const elements = document.querySelectorAll('.css-175oi2r.r-14tvyh0.r-cpa5s6.r-16y2uox');
        if (elements.length > 0) {
            elements[0].remove();
            return true; // Indicate that an element was removed
        }
        return false; // Indicate that no element was removed
    }

    // Create a MutationObserver to watch for changes in the DOM
    const observer = new MutationObserver((mutations) => {
        for (let mutation of mutations) {
            if (mutation.type === 'childList') {
                if (removeFirstElement()) {
                    observer.disconnect(); // Stop observing once the first element is removed
                    break;
                }
            }
        }
    });

    // Start observing the document body for added nodes
    observer.observe(document.body, { childList: true, subtree: true });

    // Initial removal attempt in case the element is already present
    if (removeFirstElement()) {
        observer.disconnect(); // Stop observing if the element was removed
    }
})();