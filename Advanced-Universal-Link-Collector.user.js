// ==UserScript==
// @name         Advanced Universal Link Collector
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Collects all links from network requests, HTML source, and attributes
// @author       rix4uni
// @match        *://*/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @grant        GM_setClipboard
// @grant        GM_xmlhttpRequest
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    const STORAGE_KEY = 'advancedCollectedLinks';
    let allLinks = GM_getValue(STORAGE_KEY, {});
    let currentPageLinks = new Set();
    let networkRequests = new Set();

    // Enhanced URL validation with better filtering
    function isValidUrl(string) {
        if (!string || typeof string !== 'string') return false;

        // Common false positives to exclude
        const falsePositives = [
            'javascript:',
            'mailto:',
            'tel:',
            'data:',
            '#',
            'about:',
            'void(0)',
            'undefined',
            'null',
            'function()'
        ];

        if (falsePositives.some(fp => string.includes(fp))) {
            return false;
        }

        // Length filters
        if (string.length < 5 || string.length > 500) return false;

        // Must contain at least one dot (for domains) or be absolute path
        if (!string.includes('.') && !string.startsWith('/')) return false;

        // Common file extensions to include
        const validExtensions = [
            '.html', '.htm', '.php', '.asp', '.aspx', '.jsp',
            '.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp',
            '.ico', '.woff', '.woff2', '.ttf', '.eot',
            '.json', '.xml', '.txt', '.pdf', '.doc', '.docx'
        ];

        // If it has an extension, validate it
        const hasValidExtension = validExtensions.some(ext =>
            string.toLowerCase().includes(ext)
        );

        // URL pattern matching with better validation
        const urlPatterns = [
            /https?:\/\/[^\s"'<>(){}|\\^`\[\]]+/i, // http URLs
            /\/\/[^\s"'<>(){}|\\^`\[\]]+/i,        // protocol-relative URLs
            /\/[^\s"'<>(){}|\\^`\[\]]*[a-zA-Z0-9](?:\/[^\s"'<>(){}|\\^`\[\]]*)?/i, // absolute paths
            /\.\/[^\s"'<>(){}|\\^`\[\]]+/i,        // relative paths starting with ./
            /\.\.[^\s"'<>(){}|\\^`\[\]]+/i         // relative paths starting with ../
        ];

        const matchesPattern = urlPatterns.some(pattern => pattern.test(string));

        return matchesPattern || hasValidExtension;
    }

    // Convert to absolute URL
    function toAbsoluteUrl(url, baseUrl = window.location.href) {
        try {
            // Clean the URL first
            let cleanUrl = url.trim();

            // Remove surrounding quotes if any
            cleanUrl = cleanUrl.replace(/^['"`]|['"`]$/g, '');

            // Handle HTML entities
            cleanUrl = cleanUrl.replace(/&amp;/g, '&');
            cleanUrl = cleanUrl.replace(/&quot;/g, '"');
            cleanUrl = cleanUrl.replace(/&lt;/g, '<');
            cleanUrl = cleanUrl.replace(/&gt;/g, '>');

            // If it's already an absolute URL
            if (cleanUrl.startsWith('http')) {
                return new URL(cleanUrl).href;
            }

            // If it's protocol-relative
            if (cleanUrl.startsWith('//')) {
                return new URL(window.location.protocol + cleanUrl).href;
            }

            // For relative URLs
            return new URL(cleanUrl, baseUrl).href;
        } catch (e) {
            console.log('URL conversion failed:', url, e);
            return null;
        }
    }

    // Method 1: Network Requests (Performance API)
    function setupNetworkMonitoring() {
        if (!window.performance || !window.performance.getEntriesByType) return;

        // Get existing resource entries
        const resources = performance.getEntriesByType('resource');
        resources.forEach(resource => {
            const url = resource.name;
            if (isValidUrl(url)) {
                const absoluteUrl = toAbsoluteUrl(url);
                if (absoluteUrl) {
                    networkRequests.add(absoluteUrl);
                }
            }
        });

        // Monitor new network requests
        const originalFetch = window.fetch;
        window.fetch = function(...args) {
            const url = args[0];
            if (typeof url === 'string' && isValidUrl(url)) {
                const absoluteUrl = toAbsoluteUrl(url);
                if (absoluteUrl) {
                    networkRequests.add(absoluteUrl);
                }
            }
            return originalFetch.apply(this, args);
        };

        // Observe new performance entries
        const observer = new PerformanceObserver((list) => {
            list.getEntries().forEach(entry => {
                const url = entry.name;
                if (isValidUrl(url)) {
                    const absoluteUrl = toAbsoluteUrl(url);
                    if (absoluteUrl) {
                        networkRequests.add(absoluteUrl);
                    }
                }
            });
        });

        try {
            observer.observe({ entryTypes: ['resource'] });
        } catch (e) {
            // Some browsers may not support this
        }
    }

    // Method 2: HTML Source Scanning with improved regex
    function scanHtmlSource() {
        const links = new Set();
        const html = document.documentElement.outerHTML;

        // Enhanced regex patterns for URLs in HTML
        const urlPatterns = [
            /(?:href|src|content|data|action|custom-srv|country-svc|api-url|url|service|endpoint)\s*=\s*["']([^"']+)["']/gi,
            /(?:url|src|link|image|endpoint|api)\s*\(\s*["']([^"']+)["']\s*\)/gi,
            /["'](https?:\/\/[^"'\s<>(){}]+\.[^"'\s<>(){}]+)["']/gi,
            /["'](\/\/[^"'\s<>(){}]+\.[^"'\s<>(){}]+)["']/gi,
            /["'](\/[^"'\s<>(){}][^"'\s<>(){}]*)["']/gi,
            /(https?:\/\/[^\s<>(){}"']+)/gi,
            /(\/\/[^\s<>(){}"']+)/gi
        ];

        urlPatterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(html)) !== null) {
                const url = match[1] || match[0];
                if (isValidUrl(url)) {
                    const absoluteUrl = toAbsoluteUrl(url);
                    if (absoluteUrl) {
                        links.add(absoluteUrl);
                    }
                }
            }
        });

        return Array.from(links);
    }

    // Method 3: Attribute Scanning (existing method)
    function scanAttributes() {
        const links = new Set();

        // Scan all elements with common URL attributes
        const attributes = ['href', 'src', 'content', 'data-src', 'data-href', 'action', 'cite', 'poster', 'background', 'srcset'];

        attributes.forEach(attr => {
            const elements = document.querySelectorAll(`[${attr}]`);
            elements.forEach(element => {
                const value = element.getAttribute(attr);
                if (value && isValidUrl(value)) {
                    const absoluteUrl = toAbsoluteUrl(value);
                    if (absoluteUrl) {
                        links.add(absoluteUrl);
                    }
                }
            });
        });

        // Special handling for srcset
        const srcsetElements = document.querySelectorAll('[srcset]');
        srcsetElements.forEach(element => {
            const srcset = element.getAttribute('srcset');
            if (srcset) {
                srcset.split(',').forEach(part => {
                    const url = part.trim().split(' ')[0];
                    if (isValidUrl(url)) {
                        const absoluteUrl = toAbsoluteUrl(url);
                        if (absoluteUrl) {
                            links.add(absoluteUrl);
                        }
                    }
                });
            }
        });

        return Array.from(links);
    }

    // Main link extraction function
    function extractAllLinks() {
        const currentUrl = window.location.href;
        const links = new Set();

        // Combine all methods
        [scanAttributes(), scanHtmlSource(), Array.from(networkRequests)].forEach(methodLinks => {
            methodLinks.forEach(link => {
                if (link && isValidUrl(link)) {
                    links.add(link);
                }
            });
        });

        currentPageLinks.clear();

        // Update storage with found links
        links.forEach(link => {
            currentPageLinks.add(link);

            if (!allLinks[link]) {
                allLinks[link] = {
                    count: 0,
                    firstSeen: new Date().toISOString(),
                    lastSeen: new Date().toISOString(),
                    pages: [],
                    methods: new Set()
                };
            }

            allLinks[link].count++;
            allLinks[link].lastSeen = new Date().toISOString();

            if (!allLinks[link].pages.includes(currentUrl)) {
                allLinks[link].pages.push(currentUrl);
            }
        });

        // Save to storage
        GM_setValue(STORAGE_KEY, allLinks);

        updateUI();
    }

    // Enhanced UI with method breakdown
    function updateUI() {
        const existingUI = document.getElementById('advancedLinkCollectorUI');
        if (existingUI) {
            existingUI.remove();
        }

        const totalUniqueLinks = Object.keys(allLinks).length;
        const currentPageLinkCount = currentPageLinks.size;
        const networkRequestCount = networkRequests.size;

        const ui = document.createElement('div');
        ui.id = 'advancedLinkCollectorUI';
        ui.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: #2c3e50;
            color: white;
            padding: 15px;
            border-radius: 8px;
            font-family: Arial, sans-serif;
            font-size: 12px;
            z-index: 10000;
            max-width: 350px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            border: 2px solid #34495e;
            max-height: 80vh;
            overflow-y: auto;
        `;

        const title = document.createElement('div');
        title.innerHTML = '<strong>🔗 Advanced Link Collector</strong>';
        title.style.marginBottom = '10px';
        title.style.fontSize = '14px';
        title.style.borderBottom = '1px solid #34495e';
        title.style.paddingBottom = '5px';

        const stats = document.createElement('div');
        stats.innerHTML = `
            <div>📊 Total Unique Links: <strong>${totalUniqueLinks}</strong></div>
            <div>🔍 This Page: <strong>${currentPageLinkCount}</strong> links</div>
            <div>🌐 Network Requests: <strong>${networkRequestCount}</strong></div>
            <div>📍 Current URL: ${window.location.hostname}</div>
        `;
        stats.style.marginBottom = '10px';
        stats.style.lineHeight = '1.4';

        const buttons = document.createElement('div');
        buttons.style.display = 'flex';
        buttons.style.flexDirection = 'column';
        buttons.style.gap = '5px';

        const copyBtn = createButton('📋 Copy All Links', '#27ae60', copyAllLinks);
        const copyCurrentBtn = createButton('📄 Copy Current Page Links', '#3498db', copyCurrentPageLinks);
        const copyNetworkBtn = createButton('🔄 Copy Network Requests', '#9b59b6', copyNetworkRequests);
        const resetBtn = createButton('🗑️ Reset Collection', '#e74c3c', resetCollection);

        buttons.appendChild(copyBtn);
        buttons.appendChild(copyCurrentBtn);
        buttons.appendChild(copyNetworkBtn);
        buttons.appendChild(resetBtn);

        ui.appendChild(title);
        ui.appendChild(stats);
        ui.appendChild(buttons);

        document.body.appendChild(ui);
        makeDraggable(ui);
    }

    function createButton(text, color, onClick) {
        const button = document.createElement('button');
        button.textContent = text;
        button.style.cssText = `
            padding: 8px;
            background: ${color};
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 11px;
            width: 100%;
        `;
        button.onclick = onClick;
        return button;
    }

    function copyAllLinks() {
        const allLinksArray = Object.keys(allLinks).sort();
        const linksText = allLinksArray.join('\n');
        GM_setClipboard(linksText, 'text')
            .then(() => showNotification(`Copied ${allLinksArray.length} links to clipboard!`));
    }

    function copyCurrentPageLinks() {
        const currentLinksArray = Array.from(currentPageLinks).sort();
        const linksText = currentLinksArray.join('\n');
        GM_setClipboard(linksText, 'text')
            .then(() => showNotification(`Copied ${currentLinksArray.length} links from current page!`));
    }

    function copyNetworkRequests() {
        const networkArray = Array.from(networkRequests).sort();
        const linksText = networkArray.join('\n');
        GM_setClipboard(linksText, 'text')
            .then(() => showNotification(`Copied ${networkArray.length} network requests!`));
    }

    function resetCollection() {
        if (confirm('Are you sure you want to reset all collected links?')) {
            allLinks = {};
            currentPageLinks.clear();
            networkRequests.clear();
            GM_setValue(STORAGE_KEY, {});
            updateUI();
            showNotification('Link collection reset!');
        }
    }

    function makeDraggable(element) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        element.onmousedown = dragMouseDown;

        function dragMouseDown(e) {
            e.preventDefault();
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            element.style.top = (element.offsetTop - pos2) + "px";
            element.style.left = (element.offsetLeft - pos1) + "px";
            element.style.right = "auto";
        }

        function closeDragElement() {
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }

    function showNotification(message) {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 15px 25px;
            border-radius: 5px;
            z-index: 10001;
            font-family: Arial, sans-serif;
            font-size: 14px;
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 2000);
    }

    // Initialize everything
    function init() {
        setupNetworkMonitoring();

        window.addEventListener('load', function() {
            setTimeout(() => {
                extractAllLinks();
            }, 2000);
        });

        const observer = new MutationObserver(function() {
            setTimeout(extractAllLinks, 1000);
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['href', 'src', 'content']
        });

        // Register menu commands
        GM_registerMenuCommand('📋 Copy All Links', copyAllLinks);
        GM_registerMenuCommand('📄 Copy Current Page Links', copyCurrentPageLinks);
        GM_registerMenuCommand('🔄 Copy Network Requests', copyNetworkRequests);
        GM_registerMenuCommand('🗑️ Reset Collection', resetCollection);

        // Initial extraction
        setTimeout(extractAllLinks, 3000);
    }

    // Start the script
    init();

})();
