// ==UserScript==
// @name         Copy fofa results
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Extract and copy data-clipboard-text values from hsxa-copy-btn elements
// @author       rix4uni
// @match        https://en.fofa.info/result?qbase64=*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=fofa.info
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    function copyToClipboard(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            return navigator.clipboard.writeText(text);
        } else {
            // Fallback
            return new Promise((resolve, reject) => {
                const ta = document.createElement('textarea');
                ta.value = text;
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

    function extractHsxaValues() {
        const elements = document.querySelectorAll('.hsxa-copy-btn');
        const uniqueValues = new Set();

        elements.forEach(element => {
            let value = element.getAttribute('data-clipboard-text');
            if (value) {
                value = value.replace(/^https?:\/\/(www\.)?/, '');
                uniqueValues.add(value);
            }
        });

        return Array.from(uniqueValues);
    }

    async function copyHsxaValues() {
        const values = extractHsxaValues();
        if (values.length === 0) {
            showToast('❌ No .hsxa-copy-btn elements found', 2000);
            return;
        }

        const text = values.join('\n');
        try {
            await copyToClipboard(text);
            showToast(`✅ Copied ${values.length} unique value${values.length>1?'s':''} to clipboard`, 2000);
        } catch (err) {
            showToast('❌ Failed to copy to clipboard', 2000);
        }
    }

    function showToast(msg, duration = 2000) {
        const existing = document.getElementById('tm-hsxa-copy-toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.id = 'tm-hsxa-copy-toast';
        toast.textContent = msg;
        Object.assign(toast.style, {
            position: 'fixed',
            right: '20px',
            bottom: '12px',
            padding: '12px 16px',
            background: '#333',
            color: 'white',
            borderRadius: '8px',
            zIndex: '10000',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            border: '1px solid #555',
            fontFamily: 'system-ui, -apple-system, sans-serif'
        });
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), duration);
    }

    // Create stylish button
    const btn = document.createElement('button');
    btn.innerHTML = '📋 Copy Results';
    btn.title = 'Copy data-clipboard-text values from all .hsxa-copy-btn elements';

    // Modern button styling
    Object.assign(btn.style, {
        position: 'fixed',
        top: '110px',
        right: '20px',
        zIndex: '10000',
        padding: '12px 16px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
        transition: 'all 0.3s ease',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    });

    // Hover effects
    btn.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
    });

    btn.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
    });

    // Active/click effect
    btn.addEventListener('mousedown', function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 2px 8px rgba(102, 126, 234, 0.4)';
    });

    btn.addEventListener('mouseup', function() {
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
    });

    btn.addEventListener('click', copyHsxaValues);

    // Add button to the page
    document.body.appendChild(btn);

    // Optional: Add a badge showing count when elements are found
    function updateBadge() {
        const values = extractHsxaValues();
        if (values.length > 0) {
            btn.innerHTML = `📋 Copy Results <span style="
                background: #ff4757;
                color: white;
                border-radius: 10px;
                padding: 2px 6px;
                font-size: 11px;
                margin-left: 6px;
            ">${values.length}</span>`;
        }
    }

    // Update badge after a short delay to ensure page is loaded
    setTimeout(updateBadge, 1000);
})();
