/**
 * Plain Interpreter — JavaScript (Browser) Edition
 * Extended with data analysis, built-in math/text functions, and file loading.
 */

class PlainError extends Error {
    constructor(message, line) {
        super(message);
        this.plainMessage = message;
        this.line = line;
    }
}

class ReturnSignal {
    constructor(value) { this.value = value; }
}

// ── Token Types ──
const T = {
    NUMBER: 'NUMBER', STRING: 'STRING', IDENTIFIER: 'IDENTIFIER', BOOLEAN: 'BOOLEAN',
    SET: 'SET', TO: 'TO', ADD: 'ADD', SUBTRACT: 'SUBTRACT', FROM: 'FROM',
    MULTIPLY: 'MULTIPLY', DIVIDE: 'DIVIDE', BY: 'BY', IF: 'IF', THEN: 'THEN',
    ELSE: 'ELSE', END: 'END', REPEAT: 'REPEAT', TIMES: 'TIMES', WHILE: 'WHILE',
    FOR: 'FOR', EACH: 'EACH', IN: 'IN', SAY: 'SAY', SHOW: 'SHOW', ASK: 'ASK',
    AND: 'AND', OR: 'OR', SAVE: 'SAVE', DEFINE: 'DEFINE', USING: 'USING',
    RUN: 'RUN', WITH: 'WITH', RETURN: 'RETURN', CREATE: 'CREATE', LIST: 'LIST',
    CALLED: 'CALLED', REMOVE: 'REMOVE', ITEM: 'ITEM', SIZE: 'SIZE', OF: 'OF',
    IS: 'IS', NOT: 'NOT', EQUAL: 'EQUAL', GREATER: 'GREATER', LESS: 'LESS',
    THAN: 'THAN', PLUS: 'PLUS', COMMA: 'COMMA', EOF: 'EOF', NEWLINE: 'NEWLINE',
    // New tokens
    LOAD: 'LOAD', INTO: 'INTO', SORT: 'SORT', FILTER: 'FILTER', WHERE: 'WHERE',
    TABLE: 'TABLE', COLUMN: 'COLUMN', ROW: 'ROW', CELL: 'CELL',
    AVERAGE: 'AVERAGE', SUM: 'SUM', MAXIMUM: 'MAXIMUM', MINIMUM: 'MINIMUM',
    COUNT: 'COUNT', IMPORT: 'IMPORT', ASCENDING: 'ASCENDING', DESCENDING: 'DESCENDING',
    ROUND: 'ROUND', FLOOR: 'FLOOR', CEILING: 'CEILING', ABSOLUTE: 'ABSOLUTE',
    POWER: 'POWER', SQUARE: 'SQUARE', ROOT: 'ROOT', RANDOM: 'RANDOM', BETWEEN: 'BETWEEN',
    UPPERCASE: 'UPPERCASE', LOWERCASE: 'LOWERCASE', LENGTH: 'LENGTH', TRIMMED: 'TRIMMED',
    REPLACED: 'REPLACED', CHARACTER: 'CHARACTER', TEXT: 'TEXT', NUMBER_KW: 'NUMBER_KW',
    REMAINDER: 'REMAINDER', ROWS: 'ROWS', COLUMNS: 'COLUMNS', AS: 'AS',
    AFTER: 'AFTER', SECONDS: 'SECONDS', EVERY: 'EVERY', MINUTES: 'MINUTES', STOP: 'STOP',
    RUNNING: 'RUNNING', WINDOW: 'WINDOW', WIDTH: 'WIDTH', HEIGHT: 'HEIGHT', BUTTON: 'BUTTON',
    WHEN: 'WHEN', CLICKED: 'CLICKED', LETTER: 'LETTER', STARTS: 'STARTS', ENDS: 'ENDS',
    CONTAINS: 'CONTAINS', EMPTY: 'EMPTY', SPEAK: 'SPEAK', LISTEN: 'LISTEN', REMEMBER: 'REMEMBER',
    RECALL: 'RECALL', FORGET: 'FORGET', DATE: 'DATE', TIME: 'TIME', YEARS: 'YEARS',
    TODAY: 'TODAY', WEEKEND: 'WEEKEND', PLAY: 'PLAY', SOUND: 'SOUND', LOOP: 'LOOP',
    MUSIC: 'MUSIC', FOLDER: 'FOLDER', EXISTS: 'EXISTS', DELETE: 'DELETE', COPY: 'COPY', FILES: 'FILES'
};

const KEYWORDS = {
    set: T.SET, to: T.TO, add: T.ADD, subtract: T.SUBTRACT, from: T.FROM,
    multiply: T.MULTIPLY, divide: T.DIVIDE, by: T.BY, if: T.IF, then: T.THEN,
    else: T.ELSE, end: T.END, repeat: T.REPEAT, times: T.TIMES, while: T.WHILE,
    for: T.FOR, each: T.EACH, in: T.IN, say: T.SAY, show: T.SHOW, ask: T.ASK,
    and: T.AND, or: T.OR, save: T.SAVE, define: T.DEFINE, using: T.USING,
    run: T.RUN, with: T.WITH, return: T.RETURN, create: T.CREATE, list: T.LIST,
    called: T.CALLED, remove: T.REMOVE, item: T.ITEM, size: T.SIZE, of: T.OF,
    is: T.IS, not: T.NOT, equal: T.EQUAL, greater: T.GREATER, less: T.LESS,
    than: T.THAN,
    // New keywords
    load: T.LOAD, into: T.INTO, sort: T.SORT, filter: T.FILTER, where: T.WHERE,
    table: T.TABLE, column: T.COLUMN, row: T.ROW, cell: T.CELL,
    average: T.AVERAGE, sum: T.SUM, maximum: T.MAXIMUM, minimum: T.MINIMUM,
    count: T.COUNT, import: T.IMPORT, ascending: T.ASCENDING, descending: T.DESCENDING,
    round: T.ROUND, floor: T.FLOOR, ceiling: T.CEILING, absolute: T.ABSOLUTE,
    power: T.POWER, square: T.SQUARE, root: T.ROOT, random: T.RANDOM, between: T.BETWEEN,
    uppercase: T.UPPERCASE, lowercase: T.LOWERCASE, length: T.LENGTH, trimmed: T.TRIMMED,
    replaced: T.REPLACED, character: T.CHARACTER, text: T.TEXT, number: T.NUMBER_KW,
    remainder: T.REMAINDER, rows: T.ROWS, columns: T.COLUMNS, as: T.AS,
    // 8 Feature Update Keywords
    after: T.AFTER, seconds: T.SECONDS, every: T.EVERY, minutes: T.MINUTES,
    stop: T.STOP, running: T.RUNNING, window: T.WINDOW, width: T.WIDTH,
    height: T.HEIGHT, button: T.BUTTON, when: T.WHEN, clicked: T.CLICKED,
    letter: T.LETTER, starts: T.STARTS, ends: T.ENDS, contains: T.CONTAINS,
    empty: T.EMPTY, speak: T.SPEAK, listen: T.LISTEN, remember: T.REMEMBER,
    recall: T.RECALL, forget: T.FORGET, date: T.DATE, time: T.TIME, years: T.YEARS,
    today: T.TODAY, weekend: T.WEEKEND, play: T.PLAY, sound: T.SOUND, loop: T.LOOP,
    music: T.MUSIC, folder: T.FOLDER, exists: T.EXISTS, delete: T.DELETE,
    copy: T.COPY, files: T.FILES
};
const BOOLEANS = { true: true, false: false, yes: true, no: false };

// ── Lexer ──
class Lexer {
    constructor(source) { this.src = source; this.pos = 0; this.line = 1; }

    peek() { return this.pos < this.src.length ? this.src[this.pos] : null; }
    advance() { const c = this.src[this.pos++]; if (c === '\n') this.line++; return c; }

    skipWS() { while (this.pos < this.src.length && ' \t\r'.includes(this.src[this.pos])) this.pos++; }

    skipComment() {
        if (this.src.slice(this.pos, this.pos + 2) === '//') {
            while (this.pos < this.src.length && this.src[this.pos] !== '\n') this.pos++;
            return true;
        }
        if (this.src.slice(this.pos, this.pos + 5).toLowerCase() === 'note:') {
            while (this.pos < this.src.length && this.src[this.pos] !== '\n') this.pos++;
            return true;
        }
        return false;
    }

    readString() {
        const q = this.advance(); let s = ''; const sl = this.line;
        while (this.pos < this.src.length) {
            const c = this.peek();
            if (c === '\\') { this.advance(); const n = this.advance(); s += n === 'n' ? '\n' : n === 't' ? '\t' : n === '\\' ? '\\' : n === q ? q : '\\' + n; }
            else if (c === q) { this.advance(); return { type: T.STRING, value: s, line: sl }; }
            else if (c === '\n') throw new PlainError("It looks like you forgot to close a text string with a quote mark.", this.line);
            else s += this.advance();
        }
        throw new PlainError("It looks like you forgot to close a text string with a quote mark.", sl);
    }

    readNumber() {
        let s = this.pos, dot = false;
        while (this.pos < this.src.length && (/\d/.test(this.src[this.pos]) || this.src[this.pos] === '.')) {
            if (this.src[this.pos] === '.') { if (dot) break; dot = true; }
            this.pos++;
        }
        const t = this.src.slice(s, this.pos);
        return { type: T.NUMBER, value: dot ? parseFloat(t) : parseInt(t, 10), line: this.line };
    }

    readWord() {
        let s = this.pos;
        while (this.pos < this.src.length && /[a-zA-Z0-9_]/.test(this.src[this.pos])) this.pos++;
        const w = this.src.slice(s, this.pos), lw = w.toLowerCase();
        if (lw in BOOLEANS) return { type: T.BOOLEAN, value: BOOLEANS[lw], line: this.line };
        if (lw in KEYWORDS) return { type: KEYWORDS[lw], value: lw, line: this.line };
        return { type: T.IDENTIFIER, value: lw, line: this.line };
    }

    tokenize() {
        const tokens = [];
        while (this.pos < this.src.length) {
            this.skipWS();
            if (this.pos >= this.src.length) break;
            const c = this.peek();
            if (c === '\n') { this.advance(); if (tokens.length && tokens[tokens.length - 1].type !== T.NEWLINE) tokens.push({ type: T.NEWLINE, value: '\\n', line: this.line - 1 }); continue; }
            if (this.skipComment()) continue;
            if (c === '"' || c === "'") { tokens.push(this.readString()); continue; }
            if (/\d/.test(c) || (c === '-' && this.pos + 1 < this.src.length && /\d/.test(this.src[this.pos + 1]))) {
                if (c === '-') { this.advance(); const t = this.readNumber(); t.value = -t.value; tokens.push(t); }
                else tokens.push(this.readNumber());
                continue;
            }
            if (/[a-zA-Z_]/.test(c)) { tokens.push(this.readWord()); continue; }
            if (c === '+') { tokens.push({ type: T.PLUS, value: '+', line: this.line }); this.advance(); continue; }
            if (c === ',') { tokens.push({ type: T.COMMA, value: ',', line: this.line }); this.advance(); continue; }
            throw new PlainError(`I don't recognize the character '${c}'. Plain uses English words, not special symbols.`, this.line);
        }
        tokens.push({ type: T.EOF, value: null, line: this.line });
        return tokens;
    }
}

// ── Parser ──
class Parser {
    constructor(tokens) { this.tokens = tokens; this.pos = 0; }
    cur() { return this.pos < this.tokens.length ? this.tokens[this.pos] : this.tokens[this.tokens.length - 1]; }
    pk(o = 0) { const i = this.pos + o; return i < this.tokens.length ? this.tokens[i] : this.tokens[this.tokens.length - 1]; }
    adv() { return this.tokens[this.pos++]; }
    expect(type, msg) {
        const t = this.cur();
        if (t.type === type) return this.adv();
        if (type === T.IDENTIFIER) {
            const soft = [T.NUMBER_KW, T.TEXT, T.RUNNING, T.BUTTON, T.WINDOW, T.STARTS, T.ENDS, T.CONTAINS, T.EMPTY, T.COLUMN, T.ROW, T.CELL, T.TABLE, T.FILES, T.FOLDER, T.DATE, T.TIME, T.TODAY, T.COUNT];
            if (soft.includes(t.type)) return this.adv();
        }
        throw new PlainError(msg || `Expected ${type} but found '${t.value}' on line ${t.line}.`, t.line);
    }
    match(...types) { if (types.includes(this.cur().type)) return this.adv(); return null; }
    skipNL() { while (this.cur().type === T.NEWLINE) this.adv(); }

    parse() { this.skipNL(); return { type: 'Program', stmts: this.parseStmts() }; }

    parseStmts() {
        const stmts = [];
        while (true) {
            this.skipNL();
            const t = this.cur();
            if (t.type === T.EOF || t.type === T.END || t.type === T.ELSE) break;
            const s = this.parseStmt();
            if (s) stmts.push(s);
        }
        return stmts;
    }

    parseStmt() {
        const t = this.cur(), l = t.line;
        switch (t.type) {
            case T.SET: return this.parseSet();
            case T.SAY: return this.parseSay();
            case T.SHOW: return this.parseShow();
            case T.ASK: return this.parseAsk();
            case T.ADD: return this.parseAdd();
            case T.SUBTRACT: return this.parseSub();
            case T.MULTIPLY: return this.parseMul();
            case T.DIVIDE: return this.parseDiv();
            case T.IF: return this.parseIf();
            case T.REPEAT: return this.parseRepeat();
            case T.WHILE: return this.parseWhile();
            case T.FOR: return this.parseForEach();
            case T.DEFINE: return this.parseDefine();
            case T.RUN: return this.parseRun();
            case T.RETURN: return this.parseReturn();
            case T.CREATE: return this.parseCreateList();
            case T.REMOVE: return this.parseRemove();
            case T.LOAD: return this.parseLoad();
            case T.SORT: return this.parseSort();
            case T.FILTER: return this.parseFilter();
            case T.IMPORT: return this.parseImport();

            // 8 New Features
            case T.AFTER: return this.parseAfter();
            case T.EVERY: return this.parseEvery();
            case T.STOP: return this.parseStop();
            case T.WHEN: return this.parseWhen();
            case T.SPEAK: return this.parseSpeak();
            case T.LISTEN: return this.parseListen();
            case T.REMEMBER: return this.parseRemember();
            case T.RECALL: return this.parseRecall();
            case T.FORGET: return this.parseForget();
            case T.PLAY: return this.parsePlay();
            case T.DELETE: return this.parseDelete();
            case T.COPY: return this.parseCopy();
            case T.LIST: return this.parseListFiles();

            case T.NEWLINE: this.adv(); return null;
            default: throw new PlainError(`I don't understand '${t.value}' on line ${l}. Did you mean 'set', 'say', or another Plain keyword?`, l);
        }
    }

    parseSet() {
        const l = this.cur().line; this.adv();
        const name = this.expect(T.IDENTIFIER, `I need a variable name after 'set' on line ${l}.`).value;
        this.expect(T.TO, `I expected 'to' after 'set ${name}' on line ${l}.`);

        // set x to run func
        if (this.cur().type === T.RUN) { this.adv(); const fn = this.expect(T.IDENTIFIER, `Need function name after 'run' on line ${l}.`).value; let args = []; if (this.match(T.WITH)) args = this.parseArgList(); return { type: 'SetToRun', name, fn, args, line: l }; }

        // set x to size of list
        if (this.cur().type === T.SIZE) { this.adv(); this.expect(T.OF, `Expected 'of' after 'size' on line ${l}.`); const ln = this.expect(T.IDENTIFIER, `Need list name after 'size of' on line ${l}.`).value; return { type: 'SetVar', name, value: { type: 'SizeOf', list: ln }, line: l }; }

        // set x to column "col" from table
        if (this.cur().type === T.COLUMN) { this.adv(); const col = this.expect(T.STRING, `Need column name in quotes on line ${l}.`).value; this.expect(T.FROM, `Expected 'from' on line ${l}.`); const tbl = this.expect(T.IDENTIFIER, `Need table name on line ${l}.`).value; return { type: 'SetVar', name, value: { type: 'ColumnExtract', column: col, table: tbl }, line: l }; }

        // set x to row N from table
        if (this.cur().type === T.ROW) { this.adv(); const idx = this.parseExpr(); this.expect(T.FROM, `Expected 'from' on line ${l}.`); const tbl = this.expect(T.IDENTIFIER, `Need table name on line ${l}.`).value; return { type: 'SetVar', name, value: { type: 'RowExtract', index: idx, table: tbl }, line: l }; }

        // set x to cell "col" row N from table
        if (this.cur().type === T.CELL) { this.adv(); const col = this.expect(T.STRING, `Need column name on line ${l}.`).value; this.expect(T.ROW, `Expected 'row' on line ${l}.`); const idx = this.parseExpr(); this.expect(T.FROM, `Expected 'from' on line ${l}.`); const tbl = this.expect(T.IDENTIFIER, `Need table name on line ${l}.`).value; return { type: 'SetVar', name, value: { type: 'CellExtract', column: col, index: idx, table: tbl }, line: l }; }

        // set x to average/sum/maximum/minimum of column "col" in table
        if ([T.AVERAGE, T.SUM, T.MAXIMUM, T.MINIMUM].includes(this.cur().type)) {
            const op = this.adv().value;
            this.expect(T.OF, `Expected 'of' after '${op}' on line ${l}.`);
            this.expect(T.COLUMN, `Expected 'column' on line ${l}.`);
            const col = this.expect(T.STRING, `Need column name on line ${l}.`).value;
            this.expect(T.IN, `Expected 'in' on line ${l}.`);
            const tbl = this.expect(T.IDENTIFIER, `Need table name on line ${l}.`).value;
            return { type: 'SetVar', name, value: { type: 'TableStat', op, column: col, table: tbl }, line: l };
        }

        // set x to count rows in table
        if (this.cur().type === T.COUNT) { this.adv(); this.expect(T.ROWS, `Expected 'rows' after 'count' on line ${l}.`); this.expect(T.IN, `Expected 'in' on line ${l}.`); const tbl = this.expect(T.IDENTIFIER, `Need table name on line ${l}.`).value; return { type: 'SetVar', name, value: { type: 'CountRows', table: tbl }, line: l }; }

        let value = this.parseExpr();
        if (value.type === 'VarRef' && this.cur().type === T.ITEM) { this.adv(); const idx = this.parseExpr(); value = { type: 'ListAccess', list: value.name, index: idx }; }
        return { type: 'SetVar', name, value, line: l };
    }

    parseSay() { const l = this.cur().line; this.adv(); return { type: 'Say', value: this.parseExpr(), line: l }; }

    parseShow() {
        const l = this.cur().line; this.adv();
        // show window <var>
        if (this.match(T.WINDOW)) {
            const nToken = this.adv();
            if (nToken.type !== T.IDENTIFIER && nToken.type !== T.STRING) throw new PlainError(`Expected window name on line ${l}`, l);
            return { type: 'UiShowStmt', name: nToken.value, line: l };
        }
        // show table <var>
        if (this.cur().type === T.TABLE) { this.adv(); const name = this.expect(T.IDENTIFIER, `Need table name after 'show table' on line ${l}.`).value; return { type: 'ShowTable', name, line: l }; }
        return { type: 'Show', name: this.expect(T.IDENTIFIER, `Need variable name after 'show' on line ${l}.`).value, line: l };
    }

    parseAsk() { const l = this.cur().line; this.adv(); const p = this.expect(T.STRING, `Need a question in quotes after 'ask' on line ${l}.`).value; this.expect(T.AND, `Expected 'and save to <var>' on line ${l}.`); this.expect(T.SAVE, `Expected 'save' on line ${l}.`); this.expect(T.TO, `Expected 'to' on line ${l}.`); const v = this.expect(T.IDENTIFIER, `Need variable name on line ${l}.`).value; return { type: 'Ask', prompt: p, varName: v, line: l }; }

    parseAdd() {
        const l = this.cur().line; this.adv();

        // add a button to window
        if (this.cur().type === T.IDENTIFIER && this.cur().value === 'a') {
            this.adv();
            if (this.match(T.BUTTON)) {
                this.expect(T.TO, `Expected 'to' on line ${l}.`);
                this.match(T.WINDOW); // optional
                const winToken = this.adv();
                if (winToken.type !== T.IDENTIFIER && winToken.type !== T.STRING) throw new PlainError(`Need window name on line ${l}.`, l);
                const win = winToken.value;
                this.expect(T.WITH, `Expected 'with' on line ${l}.`);
                this.expect(T.TEXT, `Expected 'text' on line ${l}.`);
                const txt = this.parseExpr();
                let varName = null;
                if (this.match(T.AND)) {
                    this.expect(T.SAVE, `Expected 'save' on line ${l}.`);
                    this.expect(T.TO, `Expected 'to' on line ${l}.`);
                    varName = this.expect(T.IDENTIFIER, `Expected variable name on line ${l}.`).value;
                }
                return { type: 'UiElementStmt', winName: win, elem: 'button', text: txt, varName, line: l };
            }
            this.pos -= 1; // backtrack
        }

        const v = this.parseExpr();
        this.expect(T.TO, `Expected 'to' in 'add' on line ${l}.`);
        const t = this.expect(T.IDENTIFIER, `Need variable/list name on line ${l}.`).value;
        return { type: 'MathOp', op: 'add', target: t, value: v, line: l };
    }
    parseSub() { const l = this.cur().line; this.adv(); const v = this.parseExpr(); this.expect(T.FROM, `Expected 'from' in 'subtract' on line ${l}.`); const t = this.expect(T.IDENTIFIER, `Need variable name on line ${l}.`).value; return { type: 'MathOp', op: 'subtract', target: t, value: v, line: l }; }
    parseMul() { const l = this.cur().line; this.adv(); const t = this.expect(T.IDENTIFIER, `Need variable name after 'multiply' on line ${l}.`).value; this.expect(T.BY, `Expected 'by' on line ${l}.`); return { type: 'MathOp', op: 'multiply', target: t, value: this.parseExpr(), line: l }; }
    parseDiv() { const l = this.cur().line; this.adv(); const t = this.expect(T.IDENTIFIER, `Need variable name after 'divide' on line ${l}.`).value; this.expect(T.BY, `Expected 'by' on line ${l}.`); return { type: 'MathOp', op: 'divide', target: t, value: this.parseExpr(), line: l }; }

    parseIf() {
        const l = this.cur().line; this.adv(); const cond = this.parseCond();
        this.expect(T.THEN, `Expected 'then' after condition on line ${l}.`); this.skipNL();
        const body = this.parseStmts(); const elifs = []; let elseBody = [];
        while (this.cur().type === T.ELSE) {
            this.adv();
            if (this.cur().type === T.IF) { this.adv(); const c = this.parseCond(); this.expect(T.THEN, `Expected 'then' on line ${this.cur().line}.`); this.skipNL(); elifs.push({ cond: c, body: this.parseStmts() }); }
            else { this.skipNL(); elseBody = this.parseStmts(); break; }
        }
        this.expect(T.END, `Forgot 'end if' for the if-block starting on line ${l}.`);
        this.expect(T.IF, `Expected 'if' after 'end' on line ${this.cur().line}.`);
        return { type: 'IfBlock', cond, body, elifs, elseBody, line: l };
    }

    parseRepeat() { const l = this.cur().line; this.adv(); const c = this.parseExpr(); this.expect(T.TIMES, `Expected 'times' on line ${l}.`); this.skipNL(); const body = this.parseStmts(); this.expect(T.END, `Forgot 'end repeat' for line ${l}.`); this.expect(T.REPEAT, `Expected 'repeat' after 'end'.`); return { type: 'RepeatBlock', count: c, body, line: l }; }
    parseWhile() { const l = this.cur().line; this.adv(); const c = this.parseCond(); this.skipNL(); const body = this.parseStmts(); this.expect(T.END, `Forgot 'end while' for line ${l}.`); this.expect(T.WHILE, `Expected 'while' after 'end'.`); return { type: 'WhileBlock', cond: c, body, line: l }; }
    parseForEach() { const l = this.cur().line; this.adv(); this.expect(T.EACH, `Expected 'each' after 'for' on line ${l}.`); const item = this.expect(T.IDENTIFIER, `Need item name on line ${l}.`).value; this.expect(T.IN, `Expected 'in' on line ${l}.`); const list = this.expect(T.IDENTIFIER, `Need list name on line ${l}.`).value; this.skipNL(); const body = this.parseStmts(); this.expect(T.END, `Forgot 'end for' for line ${l}.`); this.expect(T.FOR, `Expected 'for' after 'end'.`); return { type: 'ForEach', item, list, body, line: l }; }

    parseDefine() { const l = this.cur().line; this.adv(); const name = this.expect(T.IDENTIFIER, `Need function name on line ${l}.`).value; const params = []; if (this.match(T.USING)) { params.push(this.expect(T.IDENTIFIER, `Need param name on line ${l}.`).value); while (this.match(T.COMMA)) params.push(this.expect(T.IDENTIFIER, `Need param name.`).value); } this.skipNL(); const body = this.parseStmts(); this.expect(T.END, `Forgot 'end define' for '${name}' on line ${l}.`); this.expect(T.DEFINE, `Expected 'define' after 'end'.`); return { type: 'DefineFunc', name, params, body, line: l }; }
    parseRun() { const l = this.cur().line; this.adv(); const name = this.expect(T.IDENTIFIER, `Need function name after 'run' on line ${l}.`).value; let args = []; if (this.match(T.WITH)) args = this.parseArgList(); return { type: 'RunFunc', name, args, line: l }; }
    parseArgList() { const args = [this.parseExpr()]; while (this.match(T.COMMA)) args.push(this.parseExpr()); return args; }
    parseReturn() { const l = this.cur().line; this.adv(); return { type: 'Return', value: this.parseExpr(), line: l }; }
    parseCreateList() {
        const l = this.cur().line; this.adv();
        if (this.match(T.WINDOW)) {
            this.expect(T.CALLED, `Expected 'called' on line ${l}.`);
            const nToken = this.adv();
            if (nToken.type !== T.IDENTIFIER && nToken.type !== T.STRING) throw new PlainError(`Need window name on line ${l}.`, l);
            const n = nToken.value;
            this.expect(T.WITH, `Expected 'with' on line ${l}.`);
            this.expect(T.WIDTH, `Expected 'width' on line ${l}.`);
            const w = this.parseExpr();
            this.expect(T.AND, `Expected 'and' on line ${l}.`);
            this.expect(T.HEIGHT, `Expected 'height' on line ${l}.`);
            const h = this.parseExpr();
            return { type: 'WindowCreateStmt', name: n, width: w, height: h, line: l };
        }
        this.expect(T.LIST, `Expected 'list' or 'window' after 'create' on line ${l}.`);
        this.expect(T.CALLED, `Expected 'called' on line ${l}.`);
        return { type: 'CreateList', name: this.expect(T.IDENTIFIER, `Need list name on line ${l}.`).value, line: l };
    }
    parseRemove() { const l = this.cur().line; this.adv(); this.expect(T.ITEM, `Expected 'item' after 'remove' on line ${l}.`); const idx = this.parseExpr(); this.expect(T.FROM, `Expected 'from' on line ${l}.`); return { type: 'RemoveFromList', index: idx, list: this.expect(T.IDENTIFIER, `Need list name on line ${l}.`).value, line: l }; }

    // ── New: Load, Sort, Filter, Import ──
    parseLoad() {
        const l = this.cur().line; this.adv();
        const filename = this.expect(T.STRING, `Need a filename in quotes after 'load' on line ${l}.`).value;
        this.expect(T.INTO, `Expected 'into' after filename on line ${l}.`);
        const varName = this.expect(T.IDENTIFIER, `Need a variable name after 'into' on line ${l}.`).value;
        return { type: 'LoadFile', filename, varName, line: l };
    }

    parseSort() {
        const l = this.cur().line; this.adv();
        const table = this.expect(T.IDENTIFIER, `Need table name after 'sort' on line ${l}.`).value;
        this.expect(T.BY, `Expected 'by' on line ${l}.`);
        const col = this.expect(T.STRING, `Need column name in quotes on line ${l}.`).value;
        let order = 'ascending';
        if (this.match(T.DESCENDING)) order = 'descending';
        else this.match(T.ASCENDING);
        return { type: 'SortTable', table, column: col, order, line: l };
    }

    parseFilter() {
        const l = this.cur().line; this.adv();
        const table = this.expect(T.IDENTIFIER, `Need table name after 'filter' on line ${l}.`).value;
        this.expect(T.WHERE, `Expected 'where' on line ${l}.`);
        const col = this.expect(T.STRING, `Need column name in quotes on line ${l}.`).value;
        // parse comparison: is [not] equal to <val> / is greater than <val> / is less than <val>
        this.expect(T.IS, `Expected 'is' on line ${l}.`);
        let neg = false;
        if (this.cur().type === T.NOT) { neg = true; this.adv(); }
        let op;
        if (this.cur().type === T.EQUAL) { this.adv(); this.expect(T.TO, `Expected 'to' on line ${l}.`); op = neg ? 'neq' : 'eq'; }
        else if (this.cur().type === T.GREATER) { this.adv(); this.expect(T.THAN, `Expected 'than' on line ${l}.`); op = 'gt'; }
        else if (this.cur().type === T.LESS) { this.adv(); this.expect(T.THAN, `Expected 'than' on line ${l}.`); op = 'lt'; }
        else throw new PlainError(`Expected 'equal to', 'greater than', or 'less than' on line ${l}.`, l);
        const value = this.parseExpr();
        return { type: 'FilterTable', table, column: col, op, value, line: l };
    }

    parseImport() {
        const l = this.cur().line; this.adv();
        const module = this.expect(T.STRING, `Need a module name in quotes after 'import' on line ${l}.`).value;
        return { type: 'Import', module, line: l };
    }

    // ── New 8 Features: Timers, UI, Speech, Memory, Sound, Files ──
    parseAfter() {
        const l = this.cur().line; this.adv();
        const dur = this.parseExpr();
        const unit = this.adv().value;
        if (unit !== 'seconds' && unit !== 'minutes') throw new PlainError(`Expected 'seconds' or 'minutes' on line ${l}.`, l);
        this.expect(T.RUN, `Expected 'run' on line ${l}.`);
        const fn = this.expect(T.IDENTIFIER, `Expected function name on line ${l}.`).value;
        return { type: 'TimerStmt', dur, unit, fn, isInterval: false, line: l };
    }
    parseEvery() {
        const l = this.cur().line; this.adv();
        const dur = this.parseExpr();
        const unit = this.adv().value;
        if (unit !== 'seconds' && unit !== 'minutes') throw new PlainError(`Expected 'seconds' or 'minutes' on line ${l}.`, l);
        this.expect(T.RUN, `Expected 'run' on line ${l}.`);
        const fn = this.expect(T.IDENTIFIER, `Expected function name on line ${l}.`).value;
        return { type: 'TimerStmt', dur, unit, fn, isInterval: true, line: l };
    }
    parseStop() {
        const l = this.cur().line; this.adv();
        if (this.match(T.SOUND)) return { type: 'StopSoundStmt', line: l };
        this.expect(T.RUNNING, `Expected 'running' on line ${l} or 'sound'.`);
        const fn = this.expect(T.IDENTIFIER, `Expected function name on line ${l}.`).value;
        return { type: 'StopTimerStmt', fn, line: l };
    }
    parseWhen() {
        const l = this.cur().line; this.adv();
        let target = 'button';
        if (this.cur().type !== T.BUTTON) {
            target = this.expect(T.IDENTIFIER, `Expected UI element or 'button' on line ${l}.`).value;
        } else {
            this.adv();
        }
        this.expect(T.IS, `Expected 'is' on line ${l}.`);
        this.expect(T.CLICKED, `Expected 'clicked' on line ${l}.`);
        this.expect(T.RUN, `Expected 'run' on line ${l}.`);
        const fn = this.expect(T.IDENTIFIER, `Expected function name on line ${l}.`).value;
        return { type: 'UiEventStmt', elemType: target, fn, line: l };
    }
    parseSpeak() {
        const l = this.cur().line; this.adv();
        return { type: 'SpeakStmt', value: this.parseExpr(), line: l };
    }
    parseListen() {
        const l = this.cur().line; this.adv();
        this.expect(T.AND, `Expected 'and save to' on line ${l}.`);
        this.expect(T.SAVE, `Expected 'save' on line ${l}.`);
        this.expect(T.TO, `Expected 'to' on line ${l}.`);
        const v = this.expect(T.IDENTIFIER, `Need variable name on line ${l}.`).value;
        return { type: 'ListenStmt', varName: v, line: l };
    }
    parseRemember() {
        const l = this.cur().line; this.adv();
        const v = this.parseExpr();
        this.expect(T.AS, `Expected 'as' on line ${l}.`);
        const k = this.expect(T.STRING, `Need a key string on line ${l}.`).value;
        return { type: 'RememberStmt', value: v, key: k, line: l };
    }
    parseRecall() {
        const l = this.cur().line; this.adv();
        const k = this.expect(T.STRING, `Need a key string on line ${l}.`).value;
        if (this.match(T.AND)) this.expect(T.SAVE, `Expected 'save' on line ${l}.`);
        this.expect(T.TO, `Expected 'to' on line ${l}.`);
        const v = this.expect(T.IDENTIFIER, `Need variable name on line ${l}.`).value;
        return { type: 'RecallStmt', key: k, varName: v, line: l };
    }
    parseForget() {
        const l = this.cur().line; this.adv();
        const k = this.expect(T.STRING, `Need a key string on line ${l}.`).value;
        return { type: 'ForgetStmt', key: k, line: l };
    }
    parsePlay() {
        const l = this.cur().line; this.adv();
        this.match(T.MUSIC); // Optional
        this.match(T.SOUND); // Optional
        const f = this.expect(T.STRING, `Need sound file string on line ${l}.`).value;
        let loop = false;
        if (this.match(T.LOOP)) {
            if (this.cur().type === T.BOOLEAN) { loop = this.adv().value; }
            else { loop = true; }
        }
        return { type: 'PlaySoundStmt', file: f, loop, line: l };
    }
    parseDelete() {
        const l = this.cur().line; this.adv();
        let isFolder = false;
        if (this.match(T.FOLDER)) isFolder = true;
        else this.match(T.FILES); // optional
        const target = this.parseExpr();
        return { type: 'FileManageStmt', action: 'delete', target, isFolder, line: l };
    }
    parseCopy() {
        const l = this.cur().line; this.adv();
        let isFolder = false;
        if (this.match(T.FOLDER)) isFolder = true;
        else this.match(T.FILES); // optional
        const src = this.parseExpr();
        this.expect(T.TO, `Expected 'to' on line ${l}.`);
        const dest = this.parseExpr();
        return { type: 'FileManageStmt', action: 'copy', target: src, dest, isFolder, line: l };
    }
    parseListFiles() {
        const l = this.cur().line; this.adv();
        this.expect(T.FILES, `Expected 'files' after 'list' on line ${l}.`);
        this.expect(T.IN, `Expected 'in' on line ${l}.`);
        const folder = this.parseExpr();
        this.expect(T.AND, `Expected 'and save to' on line ${l}.`);
        this.expect(T.SAVE, `Expected 'save' on line ${l}.`);
        this.expect(T.TO, `Expected 'to' on line ${l}.`);
        const v = this.expect(T.IDENTIFIER, `Need variable name on line ${l}.`).value;
        return { type: 'FileManageStmt', action: 'list', target: folder, destVar: v, isFolder: true, line: l };
    }

    // ── Conditions and Expressions ──
    parseCond() {
        let left = this.parseSingleCond();
        while (this.cur().type === T.AND || this.cur().type === T.OR) { const op = this.adv().value; left = { type: 'LogicalOp', left, op, right: this.parseSingleCond() }; }
        return left;
    }
    parseSingleCond() {
        const left = this.parseExpr();
        if (this.cur().type !== T.IS) return left;
        this.adv(); let neg = false; if (this.cur().type === T.NOT) { neg = true; this.adv(); }
        if (this.cur().type === T.EQUAL) { this.adv(); this.expect(T.TO, "Expected 'to' after 'equal'."); return { type: 'Cmp', left, op: neg ? 'neq' : 'eq', right: this.parseExpr() }; }
        if (this.cur().type === T.GREATER) { this.adv(); this.expect(T.THAN, "Expected 'than'."); if (this.cur().type === T.OR) { this.adv(); this.expect(T.EQUAL, "Expected 'equal'."); this.expect(T.TO, "Expected 'to'."); return { type: 'Cmp', left, op: 'gte', right: this.parseExpr() }; } return { type: 'Cmp', left, op: 'gt', right: this.parseExpr() }; }
        if (this.cur().type === T.LESS) { this.adv(); this.expect(T.THAN, "Expected 'than'."); if (this.cur().type === T.OR) { this.adv(); this.expect(T.EQUAL, "Expected 'equal'."); this.expect(T.TO, "Expected 'to'."); return { type: 'Cmp', left, op: 'lte', right: this.parseExpr() }; } return { type: 'Cmp', left, op: 'lt', right: this.parseExpr() }; }
        if (this.cur().type === T.BOOLEAN) { const v = this.adv().value; return { type: 'Cmp', left, op: 'eq', right: { type: 'Bool', value: neg ? !v : v } }; }
        throw new PlainError("Expected a comparison like 'equal to', 'greater than', or 'less than'.", this.cur().line);
    }

    parseExpr() {
        let left = this.parseAtom();
        while (true) {
            if (this.cur().type === T.PLUS) {
                this.adv(); left = { type: 'Concat', left, right: this.parseAtom() };
            } else if (this.cur().type === T.STARTS) {
                this.adv(); this.expect(T.WITH, "Expected 'with' after 'starts'.");
                left = { type: 'BinOp', left, op: 'starts_with', right: this.parseAtom() };
            } else if (this.cur().type === T.ENDS) {
                this.adv(); this.expect(T.WITH, "Expected 'with' after 'ends'.");
                left = { type: 'BinOp', left, op: 'ends_with', right: this.parseAtom() };
            } else if (this.cur().type === T.CONTAINS) {
                this.adv(); left = { type: 'BinOp', left, op: 'contains', right: this.parseAtom() };
            } else if (this.cur().type === T.IS) {
                if (this.pk(1).type === T.EMPTY) {
                    this.adv(); this.adv(); // consume 'is empty'
                    left = { type: 'BinOp', left, op: 'is_empty' };
                } else if (this.pk(1).type === T.NOT && this.pk(2).type === T.EMPTY) {
                    this.adv(); this.adv(); this.adv(); // consume 'is not empty'
                    left = { type: 'BinOp', left, op: 'is_not_empty' };
                } else break;
            } else {
                break;
            }
        }
        return left;
    }

    parseAtom() {
        const t = this.cur();
        if (t.type === T.NUMBER) { this.adv(); return { type: 'Num', value: t.value }; }
        if (t.type === T.STRING) { this.adv(); return { type: 'Str', value: t.value }; }
        if (t.type === T.BOOLEAN) { this.adv(); return { type: 'Bool', value: t.value }; }
        if (t.type === T.SIZE) { this.adv(); this.expect(T.OF, "Expected 'of' after 'size'."); return { type: 'SizeOf', list: this.expect(T.IDENTIFIER, "Need list name.").value }; }

        // Date and Time Parsing Expressions
        if (t.type === T.TODAY) { this.adv(); return { type: 'VarRef', name: '__today__' }; }

        // Built-in math functions
        if (t.type === T.ROUND) { this.adv(); return { type: 'BuiltinFn', fn: 'round', arg: this.parseAtom() }; }
        if (t.type === T.FLOOR) { this.adv(); return { type: 'BuiltinFn', fn: 'floor', arg: this.parseAtom() }; }
        if (t.type === T.CEILING) { this.adv(); return { type: 'BuiltinFn', fn: 'ceiling', arg: this.parseAtom() }; }
        if (t.type === T.ABSOLUTE) { this.adv(); return { type: 'BuiltinFn', fn: 'absolute', arg: this.parseAtom() }; }
        if (t.type === T.SQUARE) { this.adv(); this.expect(T.ROOT, "Expected 'root' after 'square'."); return { type: 'BuiltinFn', fn: 'sqrt', arg: this.parseAtom() }; }
        if (t.type === T.REMAINDER) { this.adv(); this.expect(T.OF, "Expected 'of' after 'remainder'."); const a = this.parseAtom(); this.expect(T.BY, "Expected 'by' after value."); return { type: 'BuiltinFn2', fn: 'remainder', arg1: a, arg2: this.parseAtom() }; }
        if (t.type === T.POWER) { this.adv(); const base = this.parseAtom(); this.expect(T.BY, "Expected 'by' after base value."); return { type: 'BuiltinFn2', fn: 'power', arg1: base, arg2: this.parseAtom() }; }
        if (t.type === T.RANDOM) {
            this.adv();
            this.expect(T.NUMBER_KW, "Expected 'number' after 'random'.");
            this.expect(T.BETWEEN, "Expected 'between' after 'random number'.");
            const lo = this.parseAtom();
            this.expect(T.AND, "Expected 'and' after lower bound.");
            return { type: 'BuiltinFn2', fn: 'random', arg1: lo, arg2: this.parseAtom() };
        }

        // Built-in text functions
        if (t.type === T.UPPERCASE) { this.adv(); this.expect(T.OF, "Expected 'of' after 'uppercase'."); return { type: 'BuiltinFn', fn: 'uppercase', arg: this.parseAtom() }; }
        if (t.type === T.LOWERCASE) { this.adv(); this.expect(T.OF, "Expected 'of' after 'lowercase'."); return { type: 'BuiltinFn', fn: 'lowercase', arg: this.parseAtom() }; }
        if (t.type === T.LENGTH) { this.adv(); this.expect(T.OF, "Expected 'of' after 'length'."); return { type: 'BuiltinFn', fn: 'length', arg: this.parseAtom() }; }
        if (t.type === T.TRIMMED) { this.adv(); return { type: 'BuiltinFn', fn: 'trimmed', arg: this.parseAtom() }; }
        if (t.type === T.CHARACTER) { this.adv(); const idx = this.parseAtom(); this.expect(T.OF, "Expected 'of'."); return { type: 'BuiltinFn2', fn: 'character', arg1: idx, arg2: this.parseAtom() }; }
        if (t.type === T.REPLACED) { this.adv(); const find = this.parseAtom(); this.expect(T.WITH, "Expected 'with'."); const repl = this.parseAtom(); this.expect(T.IN, "Expected 'in'."); return { type: 'BuiltinFn3', fn: 'replaced', arg1: find, arg2: repl, arg3: this.parseAtom() }; }

        // Type conversions
        if (t.type === T.NUMBER_KW && this.pk(1).type === T.FROM) { this.adv(); this.adv(); return { type: 'BuiltinFn', fn: 'toNumber', arg: this.parseAtom() }; }
        if (t.type === T.TEXT && this.pk(1).type === T.FROM) { this.adv(); this.adv(); return { type: 'BuiltinFn', fn: 'toText', arg: this.parseAtom() }; }

        // Count rows in table (as expression)
        if (t.type === T.COUNT && this.pk(1).type === T.ROWS) {
            this.adv(); this.adv(); // consume count, rows
            this.expect(T.IN, "Expected 'in' after 'count rows'.");
            return { type: 'CountRows', table: this.expect(T.IDENTIFIER, "Need table name.").value };
        }

        const soft = [T.NUMBER_KW, T.TEXT, T.RUNNING, T.BUTTON, T.WINDOW, T.STARTS, T.ENDS, T.CONTAINS, T.EMPTY, T.COLUMN, T.ROW, T.CELL, T.TABLE, T.FILES, T.FOLDER, T.DATE, T.TIME, T.TODAY, T.COUNT];
        if (t.type === T.IDENTIFIER || soft.includes(t.type)) { this.adv(); if (this.cur().type === T.ITEM) { this.adv(); return { type: 'ListAccess', list: t.value, index: this.parseAtom() }; } return { type: 'VarRef', name: t.value }; }
        throw new PlainError(`Expected a value but found '${t.value}' on line ${t.line}.`, t.line);
    }
}

// ── CSV Parser ──
function parseCSV(text) {
    const lines = [];
    let current = [];
    let field = '';
    let inQuotes = false;
    let i = 0;
    while (i < text.length) {
        const ch = text[i];
        if (inQuotes) {
            if (ch === '"' && text[i + 1] === '"') { field += '"'; i += 2; }
            else if (ch === '"') { inQuotes = false; i++; }
            else { field += ch; i++; }
        } else {
            if (ch === '"') { inQuotes = true; i++; }
            else if (ch === ',') { current.push(field.trim()); field = ''; i++; }
            else if (ch === '\n' || ch === '\r') {
                current.push(field.trim()); field = '';
                if (current.some(c => c !== '')) lines.push(current);
                current = [];
                if (ch === '\r' && text[i + 1] === '\n') i++;
                i++;
            } else { field += ch; i++; }
        }
    }
    current.push(field.trim());
    if (current.some(c => c !== '')) lines.push(current);

    if (lines.length < 1) return { headers: [], rows: [] };
    const headers = lines[0];
    const rows = lines.slice(1).map(row => {
        const obj = {};
        headers.forEach((h, i) => {
            let val = row[i] !== undefined ? row[i] : '';
            const num = Number(val);
            obj[h] = val !== '' && !isNaN(num) ? num : val;
        });
        return obj;
    });
    return { headers, rows, _isTable: true };
}

// ── Interpreter ──
class PlainInterpreter {
    constructor(outputFn, inputFn, loadFileFn, outputTableFn) {
        this.output = outputFn || console.log;
        this.input = inputFn || (p => prompt(p));
        this.loadFile = loadFileFn || (() => { throw new PlainError("File loading not available."); });
        this.outputTable = outputTableFn || ((tbl) => this.output(JSON.stringify(tbl)));
        this.vars = {}; this.fns = {};
        this._halted = false;
        this._imports = new Set();
    }

    async run(source) {
        this._halted = false;
        this.vars = {}; this.fns = {}; this._imports = new Set();
        const tokens = new Lexer(source).tokenize();
        const ast = new Parser(tokens).parse();
        await this.execBlock(ast.stmts, this.vars);
    }

    async runPartial(source) {
        this._halted = false;
        const tokens = new Lexer(source).tokenize();
        const ast = new Parser(tokens).parse();
        await this.execBlock(ast.stmts, this.vars);
    }

    reset() {
        this.vars = {};
        this.fns = {};
        this._halted = false;
        this._imports = new Set();
    }

    halt() { this._halted = true; }

    async execBlock(stmts, env) {
        for (const s of stmts) {
            if (this._halted) throw new PlainError("Program stopped.");
            await this.exec(s, env);
        }
    }

    async exec(n, env) {
        switch (n.type) {
            case 'SetVar': env[n.name] = await this.eval(n.value, env); break;
            case 'SetToRun': env[n.name] = await this.callFn(n.fn, n.args, env, n.line); break;
            case 'MathOp': await this.execMath(n, env); break;
            case 'Say': this.output(String(await this.eval(n.value, env))); break;
            case 'Show': { const v = this.getVar(n.name, env, n.line); this.output(String(v)); break; }
            case 'ShowTable': {
                const tbl = this.getVar(n.name, env, n.line);
                if (!tbl || !tbl._isTable) throw new PlainError(`'${n.name}' is not a table on line ${n.line}.`, n.line);
                this.outputTable(tbl);
                break;
            }
            case 'Ask': {
                const answer = await this.input(n.prompt);
                const num = Number(answer);
                env[n.varName] = isNaN(num) ? answer : (answer.includes('.') ? parseFloat(answer) : parseInt(answer, 10));
                break;
            }
            case 'IfBlock': {
                if (await this.eval(n.cond, env)) { await this.execBlock(n.body, env); }
                else { let done = false; for (const ei of n.elifs) { if (await this.eval(ei.cond, env)) { await this.execBlock(ei.body, env); done = true; break; } } if (!done && n.elseBody.length) await this.execBlock(n.elseBody, env); }
                break;
            }
            case 'RepeatBlock': { const c = await this.eval(n.count, env); for (let i = 0; i < c; i++) { if (this._halted) break; await this.execBlock(n.body, env); } break; }
            case 'WhileBlock': { let it = 0; while (await this.eval(n.cond, env)) { if (this._halted) break; await this.execBlock(n.body, env); if (++it > 1000000) throw new PlainError(`While loop on line ${n.line} might be infinite!`, n.line); } break; }
            case 'ForEach': { const lst = this.getVar(n.list, env, n.line); if (!Array.isArray(lst)) throw new PlainError(`'${n.list}' is not a list on line ${n.line}.`, n.line); for (const item of lst) { if (this._halted) break; const le = { ...env }; le[n.item] = item; await this.execBlock(n.body, le); } break; }
            case 'DefineFunc': this.fns[n.name] = n; break;
            case 'RunFunc': await this.callFn(n.name, n.args, env, n.line); break;
            case 'Return': throw new ReturnSignal(await this.eval(n.value, env));
            case 'CreateList': env[n.name] = []; break;
            case 'RemoveFromList': { const lst = this.getVar(n.list, env, n.line); const idx = await this.eval(n.index, env); if (idx < 1 || idx > lst.length) throw new PlainError(`Can't remove item ${idx} from '${n.list}' — it has ${lst.length} items.`, n.line); lst.splice(idx - 1, 1); break; }
            // ── New statements ──
            case 'LoadFile': {
                const data = await this.loadFile(n.filename);
                env[n.filename.toLowerCase().endsWith('.csv') ? n.varName : n.varName] = data;
                break;
            }
            case 'SortTable': {
                const tbl = this.getVar(n.table, env, n.line);
                if (!tbl || !tbl._isTable) throw new PlainError(`'${n.table}' is not a table on line ${n.line}.`, n.line);
                if (!tbl.headers.includes(n.column)) throw new PlainError(`Column '${n.column}' not found in '${n.table}'. Available: ${tbl.headers.join(', ')}`, n.line);
                const dir = n.order === 'descending' ? -1 : 1;
                tbl.rows.sort((a, b) => {
                    const va = a[n.column], vb = b[n.column];
                    if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * dir;
                    return String(va).localeCompare(String(vb)) * dir;
                });
                break;
            }
            case 'FilterTable': {
                const tbl = this.getVar(n.table, env, n.line);
                if (!tbl || !tbl._isTable) throw new PlainError(`'${n.table}' is not a table on line ${n.line}.`, n.line);
                if (!tbl.headers.includes(n.column)) throw new PlainError(`Column '${n.column}' not found in '${n.table}'.`, n.line);
                const val = await this.eval(n.value, env);
                tbl.rows = tbl.rows.filter(row => {
                    const cv = row[n.column];
                    switch (n.op) {
                        case 'eq': return cv === val;
                        case 'neq': return cv !== val;
                        case 'gt': return cv > val;
                        case 'lt': return cv < val;
                        default: return true;
                    }
                });
                break;
            }
            case 'Import': {
                this._imports.add(n.module.toLowerCase());
                // All functions are built-in, so import is a no-op but acknowledged
                break;
            }

            // ── New 8 Features: Web Executions ──
            case 'TimerStmt': {
                const dur = await this.eval(n.dur, env);
                const ms = n.unit === 'seconds' ? dur * 1000 : dur * 60000;
                if (!this._timers) this._timers = {};

                const callback = async () => {
                    if (this._halted) {
                        clearInterval(this._timers[n.fn]);
                        return;
                    }
                    try {
                        await this.callFn(n.fn, [], env, n.line);
                    } catch (e) {
                        this.output(`Error in timer calling ${n.fn}: ${e.message}`);
                    }
                };

                if (n.isInterval) {
                    this._timers[n.fn] = setInterval(callback, ms);
                } else {
                    this._timers[n.fn] = setTimeout(callback, ms);
                }
                break;
            }
            case 'StopTimerStmt': {
                if (this._timers && this._timers[n.fn]) {
                    clearInterval(this._timers[n.fn]);
                    clearTimeout(this._timers[n.fn]);
                    delete this._timers[n.fn];
                }
                break;
            }
            case 'WindowCreateStmt': {
                const w = await this.eval(n.width, env);
                const h = await this.eval(n.height, env);
                const win = document.createElement('div');
                win.className = 'plain-window';
                win.style.width = w + 'px';
                win.style.height = h + 'px';

                const header = document.createElement('div');
                header.className = 'plain-window-header';

                const title = document.createElement('h3');
                title.textContent = n.name;

                const closeBtn = document.createElement('button');
                closeBtn.innerHTML = '&times;';
                closeBtn.className = 'plain-window-close';
                closeBtn.onclick = () => win.style.display = 'none';

                header.appendChild(title);
                header.appendChild(closeBtn);
                win.appendChild(header);

                let isDragging = false, startX, startY, initialLeft, initialTop;

                const onDragStart = (e) => {
                    isDragging = true;
                    // Support touch & mouse event pos
                    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
                    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
                    startX = clientX;
                    startY = clientY;
                    const rect = win.getBoundingClientRect();
                    initialLeft = rect.left;
                    initialTop = rect.top;
                    win.style.transform = 'none';
                    win.style.left = initialLeft + 'px';
                    win.style.top = initialTop + 'px';

                    const onDragMove = (me) => {
                        if (!isDragging) return;
                        const mx = me.clientX || (me.touches && me.touches[0].clientX);
                        const my = me.clientY || (me.touches && me.touches[0].clientY);
                        win.style.left = (initialLeft + mx - startX) + 'px';
                        win.style.top = (initialTop + my - startY) + 'px';
                    };
                    const onDragEnd = () => {
                        isDragging = false;
                        document.removeEventListener('mousemove', onDragMove);
                        document.removeEventListener('mouseup', onDragEnd);
                        document.removeEventListener('touchmove', onDragMove);
                        document.removeEventListener('touchend', onDragEnd);
                    };

                    document.addEventListener('mousemove', onDragMove);
                    document.addEventListener('mouseup', onDragEnd);
                    document.addEventListener('touchmove', onDragMove, { passive: false });
                    document.addEventListener('touchend', onDragEnd);
                };

                header.addEventListener('mousedown', onDragStart);
                header.addEventListener('touchstart', onDragStart, { passive: false });

                const content = document.createElement('div');
                content.style.display = 'flex';
                content.style.flexDirection = 'column';
                content.style.gap = '10px';
                content.style.overflowY = 'auto';
                content.style.flex = '1';
                win._contentArea = content;
                win.appendChild(content);

                document.body.appendChild(win);
                env[n.name] = { _ui: win, _elements: {} };
                break;
            }
            case 'UiElementStmt': {
                const txt = await this.eval(n.text, env);
                const winObj = this.getVar(n.winName, env, n.line);
                if (!winObj || !winObj._ui) throw new PlainError(`'${n.winName}' is not a window.`, n.line);

                if (n.elem === 'button') {
                    const btn = document.createElement('button');
                    btn.textContent = txt;
                    btn.style.padding = '8px 16px';
                    btn.style.cursor = 'pointer';
                    btn.style.backgroundColor = '#4CAF50';
                    btn.style.color = 'white';
                    btn.style.border = 'none';
                    btn.style.borderRadius = '4px';
                    winObj._ui._contentArea.appendChild(btn);
                    // Just store one generic button for this demo unless specified otherwise
                    winObj._elements['button'] = btn;

                    // Allow specific naming logic? The syntax is just 'add a button'. Let's store globally for simplicity
                    env['button'] = btn;
                    if (n.varName) env[n.varName] = btn;
                }
                break;
            }
            case 'UiShowStmt': {
                const winObj = this.getVar(n.name, env, n.line);
                if (!winObj || !winObj._ui) throw new PlainError(`'${n.name}' is not a window.`, n.line);
                winObj._ui.style.display = 'flex';
                break;
            }
            case 'UiEventStmt': {
                let target = null;
                if (n.elemType === 'button') {
                    target = env['button'];
                } else {
                    target = this.getVar(n.elemType, env, n.line);
                }
                if (!target || !target.addEventListener) throw new PlainError(`Cannot attach event to '${n.elemType}'.`, n.line);

                target.onclick = async () => {
                    if (this._halted) return;
                    try {
                        await this.callFn(n.fn, [], env, n.line);
                    } catch (e) {
                        this.output(`Error in UI click event calling ${n.fn}: ${e.message}`);
                    }
                };
                break;
            }
            case 'SpeakStmt': {
                const val = await this.eval(n.value, env);
                const u = new SpeechSynthesisUtterance(String(val));
                window.speechSynthesis.speak(u);
                break;
            }
            case 'ListenStmt': {
                if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) {
                    throw new PlainError(`Speech Recognition is not supported in this browser.`, n.line);
                }
                const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                const recognition = new SpeechRecognition();
                recognition.lang = 'en-US';
                recognition.interimResults = false;

                return new Promise((resolve, reject) => {
                    this.output("Listening...");
                    recognition.onresult = (event) => {
                        const transcript = event.results[0][0].transcript;
                        this.output(`Heard: "${transcript}"`);
                        env[n.varName] = transcript;
                        resolve();
                    };
                    recognition.onerror = (event) => {
                        this.output(`Speech recognition error: ${event.error}`);
                        env[n.varName] = "";
                        resolve();
                    };
                    recognition.start();
                });
            }
            case 'RememberStmt': {
                const val = await this.eval(n.value, env);
                localStorage.setItem(`plain_${n.key}`, JSON.stringify(val));
                break;
            }
            case 'RecallStmt': {
                const raw = localStorage.getItem(`plain_${n.key}`);
                if (raw !== null) {
                    try { env[n.varName] = JSON.parse(raw); }
                    catch (e) { env[n.varName] = raw; }
                } else {
                    throw new PlainError(`Nothing saved under key '${n.key}'.`, n.line);
                }
                break;
            }
            case 'ForgetStmt': {
                localStorage.removeItem(`plain_${n.key}`);
                break;
            }
            case 'PlaySoundStmt': {
                if (!this._audioContexts) this._audioContexts = {};
                const file = n.file.toLowerCase();

                // Demo mappings for specific files mentioned in standard python mock
                let soundUrl = '';
                if (file.includes('beep')) {
                    // Create simple beep
                    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                    const oscillator = audioCtx.createOscillator();
                    oscillator.type = 'sine';
                    oscillator.frequency.setValueAtTime(440, audioCtx.currentTime); // 440 Hz
                    oscillator.connect(audioCtx.destination);
                    oscillator.start();
                    oscillator.stop(audioCtx.currentTime + 0.5); // 0.5 seconds
                    this._audioContexts['beep'] = audioCtx;
                } else {
                    const audio = new Audio(n.file);
                    audio.loop = n.loop;
                    audio.play().catch(e => {
                        this.output(`Could not play audio from ${n.file}. Browsers often require user interaction first.`);
                    });
                    this._audioContexts[n.file] = audio;
                }
                break;
            }
            case 'StopSoundStmt': {
                if (this._audioContexts) {
                    for (const key in this._audioContexts) {
                        const a = this._audioContexts[key];
                        if (a instanceof Audio) {
                            a.pause();
                            a.currentTime = 0;
                        } else if (a.close) {
                            a.close();
                        }
                    }
                    this._audioContexts = {};
                }
                break;
            }
            case 'FileManageStmt': {
                // Virtual File System for Web Playground
                if (!window._plainVFs) window._plainVFs = { files: {}, folders: { "my_folder": [] } };
                const target = await this.eval(n.target, env) || '';

                if (n.action === 'list') {
                    if (window._plainVFs.folders[target] || target === '.') {
                        env[n.destVar] = window._plainVFs.folders[target] || Object.keys(window._plainVFs.files);
                    } else {
                        env[n.destVar] = [];
                    }
                } else if (n.action === 'delete') {
                    if (n.isFolder) {
                        delete window._plainVFs.folders[target];
                    } else {
                        delete window._plainVFs.files[target];
                    }
                } else if (n.action === 'copy') {
                    const dest = await this.eval(n.dest, env);
                    if (n.isFolder) {
                        window._plainVFs.folders[dest] = [...(window._plainVFs.folders[target] || [])];
                    } else {
                        window._plainVFs.files[dest] = window._plainVFs.files[target] || 'copied_content';
                    }
                }
                break;
            }
        }
    }

    async execMath(n, env) {
        const val = await this.eval(n.value, env);
        if (n.op === 'add' && Array.isArray(env[n.target])) { env[n.target].push(val); return; }
        const cur = this.getVar(n.target, env, n.line);
        if (n.op === 'add') env[n.target] = cur + val;
        else if (n.op === 'subtract') env[n.target] = cur - val;
        else if (n.op === 'multiply') env[n.target] = cur * val;
        else if (n.op === 'divide') { if (val === 0) throw new PlainError(`Oops! Division by zero on line ${n.line}.`, n.line); let r; if (Number.isInteger(cur) && Number.isInteger(val)) { r = Math.floor(cur / val); } else { r = cur / val; } env[n.target] = r; }
    }

    async callFn(name, argNodes, env, line) {
        const fn = this.fns[name];
        if (!fn) throw new PlainError(`I don't know a function called '${name}' on line ${line}. Define it first!`, line);
        const args = [];
        for (const a of argNodes) args.push(await this.eval(a, env));
        if (args.length !== fn.params.length) throw new PlainError(`'${name}' expects ${fn.params.length} values but got ${args.length} on line ${line}.`, line);
        const fEnv = { ...this.vars };
        fn.params.forEach((p, i) => fEnv[p] = args[i]);
        try { await this.execBlock(fn.body, fEnv); } catch (e) { if (e instanceof ReturnSignal) return e.value; throw e; }
        return null;
    }

    getVar(name, env, line) {
        if (name === '__today__') {
            const today = new Date();
            const yyyy = today.getFullYear();
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const dd = String(today.getDate()).padStart(2, '0');
            return `${yyyy}-${mm}-${dd}`;
        }
        if (name in env) return env[name];
        if (name in this.vars) return this.vars[name];
        throw new PlainError(`Hmm, '${name}' hasn't been set yet. Try 'set ${name} to ...' first!`, line);
    }

    async eval(n, env) {
        if (!n) return null;
        switch (n.type) {
            case 'Num': return n.value;
            case 'Str': return n.value;
            case 'Bool': return n.value;
            case 'VarRef': return this.getVar(n.name, env);
            case 'SizeOf': { const l = this.getVar(n.list, env); if (Array.isArray(l)) return l.length; if (l && l._isTable) return l.rows.length; throw new PlainError(`'${n.list}' is not a list or table.`); }
            case 'ListAccess': { const l = this.getVar(n.list, env); const i = await this.eval(n.index, env); if (i < 1 || i > l.length) throw new PlainError(`Can't get item ${i} from '${n.list}' — it has ${l.length} items.`); return l[i - 1]; }
            case 'Concat': return String(await this.eval(n.left, env)) + String(await this.eval(n.right, env));
            case 'BinOp': {
                const l = await this.eval(n.left, env);
                if (n.op === 'is_empty') {
                    if (l === null || l === undefined) return true;
                    if (typeof l === 'string') return l.trim() === '';
                    if (Array.isArray(l)) return l.length === 0;
                    return false;
                }
                if (n.op === 'is_not_empty') {
                    if (l === null || l === undefined) return false;
                    if (typeof l === 'string') return l.trim() !== '';
                    if (Array.isArray(l)) return l.length !== 0;
                    return true;
                }
                const r = await this.eval(n.right, env);
                const strL = String(l);
                const strR = String(r);
                if (n.op === 'starts_with') return strL.startsWith(strR);
                if (n.op === 'ends_with') return strL.endsWith(strR);
                if (n.op === 'contains') return strL.includes(strR);
                throw new PlainError(`Unknown BinOp operator: ${n.op}`);
            }
            case 'Cmp': { const l = await this.eval(n.left, env), r = await this.eval(n.right, env); return n.op === 'eq' ? l === r : n.op === 'neq' ? l !== r : n.op === 'gt' ? l > r : n.op === 'lt' ? l < r : n.op === 'gte' ? l >= r : l <= r; }
            case 'LogicalOp': { const l = await this.eval(n.left, env); return n.op === 'and' ? l && await this.eval(n.right, env) : l || await this.eval(n.right, env); }

            // ── Built-in functions (1 arg) ──
            case 'BuiltinFn': {
                const v = await this.eval(n.arg, env);
                switch (n.fn) {
                    case 'round': return Math.round(v);
                    case 'floor': return Math.floor(v);
                    case 'ceiling': return Math.ceil(v);
                    case 'absolute': return Math.abs(v);
                    case 'sqrt': return Math.sqrt(v);
                    case 'uppercase': return String(v).toUpperCase();
                    case 'lowercase': return String(v).toLowerCase();
                    case 'length': return typeof v === 'string' ? v.length : Array.isArray(v) ? v.length : 0;
                    case 'trimmed': return String(v).trim();
                    case 'toNumber': { const num = Number(v); if (isNaN(num)) throw new PlainError(`Can't convert '${v}' to a number.`); return num; }
                    case 'toText': return String(v);
                    default: throw new PlainError(`Unknown function: ${n.fn}`);
                }
            }

            // ── Built-in functions (2 args) ──
            case 'BuiltinFn2': {
                const a = await this.eval(n.arg1, env);
                const b = await this.eval(n.arg2, env);
                switch (n.fn) {
                    case 'power': return Math.pow(a, b);
                    case 'remainder': return a % b;
                    case 'random': return Math.floor(Math.random() * (b - a + 1)) + a;
                    case 'character': return String(b).charAt(a - 1) || '';
                    default: throw new PlainError(`Unknown function: ${n.fn}`);
                }
            }

            // ── Built-in functions (3 args) ──
            case 'BuiltinFn3': {
                const a = await this.eval(n.arg1, env);
                const b = await this.eval(n.arg2, env);
                const c = await this.eval(n.arg3, env);
                switch (n.fn) {
                    case 'replaced': return String(c).split(String(a)).join(String(b));
                    default: throw new PlainError(`Unknown function: ${n.fn}`);
                }
            }

            // ── Table operations ──
            case 'ColumnExtract': {
                const tbl = this.getVar(n.table, env);
                if (!tbl || !tbl._isTable) throw new PlainError(`'${n.table}' is not a table.`);
                if (!tbl.headers.includes(n.column)) throw new PlainError(`Column '${n.column}' not found. Available: ${tbl.headers.join(', ')}`);
                return tbl.rows.map(r => r[n.column]);
            }
            case 'RowExtract': {
                const tbl = this.getVar(n.table, env);
                if (!tbl || !tbl._isTable) throw new PlainError(`'${n.table}' is not a table.`);
                const idx = await this.eval(n.index, env);
                if (idx < 1 || idx > tbl.rows.length) throw new PlainError(`Row ${idx} doesn't exist — table has ${tbl.rows.length} rows.`);
                return tbl.rows[idx - 1];
            }
            case 'CellExtract': {
                const tbl = this.getVar(n.table, env);
                if (!tbl || !tbl._isTable) throw new PlainError(`'${n.table}' is not a table.`);
                const idx = await this.eval(n.index, env);
                if (idx < 1 || idx > tbl.rows.length) throw new PlainError(`Row ${idx} doesn't exist.`);
                if (!tbl.headers.includes(n.column)) throw new PlainError(`Column '${n.column}' not found.`);
                return tbl.rows[idx - 1][n.column];
            }
            case 'TableStat': {
                const tbl = this.getVar(n.table, env);
                if (!tbl || !tbl._isTable) throw new PlainError(`'${n.table}' is not a table.`);
                if (!tbl.headers.includes(n.column)) throw new PlainError(`Column '${n.column}' not found.`);
                const vals = tbl.rows.map(r => r[n.column]).filter(v => typeof v === 'number');
                if (vals.length === 0) throw new PlainError(`No numeric values in column '${n.column}'.`);
                switch (n.op) {
                    case 'average': return vals.reduce((a, b) => a + b, 0) / vals.length;
                    case 'sum': return vals.reduce((a, b) => a + b, 0);
                    case 'maximum': return Math.max(...vals);
                    case 'minimum': return Math.min(...vals);
                    default: throw new PlainError(`Unknown stat: ${n.op}`);
                }
            }
            case 'CountRows': {
                const tbl = this.getVar(n.table, env);
                if (!tbl || !tbl._isTable) throw new PlainError(`'${n.table}' is not a table.`);
                return tbl.rows.length;
            }

            default: throw new PlainError(`I don't know how to evaluate: ${n.type}`);
        }
    }
}

// Export for app.js
window.PlainInterpreter = PlainInterpreter;
window.PlainError = PlainError;
window.parseCSV = parseCSV;
