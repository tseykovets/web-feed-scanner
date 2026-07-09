/**
 * Copyright (c) 2026 Nikita Tseykovets <tseikovets@rambler.ru>
 * This file is part of Web Feed Scanner
 * SPDX-License-Identifier: MIT
 */

function collectData() {
  const links = document.querySelectorAll('link[rel]');
  const feeds = [];
  const pageLang = document.documentElement.lang || null;
  const pageTitle = document.title || null;

  // MIME dictionary: human-friendly name of the type
  const typeMap = {
    'application/rss+xml': 'RSS',
    'application/atom+xml': 'Atom',
    'application/feed+json': 'JSON Feed',
    'application/json': 'JSON Feed',
    'application/rdf+xml': 'RDF/XML'
  };

  links.forEach(link => {
    const relValue = link.getAttribute('rel')?.toLowerCase().trim() || '';
    if (relValue !== 'alternate') {
      return;
    }
    const typeValue = link.getAttribute('type')?.toLowerCase().trim() || '';
    const type = typeMap[typeValue];
    if (!type) {
      return;
    }

    const href = link.getAttribute('href') || '';
    const title = link.getAttribute('title') || '';
    
    // Normalization of relative paths
    let url = href;
    if (url && !/^https?:\/\//i.test(url)) {
      try {
        url = new URL(href, window.location.origin).href;
      } catch (err) {
        url = '';
      }
    }

    feeds.push({
      type: type,
      title: title,
      url: url
    });
  });

  return { feeds, pageLang };
}

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'get_feeds') {
    sendResponse(collectData());
  }
});
