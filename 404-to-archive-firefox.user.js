// ==UserScript==
// @name        Archive.org 404 Selector for Firefox
// @namespace   Violentmonkey Scripts
// @match        http://*/*
// @match        https://*/*
// @grant        GM_xmlhttpRequest
// @version     1.1
// @author      giuseppesec
// @description When a live URL 404s, show a selector of archived versions instead of auto‐redirecting
// ==/UserScript==

(function() {
  'use strict';

  GM_xmlhttpRequest({
    method: 'GET',
    url: window.location.href,
    onload: function (response) {
      if (response.status === 404) {
        // STEP 1: add a banner placeholder
        const banner = document.createElement('div');
        banner.id = 'archive-404-banner';
        Object.assign(banner.style, {
          backgroundColor: '#282828',
          color: 'white',
          padding: '10px',
          position: 'fixed',
          top: '0',
          left: '0',
          width: '100%',
          zIndex: '9999',
          maxHeight: '80vh',
          overflowY: 'auto'
        });
        document.body.appendChild(banner);
        banner.innerHTML = '<strong>This URL returned a 404.</strong><br>Loading archived versions…';

        // STEP 2: query the Wayback CDX API
        GM_xmlhttpRequest({
          method: 'GET',
          url: 'https://web.archive.org/cdx/search/cdx?url='
               + encodeURIComponent(window.location.href)
               + '&output=json&fl=timestamp,original&filter=statuscode:200',
          onload: function (res) {
            let data;
            try {
              data = JSON.parse(res.responseText);
            }
            catch(e) {
              banner.innerHTML = 'Failed to parse archive.org response.';
              return;
            }

            // data[0] is header: ["timestamp","original"], from data[1...] are entries
            if (data.length <= 1) {
              banner.innerHTML = 'No archived versions found.';
              return;
            }

            // Build a list of snapshots, most recent first
            const rows = data.slice(1)
                             .sort((a,b) => b[0].localeCompare(a[0]))  // timestamp desc
                             .slice(0, 20);                             // limit to 20 entries

            banner.innerHTML = '<strong>Select an archived snapshot:</strong><br><ul id="archive-list"></ul>';

            const list = banner.querySelector('#archive-list');
            rows.forEach(([ts, orig]) => {
              const li = document.createElement('li');
              li.style.margin = '4px 0';

              const a = document.createElement('a');
              a.href = `https://web.archive.org/web/${ts}/${orig}`;
              a.textContent = new Date(
                ts.slice(0,4)+'-'+ts.slice(4,6)+'-'+ts.slice(6,8)+' '
                +ts.slice(8,10)+':'+ts.slice(10,12)+':'+ts.slice(12,14)
              ).toLocaleString()
                + ' (' + ts + ')';
              a.target = '_blank';
              a.style.color = '#00aeef';
              a.style.textDecoration = 'underline';

              li.appendChild(a);
              list.appendChild(li);
            });

            // Optional “Close” button
            const btnClose = document.createElement('button');
            btnClose.textContent = 'Close';
            btnClose.style.marginTop = '10px';
            btnClose.onclick = () => banner.remove();
            banner.appendChild(btnClose);
          },
          onerror: function(err) {
            banner.innerHTML = 'Error fetching archive.org data.';
            console.error(err);
          }
        });

      } else {
        // your existing else‐branch (phrases / antiPhrases logic) goes here unchanged…
      }
    },
    onerror: function(e) {
      console.error('Network error:', e);
    }
  });

})();
