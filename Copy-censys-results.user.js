// ==UserScript==
// @name         Copy censys results
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Copy IP:PORT values from specific classes to clipboard - Dynamic Content Fix
// @author       rix4uni
// @match        https://platform.censys.io/search?q=*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=censys.io
// @grant        GM_setClipboard
// @grant        GM_notification
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    let button = null;
    let isInitialized = false;

    function getAllIPPortPairs() {
        // Get all IP address elements
        const ipElements = document.querySelectorAll('span._9MKxo');
        // Get all port elements
        const portElements = document.querySelectorAll('span.YATFg.TcVSz');

        const results = [];

        if (ipElements.length > 0 && portElements.length > 0) {
            // Find the minimum length to avoid errors if counts don't match
            const minLength = Math.min(ipElements.length, portElements.length);

            for (let i = 0; i < minLength; i++) {
                const ip = ipElements[i].textContent.trim();
                const port = portElements[i].textContent.trim();
                if (ip && port) {
                    results.push(`${ip}:${port}`);
                }
            }
        }

        return results;
    }

    async function copyIPPortPairs() {
        const pairs = getAllIPPortPairs();

        if (pairs.length === 0) {
            showToast('No IP:PORT pairs found on this page.');
            return;
        }

        const text = pairs.join('\n');

        try {
            // Use GM_setClipboard if available, otherwise fallback
            if (typeof GM_setClipboard !== 'undefined') {
                GM_setClipboard(text);
                showToast(`Copied ${pairs.length} IP:PORT pair${pairs.length > 1 ? 's' : ''} to clipboard`);
            } else {
                // Fallback to navigator.clipboard
                await navigator.clipboard.writeText(text);
                showToast(`Copied ${pairs.length} IP:PORT pair${pairs.length > 1 ? 's' : ''} to clipboard`);
            }
        } catch (err) {
            showToast('Failed to copy to clipboard: ' + err.message);
        }
    }

    // Small toast for feedback
    function showToast(msg, duration = 1800) {
        const existing = document.getElementById('tm-copy-ip-port-toast');
        if (existing) {
            existing.remove();
        }
        const d = document.createElement('div');
        d.id = 'tm-copy-ip-port-toast';
        d.textContent = msg;
        Object.assign(d.style, {
            position: 'fixed',
            right: '12px',
            bottom: '12px',
            padding: '8px 12px',
            background: 'rgba(0,0,0,0.8)',
            color: '#fff',
            borderRadius: '6px',
            zIndex: 1000000,
            fontSize: '13px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            fontFamily: 'Arial, sans-serif'
        });
        document.body.appendChild(d);
        setTimeout(() => d.remove(), duration);
    }

    // Create button with higher z-index and more robust positioning
    function createButton() {
        const btn = document.createElement('button');
        btn.textContent = 'Copy IP:PORT';
        btn.id = 'tm-copy-ip-port-btn';

        Object.assign(btn.style, {
            position: 'fixed',
            top: '80px',
            right: '20px',
            zIndex: 1000000,
            padding: '10px 16px',
            background: '#007cba',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            fontFamily: 'Arial, sans-serif',
            fontWeight: 'bold',
            minWidth: '120px',
            minHeight: '40px'
        });

        btn.title = 'Copy all IP:PORT pairs from this page';
        btn.addEventListener('click', copyIPPortPairs);

        // Right-click to show count
        btn.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            const pairs = getAllIPPortPairs();
            showToast(`Found ${pairs.length} IP:PORT pair${pairs.length !== 1 ? 's' : ''} on this page`);
        });

        return btn;
    }

    // Add button to page
    function addButton() {
        if (!button) {
            button = createButton();
        }

        // Remove existing button if any
        const existingBtn = document.getElementById('tm-copy-ip-port-btn');
        if (existingBtn) {
            existingBtn.remove();
        }

        document.body.appendChild(button);
    }

    // Check if button exists and re-add if needed
    function ensureButtonExists() {
        const existingBtn = document.getElementById('tm-copy-ip-port-btn');
        if (!existingBtn && button) {
            document.body.appendChild(button);
        } else if (!existingBtn && !button) {
            addButton();
        }
    }

    // Initialize the script
    function init() {
        if (isInitialized) return;

        addButton();
        isInitialized = true;

        // Check every second if button still exists
        setInterval(ensureButtonExists, 1000);

        // Also check after DOM changes
        const observer = new MutationObserver((mutations) => {
            let shouldRecheck = false;

            for (let mutation of mutations) {
                if (mutation.removedNodes) {
                    for (let node of mutation.removedNodes) {
                        if (node === button || node.contains?.(button)) {
                            shouldRecheck = true;
                            break;
                        }
                    }
                }
                if (shouldRecheck) break;
            }

            if (shouldRecheck) {
                setTimeout(ensureButtonExists, 100);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Re-initialize on URL changes (for SPAs)
        let lastUrl = location.href;
        setInterval(() => {
            const currentUrl = location.href;
            if (currentUrl !== lastUrl) {
                lastUrl = currentUrl;
                setTimeout(init, 1000);
            }
        }, 500);
    }

    // Start when page is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 1000);
    }

    // Also try to initialize after a delay in case page loads slowly
    setTimeout(init, 3000);
})();
