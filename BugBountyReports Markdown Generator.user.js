// ==UserScript==
// @name         BugBountyReports Markdown Generator
// @namespace    https://kzlabs.in/
// @version      1.0
// @description  Generate and copy KrazePlanet labs as BugBountyReports Markdown
// @match        https://kzlabs.in
// @match        https://kzlabs.store
// @match        http://*/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=kzlabs.in
// @grant        GM_setClipboard
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';

    // Only run on the intended websites / local WSL network.
    const host = location.hostname;

    const allowed =
        host === 'kzlabs.in' ||
        host === 'kzlabs.store' ||

        // WSL / private IPv4 ranges
        /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host) ||
        /^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(host) ||
        /^192\.168\.\d{1,3}\.\d{1,3}$/.test(host) ||

        // localhost
        host === 'localhost' ||
        host === '127.0.0.1';

    if (!allowed) {
        return;
    }

    // =========================================================
    // CONFIG
    // =========================================================

    const CONFIG = {
        title: '# BugBountyReports',
        progressTitle: '## 📊 Progress'
    };

    // =========================================================
    // HELPERS
    // =========================================================

    function slugify(text) {
        return text
            .toLowerCase()
            .trim()
            .replace(/&/g, 'and')
            .replace(/['"`]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    function escapeMarkdown(text) {
        return text.replace(/\|/g, '\\|').replace(/\n/g, ' ');
    }

    function getDifficultyEmoji(difficulty) {
        const map = {
            easy: '🟢',
            low: '🟢',
            medium: '🟡',
            hard: '🔴',
            expert: '🟣',
            secure: '🔵'
        };

        return map[difficulty.toLowerCase()] || '⚪';
    }

    function getCategoryEmoji(category) {
        const map = {
            training: '🎓',
            'real world': '🌐',
            challenge: '🏆'
        };

        return map[category.toLowerCase()] || '📚';
    }

    function getLabNumber(lab, fallback) {
        const badge = lab.querySelector('.lab-badge');

        if (!badge) {
            return fallback;
        }

        const match = badge.textContent.match(/LAB\s*(\d+)/i);

        return match ? parseInt(match[1], 10) : fallback;
    }

    function getStatus(lab) {
        const solvedButton = lab.querySelector('.btn-solved-toggle');

        if (!solvedButton) {
            return 'Not Solved';
        }

        const text = solvedButton.textContent
            .trim()
            .toLowerCase();

        /*
         * "Mark Solved" = not solved
         * "Solved"       = solved
         */

        if (
            text.includes('solved') &&
            !text.includes('mark solved')
        ) {
            return 'Solved';
        }

        return 'Not Solved';
    }

    // =========================================================
    // GENERATE MARKDOWN
    // =========================================================

    function generateMarkdown() {

        const categories =
            document.querySelectorAll('h3.category-title');

        if (!categories.length) {
            throw new Error(
                'No lab categories found. Make sure you are on the KrazePlanet labs page.'
            );
        }

        let markdown =
            `${CONFIG.title}\n\n` +
            `${CONFIG.progressTitle}\n\n`;

        let globalLabNumber = 0;

        categories.forEach(categoryTitle => {

            const categoryName =
                categoryTitle.textContent.trim();

            /*
             * Expected structure:
             *
             * h3.category-title
             *     ↓
             * div.labs-list
             */

            let labsList =
                categoryTitle.nextElementSibling;

            /*
             * Be slightly more tolerant if another element
             * exists between the category heading and labs-list.
             */

            if (
                !labsList ||
                !labsList.classList.contains('labs-list')
            ) {
                labsList =
                    categoryTitle.parentElement
                        ?.querySelector('.labs-list');
            }

            if (!labsList) {
                return;
            }

            const labs =
                labsList.querySelectorAll('.lab-card');

            if (!labs.length) {
                return;
            }

            markdown += `### ${escapeMarkdown(categoryName)}\n\n`;

            markdown +=
                `| Lab | Lab Name | Difficulty | Category | Status | Report |\n`;

            markdown +=
                `|---:|---|:---:|---|:---:|:---:|\n`;

            labs.forEach(lab => {

                globalLabNumber++;

                // -------------------------------------------------
                // LAB NUMBER
                // -------------------------------------------------

                const labNumber =
                    getLabNumber(lab, globalLabNumber);

                const reportNumber =
                    String(globalLabNumber).padStart(2, '0');

                // -------------------------------------------------
                // LAB NAME
                // -------------------------------------------------

                const titleElement =
                    lab.querySelector('.lab-title');

                if (!titleElement) {
                    return;
                }

                const labName =
                    titleElement.textContent.trim();

                // -------------------------------------------------
                // DIFFICULTY + CATEGORY
                // -------------------------------------------------

                const tags =
                    [...lab.querySelectorAll('.difficulty-tag')]
                        .map(el => el.textContent.trim())
                        .filter(Boolean);

                const difficulty =
                    tags[0] || 'Unknown';

                const category =
                    tags[1] || 'Training';

                const difficultyIcon =
                    getDifficultyEmoji(difficulty);

                const categoryIcon =
                    getCategoryEmoji(category);

                // -------------------------------------------------
                // LAB URL
                // -------------------------------------------------

                const accessLink =
                    lab.querySelector('a.btn-ACCESS');

                let labURL = '';

                if (accessLink) {
                    labURL =
                        new URL(
                            accessLink.getAttribute('href'),
                            window.location.origin
                        ).href;
                }

                // -------------------------------------------------
                // STATUS
                // -------------------------------------------------

                const status =
                    getStatus(lab);

                // -------------------------------------------------
                // REPORT FILE
                // -------------------------------------------------

                const reportFile =
                    `${slugify(labName)}.md`;

                // -------------------------------------------------
                // MARKDOWN ROW
                // -------------------------------------------------

                markdown +=
                    `| ${labNumber} | ` +
                    `[${escapeMarkdown(labName)}](${labURL}) | ` +
                    `${difficultyIcon} ${difficulty} | ` +
                    `${categoryIcon} ${category} | ` +
                    `${status} | ` +
                    `[View](${reportFile}) |\n`;
            });

            markdown += '\n';
        });

        return markdown.trim() + '\n';
    }

    // =========================================================
    // COPY
    // =========================================================

    async function copyMarkdown() {

        const button =
            document.getElementById('kp-markdown-copy');

        try {

            button.textContent = '⏳ Generating...';

            const markdown =
                generateMarkdown();

            // Tampermonkey clipboard
            if (typeof GM_setClipboard === 'function') {

                GM_setClipboard(
                    markdown,
                    'text'
                );

            } else {

                await navigator.clipboard.writeText(
                    markdown
                );
            }

            button.textContent =
                '✅ Copied!';

            showPreview(markdown);

            setTimeout(() => {
                button.textContent =
                    '📋 Generate Markdown';
            }, 2000);

        } catch (error) {

            console.error(
                '[KrazePlanet Markdown]',
                error
            );

            button.textContent =
                '❌ Error';

            alert(
                'Could not generate Markdown.\n\n' +
                error.message
            );

            setTimeout(() => {
                button.textContent =
                    '📋 Generate Markdown';
            }, 2000);
        }
    }

    // =========================================================
    // PREVIEW
    // =========================================================

    function showPreview(markdown) {

        const existing =
            document.getElementById(
                'kp-markdown-preview'
            );

        if (existing) {
            existing.remove();
        }

        const overlay =
            document.createElement('div');

        overlay.id =
            'kp-markdown-preview';

        overlay.innerHTML = `
            <div class="kp-modal">

                <div class="kp-modal-header">
                    <strong>BugBountyReports Markdown</strong>

                    <button id="kp-close-preview">
                        ✕
                    </button>
                </div>

                <textarea
                    id="kp-markdown-text"
                    spellcheck="false"
                ></textarea>

                <div class="kp-modal-footer">

                    <span>
                        Markdown generated successfully
                    </span>

                    <button id="kp-copy-again">
                        📋 Copy Again
                    </button>

                </div>

            </div>
        `;

        document.body.appendChild(overlay);

        const textarea =
            document.getElementById(
                'kp-markdown-text'
            );

        textarea.value = markdown;

        document
            .getElementById('kp-close-preview')
            .onclick = () => {
                overlay.remove();
            };

        document
            .getElementById('kp-copy-again')
            .onclick = async () => {

                if (typeof GM_setClipboard === 'function') {
                    GM_setClipboard(
                        textarea.value,
                        'text'
                    );
                } else {
                    await navigator.clipboard.writeText(
                        textarea.value
                    );
                }

                const btn =
                    document.getElementById(
                        'kp-copy-again'
                    );

                btn.textContent =
                    '✅ Copied!';

                setTimeout(() => {
                    btn.textContent =
                        '📋 Copy Again';
                }, 1500);
            };
    }

    // =========================================================
    // UI
    // =========================================================

    function createUI() {

        if (
            document.getElementById(
                'kp-markdown-copy'
            )
        ) {
            return;
        }

        const container =
            document.createElement('div');

        container.id =
            'kp-markdown-tool';

        container.innerHTML = `
            <button
                id="kp-markdown-copy"
                title="Generate BugBountyReports Markdown"
            >
                📋 Generate Markdown
            </button>
        `;

        document.body.appendChild(container);

        document
            .getElementById('kp-markdown-copy')
            .addEventListener(
                'click',
                copyMarkdown
            );
    }

    // =========================================================
    // CSS
    // =========================================================

    function addStyles() {

        if (
            document.getElementById(
                'kp-markdown-styles'
            )
        ) {
            return;
        }

        const style =
            document.createElement('style');

        style.id =
            'kp-markdown-styles';

        style.textContent = `

            #kp-markdown-tool {
                position: fixed;
                right: 25px;
                top: 10px;
                z-index: 999999;
            }

            #kp-markdown-copy {
                border: 0;
                border-radius: 10px;
                padding: 13px 20px;

                background:
                    linear-gradient(
                        135deg,
                        #06b6d4,
                        #0d9488
                    );

                color: white;

                font-family:
                    system-ui,
                    -apple-system,
                    BlinkMacSystemFont,
                    sans-serif;

                font-size: 14px;
                font-weight: 700;

                cursor: pointer;

                box-shadow:
                    0 8px 25px
                    rgba(0, 0, 0, 0.35);

                transition:
                    transform .15s ease,
                    box-shadow .15s ease;
            }

            #kp-markdown-copy:hover {
                transform: translateY(-2px);

                box-shadow:
                    0 12px 30px
                    rgba(0, 0, 0, 0.45);
            }

            #kp-markdown-copy:active {
                transform: translateY(0);
            }

            #kp-markdown-preview {
                position: fixed;
                inset: 0;

                z-index: 1000000;

                display: flex;
                align-items: center;
                justify-content: center;

                background:
                    rgba(0, 0, 0, .72);

                backdrop-filter:
                    blur(5px);
            }

            .kp-modal {
                width: min(
                    1000px,
                    calc(100vw - 40px)
                );

                height: min(
                    750px,
                    calc(100vh - 40px)
                );

                display: flex;
                flex-direction: column;

                background: #0f172a;

                color: #e2e8f0;

                border:
                    1px solid
                    rgba(255,255,255,.12);

                border-radius: 14px;

                box-shadow:
                    0 25px 80px
                    rgba(0,0,0,.55);

                overflow: hidden;
            }

            .kp-modal-header {
                display: flex;
                align-items: center;
                justify-content: space-between;

                padding: 16px 20px;

                background: #111c31;

                border-bottom:
                    1px solid
                    rgba(255,255,255,.1);
            }

            .kp-modal-header button {
                border: 0;

                background: transparent;

                color: #94a3b8;

                font-size: 18px;

                cursor: pointer;
            }

            #kp-markdown-text {
                flex: 1;

                width: 100%;

                resize: none;

                box-sizing: border-box;

                padding: 20px;

                border: 0;
                outline: none;

                background: #020617;

                color: #dbeafe;

                font-family:
                    "SFMono-Regular",
                    Consolas,
                    monospace;

                font-size: 13px;

                line-height: 1.6;
            }

            .kp-modal-footer {
                display: flex;
                align-items: center;
                justify-content: space-between;

                padding: 12px 16px;

                background: #111c31;

                font-size: 12px;

                color: #94a3b8;
            }

            #kp-copy-again {
                border: 0;

                border-radius: 7px;

                padding: 8px 14px;

                background: #0891b2;

                color: white;

                font-weight: 600;

                cursor: pointer;
            }

        `;

        document.head.appendChild(style);
    }

    // =========================================================
    // INIT
    // =========================================================

    function init() {

        addStyles();
        createUI();
    }

    // Wait until the page has loaded its lab DOM.
    if (document.readyState === 'loading') {

        document.addEventListener(
            'DOMContentLoaded',
            init
        );

    } else {

        init();
    }

})();
