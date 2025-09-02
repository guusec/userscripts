// ==UserScript==
// @name         File Downloader
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Downloads files from the webpage and lets you choose a folder to save them.
// @author       guusec
// @match        *://*/*
// @grant        GM_download
// ==/UserScript==

(function () {
    'use strict';

    console.log('🚀 File Downloader script loaded!');

    // Utility functions
    const utils = {
        // Create a download link and trigger download
        downloadFile: function (content, filename) {
            const blob = new Blob([content], { type: "application/octet-stream" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        },

        // Sanitize filename
        sanitizeFilename: function (filename) {
            return filename
                .replace(/[^\w\s.-]/gi, "_")
                .replace(/\s+/g, "_")
                .replace(/_+/g, "_")
                .substring(0, 250); // Limit filename length
        },

        // Fetch file with error handling
        fetchFile: async function (url) {
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                return await response.text();
            } catch (error) {
                console.warn(`❌ Failed to fetch ${url}:`, error.message);
                return null;
            }
        },
    };

    // Main downloader function
    async function startDownloading() {
        console.log("📂 Starting the file download process...");

        // Prompt user to select a folder
        const folderPicker = document.createElement("input");
        folderPicker.type = "file";
        folderPicker.webkitdirectory = true;
        folderPicker.directory = true;

        folderPicker.addEventListener("change", async (event) => {
            const folderPath = event.target.files[0]?.path;
            if (!folderPath) {
                console.error("❌ No folder selected.");
                return;
            }

            console.log(`📁 Selected folder: ${folderPath}`);

            // Example: Fetch files and save them to the folder
            const filesToDownload = [
                { url: "https://example.com/file1.js", name: "file1.js" },
                { url: "https://example.com/file2.html", name: "file2.html" },
            ];

            for (const file of filesToDownload) {
                const content = await utils.fetchFile(file.url);
                if (content) {
                    const sanitizedFilename = utils.sanitizeFilename(file.name);
                    utils.downloadFile(content, `${folderPath}/${sanitizedFilename}`);
                    console.log(`✅ Downloaded: ${sanitizedFilename}`);
                }
            }
        });

        folderPicker.click();
    }

    // Expose the download function to the console
    window.download = startDownloading;

    console.log('💡 To start downloading files, type "download()" in the console.');
})();