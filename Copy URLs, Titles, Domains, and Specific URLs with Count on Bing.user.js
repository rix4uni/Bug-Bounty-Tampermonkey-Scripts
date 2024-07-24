// ==UserScript==
// @name         Copy URLs, Titles, Domains, and Specific URLs with Count on Bing
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  Copy URLs, Titles, Domains, and Specific URLs to clipboard (PHP, ASP, ASPX, JSP, JSPX, URLs with `=`) from Bing search results and show count of URLs copied. Includes button for copying only titles.
// @author       rix4uni
// @match        https://www.bing.com/search*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Function to create and style a button
    function createButton(text, topOffset, clickHandler) {
        var button = document.createElement('button');
        button.innerHTML = text;
        button.style.position = 'fixed';
        button.style.top = topOffset + 'px';
        button.style.right = '10px';
        button.style.zIndex = '1000';
        button.style.padding = '10px';
        button.style.backgroundColor = '#4CAF50';
        button.style.color = 'white';
        button.style.border = 'none';
        button.style.borderRadius = '5px';
        button.style.cursor = 'pointer';
        button.addEventListener('click', function() {
            clickHandler();
            button.style.backgroundColor = 'blue'; // Change background color of the button to blue
        });
        document.body.appendChild(button);
    }

    // Function to copy URLs to clipboard
    function copyUrls() {
        var elements = document.querySelectorAll('li.b_algo a.tilk');
        var hrefString = "";
        var count = 0;
        elements.forEach(function(element) {
            var href = element.getAttribute('href');
            if (href) {
                hrefString += href + "\n";
                count++;
            }
        });

        if (hrefString.length > 0) {
            navigator.clipboard.writeText(hrefString).then(function() {
                alert(count + ' URLs copied to clipboard');
            }).catch(function(err) {
                console.error('Could not copy text: ', err);
            });
        }
    }

    // Function to copy URLs and Titles to clipboard
    function copyUrlsAndTitles() {
        var elements = document.querySelectorAll('li.b_algo');
        var hrefTitleString = "";
        var count = 0;
        elements.forEach(function(element) {
            var hrefElement = element.querySelector('a.tilk');
            var titleElement = element.querySelector('h2 a');
            var href = hrefElement ? hrefElement.getAttribute('href') : '';
            var title = titleElement ? titleElement.innerText : '';
            if (href && title) {
                hrefTitleString += href + ' ' + title + "\n";
                count++;
            }
        });

        if (hrefTitleString.length > 0) {
            navigator.clipboard.writeText(hrefTitleString).then(function() {
                alert(count + ' URLs and Titles copied to clipboard');
            }).catch(function(err) {
                console.error('Could not copy text: ', err);
            });
        }
    }

    // Function to copy only titles to clipboard
    function copyTitles() {
        var elements = document.querySelectorAll('li.b_algo h2 a');
        var titleString = "";
        var count = 0;
        elements.forEach(function(element) {
            var title = element.innerText;
            if (title) {
                titleString += title + "\n";
                count++;
            }
        });

        if (titleString.length > 0) {
            navigator.clipboard.writeText(titleString).then(function() {
                alert(count + ' Titles copied to clipboard');
            }).catch(function(err) {
                console.error('Could not copy text: ', err);
            });
        }
    }

    // Function to copy only domains to clipboard
    function copyDomains() {
        var elements = document.querySelectorAll('li.b_algo a.tilk');
        var domainString = "";
        var count = 0;
        elements.forEach(function(element) {
            var href = element.getAttribute('href');
            if (href) {
                var url = new URL(href);
                domainString += url.origin + "\n";
                count++;
            }
        });

        if (domainString.length > 0) {
            navigator.clipboard.writeText(domainString).then(function() {
                alert(count + ' domains copied to clipboard');
            }).catch(function(err) {
                console.error('Could not copy text: ', err);
            });
        }
    }

    // Function to copy specific file type URLs to clipboard
    function copySpecificUrls(fileExtension) {
        return function() {
            var elements = document.querySelectorAll('li.b_algo a.tilk');
            var specificUrlString = "";
            var count = 0;
            elements.forEach(function(element) {
                var href = element.getAttribute('href');
                if (href && href.endsWith(fileExtension)) {
                    specificUrlString += href + "\n";
                    count++;
                }
            });

            if (specificUrlString.length > 0) {
                navigator.clipboard.writeText(specificUrlString).then(function() {
                    alert(count + ' ' + fileExtension + ' URLs copied to clipboard');
                }).catch(function(err) {
                    console.error('Could not copy text: ', err);
                });
            }
        };
    }

    // Function to copy URLs containing '=' to clipboard
    function copyUrlsWithEquals() {
        var elements = document.querySelectorAll('li.b_algo a.tilk');
        var equalsUrlString = "";
        var count = 0;
        elements.forEach(function(element) {
            var href = element.getAttribute('href');
            if (href && href.includes('=')) {
                equalsUrlString += href + "\n";
                count++;
            }
        });

        if (equalsUrlString.length > 0) {
            navigator.clipboard.writeText(equalsUrlString).then(function() {
                alert(count + ' URLs with "=" copied to clipboard');
            }).catch(function(err) {
                console.error('Could not copy text: ', err);
            });
        }
    }

    // Create buttons
    createButton('Copy URLs', 130, copyUrls);
    createButton('Copy Titles', 170, copyTitles);
    createButton('Copy URLs and Titles', 210, copyUrlsAndTitles);
    createButton('Copy Domains', 250, copyDomains);
    createButton('Copy PHP URLs', 290, copySpecificUrls('.php'));
    createButton('Copy ASP URLs', 330, copySpecificUrls('.asp'));
    createButton('Copy ASPX URLs', 370, copySpecificUrls('.aspx'));
    createButton('Copy JSP URLs', 410, copySpecificUrls('.jsp'));
    createButton('Copy JSPX URLs', 450, copySpecificUrls('.jspx'));
    createButton('Copy URLs with "="', 490, copyUrlsWithEquals);
})();