// ==UserScript==
// @name        Freedium
// @namespace   Violentmonkey Scripts
// @match       *://*/*
// @grant       none
// @version     2.0
// @icon        https://miro.medium.com/v2/resize:fill:120:120/10fd5c419ac61637245384e7099e131627900034828f4f386bdaa47a74eae156
// @author      giuseppesec
// @description Automatically redirects to Freedium equivalent for Medium articles (including custom domains)
// @run-at      document-start
// ==/UserScript==

(function() {
  'use strict';
  
  // Check if already on freedium to prevent redirect loops
  if (window.location.hostname === 'freedium.cfd') {
    return;
  }
  
  const currentUrl = window.location.href;
  const hostname = window.location.hostname;
  
  // Check if it's a direct Medium domain
  const isMediumDomain = hostname === 'medium.com' || hostname.endsWith('.medium.com');
  
  // Function to check if this is a Medium-powered site
  function isMediumPoweredSite() {
    // Check for Medium-specific meta tags and elements
    const indicators = [
      'meta[property="al:web:url"][content*="medium.com"]',
      'meta[property="article:publisher"][content*="medium.com"]',
      'meta[name="twitter:site"][content="@Medium"]',
      'link[rel="canonical"][href*="medium.com"]',
      'script[src*="medium.com"]',
      'link[href*="medium.com"]',
      'meta[property="og:site_name"][content="Medium"]'
    ];
    
    return indicators.some(selector => document.querySelector(selector));
  }
  
  // Function to perform redirect
  function redirectToFreedium() {
    const path = window.location.pathname;
    
    // Skip homepage, tags, search pages
    if (path === '/' || path === '' || path.startsWith('/tag/') || path.startsWith('/search')) {
      return;
    }
    
    const freediumUrl = 'https://freedium.cfd/' + currentUrl;
    window.location.replace(freediumUrl);
  }
  
  // If it's a known Medium domain, redirect immediately
  if (isMediumDomain) {
    redirectToFreedium();
    return;
  }
  
  // For other domains, wait for DOM to load and check for Medium indicators
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      if (isMediumPoweredSite()) {
        redirectToFreedium();
      }
    });
  } else {
    // DOM already loaded
    if (isMediumPoweredSite()) {
      redirectToFreedium();
    }
  }
})();
