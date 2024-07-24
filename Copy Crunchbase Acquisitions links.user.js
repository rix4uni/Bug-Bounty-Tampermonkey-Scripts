// ==UserScript==
// @name         Copy Crunchbase Acquisitions links
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Copy Crunchbase Acquisitions links and create a button to do it
// @author       rix4uni
// @match        https://www.crunchbase.com/organization/*
// @grant        GM_setClipboard
// ==/UserScript==

(function() {
    'use strict';

    // Function to filter and copy links
    function copyFilteredLinks() {
        // Select the 9th tbody element
        let tbody = document.querySelectorAll('tbody')[8];

        // Get all a elements within the selected tbody
        let links = tbody.querySelectorAll('a');

        // Extract the href attributes
        let hrefs = Array.from(links).map(link => link.getAttribute('href'));

        // Filter out the hrefs that start with /acquisition/
        let filteredHrefs = hrefs.filter(href => !href.startsWith('/acquisition/'));

        // Add https://www.crunchbase.com/ to each filtered href
        filteredHrefs = filteredHrefs.map(href => `https://www.crunchbase.com${href}`);

        // Join filtered hrefs into a single string separated by new lines
        let hrefsText = filteredHrefs.join('\n');

        // Copy to clipboard
        GM_setClipboard(hrefsText);

        // Alert user
        alert('Acquisitions links copied to clipboard!');
    }

    // Create the button
    const button = document.createElement('button');
    button.textContent = 'Copy Acquisitions Links';
    button.style.position = 'fixed';
    button.style.top = '150px';
    button.style.right = '10px';
    button.style.zIndex = '1000';
    button.style.padding = '10px 20px';
    button.style.backgroundColor = '#007bff';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '5px';
    button.style.cursor = 'pointer';
    button.style.textAlign = 'center'; // Center text
    button.style.display = 'flex';
    button.style.justifyContent = 'center';
    button.style.alignItems = 'center';
    button.addEventListener('click', copyFilteredLinks);

    // Add the button to the body
    document.body.appendChild(button);

})();