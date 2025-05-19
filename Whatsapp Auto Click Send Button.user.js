// ==UserScript==
// @name         Whatsapp Auto Click Send Button
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Automatically clicks the Send button when it appears on whatsapp
// @author       rix4uni
// @match        https://web.whatsapp.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=whatsapp.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function clickSendButton() {
        const btn = document.querySelector('button[data-tab="11"][aria-label="Send"]');
        if (btn) {
            btn.click();
            console.log('Send button clicked!');
            clearInterval(observer);
        }
    }

    // Check every 500ms if button is available, then click it
    const observer = setInterval(clickSendButton, 500);
})();
