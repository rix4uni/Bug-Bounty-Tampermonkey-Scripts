// ==UserScript==
// @name         Remove Bugcrowd tags Elements
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Remove all elements with class bc-table__cell-right automatically
// @author       rix4uni
// @match        https://bugcrowd.com/engagements/invites/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=bugcrowd.com
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    function removeElements() {
        const elements = document.querySelectorAll('.bc-table__cell-right');
        elements.forEach(element => {
            element.remove();
        });
        console.log(`Removed ${elements.length} elements with class "bc-table__cell-right"`);
    }

    // Remove existing elements
    removeElements();

    // Set up MutationObserver to handle dynamically added content
    const observer = new MutationObserver(function(mutations) {
        let shouldRemove = false;
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                shouldRemove = true;
            }
        });
        if (shouldRemove) {
            removeElements();
        }
    });

    // Start observing
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Also remove elements when the page is fully loaded (as a fallback)
    window.addEventListener('load', function() {
        setTimeout(removeElements, 1000);
    });
})();
