// ==UserScript==
// @name         GitHub Topics Updater AI UI with LocalStorage, Delete Data, and Validation
// @namespace    https://github.com/
// @version      0.4
// @description  Update GitHub repository topics directly from the browser with an AI-styled UI, handling spaces in topics, saving data to localStorage, deleting data from localStorage, and validation for duplicates and topic limit.
// @author       rix4uni
// @match        https://github.com/*/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=github.com
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // Function to add the AI-styled UI
    function addAIUI() {
        const container = document.createElement('div');
        container.id = 'ai-topics-updater';
        container.style.position = 'fixed';
        container.style.bottom = '20px';
        container.style.right = '20px';
        container.style.width = '320px';
        container.style.padding = '20px';
        container.style.borderRadius = '12px';
        container.style.backgroundColor = '#1e1e2e';
        container.style.color = '#ffffff';
        container.style.fontFamily = 'Arial, sans-serif';
        container.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.3)';
        container.style.zIndex = '9999';

        container.innerHTML = `
            <h3 style="margin: 0; font-size: 18px; text-align: center; color: #9ccfd8;">GitHub Topics Updater</h3>
            <label for="token" style="display: block; margin-top: 10px; color: #cddbf8;">Authorization Token:</label>
            <input type="password" id="token" style="width: 100%; margin-top: 5px; margin-bottom: 10px; padding: 8px; border: none; border-radius: 8px; background-color: #2e2e3e; color: #ffffff;" placeholder="Enter your token">
            <label for="topics" style="display: block; margin-top: 10px; color: #cddbf8;">Topics (one per line):</label>
            <textarea id="topics" style="width: 100%; margin-top: 5px; padding: 8px; border: none; border-radius: 8px; background-color: #2e2e3e; color: #ffffff; height: 80px;" placeholder="Enter topics"></textarea>
            <button id="updateTopics" style="width: 100%; margin-top: 15px; padding: 10px; border: none; border-radius: 8px; background: linear-gradient(90deg, #6a11cb, #2575fc); color: white; font-size: 16px; cursor: pointer;">Update Topics</button>
            <button id="saveData" style="width: 100%; margin-top: 10px; padding: 8px; border: none; border-radius: 8px; background-color: #2c3e50; color: white; font-size: 14px; cursor: pointer;">Save Data</button>
            <button id="deleteData" style="width: 100%; margin-top: 10px; padding: 8px; border: none; border-radius: 8px; background-color: #e74c3c; color: white; font-size: 14px; cursor: pointer;">Delete Data</button>
        `;

        document.body.appendChild(container);

        // Load previously saved token and topics
        loadSavedData();

        document.getElementById('updateTopics').addEventListener('click', updateTopics);
        document.getElementById('saveData').addEventListener('click', saveData);
        document.getElementById('deleteData').addEventListener('click', deleteData);
    }

    // Function to extract the repository information from the URL
    function getRepoInfo() {
        const path = window.location.pathname;
        const match = path.match(/^\/([^/]+)\/([^/]+)/);
        if (match && match[1] && match[2]) {
            return `${match[1]}/${match[2]}`;
        }
        return null;
    }

    // Function to sanitize topics (replace spaces with hyphens)
    function sanitizeTopics(topics) {
        return topics.map(topic => topic.trim().replace(/\s+/g, '-'));
    }

    // Function to remove duplicates and limit topics to 20
    function cleanAndValidateTopics(topics) {
        // Remove duplicates by creating a Set
        const uniqueTopics = [...new Set(topics)];

        // Limit the topics to 20
        if (uniqueTopics.length > 20) {
            alert('You can only add a maximum of 20 topics.');
            return uniqueTopics.slice(0, 20); // Return the first 20 topics
        }

        return uniqueTopics;
    }

    // Function to update topics
    async function updateTopics() {
        const token = document.getElementById('token').value.trim();
        const topicsInput = document.getElementById('topics').value.trim();
        const repoInfo = getRepoInfo();

        if (!token || !topicsInput || !repoInfo) {
            alert('Please provide valid input (token, topics, and repository information).');
            return;
        }

        const topics = sanitizeTopics(topicsInput.split('\n').filter(Boolean));
        const cleanedTopics = cleanAndValidateTopics(topics);

        const url = `https://api.github.com/repos/${repoInfo}/topics`;

        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Accept': 'application/vnd.github+json',
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ names: cleanedTopics }),
            });

            if (response.ok) {
                alert('Topics updated successfully!');
            } else {
                const errorData = await response.json();
                console.error('Error updating topics:', errorData);
                alert(`Failed to update topics: ${response.status} - ${errorData.message}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while updating topics.');
        }
    }

    // Function to save token and topics to localStorage
    function saveData() {
        const token = document.getElementById('token').value.trim();
        const topics = document.getElementById('topics').value.trim();

        if (token && topics) {
            localStorage.setItem('githubToken', token);
            localStorage.setItem('githubTopics', topics);
            alert('Data saved successfully!');
        } else {
            alert('Please enter both token and topics to save.');
        }
    }

    // Function to load saved token and topics from localStorage
    function loadSavedData() {
        const savedToken = localStorage.getItem('githubToken');
        const savedTopics = localStorage.getItem('githubTopics');

        if (savedToken) {
            document.getElementById('token').value = savedToken;
        }
        if (savedTopics) {
            document.getElementById('topics').value = savedTopics;
        }
    }

    // Function to delete data from localStorage
    function deleteData() {
        if (confirm('Are you sure you want to delete the saved token and topics?')) {
            localStorage.removeItem('githubToken');
            localStorage.removeItem('githubTopics');
            alert('Data deleted successfully!');
            document.getElementById('token').value = '';
            document.getElementById('topics').value = '';
        }
    }

    // Run the script
    if (getRepoInfo()) {
        addAIUI();
    }
})();
