// ==UserScript==
// @name         Google Maps POI Collector (Better Status & UI)
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Collect POIs with persistent storage, visual status card, and safer UI buttons on Google Maps.
// @author       rix4uni
// @match        https://www.google.com/maps/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=googlemaps.com
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  let lastUrl = location.href;
  const STORAGE_KEY = 'poi_csv_data';
  const csvHeader = ['Image', 'Coordinates', 'Name', 'HName', 'Stars', 'Reviews', 'Category', 'Address', 'Timings'];

  const getStoredData = () => {
    const json = localStorage.getItem(STORAGE_KEY);
    return json ? new Map(JSON.parse(json)) : new Map();
  };

  const saveDataToStorage = (dataMap) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...dataMap.entries()]));
  };

  let collectedData = getStoredData();

  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
  const generateKey = (name, address) => `${name.trim()} | ${address.trim()}`;

  const updateCard = (isSaved) => {
    const card = document.getElementById('poi-status-card');
    if (!card) return;

    const label = card.querySelector('#poi-status-label');
    label.innerText = isSaved ? '✅ Already Saved' : '❌ Not Saved Yet';
    label.style.color = isSaved ? '#0a9b41' : '#d93025';

    const count = collectedData.size;
    card.querySelector('#csv-download-btn').innerText = `⬇️ Download All CSV (${count})`;
  };

  const createStatusCard = () => {
    if (document.getElementById('poi-status-card')) return;

    const card = document.createElement('div');
    card.id = 'poi-status-card';
    card.innerHTML = `
      <div id="poi-status-label" style="margin-bottom: 12px; font-weight: bold;">❌ Not Saved Yet</div>
      <button id="csv-download-btn">⬇️ Download All CSV (0)</button>
      <button id="clear-csv-btn">🗑️ Delete All Data</button>
    `;

    Object.assign(card.style, {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: '9999',
      background: '#fff',
      padding: '16px',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      width: '240px',
      fontFamily: 'system-ui, sans-serif',
      fontSize: '14px',
      color: '#333',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    });

    const downloadBtn = card.querySelector('#csv-download-btn');
    Object.assign(downloadBtn.style, {
      background: '#1a73e8',
      color: 'white',
      border: 'none',
      padding: '10px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontWeight: 'bold'
    });

    downloadBtn.onclick = () => {
      const csvRows = [csvHeader.join(',')];
      for (let row of collectedData.values()) {
        csvRows.push(row.map(field => `"${field}"`).join(','));
      }
      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'GoogleMaps_POIs.csv';
      a.click();
      URL.revokeObjectURL(url);
    };

    const clearBtn = card.querySelector('#clear-csv-btn');
    Object.assign(clearBtn.style, {
      background: '#d93025',
      color: 'white',
      border: 'none',
      padding: '10px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontWeight: 'bold'
    });

    clearBtn.onclick = () => {
      if (confirm('Are you sure you want to delete all saved POI data?')) {
        collectedData.clear();
        localStorage.removeItem(STORAGE_KEY);
        updateCard(false);
        alert('✅ All POI data deleted!');
      }
    };

    document.body.appendChild(card);
  };

  const collectData = async () => {
    await wait(100); // Give time for POI to load

    const name = document.querySelector('h1.DUwDvf.lfPIob')?.innerText || '';
    const address = document.querySelector('.Io6YTe.fontBodyMedium.kR99db.fdkmkc')?.innerText || '';
    const key = generateKey(name, address);

    const alreadySaved = collectedData.has(key);
    updateCard(alreadySaved); // Always update status FIRST

    if (!name || !address || alreadySaved) return;

    try {
      const image = document.querySelector('button.aoRNLd.kn2E5e.NMjTrf.lvtCsd img')?.src || '';
      const coordinates = location.href.match(/@([-.\d]+),([-.\d]+)/)?.slice(1, 3).join(',') || '';
      const hName = document.querySelector('h2.bwoZTb.fontBodyMedium')?.innerText || '';
      const stars = document.querySelector('.F7nice span span[aria-hidden="true"]')?.innerText || '';
      const reviews = document.querySelector('.F7nice span span span[aria-label$="reviews"]')?.innerText.replace(/[()]/g, '') || '';
      const category = document.querySelector('button.DkEaL')?.innerText || '';
      const timings = [...document.querySelectorAll("table.eK4R0e tr")]
        .map(row => {
          const day = row.querySelector("td.ylH6lf div")?.innerText?.trim();
          const hours = row.querySelector("td.mxowUb li")?.innerText?.trim();
          return day && hours ? `${day}: ${hours}` : null;
        })
        .filter(Boolean)
        .join('\\n');

      const row = [image, coordinates, name, hName, stars, reviews, category, address, timings];
      collectedData.set(key, row);
      saveDataToStorage(collectedData);
      updateCard(true);
      console.log(`✅ Saved: ${name} (${address})`);
    } catch (err) {
      console.error('❌ Failed to collect POI:', err);
    }
  };

  // Detect URL changes and collect data
  setInterval(() => {
    const currentUrl = location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      if (/\/place\//.test(currentUrl)) {
        createStatusCard();
        collectData();
      }
    }
  }, 100);
})();
