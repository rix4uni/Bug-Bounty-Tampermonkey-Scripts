// ==UserScript==
// @name         Auto Enable Disabled Elements
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Automatically enable disabled, readonly, and hidden elements on page load and highlight them
// @author       rix4uni
// @match        *://*/*
// @run-at       document-end
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    // Add custom styles for highlighting
    GM_addStyle(`
        .tm-highlight-disabled {
            box-shadow: 0 0 0 3px #4CAF50 !important;
            background-color: rgba(76, 175, 80, 0.1) !important;
            position: relative !important;
        }

        .tm-highlight-readonly {
            box-shadow: 0 0 0 3px #2196F3 !important;
            background-color: rgba(33, 150, 243, 0.1) !important;
            position: relative !important;
        }

        .tm-highlight-hidden {
            box-shadow: 0 0 0 3px #FF9800 !important;
            background-color: rgba(255, 152, 0, 0.1) !important;
            position: relative !important;
            animation: pulse-orange 2s infinite !important;
        }

        .tm-highlight-badge {
            position: absolute !important;
            top: -8px !important;
            right: -8px !important;
            background: #333 !important;
            color: white !important;
            padding: 2px 6px !important;
            font-size: 10px !important;
            border-radius: 3px !important;
            z-index: 10000 !important;
            font-family: Arial, sans-serif !important;
            font-weight: bold !important;
            pointer-events: none !important;
        }

        .tm-legend {
            position: fixed !important;
            top: 10px !important;
            right: 10px !important;
            background: white !important;
            border: 2px solid #333 !important;
            padding: 10px !important;
            border-radius: 5px !important;
            z-index: 10001 !important;
            font-family: Arial, sans-serif !important;
            font-size: 12px !important;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3) !important;
            min-width: 200px !important;
        }

        .tm-legend h4 {
            margin: 0 0 8px 0 !important;
            text-align: center !important;
            color: #333 !important;
        }

        .tm-legend-item {
            display: flex !important;
            align-items: center !important;
            margin: 5px 0 !important;
            padding: 3px !important;
        }

        .tm-legend-color {
            width: 16px !important;
            height: 16px !important;
            margin-right: 8px !important;
            border: 2px solid !important;
        }

        .tm-stats {
            margin-top: 8px !important;
            padding-top: 8px !important;
            border-top: 1px solid #ccc !important;
            font-weight: bold !important;
        }

        @keyframes pulse-orange {
            0% { box-shadow: 0 0 0 3px rgba(255, 152, 0, 0.7); }
            50% { box-shadow: 0 0 0 6px rgba(255, 152, 0, 0.3); }
            100% { box-shadow: 0 0 0 3px rgba(255, 152, 0, 0.7); }
        }
    `);

    function createLegend(disabledCount, readonlyCount, hiddenCount) {
        // Remove existing legend if any
        const existingLegend = document.getElementById('tm-legend');
        if (existingLegend) {
            existingLegend.remove();
        }

        const legend = document.createElement('div');
        legend.id = 'tm-legend';
        legend.className = 'tm-legend';
        legend.innerHTML = `
            <h4>🔧 Enabled Elements</h4>
            <div class="tm-legend-item">
                <div class="tm-legend-color" style="background-color: rgba(76, 175, 80, 0.1); border-color: #4CAF50;"></div>
                <span>Disabled Inputs (${disabledCount})</span>
            </div>
            <div class="tm-legend-item">
                <div class="tm-legend-color" style="background-color: rgba(33, 150, 243, 0.1); border-color: #2196F3;"></div>
                <span>Readonly Inputs (${readonlyCount})</span>
            </div>
            <div class="tm-legend-item">
                <div class="tm-legend-color" style="background-color: rgba(255, 152, 0, 0.1); border-color: #FF9800;"></div>
                <span>Hidden Elements (${hiddenCount})</span>
            </div>
            <div class="tm-stats">
                Total Modified: ${disabledCount + readonlyCount + hiddenCount}
            </div>
        `;

        // Make legend draggable
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;
        let xOffset = 0;
        let yOffset = 0;

        legend.addEventListener('mousedown', dragStart);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', dragEnd);

        function dragStart(e) {
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;

            if (e.target === legend || legend.contains(e.target)) {
                isDragging = true;
            }
        }

        function drag(e) {
            if (isDragging) {
                e.preventDefault();
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
                xOffset = currentX;
                yOffset = currentY;
                setTranslate(currentX, currentY, legend);
            }
        }

        function setTranslate(xPos, yPos, el) {
            el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
        }

        function dragEnd() {
            initialX = currentX;
            initialY = currentY;
            isDragging = false;
        }

        document.body.appendChild(legend);

        // Auto-hide legend after 10 seconds
        setTimeout(() => {
            if (legend && document.body.contains(legend)) {
                legend.style.opacity = '0.3';
                legend.style.transition = 'opacity 0.5s';
            }
        }, 10000);

        // Show on hover
        legend.addEventListener('mouseenter', () => {
            legend.style.opacity = '1';
        });

        legend.addEventListener('mouseleave', () => {
            legend.style.opacity = '0.3';
        });
    }

    function enableAllElements() {
        let disabledCount = 0;
        let readonlyCount = 0;
        let hiddenCount = 0;

        // Remove disabled and readonly from form elements
        const interactiveElements = ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'FIELDSET'];

        interactiveElements.forEach(tagName => {
            document.querySelectorAll(tagName).forEach(e => {
                if(e.hasAttribute('disabled')){
                    e.removeAttribute('disabled');
                    e.classList.add('tm-highlight-disabled');

                    // Add badge
                    const badge = document.createElement('span');
                    badge.className = 'tm-highlight-badge';
                    badge.textContent = 'DISABLED';
                    e.style.position = 'relative';
                    e.appendChild(badge);

                    disabledCount++;
                }
                if(e.hasAttribute('readonly')){
                    e.removeAttribute('readonly');
                    e.classList.add('tm-highlight-readonly');

                    // Add badge
                    const badge = document.createElement('span');
                    badge.className = 'tm-highlight-badge';
                    badge.textContent = 'READONLY';
                    e.style.position = 'relative';
                    e.appendChild(badge);

                    readonlyCount++;
                }
            });
        });

        // Process all elements except specific ones we want to skip
        document.querySelectorAll('*').forEach(e => {
            // Skip these element types entirely
            const skipTags = ['STYLE', 'SCRIPT', 'LINK', 'META', 'TITLE', 'HEAD', 'HTML', 'BODY'];
            if(skipTags.includes(e.tagName)) return;

            const style = window.getComputedStyle(e);
            let wasHidden = false;

            // Check various hiding methods
            if(style.display === 'none' ||
               style.visibility === 'hidden' ||
               parseFloat(style.opacity) === 0 ||
               style.pointerEvents === 'none' ||
               e.hasAttribute('hidden')) {

                wasHidden = true;

                if(style.display === 'none') {
                    const blockElements = ['DIV', 'P', 'UL', 'OL', 'LI', 'FORM', 'SECTION', 'ARTICLE', 'HEADER', 'FOOTER', 'MAIN', 'NAV', 'ASIDE', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'];
                    e.style.display = blockElements.includes(e.tagName) ? 'block' : 'inline-block';
                }

                if(style.visibility === 'hidden') {
                    e.style.visibility = 'visible';
                }

                if(parseFloat(style.opacity) === 0) {
                    e.style.opacity = '1';
                }

                if(style.pointerEvents === 'none') {
                    e.style.pointerEvents = 'auto';
                }

                if(e.hasAttribute('hidden')) {
                    e.removeAttribute('hidden');
                }

                // Only count and highlight if it was actually hidden
                if (wasHidden && (style.display === 'none' || style.visibility === 'hidden' || e.hasAttribute('hidden'))) {
                    e.classList.add('tm-highlight-hidden');

                    // Add badge
                    const badge = document.createElement('span');
                    badge.className = 'tm-highlight-badge';
                    badge.textContent = 'HIDDEN';
                    e.style.position = 'relative';
                    e.appendChild(badge);

                    hiddenCount++;
                }
            }
        });

        // Create or update legend
        if (disabledCount > 0 || readonlyCount > 0 || hiddenCount > 0) {
            createLegend(disabledCount, readonlyCount, hiddenCount);
            console.log(`🔧 Auto Enable: Enabled ${disabledCount} disabled, ${readonlyCount} readonly, and ${hiddenCount} hidden elements`);
        }
    }

    // Run immediately when page loads
    enableAllElements();

    // Also run after delays to catch dynamically loaded content
    setTimeout(enableAllElements, 1000);
    setTimeout(enableAllElements, 3000);

    // Keyboard shortcut to manually trigger (Ctrl+Shift+E)
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.shiftKey && e.key === 'E') {
            enableAllElements();
            showNotification('Elements enabled and highlighted!');
        }
    });

    // Watch for dynamically added content
    const observer = new MutationObserver(function(mutations) {
        let shouldEnable = false;
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                shouldEnable = true;
            }
        });
        if (shouldEnable) {
            setTimeout(enableAllElements, 500);
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Notification function
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            z-index: 10000;
            font-family: Arial, sans-serif;
            font-size: 14px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 2000);
    }
})();
