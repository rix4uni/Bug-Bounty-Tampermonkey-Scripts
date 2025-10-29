// ==UserScript==
// @name         Copy Hackerone Private and Public Bounty Eligible Assets
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Copy all asset names to clipboard with alert notification
// @author       rix4uni
// @match        https://hackerone.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=hackerone.com
// @grant        GM_setClipboard
// ==/UserScript==

(function() {
    'use strict';

    // Function to extract asset names
    function extractAssetNames() {
        return Array.from(document.querySelectorAll('.spec-asset-identifier strong'))
            .map(element => element.title || element.textContent.trim())
            .filter(name => name);
    }

    // Function to create and add button
    function addCopyButton() {
        // Check if button already exists
        if (document.getElementById('copy-asset-names-btn')) {
            return;
        }

        // Create button
        const button = document.createElement('button');
        button.id = 'copy-asset-names-btn';
        button.textContent = 'Copy Asset Names';
        button.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            border: none;
            padding: 10px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-family: Arial, sans-serif;
            font-size: 14px;
            font-weight: bold;
            z-index: 10000;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            transition: background 0.2s ease;
        `;

        // Add hover effect
        button.addEventListener('mouseenter', () => {
            button.style.background = '#45a049';
        });
        button.addEventListener('mouseleave', () => {
            button.style.background = '#4CAF50';
        });

        // Add click handler
        button.addEventListener('click', () => {
            const assetNames = extractAssetNames();

            if (assetNames.length === 0) {
                alert('No asset names found!');
                return;
            }

            // Join names with newlines
            const namesText = assetNames.join('\n');

            // Copy to clipboard
            GM_setClipboard(namesText, 'text')
                .then(() => {
                    alert(`✅ Successfully copied ${assetNames.length} asset names to clipboard!`);
                })
                .catch(err => {
                    console.error('Failed to copy:', err);
                    alert('❌ Failed to copy to clipboard');
                });
        });

        // Add button to page
        document.body.appendChild(button);
    }

    // Wait for page to load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', addCopyButton);
    } else {
        addCopyButton();
    }

    // Optional: Re-add button if page content changes (for SPAs)
    const observer = new MutationObserver(() => {
        if (!document.getElementById('copy-asset-names-btn')) {
            addCopyButton();
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
})();
