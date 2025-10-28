// ==UserScript==
// @name         FOFA Results Copier
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  Copy FOFA results to clipboard with one click
// @author       rix4uni
// @match        https://en.fofa.info/result?qbase64=*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=fofa.info
// @grant        GM_setClipboard
// @grant        GM_notification
// ==/UserScript==

(function() {
    'use strict';

    // Function to extract URLs from FOFA results
    function extractFofaUrls() {
        const elements = document.querySelectorAll('.hsxa-fl.hsxa-meta-data-list-lv1-lf');
        const urls = Array.from(elements).map(element => {
            const link = element.querySelector('.hsxa-host a');
            return link ? link.href : null;
        }).filter(url => url !== null);

        return urls;
    }

    // Function to show toast notification
    function showToast(message, duration = 3000) {
        // Remove existing toast if any
        const existingToast = document.getElementById('fofa-copy-toast');
        if (existingToast) {
            existingToast.remove();
        }

        // Create toast element
        const toast = document.createElement('div');
        toast.id = 'fofa-copy-toast';
        toast.innerHTML = message;

        // Style the toast
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 80%;
            transform: translateX(-50%);
            background: #323232;
            color: white;
            padding: 12px 24px;
            border-radius: 4px;
            font-family: Arial, sans-serif;
            font-size: 14px;
            z-index: 10000;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            transition: opacity 0.3s;
            opacity: 0;
        `;

        // Add to page
        document.body.appendChild(toast);

        // Animate in
        setTimeout(() => {
            toast.style.opacity = '1';
        }, 10);

        // Animate out and remove
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, duration);
    }

    // Function to create and add the copy button
    function addCopyButton() {
        // Check if button already exists
        if (document.getElementById('fofa-copy-btn')) {
            return;
        }

        // Create button
        const button = document.createElement('button');
        button.id = 'fofa-copy-btn';
        button.innerHTML = '📋 Copy fofa results';

        // Style the button
        button.style.cssText = `
            position: fixed;
            top: 40px;
            right: 20px;
            background: #409EFF;
            color: white;
            border: none;
            padding: 10px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-family: Arial, sans-serif;
            font-size: 14px;
            font-weight: bold;
            z-index: 9999;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            transition: background 0.3s;
        `;

        // Add hover effect
        button.addEventListener('mouseenter', () => {
            button.style.background = '#66b1ff';
        });
        button.addEventListener('mouseleave', () => {
            button.style.background = '#409EFF';
        });

        // Add click event
        button.addEventListener('click', async () => {
            try {
                const urls = extractFofaUrls();

                if (urls.length === 0) {
                    showToast('No FOFA results found to copy!', 2000);
                    return;
                }

                // Join URLs with newlines
                const textToCopy = urls.join('\n');

                // Copy to clipboard using Tampermonkey API
                GM_setClipboard(textToCopy, 'text');

                // Show success message
                showToast(`✅ Copied ${urls.length} FOFA results to clipboard!`);

            } catch (error) {
                console.error('Error copying FOFA results:', error);
                showToast('❌ Failed to copy results. Check console for details.');
            }
        });

        // Add button to page
        document.body.appendChild(button);
    }

    // Initialize when page loads
    window.addEventListener('load', addCopyButton);

    // Also try to add button when DOM is ready (for SPA navigation)
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', addCopyButton);
    } else {
        addCopyButton();
    }

    // Optional: Re-add button if page content changes (for SPAs)
    const observer = new MutationObserver((mutations) => {
        for (let mutation of mutations) {
            if (mutation.type === 'childList') {
                // Check if our button was removed
                if (!document.getElementById('fofa-copy-btn')) {
                    addCopyButton();
                }
            }
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

})();
