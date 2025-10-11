// ==UserScript==
// @name         Copy securitytrails Subdomains
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Copy domain values from table rows to clipboard on securitytrails
// @author       rix4uni
// @match        https://securitytrails.com/list/apex_domain/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=securitytrails.com
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  // Prefer async Clipboard API, fall back to execCommand
  async function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (e) {
        // fall through to legacy path
      }
    }
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.top = '-1000px';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  }

  // Collect domain names from anchors inside tbody rows
  function collectDomains() {
    // Grab anchors that look like /domain/<name>/dns
    const anchors = document.querySelectorAll('tbody a.link[href^="/domain/"]');
    const domains = Array.from(anchors)
      .map(a => (a.textContent || '').trim())
      .filter(Boolean);

    // De-dupe while preserving order
    const seen = new Set();
    const unique = [];
    for (const d of domains) {
      if (!seen.has(d)) {
        seen.add(d);
        unique.push(d);
      }
    }
    return unique.join('\n');
  }

  async function handleCopy() {
    const text = collectDomains();
    if (!text) {
      notify('No domains found on this page.', true);
      return;
    }
    const ok = await copyToClipboard(text);
    notify(ok ? 'Domains copied to clipboard!' : 'Failed to copy domains.', !ok);
  }

  // Tiny toast
  function notify(msg, isError = false) {
    const note = document.createElement('div');
    note.textContent = msg;
    note.style.position = 'fixed';
    note.style.bottom = '20px';
    note.style.right = '20px';
    note.style.padding = '10px 14px';
    note.style.borderRadius = '10px';
    note.style.fontFamily = 'system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif';
    note.style.fontSize = '14px';
    note.style.boxShadow = '0 6px 20px rgba(0,0,0,0.15)';
    note.style.background = isError ? '#dc3545' : '#198754';
    note.style.color = '#fff';
    note.style.zIndex = '2147483647';
    document.body.appendChild(note);
    setTimeout(() => note.remove(), 2000);
  }

  // Create floating button
  function addButton() {
    if (document.getElementById('copy-domains-btn')) return;
    const btn = document.createElement('button');
    btn.id = 'copy-domains-btn';
    btn.textContent = 'Copy Domains';
    btn.style.position = 'fixed';
    btn.style.top = '150px';
    btn.style.right = '20px';
    btn.style.zIndex = '2147483647';
    btn.style.padding = '10px 16px';
    btn.style.backgroundColor = '#007bff';
    btn.style.color = 'white';
    btn.style.border = 'none';
    btn.style.borderRadius = '8px';
    btn.style.cursor = 'pointer';
    btn.style.display = 'flex';
    btn.style.justifyContent = 'center';
    btn.style.alignItems = 'center';
    btn.style.fontFamily = 'system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif';
    btn.style.fontSize = '14px';
    btn.addEventListener('click', handleCopy);
    document.body.appendChild(btn);
  }

  // Add button immediately and after SPA navigations
  addButton();

  // Observe DOM changes (Shodan uses dynamic loads)
  const mo = new MutationObserver(() => {
    addButton(); // ensure the button exists after content swaps
  });
  mo.observe(document.documentElement, { childList: true, subtree: true });
})();
