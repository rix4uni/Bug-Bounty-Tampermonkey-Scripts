// ==UserScript==
// @name         Copy Strong Tag Values on shodan
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Copy values inside strong tags to clipboard on shodan
// @author       rix4uni
// @match        https://www.shodan.io/search/facet?query=*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=shodan.io
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Function to copy text to clipboard
    function copyToClipboard(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    }

    // Function to get values inside strong tags and copy to clipboard
    function copyStrongValues() {
        const strongTags = document.querySelectorAll('strong');
        let values = '';
        strongTags.forEach(tag => {
            values += tag.textContent + '\n';
        });
        copyToClipboard(values);
        alert('Values copied to clipboard!');
    }

    // Create the button
    const button = document.createElement('button');
    button.textContent = 'Copy Strong Values';
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

    // Add the button to the body
    document.body.appendChild(button);

    // Add event listener to the button
    button.addEventListener('click', copyStrongValues);
})();
