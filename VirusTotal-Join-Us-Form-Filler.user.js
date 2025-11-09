// ==UserScript==
// @name         VirusTotal Join Us Form Filler
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Fill VirusTotal join us form with random data and specific password
// @author       rix4uni
// @match        https://www.virustotal.com/gui/join-us
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    // Wait for the page to fully load and form to be ready
    setTimeout(fillForm, 2000);

    // Also try when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(fillForm, 1000);
        });
    } else {
        setTimeout(fillForm, 1000);
    }

    // Try multiple times in case the form loads slowly
    let attempts = 0;
    const maxAttempts = 10;
    const interval = setInterval(() => {
        attempts++;
        if (fillForm() || attempts >= maxAttempts) {
            clearInterval(interval);
        }
    }, 500);

    function generateRandomString(length) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    function generateRandomEmail() {
        const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'example.com'];
        const username = generateRandomString(8).toLowerCase();
        const domain = domains[Math.floor(Math.random() * domains.length)];
        return `${username}@${domain}`;
    }

    function fillForm() {
        console.log('Attempting to fill VirusTotal form...');

        let filledAny = false;

        // Fill first name
        const firstName = document.getElementById('firstName');
        if (firstName && !firstName.value) {
            firstName.value = generateRandomString(6);
            console.log('Filled first name:', firstName.value);
            filledAny = true;
            
            // Trigger input event for React
            firstName.dispatchEvent(new Event('input', { bubbles: true }));
            firstName.dispatchEvent(new Event('change', { bubbles: true }));
        }

        // Fill last name
        const lastName = document.getElementById('lastName');
        if (lastName && !lastName.value) {
            lastName.value = generateRandomString(8);
            console.log('Filled last name:', lastName.value);
            filledAny = true;
            
            lastName.dispatchEvent(new Event('input', { bubbles: true }));
            lastName.dispatchEvent(new Event('change', { bubbles: true }));
        }

        // Fill email
        const email = document.getElementById('email');
        if (email && !email.value) {
            email.value = generateRandomEmail();
            console.log('Filled email:', email.value);
            filledAny = true;
            
            email.dispatchEvent(new Event('input', { bubbles: true }));
            email.dispatchEvent(new Event('change', { bubbles: true }));
        }

        // Fill username
        const userId = document.getElementById('userId');
        if (userId && !userId.value) {
            userId.value = generateRandomString(10);
            console.log('Filled username:', userId.value);
            filledAny = true;
            
            userId.dispatchEvent(new Event('input', { bubbles: true }));
            userId.dispatchEvent(new Event('change', { bubbles: true }));
        }

        // Fill password and repeat password with specified value
        const passwordValue = "John@4321##";
        const passwordField = document.getElementById('password');
        const passwordRepeatField = document.getElementById('passwordRepeat');
        
        if (passwordField && !passwordField.value) {
            passwordField.value = passwordValue;
            console.log('Filled password');
            filledAny = true;
            
            passwordField.dispatchEvent(new Event('input', { bubbles: true }));
            passwordField.dispatchEvent(new Event('change', { bubbles: true }));
        }

        if (passwordRepeatField && !passwordRepeatField.value) {
            passwordRepeatField.value = passwordValue;
            console.log('Filled repeat password');
            filledAny = true;
            
            passwordRepeatField.dispatchEvent(new Event('input', { bubbles: true }));
            passwordRepeatField.dispatchEvent(new Event('change', { bubbles: true }));
        }

        // Check the terms of service checkbox
        const tosCheckbox = document.getElementById('tosCheckbox');
        if (tosCheckbox && !tosCheckbox.checked) {
            tosCheckbox.checked = true;
            console.log('Checked TOS checkbox');
            filledAny = true;
            
            tosCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
            tosCheckbox.dispatchEvent(new Event('click', { bubbles: true }));
        }

        if (filledAny) {
            console.log('Successfully filled VirusTotal form!');
        }

        return filledAny;
    }

    // Additional attempt when user focuses on any input (in case form loads on interaction)
    document.addEventListener('focus', function(e) {
        if (e.target.tagName === 'INPUT') {
            setTimeout(fillForm, 100);
        }
    }, true);

    // Monitor for dynamically added elements
    const observer = new MutationObserver(function(mutations) {
        for (let mutation of mutations) {
            if (mutation.addedNodes.length) {
                setTimeout(fillForm, 100);
            }
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
})();
