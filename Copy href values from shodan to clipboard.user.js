// ==UserScript==
// @name         Copy href values from shodan to clipboard
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Copy href values from shodan to clipboard
// @author       rix4uni
// @match        https://www.shodan.io/search?query=*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=shodan.io
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    // Set to true to copy absolute URLs (a.href), false to copy raw attribute (a.getAttribute('href'))
    const useAbsolute = true;

    function copyToClipboard(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            return navigator.clipboard.writeText(text);
        } else {
            // Fallback
            return new Promise((resolve, reject) => {
                const ta = document.createElement('textarea');
                ta.value = text;
                // Prevent page jump / visible textarea
                ta.style.position = 'fixed';
                ta.style.top = '-9999px';
                ta.style.left = '-9999px';
                document.body.appendChild(ta);
                ta.focus();
                ta.select();
                try {
                    const ok = document.execCommand('copy');
                    document.body.removeChild(ta);
                    ok ? resolve() : reject(new Error('execCommand failed'));
                } catch (e) {
                    document.body.removeChild(ta);
                    reject(e);
                }
            });
        }
    }

    function getDangerHrefs() {
        const nodes = document.querySelectorAll('a.text-danger');
        const hrefs = Array.from(nodes).map(a => useAbsolute ? a.href : a.getAttribute('href') || '');
        // Filter empty strings
        return hrefs.filter(h => h !== '');
    }

    async function copyDangerHrefs() {
        const hrefs = getDangerHrefs();
        if (hrefs.length === 0) {
            alert('No <a class="text-danger"> links found on this page.');
            return;
        }
        const text = hrefs.join('\n');
        try {
            await copyToClipboard(text);
            // Temporary visual feedback instead of alert (less annoying)
            showToast(`Copied ${hrefs.length} href${hrefs.length>1?'s':''} to clipboard`);
        } catch (err) {
            alert('Failed to copy to clipboard: ' + err.message);
        }
    }

    // Small toast for feedback
    function showToast(msg, duration = 1800) {
        const existing = document.getElementById('tm-copy-danger-toast');
        if (existing) {
            existing.remove();
        }
        const d = document.createElement('div');
        d.id = 'tm-copy-danger-toast';
        d.textContent = msg;
        Object.assign(d.style, {
            position: 'fixed',
            right: '12px',
            bottom: '12px',
            padding: '8px 12px',
            background: 'rgba(0,0,0,0.8)',
            color: '#fff',
            borderRadius: '6px',
            zIndex: 999999,
            fontSize: '13px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
        });
        document.body.appendChild(d);
        setTimeout(() => d.remove(), duration);
    }

    // Create button
    const btn = document.createElement('button');
    btn.textContent = 'Copy .text-danger hrefs';
    Object.assign(btn.style, {
        position: 'fixed',
        top: '110px',
        right: '10px',
        zIndex: 999999,
        padding: '0px 8px',
        background: '#d9534f',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '13px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
    });
    btn.title = 'Copy href values from all <a class="text-danger"> on this page';

    btn.addEventListener('click', copyDangerHrefs);

    // Optionally add right-click to toggle absolute/raw href mode
    btn.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        const newVal = !useAbsolute;
        // Can't change const useAbsolute at runtime; instead show an explanatory toast
        showToast(`To change absolute/raw behavior edit "useAbsolute" variable in the script.`);
    });

    document.body.appendChild(btn);
})();
