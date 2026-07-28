// ==UserScript==
// @name         Hunter.how – Copy Tools
// @namespace    https://hunter.how/
// @version      1.3
// @description  Adds buttons to copy IPs or IPs+Domains from Hunter.how results
// @match        https://hunter.how/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=hunter.how
// @grant        GM_setClipboard
// ==/UserScript==

(function () {
    'use strict';

    function extractData(includeDomains) {
        const results = new Set();

        document.querySelectorAll('.res-item').forEach(item => {
            const ipEl = item.querySelector('.ip');
            const domainEl = item.querySelector('.domain');

            let ip = ipEl ? ipEl.innerText.trim() : '';
            let domain = domainEl ? domainEl.innerText.trim() : '';

            if (ip) {
                // If includeDomains is true and domain is valid
                if (includeDomains && domain && domain.toUpperCase() !== 'N/A') {
                    results.add(`${ip} ${domain}`);
                } else {
                    // Otherwise just IP
                    results.add(ip);
                }
            }
        });

        return [...results].join('\n');
    }

    function addButtons() {
        if (document.getElementById('hunter-copy-container')) return;

        // Container to hold both buttons cleanly
        const container = document.createElement('div');
        container.id = 'hunter-copy-container';
        Object.assign(container.style, {
            position: 'fixed',
            top: '120px',
            right: '0px',
            zIndex: '9999',
            display: 'flex',
            gap: '10px'
        });

        // Common styles for both buttons
        const btnStyles = {
            padding: '10px 14px',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            cursor: 'pointer',
            fontWeight: '500',
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
        };

        // Button 1: Copy IPs Only
        const btnIPs = document.createElement('button');
        btnIPs.textContent = 'Copy IPs Only';
        Object.assign(btnIPs.style, btnStyles);
        btnIPs.style.background = '#f95e00'; // Orange

        btnIPs.onclick = () => {
            const data = extractData(false);
            if (!data) return alert('No IPs found');
            GM_setClipboard(data);
            alert(`Copied ${data.split('\n').length} IPs`);
        };

        // Button 2: Copy IPs & Domains
        const btnBoth = document.createElement('button');
        btnBoth.textContent = 'Copy IP + Domain';
        Object.assign(btnBoth.style, btnStyles);
        btnBoth.style.background = '#333333'; // Dark Gray

        btnBoth.onclick = () => {
            const data = extractData(true);
            if (!data) return alert('No results found');
            GM_setClipboard(data);
            alert(`Copied ${data.split('\n').length} items`);
        };

        container.appendChild(btnIPs);
        container.appendChild(btnBoth);
        document.body.appendChild(container);
    }

    // Handle dynamic Vue content
    const observer = new MutationObserver(addButtons);
    observer.observe(document.body, { childList: true, subtree: true });

    setTimeout(addButtons, 2000);
})();
