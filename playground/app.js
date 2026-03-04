/**
 * Plain Lab — Notebook App Logic
 * Jupyter-style cell-based execution with shared interpreter state.
 * Extended with data analysis, file loading, and table rendering.
 */

// ── Example Programs ──
const EXAMPLES = [
    {
        name: '👋 Hello World',
        desc: 'The simplest Plain program',
        code: 'say "Hello, World!"\nsay "Welcome to Plain — a language that reads like English."'
    },
    {
        name: '🎉 Greeting',
        desc: 'Ask for a name and greet',
        code: 'ask "What is your name?" and save to name\nsay "Hello, " + name + "! Nice to meet you."'
    },
    {
        name: '🎯 Guessing Game',
        desc: 'Guess the secret number',
        code: 'set secret to random number between 1 and 10\nask "Guess a number between 1 and 10:" and save to guess\nif guess is equal to secret then\n    say "Correct! You guessed it!"\nelse\n    say "Nope! The secret was " + secret\nend if'
    },
    {
        name: '🧩 Functions',
        desc: 'Define and call reusable functions',
        code: 'define greet using name\n    say "Hello, " + name + "!"\nend define\n\nrun greet with "Alice"\nrun greet with "Bob"'
    },
    {
        name: '🔢 FizzBuzz',
        desc: 'Classic programming challenge',
        code: 'set n to 1\nrepeat 20 times\n    set r3 to remainder of n by 3\n    set r5 to remainder of n by 5\n    if r3 is equal to 0 and r5 is equal to 0 then\n        say "FizzBuzz"\n    else if r3 is equal to 0 then\n        say "Fizz"\n    else if r5 is equal to 0 then\n        say "Buzz"\n    else\n        say n\n    end if\n    add 1 to n\nend repeat'
    },
    {
        name: '🧮 Math Functions',
        desc: 'Round, power, square root, random',
        code: '// Rounding\nset pi to 3.14159\nsay "Rounded: " + round pi\nsay "Floor: " + floor pi\nsay "Ceiling: " + ceiling pi\n\n// Powers and roots\nset result to power 2 by 8\nsay "2^8 = " + result\nsay "Square root of 144 = " + square root 144\n\n// Absolute value\nsay "Absolute of -42 = " + absolute -42\n\n// Random numbers\nset dice to random number between 1 and 6\nsay "Dice roll: " + dice'
    },
    {
        name: '📝 Text Processing',
        desc: 'Uppercase, lowercase, length, replace',
        code: 'set message to "Hello, World!"\n\nsay "Original: " + message\nsay "Uppercase: " + uppercase of message\nsay "Lowercase: " + lowercase of message\nsay "Length: " + length of message\n\n// Replace text\nset fixed to replaced "World" with "Plain" in message\nsay "Replaced: " + fixed\n\n// Character access\nsay "First char: " + character 1 of message\n\n// Trim whitespace\nset messy to "  spaces everywhere  "\nsay "Trimmed: [" + trimmed messy + "]"'
    },
    {
        name: '📊 Data Analysis',
        desc: 'Load CSV and analyze data',
        code: '// Click Run to pick a CSV file!\nload "data.csv" into data\nshow table data\n\n// Note: After loading, try these in a new cell:\n// set avg to average of column "price" in data\n// set total to sum of column "price" in data\n// say "Average: " + avg\n// say "Total: " + total'
    },
    {
        name: '📂 CSV Explorer',
        desc: 'Sort, filter, and extract from tables',
        code: '// First, load a CSV file\nload "sales.csv" into sales\nshow table sales\n\n// Sort by a column\n// sort sales by "amount" descending\n// show table sales\n\n// Filter rows\n// filter sales where "status" is equal to "completed"\n// show table sales'
    },
    {
        name: '🎲 Random & Games',
        desc: 'Random numbers, dice rolls, coin flips',
        code: '// Coin flip\nset flip to random number between 1 and 2\nif flip is equal to 1 then\n    say "Heads! 🪙"\nelse\n    say "Tails! 🪙"\nend if\n\n// Dice roll\nsay "Rolling two dice..."\nset die1 to random number between 1 and 6\nset die2 to random number between 1 and 6\nsay "Die 1: " + die1\nsay "Die 2: " + die2\nsay "Total: " + die1 + die2\n\n// Random password\ncreate list called chars\nadd "A" to chars\nadd "B" to chars\nadd "X" to chars\nadd "7" to chars\nadd "9" to chars\nadd "!" to chars\nset password to ""\nrepeat 6 times\n    set idx to random number between 1 and size of chars\n    set ch to chars item idx\n    set password to password + ch\nend repeat\nsay "Random password: " + password'
    },
    {
        name: '🔄 Type Conversion',
        desc: 'Convert between numbers and text',
        code: '// Convert text to number\nset age_text to "25"\nset age to number from age_text\nadd 1 to age\nsay "Next year you will be " + age\n\n// Convert number to text\nset score to 100\nset message to "Your score is: " + text from score\nsay message'
    },
];

const HELP_ITEMS = [
    { title: 'Variables', code: 'set name to "Alice"\nset age to 25' },
    { title: 'Output', code: 'say "Hello!"\nshow name' },
    { title: 'Input', code: 'ask "Your name?" and save to name' },
    { title: 'Math', code: 'add 5 to score\nsubtract 1 from lives\nmultiply total by 2\ndivide amount by 3' },
    { title: 'Conditions', code: 'if score is greater than 10 then\n    say "You win!"\nelse\n    say "Keep going!"\nend if' },
    { title: 'Loops', code: 'repeat 5 times\n    say "Hello!"\nend repeat\n\nwhile count is less than 10\n    add 1 to count\nend while' },
    { title: 'Functions', code: 'define greet using name\n    say "Hi, " + name\nend define\nrun greet with "Alice"' },
    { title: 'Lists', code: 'create list called fruits\nadd "apple" to fruits\nadd "banana" to fruits\nfor each item in fruits\n    say item\nend for' },
    { title: 'Math Funcs', code: 'round 3.7\nfloor 3.7\nceiling 3.2\nabsolute -5\npower 2 by 10\nsquare root 25\nremainder of 10 by 3\nrandom number between 1 and 100' },
    { title: 'Text Funcs', code: 'uppercase of name\nlowercase of name\nlength of name\ntrimmed text\nreplaced "a" with "b" in text\ncharacter 1 of name' },
    { title: 'Data Tables', code: 'load "file.csv" into data\nshow table data\nsort data by "col"\nfilter data where "col" is equal to "x"' },
    { title: 'Statistics', code: 'average of column "price" in data\nsum of column "price" in data\nmaximum of column "price" in data\nminimum of column "price" in data\ncount rows in data' },
    { title: 'Conversions', code: 'number from "42"\ntext from 42' },
];

// ── State ──
let cells = [];
let executionCount = 0;
let interpreter = null;
let currentCellId = null;

// ── DOM refs ──
const notebook = document.getElementById('notebook');
const kernelStatus = document.getElementById('kernel-status');
const inputModal = document.getElementById('input-modal');
const inputField = document.getElementById('input-field');
const inputPrompt = document.getElementById('input-prompt');
const inputSubmit = document.getElementById('input-submit');
const examplesModal = document.getElementById('examples-modal');
const helpModal = document.getElementById('help-modal');
const fileInput = document.getElementById('file-input');

// ── File Loading ──
let fileResolve = null;

function requestFileLoad(filename) {
    return new Promise((resolve, reject) => {
        fileResolve = { resolve, reject, filename };
        // Set accepted file types based on extension
        const ext = filename.toLowerCase().split('.').pop();
        if (ext === 'xlsx' || ext === 'xls') {
            fileInput.accept = '.xlsx,.xls';
        } else {
            fileInput.accept = '.csv,.txt';
        }
        fileInput.click();
    });
}

fileInput.addEventListener('change', async () => {
    if (!fileResolve || !fileInput.files.length) return;
    const file = fileInput.files[0];
    const { resolve, reject, filename } = fileResolve;
    fileResolve = null;
    fileInput.value = '';

    try {
        const ext = file.name.toLowerCase().split('.').pop();

        if (ext === 'csv' || ext === 'txt') {
            const text = await file.text();
            resolve(parseCSV(text));
        } else if (ext === 'xlsx' || ext === 'xls') {
            // Use SheetJS
            if (typeof XLSX === 'undefined') {
                throw new Error('Excel support loading... please try again in a moment.');
            }
            const buffer = await file.arrayBuffer();
            const wb = XLSX.read(buffer, { type: 'array' });
            const ws = wb.Sheets[wb.SheetNames[0]];
            const data = XLSX.utils.sheet_to_json(ws, { defval: '' });
            if (data.length === 0) {
                resolve({ headers: [], rows: [], _isTable: true });
            } else {
                const headers = Object.keys(data[0]);
                const rows = data.map(row => {
                    const obj = {};
                    headers.forEach(h => {
                        const v = row[h];
                        obj[h] = typeof v === 'number' ? v : v;
                    });
                    return obj;
                });
                resolve({ headers, rows, _isTable: true });
            }
        } else {
            reject(new Error(`Unsupported file type: .${ext}`));
        }
    } catch (e) {
        reject(e);
    }
});

// ── Table Output ──
function outputTable(tbl) {
    if (!currentCellId) return;
    const cell = document.getElementById(currentCellId);
    if (!cell) return;
    const wrapper = cell.querySelector('.cell-output-wrapper');
    const content = cell.querySelector('.cell-output-content');
    wrapper.classList.add('has-output');

    const tableDiv = document.createElement('div');
    tableDiv.className = 'output-table-wrapper';

    const maxRows = 50; // limit display
    const displayRows = tbl.rows.slice(0, maxRows);

    let html = '<table class="output-table"><thead><tr>';
    html += '<th class="row-idx">#</th>';
    tbl.headers.forEach(h => html += `<th>${escapeHtml(h)}</th>`);
    html += '</tr></thead><tbody>';
    displayRows.forEach((row, i) => {
        html += `<tr><td class="row-idx">${i + 1}</td>`;
        tbl.headers.forEach(h => html += `<td>${escapeHtml(String(row[h] ?? ''))}</td>`);
        html += '</tr>';
    });
    html += '</tbody></table>';
    if (tbl.rows.length > maxRows) {
        html += `<div class="table-truncated">Showing ${maxRows} of ${tbl.rows.length} rows</div>`;
    }
    html += `<div class="table-info">${tbl.rows.length} rows × ${tbl.headers.length} columns</div>`;
    tableDiv.innerHTML = html;
    content.appendChild(tableDiv);
}

// ── Interpreter ──
function initInterpreter() {
    interpreter = new PlainInterpreter(
        (text) => appendCellOutput(currentCellId, text, ''),
        (prompt) => requestInput(prompt),
        (filename) => requestFileLoad(filename),
        (tbl) => outputTable(tbl)
    );
}
initInterpreter();

// ── Cell Management ──
let cellIdCounter = 0;

function createCell(code = '', focus = true) {
    const id = 'cell-' + (++cellIdCounter);
    const cell = { id, code, output: [], executionCount: null };
    cells.push(cell);
    renderCell(cell);
    if (focus) {
        setTimeout(() => {
            const el = document.getElementById(id);
            if (el) {
                const editor = el.querySelector('.cell-editor');
                editor.focus();
                setFocusedCell(id);
            }
        }, 50);
    }
    return id;
}

function renderCell(cell) {
    const div = document.createElement('div');
    div.className = 'cell';
    div.id = cell.id;
    div.innerHTML = `
        <div class="cell-toolbar">
            <button class="cell-action-btn run-btn" title="Run Cell (Shift+Enter)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                <span>Run</span>
            </button>
            <button class="cell-action-btn move-up-btn" title="Move Up">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"/></svg>
            </button>
            <button class="cell-action-btn move-down-btn" title="Move Down">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            <button class="cell-action-btn delete-btn" title="Delete Cell">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
        </div>
        <div class="cell-input">
            <div class="cell-label">${cell.executionCount !== null ? 'In [' + cell.executionCount + ']:' : 'In [ ]:'}</div>
            <div class="editor-container">
                <pre class="cell-highlight" aria-hidden="true"><code></code></pre>
                <textarea class="cell-editor" spellcheck="false" placeholder="// Write Plain code here..." rows="1">${escapeHtml(cell.code)}</textarea>
            </div>
        </div>
        <div class="cell-output-wrapper">
            <div class="cell-output">
                <div class="cell-output-label success">Out [ ]:</div>
                <div class="cell-output-content"></div>
            </div>
        </div>
    `;

    notebook.appendChild(div);

    // Setup event listeners
    const editor = div.querySelector('.cell-editor');
    const highlightEl = div.querySelector('.cell-highlight code');
    const runBtn = div.querySelector('.run-btn');
    const moveUpBtn = div.querySelector('.move-up-btn');
    const moveDownBtn = div.querySelector('.move-down-btn');
    const deleteBtn = div.querySelector('.delete-btn');

    // Sync highlight
    const syncHighlight = () => {
        highlightEl.innerHTML = highlightPlain(editor.value);
    };

    // Auto-resize textarea
    const autoResize = () => {
        editor.style.height = 'auto';
        editor.style.height = editor.scrollHeight + 'px';
    };
    editor.addEventListener('input', () => {
        const c = cells.find(c => c.id === cell.id);
        if (c) c.code = editor.value;
        syncHighlight();
        autoResize();
    });
    editor.addEventListener('scroll', () => {
        div.querySelector('.cell-highlight').scrollTop = editor.scrollTop;
        div.querySelector('.cell-highlight').scrollLeft = editor.scrollLeft;
    });
    syncHighlight();
    autoResize();

    // Focus tracking
    editor.addEventListener('focus', () => setFocusedCell(cell.id));

    // Keyboard shortcuts
    editor.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.shiftKey) {
            e.preventDefault();
            runCell(cell.id);
            const idx = cells.findIndex(c => c.id === cell.id);
            if (idx === cells.length - 1) {
                createCell('', true);
            } else {
                const nextEl = document.getElementById(cells[idx + 1].id);
                if (nextEl) nextEl.querySelector('.cell-editor').focus();
            }
        }
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            runCell(cell.id);
        }
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = editor.selectionStart;
            const end = editor.selectionEnd;
            editor.value = editor.value.substring(0, start) + '    ' + editor.value.substring(end);
            editor.selectionStart = editor.selectionEnd = start + 4;
            const c = cells.find(c => c.id === cell.id);
            if (c) c.code = editor.value;
            syncHighlight();
        }
    });

    // Action buttons
    runBtn.addEventListener('click', () => runCell(cell.id));
    moveUpBtn.addEventListener('click', () => moveCell(cell.id, -1));
    moveDownBtn.addEventListener('click', () => moveCell(cell.id, 1));
    deleteBtn.addEventListener('click', () => deleteCell(cell.id));
}

function setFocusedCell(id) {
    document.querySelectorAll('.cell').forEach(c => c.classList.remove('focused'));
    const el = document.getElementById(id);
    if (el) el.classList.add('focused');
}

function deleteCell(id) {
    if (cells.length <= 1) return;
    const idx = cells.findIndex(c => c.id === id);
    cells.splice(idx, 1);
    const el = document.getElementById(id);
    if (el) {
        el.style.transition = 'all 0.2s ease-out';
        el.style.opacity = '0';
        el.style.transform = 'translateX(-20px)';
        setTimeout(() => el.remove(), 200);
    }
    const focusIdx = Math.min(idx, cells.length - 1);
    if (cells[focusIdx]) {
        setTimeout(() => {
            const next = document.getElementById(cells[focusIdx].id);
            if (next) next.querySelector('.cell-editor').focus();
        }, 210);
    }
}

function moveCell(id, direction) {
    const idx = cells.findIndex(c => c.id === id);
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= cells.length) return;
    [cells[idx], cells[newIdx]] = [cells[newIdx], cells[idx]];
    const el = document.getElementById(id);
    const otherEl = document.getElementById(cells[idx].id);
    if (direction < 0) notebook.insertBefore(el, otherEl);
    else notebook.insertBefore(otherEl, el);
}

// ── Cell Output ──
function appendCellOutput(cellId, text, cls) {
    const cell = document.getElementById(cellId);
    if (!cell) return;
    const wrapper = cell.querySelector('.cell-output-wrapper');
    const content = cell.querySelector('.cell-output-content');
    wrapper.classList.add('has-output');
    const line = document.createElement('div');
    line.className = 'output-line' + (cls ? ' ' + cls : '');
    line.textContent = text;
    content.appendChild(line);
}

function clearCellOutput(cellId) {
    const cell = document.getElementById(cellId);
    if (!cell) return;
    const wrapper = cell.querySelector('.cell-output-wrapper');
    const content = cell.querySelector('.cell-output-content');
    content.innerHTML = '';
    wrapper.classList.remove('has-output');
}

// ── Run Cell ──
async function runCell(id) {
    const cell = cells.find(c => c.id === id);
    if (!cell) return;

    const el = document.getElementById(id);
    const editor = el.querySelector('.cell-editor');
    cell.code = editor.value;

    if (!cell.code.trim()) return;

    executionCount++;
    cell.executionCount = executionCount;

    const inLabel = el.querySelector('.cell-label');
    const outLabel = el.querySelector('.cell-output-label');
    inLabel.textContent = `In [${cell.executionCount}]:`;
    outLabel.textContent = `Out [${cell.executionCount}]:`;
    outLabel.classList.add('success');

    clearCellOutput(id);
    setKernelStatus('running');
    currentCellId = id;

    try {
        await interpreter.runPartial(cell.code);
    } catch (err) {
        const msg = err.plainMessage || err.message || String(err);
        appendCellOutput(id, 'Error: ' + msg, 'error');
        const outLabel = el.querySelector('.cell-output-label');
        outLabel.classList.remove('success');
    }

    setKernelStatus('idle');
    currentCellId = null;
}

async function runAllCells() {
    interpreter.reset();
    document.querySelectorAll('.plain-window').forEach(w => w.remove());
    executionCount = 0;
    cells.forEach(c => clearCellOutput(c.id));
    setKernelStatus('running');

    for (const cell of cells) {
        const el = document.getElementById(cell.id);
        const editor = el.querySelector('.cell-editor');
        cell.code = editor.value;
        if (!cell.code.trim()) continue;

        executionCount++;
        cell.executionCount = executionCount;

        const inLabel = el.querySelector('.cell-label');
        const outLabel = el.querySelector('.cell-output-label');
        inLabel.textContent = `In [${cell.executionCount}]:`;
        outLabel.textContent = `Out [${cell.executionCount}]:`;
        outLabel.classList.add('success');

        currentCellId = cell.id;
        try {
            await interpreter.runPartial(cell.code);
        } catch (err) {
            const msg = err.plainMessage || err.message || String(err);
            appendCellOutput(cell.id, 'Error: ' + msg, 'error');
            const outLabel = el.querySelector('.cell-output-label');
            outLabel.classList.remove('success');
            break;
        }
    }

    setKernelStatus('idle');
    currentCellId = null;
}

function restartKernel() {
    initInterpreter();
    document.querySelectorAll('.plain-window').forEach(w => w.remove());
    executionCount = 0;
    cells.forEach(c => {
        c.executionCount = null;
        clearCellOutput(c.id);
        const el = document.getElementById(c.id);
        if (el) el.querySelector('.cell-label').textContent = 'In [ ]:';
    });
}

function setKernelStatus(status) {
    if (status === 'running') {
        kernelStatus.classList.add('running');
        const textNodes = [...kernelStatus.childNodes].filter(n => n.nodeType === 3);
        if (textNodes.length) textNodes[textNodes.length - 1].textContent = ' Running';
    } else {
        kernelStatus.classList.remove('running');
        const textNodes = [...kernelStatus.childNodes].filter(n => n.nodeType === 3);
        if (textNodes.length) textNodes[textNodes.length - 1].textContent = ' Idle';
    }
}

// ── Input Handling ──
let inputResolve = null;

function requestInput(prompt) {
    return new Promise(resolve => {
        inputResolve = resolve;
        inputPrompt.textContent = prompt;
        inputField.value = '';
        inputModal.classList.remove('hidden');
        setTimeout(() => inputField.focus(), 100);
    });
}

function submitInput() {
    if (inputResolve) {
        const val = inputField.value;
        inputResolve(val);
        inputResolve = null;
        inputModal.classList.add('hidden');
        if (currentCellId) appendCellOutput(currentCellId, '⌨ ' + val, 'info');
    }
}

inputSubmit.addEventListener('click', submitInput);
inputField.addEventListener('keydown', e => { if (e.key === 'Enter') submitInput(); });

// ── Toolbar Buttons ──
document.getElementById('btn-add-cell').addEventListener('click', () => createCell());
document.getElementById('btn-add-cell-bottom').addEventListener('click', () => createCell());
document.getElementById('btn-run-all').addEventListener('click', runAllCells);
document.getElementById('btn-restart').addEventListener('click', restartKernel);

// ── Modals ──
function openModal(modal) { modal.classList.remove('hidden'); }
function closeModal(modal) { modal.classList.add('hidden'); }

document.querySelectorAll('.modal-backdrop').forEach(b =>
    b.addEventListener('click', () => b.parentElement.classList.add('hidden'))
);
document.querySelectorAll('.modal-close').forEach(b =>
    b.addEventListener('click', () => b.closest('.modal').classList.add('hidden'))
);

// ── Examples ──
function populateExamples() {
    const list = document.getElementById('examples-list');
    list.innerHTML = '';
    EXAMPLES.forEach(ex => {
        const card = document.createElement('div');
        card.className = 'example-card';
        card.innerHTML = `<h3>${ex.name}</h3><p>${ex.desc}</p>`;
        card.addEventListener('click', () => {
            cells.forEach(c => {
                const el = document.getElementById(c.id);
                if (el) el.remove();
            });
            cells = [];
            initInterpreter();
            executionCount = 0;
            createCell(ex.code, true);
            closeModal(examplesModal);
        });
        list.appendChild(card);
    });
}
populateExamples();
document.getElementById('btn-examples').addEventListener('click', () => openModal(examplesModal));

// ── Help ──
function populateHelp() {
    const grid = document.getElementById('help-content');
    grid.innerHTML = '';
    HELP_ITEMS.forEach(item => {
        const div = document.createElement('div');
        div.className = 'help-item';
        div.innerHTML = `<h4>${item.title}</h4><code>${escapeHtml(item.code)}</code>`;
        grid.appendChild(div);
    });
}
populateHelp();
document.getElementById('btn-help').addEventListener('click', () => openModal(helpModal));

// ── Keyboard Shortcuts ──
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal:not(.hidden)').forEach(m => m.classList.add('hidden'));
    }
    if (e.key === 'b' && !e.ctrlKey && !e.metaKey && document.activeElement.tagName !== 'TEXTAREA' && document.activeElement.tagName !== 'INPUT') {
        e.preventDefault();
        createCell();
    }
});

// ── Syntax Highlighting ──
const PLAIN_KEYWORDS = new Set([
    'set', 'to', 'say', 'show', 'ask', 'and', 'save',
    'if', 'then', 'else', 'end',
    'repeat', 'times', 'while', 'for', 'each', 'in',
    'define', 'using', 'run', 'with', 'return',
    'create', 'list', 'called',
    'add', 'subtract', 'multiply', 'divide', 'from', 'by',
    'remove', 'item', 'size', 'of',
    // New keywords
    'load', 'into', 'sort', 'filter', 'where', 'table',
    'column', 'row', 'cell', 'import',
    'ascending', 'descending', 'as',
    'round', 'floor', 'ceiling', 'absolute',
    'power', 'square', 'root', 'random', 'between',
    'uppercase', 'lowercase', 'length', 'trimmed',
    'replaced', 'character', 'text', 'number',
    'remainder', 'rows', 'columns',
    'count', 'average', 'sum', 'maximum', 'minimum'
]);

const PLAIN_COMPARISONS = new Set([
    'is', 'not', 'equal', 'greater', 'less', 'than', 'or'
]);

const PLAIN_BOOLEANS = new Set(['true', 'false', 'yes', 'no']);

function highlightPlain(code) {
    if (!code) return '\n';
    let result = '';
    let i = 0;
    const len = code.length;

    while (i < len) {
        const ch = code[i];

        // Comments: // or note:
        if (ch === '/' && code[i + 1] === '/') {
            let end = code.indexOf('\n', i);
            if (end === -1) end = len;
            result += '<span class="hl-comment">' + escapeHtml(code.slice(i, end)) + '</span>';
            i = end;
            continue;
        }
        if (/^note:/i.test(code.slice(i, i + 5))) {
            let end = code.indexOf('\n', i);
            if (end === -1) end = len;
            result += '<span class="hl-comment">' + escapeHtml(code.slice(i, end)) + '</span>';
            i = end;
            continue;
        }

        // Strings
        if (ch === '"' || ch === "'") {
            const q = ch;
            let j = i + 1;
            while (j < len && code[j] !== q && code[j] !== '\n') {
                if (code[j] === '\\') j++;
                j++;
            }
            if (j < len && code[j] === q) j++;
            result += '<span class="hl-string">' + escapeHtml(code.slice(i, j)) + '</span>';
            i = j;
            continue;
        }

        // Numbers
        if (/\d/.test(ch) || (ch === '-' && i + 1 < len && /\d/.test(code[i + 1]) && (i === 0 || /[\s,]/.test(code[i - 1])))) {
            let j = i;
            if (code[j] === '-') j++;
            while (j < len && /[\d.]/.test(code[j])) j++;
            result += '<span class="hl-number">' + escapeHtml(code.slice(i, j)) + '</span>';
            i = j;
            continue;
        }

        // Words
        if (/[a-zA-Z_]/.test(ch)) {
            let j = i;
            while (j < len && /[a-zA-Z0-9_]/.test(code[j])) j++;
            const word = code.slice(i, j);
            const lower = word.toLowerCase();

            if (PLAIN_BOOLEANS.has(lower)) {
                result += '<span class="hl-boolean">' + escapeHtml(word) + '</span>';
            } else if (PLAIN_KEYWORDS.has(lower)) {
                result += '<span class="hl-keyword">' + escapeHtml(word) + '</span>';
            } else if (PLAIN_COMPARISONS.has(lower)) {
                result += '<span class="hl-comparison">' + escapeHtml(word) + '</span>';
            } else {
                result += '<span class="hl-ident">' + escapeHtml(word) + '</span>';
            }
            i = j;
            continue;
        }

        // Operators
        if (ch === '+') {
            result += '<span class="hl-operator">+</span>';
            i++;
            continue;
        }

        result += escapeHtml(ch);
        i++;
    }

    if (!code.endsWith('\n')) result += '\n';
    return result;
}

// ── Utilities ──
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ── Initialize ──
createCell(EXAMPLES[0].code, true);
