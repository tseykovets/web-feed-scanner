/**
 * Copyright (c) 2026 Nikita Tseykovets <tseikovets@rambler.ru>
 * This file is part of Web Feed Scanner
 * SPDX-License-Identifier: MIT
 */

const menuId = 'show_page_feeds';

function createContextMenu() {
  try {
    browser.contextMenus.removeAll(() => {
      if (browser.runtime.lastError) {
        console.error('[Web Feed Scanner] Menu clearing error:', browser.runtime.lastError);
      }

      browser.contextMenus.create({
        id: menuId,
        title: browser.i18n.getMessage('show_page_feeds'),
        contexts: ['all']
      }, () => {
        if (browser.runtime.lastError) {
          console.error('[Web Feed Scanner] Menu creating error:', browser.runtime.lastError);
        }
      });
    });
  } catch (err) {
    console.error('[Web Feed Scanner] Critical error when initializing the menu:', err);
  }
}

createContextMenu();

// Toolbar button handler
browser.action.onClicked.addListener(async (tab) => {
  await showPageFeeds(tab);
});

// Context menu handler
browser.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === menuId) {
    await showPageFeeds(tab);
  }
});

async function showPageFeeds(tab) {
  const url = `${browser.runtime.getURL('popup.html')}?tabId=${tab.id}`;

  try {
    // Open new tab before requesting data
    const newTab = await browser.tabs.create({ url: url, active: true });
    const response = await browser.tabs.sendMessage(tab.id, { action: 'get_feeds' });
    if (!response || !response.feeds) {
      console.warn('[Web Feed Scanner] Response received, but data missing or incorrect.');
      return;
    }
  } catch (err) {
    console.error('[Web Feed Scanner] Error in the showPageFeeds() function:', err);
  }
}
