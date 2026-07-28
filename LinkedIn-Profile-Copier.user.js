// ==UserScript==
// @name         LinkedIn Profile Copier
// @namespace    https://krazeplanet.com
// @version      0.1
// @description  Copy LinkedIn profile/company names and URLs.
// @author       rix4uni
// @match        https://www.linkedin.com/feed/update/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=linkedin.com
// @grant        GM_setClipboard
// ==/UserScript==

(function () {
    'use strict';

    function createButton() {
        if (document.getElementById('kp-copy-btn')) return;

        const btn = document.createElement('button');
        btn.id = 'kp-copy-btn';
        btn.innerText = 'Copy Profiles';

        Object.assign(btn.style, {
            position: 'fixed',
            top: '55px',
            right: '20px',
            zIndex: '999999',
            padding: '10px 16px',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            background: '#0A66C2',
            color: '#fff',
            fontSize: '14px',
            fontWeight: 'bold',
            boxShadow: '0 2px 10px rgba(0,0,0,.2)'
        });

        btn.onclick = copyProfiles;
        document.body.appendChild(btn);
    }

    function showToast(message) {
        const toast = document.createElement('div');

        toast.innerText = message;

        Object.assign(toast.style, {
            position: 'fixed',
            bottom: '70px',
            right: '20px',
            background: '#333',
            color: '#fff',
            padding: '12px 18px',
            borderRadius: '8px',
            zIndex: '999999',
            fontSize: '14px',
            boxShadow: '0 2px 10px rgba(0,0,0,.2)'
        });

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    function copyProfiles() {
        const results = [];

        document
            .querySelectorAll(
                'a[href*="linkedin.com/in/"], a[href*="linkedin.com/company/"]'
            )
            .forEach(link => {
                const name = link
                    .querySelectorAll('span[aria-hidden="true"]')[0]
                    ?.childNodes[0]
                    ?.textContent
                    ?.trim();

                if (!name) return;

                let url =
                    link.getAttribute('data-original-url') || link.href;

                url = url
                    .replace(/\/posts\/?$/, '')
                    .replace(/\?.*$/, '');

                const entry = `${name}: ${url}`;

                if (!results.includes(entry)) {
                    results.push(entry);
                }
            });

        if (results.length === 0) {
            showToast('No profiles found.');
            return;
        }

        GM_setClipboard(results.join('\n'));

        showToast(`Copied ${results.length} profiles to clipboard!`);
    }

    // LinkedIn is SPA, so periodically ensure button exists.
    setInterval(createButton, 1000);
})();
