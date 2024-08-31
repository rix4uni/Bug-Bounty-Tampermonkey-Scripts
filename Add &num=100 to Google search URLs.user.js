// ==UserScript==
// @name         Google Search Add &num=100
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Add &num=100 to Google search URLs
// @author       rix4uni
// @match        https://www.google.com/search?q=*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=google.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Get the current URL
    let url = new URL(window.location.href);

    // Get the search parameters
    let params = new URLSearchParams(url.search);

    // Check if 'num' parameter already exists, if not add it
    if (!params.has('num')) {
        params.set('num', '100');

        // Update the URL search parameters
        url.search = params.toString();

        // Redirect to the updated URL
        window.location.href = url.toString();
    }
})();
