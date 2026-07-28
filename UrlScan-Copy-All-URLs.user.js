// ==UserScript==
// @name         UrlScan Copy All URLs
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Copy all URLs from td.break-all.url a elements
// @author       rix4uni
// @match        https://urlscan.io/search*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=https://urlscan.io
// @grant        GM_setClipboard
// ==/UserScript==

(function () {
    'use strict';

    function showToast(message) {
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 999999;
            background: #28a745;
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            font-size: 14px;
            font-family: Arial, sans-serif;
            box-shadow: 0 4px 10px rgba(0,0,0,.2);
        `;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    const button = document.createElement('button');
    button.textContent = '📋 Copy URLs';

    button.style.cssText = `
        position: fixed;
        top: 65px;
        right: 20px;
        z-index: 999999;
        padding: 10px 15px;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        font-weight: bold;
    `;

    button.addEventListener('click', () => {
        const urls = [...document.querySelectorAll('td.break-all.url a')]
            .map(a => a.title)
            .filter(Boolean);

        if (!urls.length) {
            showToast('No URLs found');
            return;
        }

        GM_setClipboard(urls.join('\n'));

        showToast(`Copied ${urls.length} URLs`);
    });

    document.body.appendChild(button);
})();
