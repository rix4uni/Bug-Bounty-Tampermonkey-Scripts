// ==UserScript==
// @name         Scrape securitytrails Subdomains
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Scrape all subdomains from securitytrails and save to a file.
// @author       rix4uni & Cascade
// @match        https://securitytrails.com/list/apex_domain/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=securitytrails.com
// @grant        GM_download
// ==/UserScript==

(function () {
    'use strict';
  
    function saveToFile(text, filename) {
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
  
    function collectDomainsFromDocument(doc) {
        const anchors = doc.querySelectorAll('tbody a.link[href^="/domain/"]');
        const domains = Array.from(anchors)
            .map(a => (a.textContent || '').trim())
            .filter(Boolean);
        return domains;
    }

    function getLastPageNumber() {
        const summaryElement = Array.from(document.querySelectorAll('div, span, p'))
            .find(el => el.textContent.includes('of') && el.textContent.includes('results'));

        if (!summaryElement) {
            // Fallback for single-page results if summary is not found
            return document.querySelectorAll('tbody a.link[href^="/domain/"]').length > 0 ? 1 : 0;
        }

        const summaryText = summaryElement.textContent;
        const match = summaryText.match(/of ([,\dK+]+) results/);
        if (!match || !match[1]) return 1;

        let totalResultsStr = match[1].trim().toUpperCase();
        let totalResults;

        if (totalResultsStr.endsWith('K+')) {
            totalResults = parseInt(totalResultsStr.replace('K+', ''), 10) * 1000;
        } else if (totalResultsStr.endsWith('K')) {
            totalResults = parseInt(totalResultsStr.replace('K', ''), 10) * 1000;
        } else {
            totalResults = parseInt(totalResultsStr.replace(/,/g, ''), 10);
        }

        if (isNaN(totalResults)) return 1;

        // Assuming 100 results per page
        const resultsPerPage = 100;
        return Math.ceil(totalResults / resultsPerPage);
    }
  

    async function fetchWithRetry(url, maxRetries = 3, initialDelay = 5000) {
        let attempt = 0;
        let delay = initialDelay;

        while (attempt < maxRetries) {
            try {
                const response = await fetch(url);
                if (response.status === 429) {
                    throw new Error(`HTTP error! status: 429`); // Specific error for retrying
                }
                if (!response.ok) {
                    // For other non-429 errors, fail immediately
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response; // Success
            } catch (error) {
                if (error.message.includes('429')) {
                    attempt++;
                    if (attempt >= maxRetries) {
                        throw new Error(`Failed after ${maxRetries} attempts due to rate limiting.`);
                    }
                    notify(`Rate limit hit. Retrying in ${delay / 1000}s...`, true);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    delay *= 2; // Exponential backoff
                } else {
                    throw error; // Re-throw other errors
                }
            }
        }
    }

    async function handleScrape() {
        const lastPage = getLastPageNumber();
        if (lastPage === 1 && document.querySelectorAll('tbody a.link[href^="/domain/"]').length === 0) {
            notify('No domains found on this page.', true);
            return;
        }

        notify(`Scraping ${lastPage} pages...`);
        const allDomains = new Set();
        let errorOccurred = null;

        // 18 requests per minute is ~3.4 seconds per request. We'll use a fixed delay.
        const requestDelay = 3400;

        for (let i = 1; i <= lastPage; i++) {
            if (i > 1) {
                await new Promise(resolve => setTimeout(resolve, requestDelay));
            }

            const url = new URL(window.location.href);
            url.searchParams.set('page', i);

            try {
                const response = await fetchWithRetry(url.toString());
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const text = await response.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(text, 'text/html');
                const domains = collectDomainsFromDocument(doc);
                domains.forEach(d => allDomains.add(d));
                notify(`Scraped page ${i}/${lastPage}. Found ${domains.length} domains.`);
            } catch (error) {
                errorOccurred = `\n\n--- SCRIPT ERROR ---\nError scraping page ${i}: ${error.message}`;
                notify(errorOccurred.trim(), true);
                break; // Stop on error
            }
        }

        if (allDomains.size > 0) {
            let domainText = Array.from(allDomains).join('\n');
            if (errorOccurred) {
                domainText += errorOccurred;
            }
            const apexDomain = window.location.pathname.split('/').pop();
            saveToFile(domainText, `${apexDomain}-subdomains.txt`);
            notify(`Saved ${allDomains.size} unique domains to file!`, false);
        } else {
            notify('No domains were scraped.', true);
        }
    }
  
    // Tiny toast
    function notify(msg, isError = false) {
      const note = document.createElement('div');
      note.textContent = msg;
      note.style.position = 'fixed';
      note.style.bottom = '20px';
      note.style.right = '20px';
      note.style.padding = '10px 14px';
      note.style.borderRadius = '10px';
      note.style.fontFamily = 'system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif';
      note.style.fontSize = '14px';
      note.style.boxShadow = '0 6px 20px rgba(0,0,0,0.15)';
      note.style.background = isError ? '#dc3545' : '#198754';
      note.style.color = '#fff';
      note.style.zIndex = '2147483647';
      document.body.appendChild(note);
      setTimeout(() => note.remove(), 2000);
    }
  
    // Create floating button
    function addButton() {
      if (document.getElementById('copy-domains-btn')) return;
      const btn = document.createElement('button');
      btn.id = 'copy-domains-btn';
      btn.textContent = 'Scrape All Domains';
      btn.style.position = 'fixed';
      btn.style.top = '150px';
      btn.style.right = '20px';
      btn.style.zIndex = '2147483647';
      btn.style.padding = '10px 16px';
      btn.style.backgroundColor = '#007bff';
      btn.style.color = 'white';
      btn.style.border = 'none';
      btn.style.borderRadius = '8px';
      btn.style.cursor = 'pointer';
      btn.style.display = 'flex';
      btn.style.justifyContent = 'center';
      btn.style.alignItems = 'center';
      btn.style.fontFamily = 'system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif';
      btn.style.fontSize = '14px';
      btn.addEventListener('click', handleScrape);
      document.body.appendChild(btn);
    }
  
    // Add button immediately and after SPA navigations
    addButton();
  
    // Observe DOM changes (Shodan uses dynamic loads)
    const mo = new MutationObserver(() => {
      addButton(); // ensure the button exists after content swaps
    });
    mo.observe(document.documentElement, { childList: true, subtree: true });
  })();
