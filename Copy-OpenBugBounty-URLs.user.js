// ==UserScript==
// @name         Copy OpenBugBounty URLs
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Copy OpenBugBounty program URLs to clipboard
// @author       You
// @match        https://www.openbugbounty.org/bugbounty-list/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=openbugbounty.org
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Function to copy text to clipboard
    function copyToClipboard(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    }

    // Function to get OpenBugBounty URLs and copy to clipboard
    function copyBugBountyURLs() {
        const rows = document.querySelectorAll('tbody tr');
        let urls = [];

        rows.forEach(row => {
            const link = row.querySelector('td:first-child a');
            if (link) {
                const href = link.getAttribute('href');
                if (href && href.startsWith('/bugbounty/')) {
                    const fullUrl = 'https://www.openbugbounty.org' + href;
                    urls.push(fullUrl);
                }
            }
        });

        if (urls.length > 0) {
            const urlsText = urls.join('\n');
            copyToClipboard(urlsText);
            alert('Copied ' + urls.length + ' OpenBugBounty URLs to clipboard!');

            // Optional: Log to console as well
            console.log('=== COPIED OPENBUGBOUNTY URLS ===');
            console.log(urlsText);
        } else {
            alert('No OpenBugBounty URLs found!');
        }
    }

    // Create the button
    const button = document.createElement('button');
    button.textContent = 'Copy BugBounty URLs';
    button.style.position = 'fixed';
    button.style.top = '150px';
    button.style.right = '10px';
    button.style.zIndex = '1000';
    button.style.padding = '10px 20px';
    button.style.backgroundColor = '#007bff';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '5px';
    button.style.cursor = 'pointer';
    button.style.textAlign = 'center';
    button.style.display = 'flex';
    button.style.justifyContent = 'center';
    button.style.alignItems = 'center';
    button.style.fontSize = '14px';
    button.style.fontWeight = 'bold';

    // Add hover effects
    button.addEventListener('mouseenter', function() {
        button.style.backgroundColor = '#0056b3';
    });

    button.addEventListener('mouseleave', function() {
        button.style.backgroundColor = '#007bff';
    });

    // Add the button to the body
    document.body.appendChild(button);

    // Add event listener to the button
    button.addEventListener('click', copyBugBountyURLs);

    // Optional: Auto-run when page loads
    window.addEventListener('load', function() {
        setTimeout(function() {
            console.log('OpenBugBounty URL copy button ready!');
        }, 1000);
    });
})();
