// ==UserScript==
// @name         FOFA Results Copier + Auto Page Size 50
// @namespace    http://tampermonkey.net/
// @version      0.5
// @description  Automatically sets page_size=50 and copy FOFA results to clipboard with one click
// @author       rix4uni
// @match        https://en.fofa.info/result?qbase64=*
// @match        https://fofa.so/result?qbase64=*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=fofa.info
// @grant        GM_setClipboard
// @grant        GM_notification
// ==/UserScript==

(function() {
    'use strict';

    // Auto set page_size=50
    const currentUrl = new URL(window.location.href);
    const params = new URLSearchParams(currentUrl.search);

    if (params.get('page_size') !== '50') {
        params.set('page_size', '50');
        currentUrl.search = params.toString();
        window.location.replace(currentUrl.toString());
        return;
    }

    // Function to extract URLs from FOFA results
    function extractFofaUrls() {
        const urls = new Set();

        // Current FOFA layout
        document.querySelectorAll('.hsxa-fl.hsxa-meta-data-list-lv1-lf').forEach(element => {
            const link = element.querySelector('.hsxa-host a');
            if (link && link.href) {
                urls.add(link.href);
            }
        });

        // Fallback: collect all result links
        if (urls.size === 0) {
            document.querySelectorAll('a[href^="http"]').forEach(link => {
                try {
                    const href = link.href;
                    if (href && !href.includes('fofa')) {
                        urls.add(href);
                    }
                } catch (e) {}
            });
        }

        return [...urls];
    }

    // Function to show toast notification
    function showToast(message, duration = 3000) {
        const existingToast = document.getElementById('fofa-copy-toast');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.id = 'fofa-copy-toast';
        toast.innerHTML = message;

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

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '1';
        }, 10);

        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, duration);
    }

    // Function to create and add the copy button
    function addCopyButton() {
        if (document.getElementById('fofa-copy-btn')) {
            return;
        }

        const button = document.createElement('button');
        button.id = 'fofa-copy-btn';
        button.innerHTML = '📋 Copy FOFA Results';

        button.style.cssText = `
            position: fixed;
            top: 80px;
            right: 0;
            background: #409EFF;
            color: white;
            border: none;
            padding: 10px 16px;
            border-radius: 4px 0 0 4px;
            cursor: pointer;
            font-family: Arial, sans-serif;
            font-size: 14px;
            font-weight: bold;
            z-index: 9999;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            transition: background 0.3s;
        `;

        button.addEventListener('mouseenter', () => {
            button.style.background = '#66b1ff';
        });

        button.addEventListener('mouseleave', () => {
            button.style.background = '#409EFF';
        });

        button.addEventListener('click', () => {
            try {
                const urls = extractFofaUrls();

                if (urls.length === 0) {
                    showToast('❌ No FOFA results found!');
                    return;
                }

                const textToCopy = urls.join('\n');

                GM_setClipboard(textToCopy, 'text');

                showToast(`✅ Copied ${urls.length} FOFA results!`);

            } catch (error) {
                console.error(error);
                showToast('❌ Failed to copy results.');
            }
        });

        document.body.appendChild(button);
    }

    // Initialize
    function init() {
        addCopyButton();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.addEventListener('load', init);

    // Re-add button if FOFA updates page dynamically
    const observer = new MutationObserver(() => {
        if (!document.getElementById('fofa-copy-btn')) {
            addCopyButton();
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

})();
