// ==UserScript==
// @name         Google ALL Tabs Reload Button
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Adds a button to google.com/* page to reload all tabs based on detected URL
// @author       rix4uni
// @match        https://www.google.com/*
// @grant        none
// ==/UserScript==

// Usage
// if you using 'Open Multiple URLs' extension then you have lots of tabs open solve first tabs captcha if get and click on Reload button

(function() {
    'use strict';

    // Create a Broadcast Channel
    var channel = new BroadcastChannel('googleRedirect');

    // Create a button element
    var redirectButton = document.createElement('button');
    redirectButton.textContent = 'Reload';
    redirectButton.style.position = 'fixed';
    redirectButton.style.top = '16px';
    redirectButton.style.right = '48%';
    redirectButton.style.zIndex = '9999';
    redirectButton.style.padding = '8px';
    redirectButton.style.width = '80px';

    // Append the button to the body
    document.body.appendChild(redirectButton);

    // Add click event listener to the button
    redirectButton.addEventListener('click', function() {
        // Send a message through the Broadcast Channel
        channel.postMessage({ command: 'redirect' });
    });

    // Listen for messages from other tabs
    channel.onmessage = function(event) {
        if (event.data && event.data.command === 'redirect') {
            // Run the desired command
            //alert(1);
            setTimeout(() => {
                const urlElement = document.querySelector('div[style="font-size:13px;"]');
                if (urlElement) {
                    const url = urlElement.textContent.match(/URL:\s*(\S+)/)?.[1];
                    if (url) {
                        window.location.href = url;
                    }
                }
            }, 100);
        }
    };
})();
