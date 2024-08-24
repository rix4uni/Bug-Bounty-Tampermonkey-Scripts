// ==UserScript==
// @name         GET, POST form finder
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  GET, POST form finder on any website except specified domains
// @author       rix4uni
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // List of domains to exclude
    const excludedDomains = [
        "google.com",
        "chatgpt.com",
        "codepen.io",
        "netlify.app",
        "github.com",
        "notion.so",
        // Add more domains here...
    ];

    // Get the current hostname
    const hostname = window.location.hostname;

    // Check if the current site is in the excluded list
    if (excludedDomains.some(domain => hostname.includes(domain))) {
        return; // Exit the script if the current domain is in the excluded list
    }

    // Get all forms on the page
    const forms = document.querySelectorAll('form');

    // Initialize counters for all forms and methods
    let formCounter = 0;
    let getCounter = 0;
    let postCounter = 0;

    // Iterate through each form
    forms.forEach(form => {
        // Increment the form counter
        formCounter++;

        // Check the method of the form
        const method = form.method.toLowerCase();

        // Increment the appropriate counter based on the form method
        if (method === 'get') {
            getCounter++;
        } else if (method === 'post') {
            postCounter++;
        }

        // Create a label element
        const label = document.createElement('div');
        label.style.position = 'absolute';
        label.style.padding = '2px 5px';
        label.style.fontSize = '12px';
        label.style.color = 'white';
        label.style.borderRadius = '3px';
        label.style.zIndex = '1000';

        // Set the label text and background color based on the form method
        if (method === 'get' || method === 'post') {
            label.textContent = `${method.toUpperCase()}${formCounter}`;
            label.style.backgroundColor = 'red';
            form.style.border = '2px solid red';
        }

        // Add the label to the form
        form.style.position = 'relative';
        form.appendChild(label);
    });

    // Use setTimeout to ensure the alert is shown after processing
    setTimeout(() => {
        // Display an alert with the total number of forms found and counts of each method
        alert(`Total forms found: ${formCounter}, GET=${getCounter}, POST=${postCounter}`);
    }, 0); // Delay of 0ms ensures execution after the loop

})();
