// ==UserScript==
// @name         Copy URLs, Titles, Domains, and Specific URLs with Count on Google
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Copy URLs, Titles, Domains, and Specific URLs to clipboard (PHP, ASP, ASPX, JSP, JSPX, URLs with `=`) and show count of URLs copied
// @author       rix4uni
// @match        https://www.google.com/search?q=*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=google.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Function to create and style a button
    function createButton(text, topOffset, clickHandler, rightOffset, container) {
        var button = document.createElement('button');
        button.innerHTML = text;
        button.style.position = 'fixed';
        button.style.top = topOffset + 'px';
        button.style.right = rightOffset + 'px';
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
        container.appendChild(button);
        return button; // Return the button for further manipulation
    }

    // Function to copy URLs to clipboard
    function copyUrls() {
        var elements = document.querySelectorAll('.yuRUbf a[jsname="UWckNb"], .nhaZ2c a[jsname="UWckNb"], .HiHjCd a');
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
        var hrefTitleString = "";
        var count = 0;

        // Select all anchor elements of the class .HiHjCd
        var hiHjCdElements = document.querySelectorAll('.HiHjCd a');
        hiHjCdElements.forEach(function(element) {
            var href = element.getAttribute('href');
            var title = element.innerText; // Use the text of the <a> element as the title
            if (href && title) {
                hrefTitleString += href + ' [' + title + ']' + "\n";
                count++;
            }
        });

        var elements = document.querySelectorAll('.yuRUbf a, .nhaZ2c a');
        elements.forEach(function(element) {
            var href = element.getAttribute('href');
            var titleElement = element.querySelector('h3');
            var title = titleElement ? titleElement.innerText : '';
            if (href && title) {
                hrefTitleString += href + ' [' + title + ']' + "\n";
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


    // Function to copy Domains and Titles to clipboard
    function copyDomainsAndTitles() {
        var domainTitleString = "";
        var count = 0;

        // Select all anchor elements with specified classes
        var elements = document.querySelectorAll('.yuRUbf a[jsname="UWckNb"], .nhaZ2c a[jsname="UWckNb"], .HiHjCd a');

        elements.forEach(function(element) {
            var href = element.getAttribute('href');
            var titleElement = element.querySelector('h3');
            var title = titleElement ? titleElement.innerText : element.innerText; // Use the innerText if <h3> is not found
            if (href && title) {
                var url = new URL(href);
                domainTitleString += url.origin + ' [' + title + ']' + "\n";
                count++;
            }
        });

        if (domainTitleString.length > 0) {
            navigator.clipboard.writeText(domainTitleString).then(function() {
                alert(count + ' Domains and Titles copied to clipboard');
            }).catch(function(err) {
                console.error('Could not copy text: ', err);
            });
        }
    }



    // Function to copy only titles to clipboard
    function copyTitles() {
        var elements = document.querySelectorAll('.yuRUbf a h3, .nhaZ2c a h3, .HiHjCd a');
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
        var elements = document.querySelectorAll('.yuRUbf a[jsname="UWckNb"], .nhaZ2c a[jsname="UWckNb"], .HiHjCd a');
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
            var elements = document.querySelectorAll('.yuRUbf a, .nhaZ2c a, .HiHjCd a');
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
        var elements = document.querySelectorAll('.yuRUbf a[jsname="UWckNb"], .nhaZ2c a[jsname="UWckNb"], .HiHjCd a');
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

    // Function to copy URLs containing '.git' to clipboard
    function copyUrlsWithGit() {
        var elements = document.querySelectorAll('.yuRUbf a[jsname="UWckNb"], .nhaZ2c a[jsname="UWckNb"], .HiHjCd a');
        var gitUrlString = "";
        var count = 0;
        elements.forEach(function(element) {
            var href = element.getAttribute('href');
            if (href && href.includes('/.git')) {
                gitUrlString += href + "\n";
                count++;
            }
        });

        if (gitUrlString.length > 0) {
            navigator.clipboard.writeText(gitUrlString).then(function() {
                alert(count + ' URLs with "/.git" copied to clipboard');
            }).catch(function(err) {
                console.error('Could not copy text: ', err);
            });
        }
    }

    // Create container for buttons
    var container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '130px';
    container.style.right = '480px';
    container.style.zIndex = '1000';
    container.style.padding = '10px';
    container.style.border = '1px solid #ddd';
    container.style.borderRadius = '5px';
    container.style.maxHeight = '400px';
    container.style.overflowY = 'auto';
    container.style.display = 'none';
    document.body.appendChild(container);

    // Function to create and style the collapse/expand button
    var collapseButton = document.createElement('button');
    collapseButton.innerHTML = 'Manage Buttons';
    collapseButton.style.position = 'fixed';
    collapseButton.style.top = '110px';
    collapseButton.style.right = '10px';
    collapseButton.style.zIndex = '1000';
    collapseButton.style.padding = '10px';
    collapseButton.style.backgroundColor = '#4CAF50';
    collapseButton.style.color = 'white';
    collapseButton.style.border = 'none';
    collapseButton.style.borderRadius = '5px';
    collapseButton.style.cursor = 'pointer';
    document.body.appendChild(collapseButton);

    // Create hide/show button
    var hideShowButton = document.createElement('button');
    hideShowButton.innerHTML = 'Hide';
    hideShowButton.style.position = 'fixed';
    hideShowButton.style.top = '70px';
    hideShowButton.style.right = '10px';
    hideShowButton.style.zIndex = '1000';
    hideShowButton.style.padding = '10px';
    hideShowButton.style.backgroundColor = '#4CAF50';
    hideShowButton.style.color = 'white';
    hideShowButton.style.border = 'none';
    hideShowButton.style.borderRadius = '5px';
    hideShowButton.style.cursor = 'pointer';
    document.body.appendChild(hideShowButton);

    // List to keep track of all buttons for show/hide
    var allButtons = [];

    // Function to create a checkbox for each button
    function createCheckbox(text, button, index) {
        var checkboxContainer = document.createElement('div');
        checkboxContainer.style.marginBottom = '10px';
        var checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = true;
        var label = document.createElement('label');
        label.style.marginLeft = '5px';
        label.innerHTML = text;
        checkboxContainer.appendChild(checkbox);
        checkboxContainer.appendChild(label);

        // Load saved state from localStorage
        var savedState = localStorage.getItem('buttonState_' + index);
        if (savedState === 'false') {
            checkbox.checked = false;
            button.style.display = 'none';
        }

        checkbox.addEventListener('change', function() {
            if (checkbox.checked) {
                button.style.display = 'block';
                localStorage.setItem('buttonState_' + index, 'true');
            } else {
                button.style.display = 'none';
                localStorage.setItem('buttonState_' + index, 'false');
            }
        });

        container.appendChild(checkboxContainer);
    }

    // Create buttons and their checkboxes
    var buttons = [
        {text: 'Copy URLs', handler: copyUrls},
        {text: 'Copy Titles', handler: copyTitles},
        {text: 'Copy URLs and Titles', handler: copyUrlsAndTitles},
        {text: 'Copy Domains and Titles', handler: copyDomainsAndTitles},
        {text: 'Copy Domains', handler: copyDomains},
        {text: 'Copy PHP URLs', handler: copySpecificUrls('.php')},
        {text: 'Copy ASPX URLs', handler: copySpecificUrls('.aspx')},
        {text: 'Copy ASP URLs', handler: copySpecificUrls('.asp')},
        {text: 'Copy JSP URLs', handler: copySpecificUrls('.jsp')},
        {text: 'Copy JSPX URLs', handler: copySpecificUrls('.jspx')},
        {text: 'Copy DO URLs', handler: copySpecificUrls('.do')},
        {text: 'Copy URLs with "="', handler: copyUrlsWithEquals},
        {text: 'Copy GIT URLs', handler: copyUrlsWithGit},
        {text: 'Copy SQL URLs', handler: copySpecificUrls('.sql')},
        {text: 'Copy LOG URLs', handler: copySpecificUrls('.log')},
        {text: 'Copy PY URLs', handler: copySpecificUrls('.py')},
        {text: 'Copy JAVA URLs', handler: copySpecificUrls('.java')},
        {text: 'Copy CONF URLs', handler: copySpecificUrls('.conf')},
        {text: 'Copy CNF URLs', handler: copySpecificUrls('.cnf')},
        {text: 'Copy INI URLs', handler: copySpecificUrls('.ini')},
        {text: 'Copy ENV URLs', handler: copySpecificUrls('.env')},
        {text: 'Copy SH URLs', handler: copySpecificUrls('.sh')},
        {text: 'Copy BAK URLs', handler: copySpecificUrls('.bak')},
        {text: 'Copy BACKUP URLs', handler: copySpecificUrls('.backup')},
        {text: 'Copy ZIP URLs', handler: copySpecificUrls('.zip')},
        {text: 'Copy TAR URLs', handler: copySpecificUrls('.tar')},
        {text: 'Copy YML URLs', handler: copySpecificUrls('.yml')},
        {text: 'Copy SWP URLs', handler: copySpecificUrls('.swp')},
        {text: 'Copy OLD URLs', handler: copySpecificUrls('.old')},
        {text: 'Copy SVN URLs', handler: copySpecificUrls('.svn')},
        {text: 'Copy HTPASSWD URLs', handler: copySpecificUrls('.htpasswd')},
        {text: 'Copy HTACCESS URLs', handler: copySpecificUrls('.htaccess')},
        {text: 'Copy JSON URLs', handler: copySpecificUrls('.json')},
        {text: 'Copy TXT URLs', handler: copySpecificUrls('.txt')},
        {text: 'Copy PDF URLs', handler: copySpecificUrls('.pdf')},
        {text: 'Copy XML URLs', handler: copySpecificUrls('.xml')},
        {text: 'Copy XLS URLs', handler: copySpecificUrls('.xls')},
        {text: 'Copy XLSX URLs', handler: copySpecificUrls('.xlsx')},
        {text: 'Copy PPT URLs', handler: copySpecificUrls('.ppt')},
        {text: 'Copy PPTX URLs', handler: copySpecificUrls('.pptx')},
        {text: 'Copy DOC URLs', handler: copySpecificUrls('.doc')},
        {text: 'Copy DOCX URLs', handler: copySpecificUrls('.docx')},
        {text: 'Copy CSV URLs', handler: copySpecificUrls('.csv')}
    ];

    buttons.forEach(function(button, index) {
        var column = Math.floor(index / 19);
        var topOffset = 150 + (index % 19) * 40;
        var rightOffset = 10 + column * 170; // Adjust the horizontal offset based on the column
        var btn = createButton(button.text, topOffset, button.handler, rightOffset, document.body);
        createCheckbox(button.text, btn, index);
        allButtons.push(btn); // Add the button to the list of all buttons
    });

    // Toggle collapse state
    collapseButton.addEventListener('click', function() {
        if (container.style.display === 'none') {
            container.style.display = 'block';
        } else {
            container.style.display = 'none';
        }
    });

    // Toggle show/hide state of all buttons
    hideShowButton.addEventListener('click', function() {
        allButtons.forEach(function(button) {
            if (button.style.display === 'none') {
                button.style.display = 'block';
            } else {
                button.style.display = 'none';
            }
        });
        hideShowButton.innerHTML = hideShowButton.innerHTML === 'Hide' ? 'Show' : 'Hide';
    });

})();
