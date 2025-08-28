/**
 * Webpage JS/HTML Downloader
 * Run this script in the browser console to download all JavaScript and HTML files
 * loaded by the current webpage.
 * 
 * Usage: Copy and paste this entire script into the browser console and press Enter
 */

(function() {
    'use strict';
    
    console.log('🚀 Starting webpage file downloader...');
    
    // Configuration
    const config = {
        includeInlineScripts: true,
        includeDataURIs: false,
        maxFileSize: 50 * 1024 * 1024, // 50MB max file size
        downloadDelay: 500, // Delay between downloads in ms
        logProgress: true
    };
    
    // Utility functions
    const utils = {
        // Create a download link and trigger download
        downloadFile: function(content, filename, mimeType = 'text/plain') {
            const blob = new Blob([content], { type: mimeType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        },
        
        // Sanitize filename
        sanitizeFilename: function(filename) {
            return filename
                .replace(/[^\w\s.-]/gi, '_')
                .replace(/\s+/g, '_')
                .replace(/_+/g, '_')
                .substring(0, 250); // Limit filename length
        },
        
        // Extract filename from URL
        getFilenameFromUrl: function(url) {
            try {
                const urlObj = new URL(url);
                let filename = urlObj.pathname.split('/').pop();
                if (!filename || filename.indexOf('.') === -1) {
                    filename = urlObj.hostname + '_' + Date.now();
                }
                return this.sanitizeFilename(filename);
            } catch (e) {
                return 'unknown_file_' + Date.now();
            }
        },
        
        // Check if URL is same origin or accessible
        isSameOrigin: function(url) {
            try {
                const urlObj = new URL(url);
                return urlObj.origin === window.location.origin;
            } catch (e) {
                return false;
            }
        },
        
        // Fetch file with error handling
        fetchFile: async function(url) {
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                // Check content length
                const contentLength = response.headers.get('content-length');
                if (contentLength && parseInt(contentLength) > config.maxFileSize) {
                    throw new Error(`File too large: ${contentLength} bytes`);
                }
                
                return await response.text();
            } catch (error) {
                console.warn(`❌ Failed to fetch ${url}:`, error.message);
                return null;
            }
        },
        
        // Sleep function for delays
        sleep: function(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
    };
    
    // Main downloader class
    const WebpageDownloader = {
        files: new Set(),
        downloaded: 0,
        failed: 0,
        
        // Initialize and start download process
        init: async function() {
            console.log('📂 Scanning webpage for JS and HTML files...');
            
            // Collect all file URLs
            this.collectJavaScriptFiles();
            this.collectHTMLFiles();
            this.collectInlineContent();
            
            console.log(`📊 Found ${this.files.size} files to download`);
            
            if (this.files.size === 0) {
                console.log('ℹ️ No files found to download');
                return;
            }
            
            // Start downloading
            await this.downloadAllFiles();
            
            // Summary
            console.log(`✅ Download complete! Downloaded: ${this.downloaded}, Failed: ${this.failed}`);
        },
        
        // Collect JavaScript files
        collectJavaScriptFiles: function() {
            // External script tags
            const scripts = document.querySelectorAll('script[src]');
            scripts.forEach(script => {
                const src = script.getAttribute('src');
                if (src && !src.startsWith('data:')) {
                    const absoluteUrl = new URL(src, window.location.href).href;
                    this.files.add({
                        url: absoluteUrl,
                        type: 'js',
                        source: 'script-tag'
                    });
                }
            });
            
            // Check for dynamically loaded scripts in performance entries
            if (window.performance && window.performance.getEntriesByType) {
                const resources = window.performance.getEntriesByType('resource');
                resources.forEach(resource => {
                    if (resource.name.endsWith('.js') || 
                        resource.name.includes('.js?') ||
                        resource.initiatorType === 'script') {
                        this.files.add({
                            url: resource.name,
                            type: 'js',
                            source: 'performance-api'
                        });
                    }
                });
            }
        },
        
        // Collect HTML files
        collectHTMLFiles: function() {
            // Current page
            this.files.add({
                url: window.location.href,
                type: 'html',
                source: 'current-page'
            });
            
            // Iframes
            const iframes = document.querySelectorAll('iframe[src]');
            iframes.forEach(iframe => {
                const src = iframe.getAttribute('src');
                if (src && !src.startsWith('data:') && !src.startsWith('javascript:')) {
                    const absoluteUrl = new URL(src, window.location.href).href;
                    this.files.add({
                        url: absoluteUrl,
                        type: 'html',
                        source: 'iframe'
                    });
                }
            });
            
            // Links to HTML files
            const links = document.querySelectorAll('a[href]');
            links.forEach(link => {
                const href = link.getAttribute('href');
                if (href && (href.endsWith('.html') || href.endsWith('.htm'))) {
                    const absoluteUrl = new URL(href, window.location.href).href;
                    this.files.add({
                        url: absoluteUrl,
                        type: 'html',
                        source: 'link'
                    });
                }
            });
        },
        
        // Collect inline content
        collectInlineContent: function() {
            if (!config.includeInlineScripts) return;
            
            // Inline scripts
            const inlineScripts = document.querySelectorAll('script:not([src])');
            inlineScripts.forEach((script, index) => {
                if (script.textContent.trim()) {
                    this.files.add({
                        content: script.textContent,
                        filename: `inline_script_${index + 1}.js`,
                        type: 'js',
                        source: 'inline'
                    });
                }
            });
        },
        
        // Download all collected files
        downloadAllFiles: async function() {
            const filesArray = Array.from(this.files);
            console.log('📥 Starting downloads...');
            
            for (let i = 0; i < filesArray.length; i++) {
                const fileInfo = filesArray[i];
                
                if (config.logProgress) {
                    console.log(`⬇️ (${i + 1}/${filesArray.length}) Downloading: ${fileInfo.url || fileInfo.filename}`);
                }
                
                try {
                    await this.downloadFile(fileInfo);
                    this.downloaded++;
                } catch (error) {
                    console.error(`❌ Failed to download ${fileInfo.url || fileInfo.filename}:`, error);
                    this.failed++;
                }
                
                // Add delay between downloads
                if (i < filesArray.length - 1) {
                    await utils.sleep(config.downloadDelay);
                }
            }
        },
        
        // Download individual file
        downloadFile: async function(fileInfo) {
            let content;
            let filename;
            let mimeType;
            
            if (fileInfo.content) {
                // Inline content
                content = fileInfo.content;
                filename = fileInfo.filename;
            } else {
                // External file
                content = await utils.fetchFile(fileInfo.url);
                if (!content) {
                    throw new Error('Failed to fetch file content');
                }
                filename = utils.getFilenameFromUrl(fileInfo.url);
            }
            
            // Set MIME type
            if (fileInfo.type === 'js') {
                mimeType = 'application/javascript';
                if (!filename.endsWith('.js')) {
                    filename += '.js';
                }
            } else if (fileInfo.type === 'html') {
                mimeType = 'text/html';
                if (!filename.endsWith('.html') && !filename.endsWith('.htm')) {
                    filename += '.html';
                }
            }
            
            // Add metadata comment
            const metadata = `/*\n * Downloaded from: ${fileInfo.url || 'inline content'}\n * Source: ${fileInfo.source}\n * Date: ${new Date().toISOString()}\n * User Agent: ${navigator.userAgent}\n */\n\n`;
            
            if (fileInfo.type === 'js') {
                content = metadata + content;
            } else if (fileInfo.type === 'html') {
                content = `<!-- ${metadata.replace(/\/\*/g, '').replace(/\*\//g, '')} -->\n` + content;
            }
            
            utils.downloadFile(content, filename, mimeType);
        }
    };
    
    // Advanced features
    const AdvancedFeatures = {
        // Download with folder structure
        downloadWithStructure: function() {
            console.log('📁 Enhanced download with folder structure...');
            // This would require a zip library for full implementation
            console.warn('⚠️ Folder structure download requires additional libraries');
        },
        
        // Analyze dependencies
        analyzeDependencies: function() {
            console.log('🔍 Analyzing JavaScript dependencies...');
            const scripts = document.querySelectorAll('script');
            const dependencies = [];
            
            scripts.forEach(script => {
                if (script.src) {
                    dependencies.push({
                        url: script.src,
                        async: script.async,
                        defer: script.defer,
                        type: script.type || 'text/javascript'
                    });
                }
            });
            
            console.table(dependencies);
            return dependencies;
        },
        
        // Check for webpack/bundled files
        detectBundlers: function() {
            const bundlerHints = {
                webpack: /webpack|__webpack/i,
                rollup: /__rollup|rollup/i,
                parcel: /__parcel|parcel/i,
                esbuild: /__esbuild/i
            };
            
            const detectedBundlers = [];
            
            // Check script content for bundler signatures
            document.querySelectorAll('script').forEach(script => {
                const content = script.textContent || '';
                Object.entries(bundlerHints).forEach(([bundler, regex]) => {
                    if (regex.test(content) && !detectedBundlers.includes(bundler)) {
                        detectedBundlers.push(bundler);
                    }
                });
            });
            
            if (detectedBundlers.length > 0) {
                console.log('🔧 Detected bundlers:', detectedBundlers);
            } else {
                console.log('ℹ️ No common bundlers detected');
            }
            
            return detectedBundlers;
        }
    };
    
    // UI Interface for console
    const ConsoleUI = {
        showMenu: function() {
            console.log(`
╔════════════════════════════════════════════╗
║           Webpage File Downloader          ║
╠════════════════════════════════════════════╣
║ Commands:                                  ║
║ • downloader.start()        - Start download   ║
║ • downloader.config()       - Show config      ║
║ • downloader.analyze()      - Analyze deps     ║
║ • downloader.detectBundlers() - Find bundlers  ║
╚════════════════════════════════════════════╝
            `);
        },
        
        showConfig: function() {
            console.log('⚙️ Current Configuration:');
            console.table(config);
        }
    };
    
    // Create global interface
    window.downloader = {
        start: () => WebpageDownloader.init(),
        config: () => ConsoleUI.showConfig(),
        analyze: () => AdvancedFeatures.analyzeDependencies(),
        detectBundlers: () => AdvancedFeatures.detectBundlers(),
        help: () => ConsoleUI.showMenu()
    };
    
    // Auto-start or show menu
    if (confirm('🚀 Webpage File Downloader loaded!\n\nStart downloading files immediately?')) {
        WebpageDownloader.init();
    } else {
        ConsoleUI.showMenu();
        console.log('💡 Type "downloader.start()" to begin downloading files');
    }
    
})();
