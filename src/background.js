/**
 * Copyright (c) 2026 Nikita Tseykovets <tseikovets@rambler.ru>
 * This file is part of Web Feed Scanner
 * SPDX-License-Identifier: MIT
 */

const menuId = 'show_page_feeds';

async function createContextMenu() {
  try {
    await browser.contextMenus.removeAll();
  } catch (err) {
    console.warn('[Web Feed Scanner] Could not clear context menus (may be harmless):', err);
  }

  try {
    await browser.contextMenus.create({
      id: menuId,
      title: browser.i18n.getMessage('show_page_feeds'),
      contexts: ['all'],
    });
  } catch (err) {
    console.error('[Web Feed Scanner] Failed to create context menu:', err);
  }
}

createContextMenu().catch(err => {
  console.error('[Web Feed Scanner] Critical error initializing context menu:', err);
});

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
    const newTab = await browser.tabs.create({ url, active: true });
    const response = await browser.tabs.sendMessage(tab.id, { action: 'get_feeds' });

    if (!response || !response.feeds) {
      console.warn('[Web Feed Scanner] Response received, but data missing or incorrect.');
    }
  } catch (err) {
    console.error('[Web Feed Scanner] Error in showPageFeeds() function:', err);
  }
}
