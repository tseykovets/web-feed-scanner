/**
 * Copyright (c) 2026 Nikita Tseykovets <tseikovets@rambler.ru>
 * This file is part of Web Feed Scanner
 * SPDX-License-Identifier: MIT
 */

document.addEventListener('DOMContentLoaded', async () => {
  const pageTitleEl = document.getElementById('page-title');
  const headerEl = document.getElementById('header-text');
  const contentDiv = document.getElementById('content');

  try {
    // Get tab ID from URL (?tabId=...)
    const params = new URLSearchParams(window.location.search);
    const tabId = parseInt(params.get('tabId'), 10);
    if (!tabId) {
      throw new Error('The tabId parameter was not found when opening popup.html.');
    }

    // Check if the tab exists
    let sourceTab;
    try {
      sourceTab = await chrome.tabs.get(tabId);
    } catch (e) {
      // If the tab does not exist (closed), display message
      pageTitleEl.textContent = chrome.i18n.getMessage('error_title');
      headerEl.textContent = chrome.i18n.getMessage('error_title');
      contentDiv.innerHTML = `
        <div class="empty-state">
          <p>${chrome.i18n.getMessage('tab_closed_message')}</p>
          <p style="margin-top: 10px; font-size: 0.9em; color: #555;">${
            chrome.i18n.getMessage('tab_closed_explanation')
          }</p>
        </div>`;
      return;
    }
    
    // Request data from content.js
    let response;
    try {
      response = await chrome.tabs.sendMessage(tabId, { action: 'get_feeds' });
    } catch (err) {
      console.error('[Web Feed Scanner] Error connecting to the tab:', err);
      pageTitleEl.textContent = chrome.i18n.getMessage('error_title');
      headerEl.textContent = chrome.i18n.getMessage('error_title');
      contentDiv.innerHTML = `
        <div class="empty-state">
          <p>${chrome.i18n.getMessage('no_connection_message')}</p>
          <p style="margin-top: 10px; font-size: 0.9em; color: #555;">${
            chrome.i18n.getMessage('no_connection_explanation')
          }</p>
        </div>`;
      return;
    }

    // Process data
    let feeds = [];
    
    // Safely get an array of feeds
    if (response && Array.isArray(response.feeds)) {
      feeds = response.feeds;
    }

    const feedNumber = feeds.length;

    if (feedNumber === 0) {
      let pageName;
      if (sourceTab.title) {
        pageName = sourceTab.title;
      } else {
        pageName = sourceTab.url;
      }
      pageTitleEl.textContent = chrome.i18n.getMessage('no_feeds_title', pageName);
      headerEl.innerHTML = `
        <a href="${sourceTab.url}" target="_blank" rel="noopener noreferrer">${
          chrome.i18n.getMessage('no_feeds_title', pageName)
        }</a>`;
      contentDiv.innerHTML = `
        <div class="empty-state">
          <p>${chrome.i18n.getMessage('no_feeds_message')}</p>
          <p style="margin-top: 10px; font-size: 0.9em; color: #555;">${
            chrome.i18n.getMessage('no_feeds_explanation')
          }</p>
        </div>`;
      return;
    }

    let pageName;
    if (sourceTab.title) {
      pageName = sourceTab.title;
    } else {
      pageName = sourceTab.url;
    }
    pageTitleEl.textContent = chrome.i18n.getMessage('there_are_feeds_title', [String(feedNumber), pageName]);
    headerEl.innerHTML = `
      <a href="${sourceTab.url}" target="_blank" rel="noopener noreferrer">${
        chrome.i18n.getMessage('there_are_feeds_title', [String(feedNumber), pageName])
      }</a>`;

    // Create a table
    const table = document.createElement('table');
    table.innerHTML = `
      <thead>
        <tr>
          <th>${chrome.i18n.getMessage('type')}</th>
          <th>${chrome.i18n.getMessage('title')}</th>
          <th style="text-align: right;">${chrome.i18n.getMessage('action')}</th>
        </tr>
      </thead>
      <tbody id="feeds-body"></tbody>`;
    contentDiv.appendChild(table);
    const tbody = document.getElementById('feeds-body');

    feeds.forEach((feed) => {
      const tr = document.createElement('tr');
      
      // Type
      const tdType = document.createElement('td');
      tdType.textContent = feed.type;

      // Title
      const tdTitle = document.createElement('td');
      const link = document.createElement('a');
      link.href = feed.url;
      link.target = '_blank';
      link.className = 'feed-link';
      link.rel = 'noopener noreferrer';
      if (response.pageLang) {
        link.lang = response.pageLang;
      }
      if (feed.title) {
        link.textContent = feed.title;
      } else {
        link.textContent = feed.url;
      }
      tdTitle.appendChild(link);

      // Action
      const tdAction = document.createElement('td');
      tdAction.style.textAlign = 'right';
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'copy-btn';
      btn.textContent = chrome.i18n.getMessage('copy_url');
      
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
          await navigator.clipboard.writeText(feed.url);
          const originalText = btn.textContent;
          btn.textContent = chrome.i18n.getMessage('copied');
          btn.classList.add('copied');
          
          setTimeout(() => {
            btn.textContent = originalText;
            btn.classList.remove('copied');
          }, 3000);
        } catch (err) {
          alert(chrome.i18n.getMessage('failed_copying'));
        }
      });
      tdAction.appendChild(btn);

      tr.appendChild(tdType);
      tr.appendChild(tdTitle);
      tr.appendChild(tdAction);
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error('[Web Feed Scanner] Critical error', err);
    pageTitleEl.textContent = chrome.i18n.getMessage('error_title');
    headerEl.textContent = chrome.i18n.getMessage('error_title');
    contentDiv.innerHTML = `
      <div class="empty-state">
        <p>${chrome.i18n.getMessage('critical_error_message')}</p>
        <p style="margin-top: 10px; font-size: 0.9em; color: #555;">${
          chrome.i18n.getMessage('critical_error_explanation')
        }</p>
      </div>`;
  }
});
