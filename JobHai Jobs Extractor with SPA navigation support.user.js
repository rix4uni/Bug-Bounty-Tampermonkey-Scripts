// ==UserScript==
// @name         JobHai Jobs Extractor with SPA navigation support
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Extract jobs & update when navigating pages without reload (SPA support)
// @author       rix4uni
// @match        https://www.jobhai.com/jobs*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=jobhai.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const containerId = 'jobhai-extracted-jobs-container';

    function createContainer() {
        let container = document.getElementById(containerId);
        if (container) return container;

        container = document.createElement('div');
        container.id = containerId;
        container.style.position = 'fixed';
        container.style.top = '20px';
        container.style.right = '20px';
        container.style.width = '320px';
        container.style.maxHeight = '90vh';
        container.style.overflowY = 'auto';
        container.style.zIndex = '9999';
        container.style.backgroundColor = '#1e1e1e';
        container.style.color = '#fff';
        container.style.padding = '20px';
        container.style.borderRadius = '12px';
        container.style.boxShadow = '0 4px 12px rgba(0,0,0,0.4)';
        container.style.fontFamily = 'Arial, sans-serif';

        const title = document.createElement('h2');
        title.textContent = '🔍 Extracted Job Cards';
        title.style.marginBottom = '10px';
        title.style.fontSize = '18px';
        title.style.borderBottom = '1px solid #444';
        title.style.paddingBottom = '8px';
        container.appendChild(title);

        document.body.appendChild(container);
        return container;
    }

    function extractAndDisplayJobs() {
        const container = createContainer();

        // Clear previous job cards except title
        container.querySelectorAll('div.job-card').forEach(el => el.remove());

        const jobcards = document.querySelectorAll('.jobcard');

        if (jobcards.length === 0) {
            return false;
        }

        jobcards.forEach((card, index) => {
            const h3 = card.querySelector('h3');
            const link = card.querySelector('a');

            if (!h3 || !link) return;

            const jobTitle = h3.innerText.trim();
            const href = link.getAttribute('href');
            if (!href) return;

            const jobLink = 'https://www.jobhai.com' + href;

            const jobCardDiv = document.createElement('div');
            jobCardDiv.className = 'job-card';
            jobCardDiv.style.marginBottom = '15px';
            jobCardDiv.style.padding = '10px';
            jobCardDiv.style.backgroundColor = '#2b2b2b';
            jobCardDiv.style.borderRadius = '8px';

            const jobName = document.createElement('div');
            jobName.textContent = `${index + 1}. ${jobTitle}`;
            jobName.style.marginBottom = '6px';

            const applyBtn = document.createElement('a');
            applyBtn.textContent = 'Apply Now';
            applyBtn.href = jobLink;
            applyBtn.target = '_blank';
            applyBtn.style.display = 'inline-block';
            applyBtn.style.backgroundColor = '#00b894';
            applyBtn.style.color = '#fff';
            applyBtn.style.padding = '6px 12px';
            applyBtn.style.borderRadius = '6px';
            applyBtn.style.textDecoration = 'none';
            applyBtn.style.fontSize = '14px';

            jobCardDiv.appendChild(jobName);
            jobCardDiv.appendChild(applyBtn);
            container.appendChild(jobCardDiv);
        });

        return true;
    }

    // Observe mutations for dynamic content loading
    function waitForJobsAndExtract() {
        if (extractAndDisplayJobs()) {
            return;
        }
        const observer = new MutationObserver((mutations, obs) => {
            if (extractAndDisplayJobs()) {
                obs.disconnect();
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    // Hook into SPA navigation to detect URL changes
    function onUrlChange(callback) {
        let lastUrl = location.href;
        new MutationObserver(() => {
            const currentUrl = location.href;
            if (currentUrl !== lastUrl) {
                lastUrl = currentUrl;
                callback();
            }
        }).observe(document, { subtree: true, childList: true });
    }

    // Initialize
    waitForJobsAndExtract();

    // Re-extract on URL changes (SPA navigation)
    onUrlChange(() => {
        waitForJobsAndExtract();
    });
})();
