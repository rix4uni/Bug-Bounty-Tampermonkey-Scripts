// ==UserScript==
// @name         Copy Github Repositories
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Copy Github Repositories on button click, change button color, and display count
// @author       rix4uni
// @match        https://github.com/search?q=*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=github.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Create a button element
    const button = document.createElement('button');
    button.textContent = 'Copy Repositories';
    button.style.backgroundColor = 'green';
    button.style.color = 'white';
    button.style.padding = '8px 20px';
    button.style.border = 'none';
    button.style.cursor = 'pointer';
    button.style.position = 'fixed';
    button.style.top = '65px';
    button.style.right = '10px';
    button.style.zIndex = '9999';
    button.style.fontFamily = `'Arial', sans-serif`; // Add a custom font
    button.style.fontSize = '16px';
    button.style.borderRadius = '8px'; // Add border radius for rounded corners
    button.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)'; // Optional: Add some shadow for better aesthetics

    // Append the button to the body
    document.body.appendChild(button);

    // Function to reset button color
    const resetButtonColor = () => {
        button.style.backgroundColor = 'green';
    };

    // Add a click event listener to the button
    button.addEventListener('click', () => {
        // Select all elements with the specified class
        const links = document.querySelectorAll('.Link__StyledLink-sc-14289xe-0.elltiT');

        // Collect href attributes
        const hrefs = [];
        links.forEach(link => {
            hrefs.push(link.href);
        });

        // Copy Repositories to clipboard
        const hrefsText = hrefs.join('\n');
        navigator.clipboard.writeText(hrefsText).then(() => {
            alert(`${hrefs.length} Repositories copied to clipboard!`); // Show the count of hrefs copied
        }).catch(err => {
            console.error('Failed to copy: ', err);
        });

        // Change button color from green to blue
        button.style.backgroundColor = 'blue';
    });

    // Monitor URL changes using a MutationObserver
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList' || mutation.type === 'attributes') {
                // Check if the URL has changed
                if (window.location.href !== observer.currentUrl) {
                    observer.currentUrl = window.location.href;
                    resetButtonColor();
                }
            }
        });
    });

    // Set the initial URL
    observer.currentUrl = window.location.href;

    // Start observing the document body for changes
    observer.observe(document.body, {
        childList: true, // Watch for additions/removals of child elements
        subtree: true,   // Watch across the entire DOM tree
        attributes: true // Watch for attribute changes
    });
})();
