// ==UserScript==
// @name         Google Reload All & Current Tab Button
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Adds buttons to google.com/* page to reload all tabs and to reload the current tab with detected URL if needed.
// @match        https://www.google.com/search?q=*
// @match        https://www.google.com/sorry/index?continue=*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Create a Broadcast Channel for communication between tabs
    var channel = new BroadcastChannel('googleRedirect');

    // Function to create a button
    function createButton(text, top, callback) {
        const button = document.createElement('button');
        button.innerText = text;
        button.style.position = "fixed";
        button.style.top = top;
        button.style.right = "10%";
        button.style.padding = "10px";
        button.style.zIndex = "1000";
        button.style.width = '140px';
        button.addEventListener('click', callback);
        document.body.appendChild(button);
    }

    // Create "Reload All Tabs" button
    createButton("Reload All Tabs", "16px", function() {
        // Send a message through the Broadcast Channel to reload all tabs
        channel.postMessage({ command: 'redirect' });
    });

    // Create "Reload Current Tab" button if a URL is detected
    window.addEventListener('load', function() {
        // Detect URL on the "unusual traffic" page
        const urlRegex = /URL:\s*(https:\/\/\S+)/;
        const match = document.body.innerHTML.match(urlRegex);

        if (match && match[1]) {
            const urlValue = match[1];

            // Create "Reload Current Tab" button
            createButton("Reload Current Tab", "65px", function() {
                // Open the URL in the same tab
                window.location.href = urlValue;
            });
        }
    });

    // Listen for messages from other tabs to reload if required
    channel.onmessage = function(event) {
        if (event.data && event.data.command === 'redirect') {
            setTimeout(() => {
                // Attempt to find the URL from updated page structure
                const urlMatch = document.body.innerHTML.match(/URL:\s*(https:\/\/\S+)/);
                if (urlMatch && urlMatch[1]) {
                    window.location.href = urlMatch[1];
                }
            }, 100);
        }
    };
})();
