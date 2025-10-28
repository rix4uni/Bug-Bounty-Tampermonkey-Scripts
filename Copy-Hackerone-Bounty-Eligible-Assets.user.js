// ==UserScript==
// @name         Copy Hackerone Bounty Eligible Assets
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Copy Hackerone bounty-eligible assets to clipboard
// @author       rix4uni
// @match        https://hackerone.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=hackerone.com
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

    // Function to get bounty-eligible assets and copy to clipboard
    function copyBountyAssets() {
        const listItems = document.querySelectorAll('li.result-list-item');
        let bountyAssets = [];

        listItems.forEach(item => {
            const metaText = item.querySelector('.meta-text');
            if (metaText && metaText.textContent.includes('Eligible for bounty')) {
                const assetName = item.querySelector('.spec-asset-suggestion').childNodes[0].textContent.trim();
                bountyAssets.push(assetName);
            }
        });

        if (bountyAssets.length > 0) {
            const assetsText = bountyAssets.join('\n');
            copyToClipboard(assetsText);
            alert('Copied ' + bountyAssets.length + ' bounty-eligible assets to clipboard!');

            // Optional: Log to console as well
            console.log('=== COPIED BOUNTY ELIGIBLE ASSETS ===');
            console.log(assetsText);
        } else {
            alert('No bounty-eligible assets found!');
        }
    }

    // Create the button
    const button = document.createElement('button');
    button.textContent = 'Copy Bounty Assets';
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
    button.addEventListener('click', copyBountyAssets);

    // Optional: Auto-run when page loads and detect changes
    window.addEventListener('load', function() {
        setTimeout(function() {
            console.log('Bounty assets copy button ready!');
        }, 1000);
    });

    // Optional: Re-scan when DOM changes
    const observer = new MutationObserver(function(mutations) {
        // Button remains functional even if content changes
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
})();
