// ==UserScript==
// @name         DevTools
// @namespace    http://tampermonkey.net/
// @version      2.6
// @description  Javascript console and DOM inspector/editor for mobile browsers
// @author       @giuseppesec
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    if (window.__iosJsConsoleLoaded) return;
    window.__iosJsConsoleLoaded = true;

    // --- Styles ---
    const style = document.createElement('style');
    style.id = '__ios_console_style';
    style.innerHTML = `
        #ios-js-console-container {
            position: fixed;
            left: 0; right: 0; bottom: 0;
            background: rgba(30,30,30,0.97);
            color: #fff;
            z-index: 99999;
            font-family: monospace;
            padding: 0;
            border-top: 1px solid #444;
        }
        #ios-js-console-log {
            max-height: 160px;
            overflow-y: auto;
            font-size: 14px;
            padding: 8px 6px 0 6px;
        }
        #ios-js-console-input-wrap {
            display: flex;
            flex-direction: column;
            border-top: 1px solid #444;
            background: #232323;
        }
        #ios-js-console-input-row {
            display: flex;
            align-items: center;
        }
        #ios-js-console-input {
            flex: 1;
            font-size: 16px;
            background: #232323;
            color: #fff;
            border: none;
            outline: none;
            padding: 9px 8px;
        }
        #ios-js-console-run {
            background: #444;
            color: #fff;
            border: none;
            font-size: 17px;
            padding: 0 18px;
            margin-left: 2px;
            cursor: pointer;
            border-radius: 7px;
            transition: background .2s;
        }
        #ios-js-console-run:active {
            background: #666;
        }
        #ios-js-console-preview {
            font-size: 14px;
            color: #aafffa;
            background: #181818;
            padding: 5px 8px;
            border-top: 1px solid #333;
            min-height: 20px;
        }
        #highlight-inspector-menu {
            position: fixed;
            background: #232323;
            color: #aafffa;
            border: 2px solid #444;
            border-radius: 8px;
            font-size: 16px;
            padding: 8px 18px;
            z-index: 1000000;
            box-shadow: 0 2px 8px rgba(0,0,0,0.18);
            cursor: pointer;
            user-select: none;
            transition: background .2s;
        }
        #highlight-inspector-menu:active {
            background: #282848;
        }
        #ios-html-inspector-overlay {
            position: fixed;
            left: 0; top: 0; right: 0; bottom: 0;
            background: rgba(18,18,24,0.98);
            color: #eee;
            z-index: 999999;
            font-family: monospace;
            display: flex;
            flex-direction: column;
        }
        #ios-html-inspector-header {
            background: #27273a;
            padding: 11px 14px;
            font-size: 17px;
            font-weight: bold;
            border-bottom: 1px solid #444;
        }
        #ios-html-inspector-info {
            padding: 13px 14px;
            border-bottom: 1px solid #444;
            background: #222;
            font-size: 15px;
            word-break: break-word;
        }
        #ios-html-inspector-tree {
            flex: 1;
            padding: 8px 6px 0 6px;
            overflow-y: auto;
            font-size: 14px;
            background: #18181f;
            color: #baffba;
            position: relative;
            white-space: pre-line;
            word-break: break-word;
        }
        .inspector-node {
            margin-left: 0 !important;
            margin-bottom: 2px;
            cursor: default;
            position: relative;
            user-select: text;
            transition: background 0.15s;
            white-space: normal;
            word-break: break-word;
            display: block;
        }
        .inspector-highlight {
            background: #345a7c !important;
            color: #fffa7c !important;
            border-radius: 7px;
        }
        .inspector-expand {
            color: #87cdfa;
            font-weight: bold;
            cursor: pointer;
            user-select: none;
            margin-right: 5px;
            display: inline-block;
            width: 16px;
        }
        .inspector-tag {
            color: #fffa7c;
        }
        .inspector-id {
            color: #ff96c8;
        }
        .inspector-class {
            color: #7cffa4;
        }
        .inspector-edit {
            background: #282848;
            color: #fff;
            border: none;
            font-size: 13px;
            margin-left: 8px;
            border-radius: 5px;
            padding: 2px 8px;
            cursor: pointer;
        }
        #ios-html-inspector-controls {
            display: flex;
            border-top: 1px solid #444;
            background: #232323;
            align-items: stretch;
        }
        #ios-html-inspector-close {
            background: #444;
            color: #fff;
            border: none;
            font-size: 16px;
            padding: 0 22px;
            height: 40px;
            margin-left: auto;
        }
        /* Modal for editing */
        #ios-html-inspector-modal {
            position: fixed;
            left: 0; top: 0; right: 0; bottom: 0;
            background: rgba(20,20,30,0.85);
            z-index: 2000000;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        #ios-html-inspector-modal-content {
            background: #232323;
            color: #fff;
            border-radius: 12px;
            max-width: 96vw;
            width: 500px;
            min-width: 240px;
            max-height: 70vh;
            padding: 24px 22px 18px 22px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.20);
            display: flex;
            flex-direction: column;
            align-items: stretch;
        }
        #ios-html-inspector-modal-content textarea {
            background: #18181f;
            color: #fff;
            border: 1px solid #444;
            font-size: 15px;
            min-height: 100px;
            max-height: 40vh;
            width: 100%;
            resize: vertical;
            margin-bottom: 18px;
            margin-top: 6px;
            border-radius: 8px;
            font-family: monospace;
        }
        #ios-html-inspector-modal-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 9px;
        }
        #ios-html-inspector-modal-buttons {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
        }
        #ios-html-inspector-modal-save,
        #ios-html-inspector-modal-cancel {
            background: #444;
            color: #fff;
            border: none;
            font-size: 15px;
            border-radius: 7px;
            padding: 7px 21px;
            cursor: pointer;
        }
        #ios-html-inspector-modal-save:active,
        #ios-html-inspector-modal-cancel:active {
            background: #666;
        }
    `;
    document.head.appendChild(style);

    // --- Console UI ---
    function addConsole() {
        if (document.getElementById('ios-js-console-container')) {
            document.getElementById('ios-js-console-container').remove();
        }

        const container = document.createElement('div');
        container.id = 'ios-js-console-container';

        const logArea = document.createElement('div');
        logArea.id = 'ios-js-console-log';

        const inputWrap = document.createElement('div');
        inputWrap.id = 'ios-js-console-input-wrap';

        const inputRow = document.createElement('div');
        inputRow.id = 'ios-js-console-input-row';

        const input = document.createElement('input');
        input.id = 'ios-js-console-input';
        input.type = 'text';
        input.autocapitalize = 'off';
        input.autocorrect = 'off';
        input.spellcheck = false;
        input.placeholder = 'Type JS here...';

        const runBtn = document.createElement('button');
        runBtn.id = 'ios-js-console-run';
        runBtn.textContent = '▶︎';

        inputRow.appendChild(input);
        inputRow.appendChild(runBtn);

        const preview = document.createElement('div');
        preview.id = 'ios-js-console-preview';

        inputWrap.appendChild(inputRow);
        inputWrap.appendChild(preview);

        container.appendChild(logArea);
        container.appendChild(inputWrap);

        document.body.appendChild(container);

        setTimeout(() => { input.focus(); }, 400);

        function scrollLog() {
            logArea.scrollTop = logArea.scrollHeight;
        }

        function printToLog(type, value) {
            const el = document.createElement('div');
            el.style.marginBottom = '3px';
            if (type === 'error') {
                el.style.color = '#ff6666';
            } else if (type === 'result') {
                el.style.color = '#baffba';
            }
            el.textContent = value;
            logArea.appendChild(el);
            scrollLog();
        }

        const origLog = window.console.log;
        const origError = window.console.error;
        window.console.log = function(...args) {
            origLog.apply(window.console, args);
            printToLog('log', args.map(String).join(' '));
        };
        window.console.error = function(...args) {
            origError.apply(window.console, args);
            printToLog('error', args.map(String).join(' '));
        };

        input.addEventListener('input', function(e) {
            previewOutput(input.value);
        });

        function previewOutput(code) {
            if (!code.trim()) {
                preview.innerHTML = '';
                return;
            }
            try {
                new Function('"use strict"; return (' + code + ')');
                preview.innerHTML = `<span style="color:#baffba;">Parsing OK</span>`;
            } catch (e) {
                preview.innerHTML = `<span style="color:#ff6666;">Syntax/Error: ${escapeHtml(e.message)}</span>`;
            }
        }

        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                runCode();
            } else if (e.key === 'Escape') {
                container.remove();
                window.__iosJsConsoleLoaded = false;
            }
        });

        logArea.addEventListener('click', () => input.focus());

        let startY = null;
        container.addEventListener('touchstart', function(e) {
            startY = e.touches[0].clientY;
        });
        container.addEventListener('touchmove', function(e) {
            if (startY !== null) {
                const dy = e.touches[0].clientY - startY;
                if (dy > 60) {
                    container.remove();
                    window.__iosJsConsoleLoaded = false;
                }
            }
        });
        container.addEventListener('touchend', function() { startY = null; });

        runBtn.addEventListener('click', function(e) {
            runCode();
        });

        function runCode() {
            const code = input.value;
            if (!code.trim()) return;
            printToLog('log', '» ' + code);
            try {
                // eslint-disable-next-line no-eval
                const result = eval(code);
                if (result !== undefined) {
                    printToLog('result', String(result));
                }
            } catch (e) {
                printToLog('error', e.toString());
            }
            input.value = '';
            preview.innerHTML = '';
            input.focus();
        }
    }
    addConsole();

    // --- Floating Inspector Menu ---
    let highlightMenu = null;
    let inspectorTarget = null;

    document.addEventListener('selectionchange', function() {
        if (highlightMenu) highlightMenu.remove();
        inspectorTarget = null;
        const sel = window.getSelection();
        if (sel && sel.rangeCount && sel.toString().length > 0) {
            const range = sel.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            let node = sel.anchorNode;
            if (!node) node = document.body;
            if (node.nodeType === 3 || node.nodeType === 8) {
                node = node.parentElement;
            } else if (node.nodeType === 1) {
                node = node;
            } else {
                node = document.body;
            }
            inspectorTarget = node;
            highlightMenu = document.createElement('div');
            highlightMenu.id = 'highlight-inspector-menu';
            highlightMenu.textContent = '🕵️ Inspect Element';
            let left = Math.max(rect.left + window.scrollX, 10);
            let top = Math.max(rect.top + window.scrollY - 48, 10);
            highlightMenu.style.left = left + 'px';
            highlightMenu.style.top = top + 'px';

            highlightMenu.addEventListener('pointerdown', function(ev) {
                ev.preventDefault();
                ev.stopPropagation();
                if (highlightMenu) highlightMenu.remove();
                if (inspectorTarget) showInspector(document.body, inspectorTarget);
            }, {capture:true});

            document.body.appendChild(highlightMenu);
        }
    });

    document.addEventListener('pointerdown', function() {
        if (highlightMenu) highlightMenu.remove();
    }, {capture:true});

    // --- Inspector with full DOM tree, scroll and highlight to selected ---
    function showInspector(root, highlightElement) {
        const oldOverlay = document.getElementById('ios-html-inspector-overlay');
        if (oldOverlay) oldOverlay.remove();

        const overlay = document.createElement('div');
        overlay.id = 'ios-html-inspector-overlay';

        const header = document.createElement('div');
        header.id = 'ios-html-inspector-header';
        header.textContent = 'HTML Inspector';

        const info = document.createElement('div');
        info.id = 'ios-html-inspector-info';
        let desc = '';
        if (highlightElement) {
            desc += `Tag: <b>${highlightElement.tagName ? highlightElement.tagName.toLowerCase() : 'body'}</b>`;
            if (highlightElement.id) desc += ` | id: <b>${highlightElement.id}</b>`;
            if (highlightElement.className) desc += ` | class: <b>${String(highlightElement.className)}</b>`;
            info.innerHTML = desc;
        } else {
            info.innerHTML = '<i>No element found.</i>';
        }

        const treeArea = document.createElement('div');
        treeArea.id = 'ios-html-inspector-tree';

        let highlightNodeRef = null;
        treeArea.appendChild(createInspectorTree(root, 0, highlightElement, function(nodeDiv) {
            highlightNodeRef = nodeDiv;
        }));

        const controls = document.createElement('div');
        controls.id = 'ios-html-inspector-controls';

        const closeBtn = document.createElement('button');
        closeBtn.id = 'ios-html-inspector-close';
        closeBtn.textContent = 'Close';

        controls.appendChild(closeBtn);

        overlay.appendChild(header);
        overlay.appendChild(info);
        overlay.appendChild(treeArea);
        overlay.appendChild(controls);

        document.body.appendChild(overlay);

        closeBtn.addEventListener('click', function() {
            overlay.remove();
        });

        overlay.addEventListener('pointerdown', function(e) {
            if (e.target === overlay) overlay.remove();
        });

        setTimeout(function() {
            if (highlightNodeRef) {
                highlightNodeRef.classList.add('inspector-highlight');
                highlightNodeRef.scrollIntoView({block:'center',behavior:'smooth'});
            }
        }, 120);
    }

    // --- DOM tree, no indentation, auto-expands down to highlighted node ---
    function createInspectorTree(node, depth, highlightElement, foundCb) {
        const isElement = node.nodeType === 1;
        const isText = node.nodeType === 3;
        const isComment = node.nodeType === 8;

        const nodeWrap = document.createElement('div');
        nodeWrap.className = 'inspector-node';

        let label = '';
        if (isElement) {
            label += `<span class="inspector-tag">&lt;${node.tagName.toLowerCase()}</span>`;
            if (node.id) label += `<span class="inspector-id"> id="${node.id}"</span>`;
            if (node.className) label += `<span class="inspector-class"> class="${escapeHtml(String(node.className))}"</span>`;
            label += `<span class="inspector-tag">&gt;</span>`;
        } else if (isText) {
            label += `<span style="color:#fff6c9;">"${escapeHtml(String(node.textContent).trim())}"</span>`;
        } else if (isComment) {
            label += `<span style="color:#aaa;">&lt;!-- ${escapeHtml(String(node.textContent))} --&gt;</span>`;
        }

        if (isElement || isText) {
            nodeWrap.innerHTML = label;
            const editBtn = document.createElement('button');
            editBtn.className = 'inspector-edit';
            editBtn.textContent = 'Edit';
            editBtn.onclick = function(e) {
                e.stopPropagation();
                showEditModal(node, isElement ? 'outerHTML' : 'textContent');
            };
            nodeWrap.appendChild(editBtn);
        } else {
            nodeWrap.innerHTML = label;
        }

        let childrenDiv = null;
        let expandBtn = null;

        function containsHighlight(curr, target) {
            if (!curr || !target) return false;
            if (curr === target) return true;
            if (curr.nodeType === 1 && curr.contains && curr.contains(target)) return true;
            return false;
        }

        if (isElement && node.childNodes.length > 0) {
            expandBtn = document.createElement('span');
            expandBtn.className = 'inspector-expand';
            expandBtn.textContent = '+';

            childrenDiv = document.createElement('div');
            childrenDiv.style.display = 'none';
            for (let i = 0; i < node.childNodes.length; ++i) {
                childrenDiv.appendChild(createInspectorTree(node.childNodes[i], depth + 1, highlightElement, foundCb));
            }

            expandBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                if (childrenDiv.style.display === 'none') {
                    childrenDiv.style.display = '';
                    expandBtn.textContent = '-';
                } else {
                    childrenDiv.style.display = 'none';
                    expandBtn.textContent = '+';
                }
            });

            nodeWrap.insertBefore(expandBtn, nodeWrap.firstChild);
            nodeWrap.appendChild(childrenDiv);

            if (containsHighlight(node, highlightElement)) {
                childrenDiv.style.display = '';
                expandBtn.textContent = '-';
            }
        }

        if (node === highlightElement && foundCb) {
            foundCb(nodeWrap);
        }

        return nodeWrap;
    }

    // --- Modal for editing ---
    function showEditModal(node, mode) {
        removeEditModal();

        const modal = document.createElement('div');
        modal.id = 'ios-html-inspector-modal';

        const content = document.createElement('div');
        content.id = 'ios-html-inspector-modal-content';

        const title = document.createElement('div');
        title.id = 'ios-html-inspector-modal-title';
        title.textContent = mode === 'outerHTML' ? 'Edit HTML' : 'Edit Text';

        const textarea = document.createElement('textarea');
        textarea.value = mode === 'outerHTML' ? node.outerHTML : String(node.textContent);

        const buttons = document.createElement('div');
        buttons.id = 'ios-html-inspector-modal-buttons';

        const saveBtn = document.createElement('button');
        saveBtn.id = 'ios-html-inspector-modal-save';
        saveBtn.textContent = 'Save';

        const cancelBtn = document.createElement('button');
        cancelBtn.id = 'ios-html-inspector-modal-cancel';
        cancelBtn.textContent = 'Cancel';

        buttons.appendChild(cancelBtn);
        buttons.appendChild(saveBtn);

        content.appendChild(title);
        content.appendChild(textarea);
        content.appendChild(buttons);
        modal.appendChild(content);
        document.body.appendChild(modal);

        textarea.focus();

        saveBtn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            applyEdit(node, textarea.value, mode);
            removeEditModal();
        };
        cancelBtn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            removeEditModal();
        };
        modal.addEventListener('pointerdown', function(e){
            if (e.target === modal) removeEditModal();
        });
    }

    function removeEditModal() {
        const oldModal = document.getElementById('ios-html-inspector-modal');
        if (oldModal) oldModal.remove();
    }

    function applyEdit(node, value, mode) {
        try {
            if (mode === 'outerHTML') {
                const temp = document.createElement('div');
                temp.innerHTML = value;
                if (temp.childNodes.length === 1) {
                    node.replaceWith(temp.firstChild);
                } else {
                    for (let n of Array.from(temp.childNodes)) {
                        node.parentNode.insertBefore(n, node);
                    }
                    node.remove();
                }
            } else if (mode === 'textContent') {
                node.textContent = value;
            }
            setTimeout(() => {
                let el = node;
                if (mode === 'outerHTML' && node.parentNode) {
                    if (node.nextSibling) el = node.nextSibling.previousSibling || node.parentNode;
                    else el = node.parentNode;
                }
                showInspector(document.body, el && el.nodeType === 1 ? el : (el.parentNode || document.body));
            }, 100);
        } catch (e) {
            alert('Error editing HTML: ' + e);
        }
    }

    function escapeHtml(str) {
        str = String(str); // Ensure it's always a string
        return str.replace(/[&<>"'`]/g, function (m) {
            return ({
                '&': '&amp;', '<': '&lt;', '>': '&gt;',
                '"': '&quot;', "'": '&#39;', '`': '&#96;'
            })[m];
        });
    }
})();
