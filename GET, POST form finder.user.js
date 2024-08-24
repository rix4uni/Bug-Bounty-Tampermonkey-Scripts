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
        "askubuntu.com",
        "stackexchange.com",
        "ez.pe",
        "xss.report",
        "bxsshunter.com",
        "bugcrowd.com",
        "hackerone.com",
        "intigriti.com",
        "hackenproof.com",
        "yeswehack.com",
        "bughunt.com.br",
        "urlscan.io",
        "web.archive.org",
        "alienvault.com",
        "commoncrawl.org",
        "shodan.io",
        "censys.io",
        "fofa.info",
        "hunter.how",
        "zoomeye.hk",
        "netlas.io",
        "fullhunt.io",
        "leakix.net",
        "ipinfo.io",
        "securitytrails.com",
        "subdomainfinder.c99.nl",
        "virustotal.com",
        "crt.sh",
        "crunchbase.com",
        "bgp.he.net",
        "github.io",
        "1secmail.com",
        "mail.tm",
        "zdresearch.com",
        // Add more domains here...
    ];

    // Get the current hostname
    const hostname = window.location.hostname;

    // Create a button element
    const button = document.createElement('button');
    button.textContent = 'Check Exclusion';
    button.style.position = 'fixed';
    button.style.top = '50px';
    button.style.right = '10px';
    button.style.padding = '10px';
    button.style.backgroundColor = '#3183ab';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '5px';
    button.style.zIndex = '10000';
    document.body.appendChild(button);

    // Function to check if the domain is excluded and update the button text
    function updateButton() {
        if (excludedDomains.some(domain => hostname.includes(domain))) {
            button.textContent = `Excluded: ${hostname} (Click to Remove)`;
        } else {
            button.textContent = `Not Excluded: ${hostname}`;
        }
    }

    // Initial check
    updateButton();

    // Button click event to remove the domain from the excluded list
    button.addEventListener('click', () => {
        const index = excludedDomains.findIndex(domain => hostname.includes(domain));
        if (index !== -1) {
            excludedDomains.splice(index, 1); // Remove the domain from the list
            console.log(`${hostname} has been removed from the exclusion list.`);
            updateButton(); // Update the button text after removal

            // Now run the form processing if the domain is removed
            processForms();
        } else {
            console.log(`${hostname} is not in the exclusion list.`);
        }
    });

    // Check if the current site is in the excluded list
    if (excludedDomains.some(domain => hostname.includes(domain))) {
        return; // Exit the script if the current domain is in the excluded list
    }

    // Function to process the forms if the domain is not excluded
    function processForms() {
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
    }

    // Run the form processing if the domain is not excluded initially
    if (!excludedDomains.some(domain => hostname.includes(domain))) {
        processForms();
    }

})();
