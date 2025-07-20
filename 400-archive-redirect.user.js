// ==UserScript==
// @name        Archive.org 404 Redirect
// @namespace   Violentmonkey Scripts
// @match       *://github.com/*
// @grant       GM_xmlhttpRequest
// @version     1.0
// @author      giuseppesec
// @description 7/14/2025, 12:54:10 PM
// ==/UserScript==

(function() {
  'use strict';
    GM_xmlhttpRequest({
        method: 'HEAD',
        url: window.location.href,
        onload: function (response) {
            if (response.status === 404) {
                const banner = document.createElement('div');
                banner.innerHTML = '<div style="background-color: #008080; color: white; padding: 10px; position: fixed; top: 0; left: 0; width: 100%; z-index: 9999;" id="404toarchive-banner">Redirecting to archived version, please wait...</div>';
                document.body.appendChild(banner);
                GM_xmlhttpRequest({
                    method: 'GET',
                    url: `https://web.archive.org/cdx/search/cdx?url=${window.location.href}`,
                    onload: function (response) {
                        const text = response.responseText;
                        if (text) {
                            const lines = text.split('\n');
                            const objects = lines.map(line => {
                                const [urlkey, timestamp, original, mimetype, statuscode, digest, length] = line.split(' ');
                                return { urlkey, timestamp, original, mimetype, statuscode, digest, length };
                            });
                            const filteredObjects = objects.filter(obj => obj.statuscode === '200');
                            filteredObjects.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
                            const mostRecent = filteredObjects[0];

                            if (mostRecent) {
                                window.location.replace(`https://web.archive.org/web/${mostRecent.timestamp}/${mostRecent.original}`);
                            } else {
                                document.getElementById('404toarchive-banner').innerText = 'This document does not have an archived version.';
                            }
                        }
                    },
                    onerror: function (error) {
                        console.error('Error fetching data:', error);
                    }
                });
            } else {
                const phrases = ['404 not found', 'page not found', 'this page does not exist', 'the page you are looking for could not be found', "we can't find the page you're looking for", 'the requested page could not be found', 'the page you requested was not found', 'this page is not available', "sorry, we couldn't find that page", 'the page you are looking for is not here', "the page you're looking for doesn't exist", 'oops! that page can't be found', 'sorry, the page you are looking for is not available', 'the page you tried to access does not exist', "this is not the page you're looking for", '404: page not found', 'error 404: not found', 'the page you are trying to reach is not available', "the page you're looking for cannot be found", 'this page cannot be found', 'we couldn't find the page you were looking for', 'the webpage cannot be found', 'the url you requested could not be found', '404 error: page not found', 'error 404: page not found', 'the page you are looking for might have been removed', 'the link you followed may be broken', 'the page you are looking for might have been deleted', "sorry, that page doesn't exist", "oops! the page you're looking for is not here", 'it looks like the page you are looking for does not exist', 'this page might have been moved or deleted', 'we're sorry, the page you requested could not be found', 'page could not be found', 'the page you requested is not available', 'the page you requested is not found', 'this webpage is not available', 'we could not find the page you were looking for', 'the page you are looking for could not be located', "sorry, we can't find that page", 'the page you are looking for could not be reached', 'the page you are trying to view does not exist', 'the page you are trying to access does not exist', 'the requested url was not found on this server', "the page you're looking for might have been removed", 'the link you followed may be outdated', '404 - file or directory not found', 'the resource you are looking for might have been removed', 'we couldn't locate the page you are looking for'];
                const antiPhrases = ['how to handle 404 error', 'what does 404 error mean', 'what is a 404', 'common causes of 404 error', 'fixing 404 not found error', 'troubleshooting 404 error', '404 error best practices', 'understanding 404 error', 'preventing 404 error', 'creating a custom 404 error page', 'handling 404 error gracefully', 'seo impact of 404 error', '404 error troubleshooting guide', 'dealing with 404 error in your website', 'why do 404 error occur', 'designing effective 404 error pages', '404 error page examples', 'differences between 404 and other error', 'server response codes: 404 not found', 'how to create a useful 404 page', '404 error: page not found explanation', 'best practices for 404 error handling', 'improving user experience with 404 pages', 'avoiding 404 error on your site', 'seo and 404 error', 'custom 404 error pages', 'user-friendly 404 error messages', 'how to track 404 error', '404 error page design tips', 'common misconceptions about 404 error', 'impact of 404 error on website traffic', 'case studies on 404 error handling', 'exploring 404 error causes', '404 error monitoring tools', 'analytics for 404 error', 'redirects and 404 error', 'how to reduce 404 error', 'web development and 404 error', 'designing for 404 error', '404 error pages and user retention', 'technical seo: 404 error', 'server logs and 404 error', 'handling 404 error in web applications', 'user feedback on 404 pages', '404 error and site maintenance', '404 error tracking', 'optimizing 404 error pages'];

                const bodyText = document.body.innerText;
                if (phrases.some(phrase => bodyText.includes(phrase.toLowerCase())) && !antiPhrases.some(phrase => bodyText.includes(phrase.toLowerCase())) && !localStorage.getItem('404toarchive-donotshowagain')) {
                    const banner = document.createElement('div');
                    banner.innerHTML = '<div style="background-color: blue; color: white; padding: 10px; position: fixed; top: 0; left: 0; width: 100%; z-index: 9999;">This page seems to be a 404 page, but is returning a non-404 status code.<br/>Due to technical limitations, it is not yet possible to determine which archived versions contain actual content instead of a 404 page, therefore the page cannot be automatically redirected.<br/></div>';
                    document.body.appendChild(banner);

                    const waListButton = document.createElement('button');
                    waListButton.style.margin = '5px';
                    waListButton.textContent = 'View list of archived versions';
                    waListButton.onclick = function () {
                        window.location.href = `https://web.archive.org/web/${new Date().getFullYear()}0000000000*/${window.location.href}`;
                    };
                    banner.firstChild.appendChild(waListButton);

                    const closeButton = document.createElement('button');
                    closeButton.style.margin = '5px';
                    closeButton.textContent = 'Close';
                    closeButton.onclick = function () {
                        banner.parentNode.removeChild(banner);
                    };
                    banner.firstChild.appendChild(closeButton);

                    const closeForeverButton = document.createElement('button');
                    closeForeverButton.style.margin = '5px';
                    closeForeverButton.textContent = 'Close and do not show again';
                    closeForeverButton.onclick = function () {
                        localStorage.setItem('404toarchive-donotshowagain', true);
                        banner.parentNode.removeChild(banner);
                    };
                    banner.firstChild.appendChild(closeForeverButton);
                }
            }
        },
        onerror: function (error) {
            console.error('Error:', error);
        }
    });
  })();