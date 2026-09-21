// ==UserScript==
// @name         HackerOne CSV Downloader
// @namespace    https://hackerone.com/
// @version      1.2
// @description  Collect HackerOne CSV links and download them sequentially
// @match        https://hackerone.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=hackerone.com
// @grant        none
// ==/UserScript==

(() => {
    'use strict';

    // ==============================
    // CONFIGURATION
    // ==============================

    const SCROLL_WAIT = 2500;
    const DOWNLOAD_WAIT = 1500;
    const MAX_SCROLL_ROUNDS = 200;
    const MAX_UNCHANGED_ROUNDS = 4;

    let running = false;

    const found = new Set();

    // ==============================
    // UI
    // ==============================

    const panel = document.createElement('div');

    panel.innerHTML = `
        <div id="h1-csv-panel">
            <button id="h1-csv-start">
                Download CSVs
            </button>
        </div>
    `;

    document.body.appendChild(panel);

    const style = document.createElement('style');

    style.textContent = `
        #h1-csv-panel {
            position: fixed;
            right: 20px;
            top: 70px;
            z-index: 2147483647;
        }

        #h1-csv-start {
            border: 0;
            border-radius: 6px;

            padding: 10px 16px;

            background: #ff4f00;
            color: white;

            cursor: pointer;

            font-family:
                -apple-system,
                BlinkMacSystemFont,
                "Segoe UI",
                sans-serif;

            font-size: 13px;
            font-weight: 600;

            box-shadow:
                0 4px 12px rgba(0, 0, 0, .2);
        }

        #h1-csv-start:hover {
            background: #e64600;
        }

        #h1-csv-start:disabled {
            background: #aaa;
            cursor: not-allowed;
        }
    `;

    document.head.appendChild(style);

    const startButton =
        document.getElementById('h1-csv-start');

    // ==============================
    // HELPERS
    // ==============================

    const sleep = ms =>
        new Promise(resolve => setTimeout(resolve, ms));

    // ==============================
    // COLLECT TEAM LINKS
    // ==============================

    function collect() {

        document
            .querySelectorAll('a[href*="?type=team"]')
            .forEach(a => {

                try {

                    const href =
                        a.getAttribute('href');

                    if (!href) return;

                    const url =
                        new URL(href, location.origin);

                    const parts =
                        url.pathname
                            .split('/')
                            .filter(Boolean);

                    if (!parts.length) return;

                    const team =
                        parts[parts.length - 1];

                    found.add(
                        `${location.origin}/teams/${team}/assets/download_csv.csv`
                    );

                } catch (error) {

                    console.warn(
                        '[H1 CSV] Could not process link:',
                        a,
                        error
                    );

                }

            });
    }

    // ==============================
    // FIND SCROLLABLE ELEMENTS
    // ==============================

    function getScrollableElements() {

        return [...document.querySelectorAll('*')]
            .filter(el => {

                const style =
                    getComputedStyle(el);

                return (
                    (
                        style.overflowY === 'auto' ||
                        style.overflowY === 'scroll'
                    ) &&
                    el.scrollHeight >
                        el.clientHeight + 50
                );

            });
    }

    // ==============================
    // LOAD ALL TEAMS
    // ==============================

    async function loadAllTeams() {

        found.clear();

        let previousCount = 0;
        let unchanged = 0;

        for (
            let round = 1;
            round <= MAX_SCROLL_ROUNDS;
            round++
        ) {

            collect();

            console.log(
                `[H1 CSV] Loading teams... ${found.size} found`
            );

            const scrollables =
                getScrollableElements();

            // Scroll all internal containers
            scrollables.forEach(el => {

                try {

                    el.scrollTop =
                        el.scrollHeight;

                } catch {}

            });

            // Scroll main page
            window.scrollTo({
                top: document.documentElement.scrollHeight,
                behavior: 'instant'
            });

            await sleep(SCROLL_WAIT);

            collect();

            if (found.size === previousCount) {
                unchanged++;
            } else {
                unchanged = 0;
            }

            previousCount = found.size;

            console.log(
                `[H1 CSV] Scroll round ${round}: ${found.size} teams`
            );

            if (
                unchanged >=
                MAX_UNCHANGED_ROUNDS
            ) {
                break;
            }
        }

        return [...found];
    }

    // ==============================
    // DOWNLOAD ONE CSV
    // ==============================

    async function downloadCSV(
        url,
        index,
        total
    ) {

        console.log(
            `[H1 CSV] Downloading ${index}/${total}:`,
            url
        );

        try {

            const response =
                await fetch(url, {
                    method: 'GET',
                    credentials: 'include'
                });

            if (!response.ok) {

                throw new Error(
                    `HTTP ${response.status}`
                );

            }

            const blob =
                await response.blob();

            const team =
                url
                    .split('/teams/')[1]
                    ?.split('/')[0]
                    || `team-${index}`;

            const filename =
                `${team}_download.csv`;

            const blobUrl =
                URL.createObjectURL(blob);

            const a =
                document.createElement('a');

            a.href = blobUrl;
            a.download = filename;

            document.body.appendChild(a);

            a.click();

            a.remove();

            setTimeout(() => {
                URL.revokeObjectURL(blobUrl);
            }, 10000);

            console.log(
                `[H1 CSV] Downloaded: ${filename}`
            );

            return true;

        } catch (error) {

            console.error(
                `[H1 CSV] Failed:`,
                url,
                error
            );

            return false;
        }
    }

    // ==============================
    // DOWNLOAD ALL
    // ==============================

    async function downloadAll(urls) {

        let success = 0;
        let failed = 0;

        for (
            let i = 0;
            i < urls.length;
            i++
        ) {

            const ok =
                await downloadCSV(
                    urls[i],
                    i + 1,
                    urls.length
                );

            if (ok) {
                success++;
            } else {
                failed++;
            }

            if (i < urls.length - 1) {
                await sleep(DOWNLOAD_WAIT);
            }
        }

        console.log(
            '%c[H1 CSV] COMPLETE',
            'color:green;font-weight:bold'
        );

        console.log({
            total: urls.length,
            success,
            failed
        });

        // Allow the button to be used again
        running = false;
        startButton.disabled = false;
        startButton.textContent = 'Download CSVs';
    }

    // ==============================
    // START
    // ==============================

    async function start() {

        if (running) {
            return;
        }

        running = true;

        found.clear();

        startButton.disabled = true;
        startButton.textContent = 'Downloading...';

        console.log(
            '%c[H1 CSV] Starting...',
            'color:#ff4f00;font-weight:bold'
        );

        try {

            const urls =
                await loadAllTeams();

            if (!urls.length) {

                console.warn(
                    '[H1 CSV] No team links found.'
                );

                running = false;
                startButton.disabled = false;
                startButton.textContent =
                    'Download CSVs';

                return;
            }

            console.log(
                `%c[H1 CSV] Found ${urls.length} teams.`,
                'color:green;font-weight:bold'
            );

            console.log(
                '[H1 CSV] URLs:\n' +
                urls.join('\n')
            );

            await downloadAll(urls);

        } catch (error) {

            console.error(
                '[H1 CSV] Error:',
                error
            );

            running = false;

            startButton.disabled = false;
            startButton.textContent =
                'Download CSVs';
        }
    }

    // ==============================
    // BUTTON EVENT
    // ==============================

    startButton.addEventListener(
        'click',
        start
    );

    console.log(
        '%c[H1 CSV] Ready. Click "Download CSVs" to start.',
        'color:#ff4f00;font-weight:bold'
    );

})();
