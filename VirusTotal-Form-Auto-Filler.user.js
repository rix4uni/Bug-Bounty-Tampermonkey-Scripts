// ==UserScript==
// @name         VirusTotal Form Auto-Filler
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Automatically fill VirusTotal join-us and sign-in forms
// @author       rix4uni
// @match        https://www.virustotal.com/gui/join-us
// @match        https://www.virustotal.com/gui/sign-in
// @icon         https://www.google.com/s2/favicons?sz=64&domain=virustotal.com
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    let formFilled = false;
    const targetPassword = "John@4321##";
    const credentials = {
        username: 'testuser@example.com', // Change this to desired username/email
        password: targetPassword
    };

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

    function fillJoinUsForm() {
        const firstName = document.getElementById('firstName');
        const lastName = document.getElementById('lastName');
        const email = document.getElementById('email');
        const userId = document.getElementById('userId');
        const passwordField = document.getElementById('password');
        const passwordRepeatField = document.getElementById('passwordRepeat');
        const tosCheckbox = document.getElementById('tosCheckbox');

        // Check if all required elements exist
        if (!firstName || !lastName || !email || !userId || !passwordField || !passwordRepeatField || !tosCheckbox) {
            return false;
        }

        console.log('Filling VirusTotal join-us form...');

        // Fill first name
        firstName.value = generateRandomString(6);
        triggerEvents(firstName);

        // Fill last name
        lastName.value = generateRandomString(8);
        triggerEvents(lastName);

        // Fill email
        email.value = generateRandomEmail();
        triggerEvents(email);

        // Fill username
        userId.value = generateRandomString(10);
        triggerEvents(userId);

        // Fill password fields
        passwordField.value = targetPassword;
        triggerEvents(passwordField);

        passwordRepeatField.value = targetPassword;
        triggerEvents(passwordRepeatField);

        // Check TOS checkbox
        tosCheckbox.checked = true;
        triggerEvents(tosCheckbox);

        console.log('VirusTotal join-us form filled successfully!');
        return true;
    }

    function fillSignInForm() {
        const userId = document.getElementById('userId');
        const password = document.getElementById('password');
        const rememberMe = document.querySelector('input[type="checkbox"]');
        const signInBtn = document.getElementById('sign-in-btn');

        // Check if all required elements exist
        if (!userId || !password || !signInBtn) {
            return false;
        }

        console.log('Filling VirusTotal sign-in form...');

        // Fill username/email
        userId.value = credentials.username;
        triggerEvents(userId);

        // Fill password
        password.value = credentials.password;
        triggerEvents(password);

        // Check remember me checkbox
        if (rememberMe && !rememberMe.checked) {
            rememberMe.checked = true;
            triggerEvents(rememberMe);
        }

        console.log('VirusTotal sign-in form filled successfully!');

        // Submit the form after a short delay
        setTimeout(() => {
            console.log('Submitting sign-in form...');
            signInBtn.click();
            
            // Alternative submission method
            const form = document.querySelector('form[method="post"]');
            if (form) {
                form.dispatchEvent(new Event('submit', { bubbles: true }));
            }
        }, 3000);

        return true;
    }

    function triggerEvents(element) {
        if (!element) return;
        
        element.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
        element.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
        element.dispatchEvent(new Event('blur', { bubbles: true, composed: true }));
    }

    function handleForm() {
        if (formFilled) return;

        const currentUrl = window.location.href;
        let success = false;

        if (currentUrl.includes('/join-us')) {
            success = fillJoinUsForm();
        } else if (currentUrl.includes('/sign-in')) {
            success = fillSignInForm();
        }

        if (success) {
            formFilled = true;
        }

        return success;
    }

    // Method 1: Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(() => {
                if (!handleForm()) {
                    startObserving();
                }
            }, 1000);
        });
    } else {
        setTimeout(() => {
            if (!handleForm()) {
                startObserving();
            }
        }, 1000);
    }

    // Method 2: Use MutationObserver to detect when form is added
    function startObserving() {
        const observer = new MutationObserver(function(mutations) {
            for (let mutation of mutations) {
                if (mutation.addedNodes.length) {
                    for (let node of mutation.addedNodes) {
                        if (node.nodeType === 1) {
                            // Check if form elements were added
                            const hasJoinUsForm = node.querySelector && (
                                node.querySelector('#firstName') || 
                                node.querySelector('#joinUsForm')
                            );
                            const hasSignInForm = node.querySelector && (
                                node.querySelector('#userId[name="username"]') || 
                                node.querySelector('#password[name="password"]')
                            );
                            
                            if (hasJoinUsForm || hasSignInForm) {
                                setTimeout(handleForm, 500);
                                return;
                            }
                        }
                    }
                }
            }
            
            // Also try to fill form on any DOM change
            if (!formFilled) {
                handleForm();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Stop observing after 30 seconds
        setTimeout(() => {
            observer.disconnect();
            if (!formFilled) {
                console.log('Form not found after 30 seconds');
            }
        }, 30000);
    }

    // Method 3: Monitor URL changes for SPA navigation
    let lastUrl = location.href;
    const urlObserver = new MutationObserver(() => {
        const currentUrl = location.href;
        if (currentUrl !== lastUrl) {
            lastUrl = currentUrl;
            if (currentUrl.includes('/join-us') || currentUrl.includes('/sign-in')) {
                formFilled = false;
                setTimeout(() => {
                    if (!handleForm()) {
                        startObserving();
                    }
                }, 1000);
            }
        }
    });

    urlObserver.observe(document, { 
        subtree: true, 
        childList: true 
    });

    // Method 4: Try on user interaction (in case form loads on focus)
    document.addEventListener('focus', function(e) {
        if (e.target.tagName === 'INPUT' && !formFilled) {
            setTimeout(handleForm, 100);
        }
    }, true);

    console.log('VirusTotal Form Auto-Filler loaded - monitoring for forms...');
})();
