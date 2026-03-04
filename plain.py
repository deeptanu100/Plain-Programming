#!/usr/bin/env python3
"""
Plain — A programming language that reads like English.
Version 1.0

Usage:
    python plain.py <filename.plain>
    python plain.py                     (interactive REPL)
"""

import sys
import re
import os
import time
import json
import threading
import datetime
import shutil
import tkinter as tk

# Conditional multimedia imports
try:
    import pyttsx3
    import speech_recognition as sr
    HAS_SPEECH = True
except ImportError:
    HAS_SPEECH = False

try:
    import winsound
    HAS_WINSOUND = True
except ImportError:
    HAS_WINSOUND = False

# ============================================================================
# TOKEN TYPES
# ============================================================================

class TokenType:
    # Literals
    NUMBER = 'NUMBER'
    STRING = 'STRING'
    IDENTIFIER = 'IDENTIFIER'
    BOOLEAN = 'BOOLEAN'

    # Keywords
    SET = 'SET'
    TO = 'TO'
    ADD = 'ADD'
    SUBTRACT = 'SUBTRACT'
    FROM = 'FROM'
    MULTIPLY = 'MULTIPLY'
    DIVIDE = 'DIVIDE'
    BY = 'BY'
    IF = 'IF'
    THEN = 'THEN'
    ELSE = 'ELSE'
    END = 'END'
    REPEAT = 'REPEAT'
    TIMES = 'TIMES'
    WHILE = 'WHILE'
    FOR = 'FOR'
    EACH = 'EACH'
    IN = 'IN'
    SAY = 'SAY'
    SHOW = 'SHOW'
    ASK = 'ASK'
    AND = 'AND'
    OR = 'OR'
    SAVE = 'SAVE'
    DEFINE = 'DEFINE'
    USING = 'USING'
    RUN = 'RUN'
    WITH = 'WITH'
    RETURN = 'RETURN'
    CREATE = 'CREATE'
    LIST = 'LIST'
    CALLED = 'CALLED'
    REMOVE = 'REMOVE'
    ITEM = 'ITEM'
    SIZE = 'SIZE'
    OF = 'OF'
    IS = 'IS'
    NOT = 'NOT'
    EQUAL = 'EQUAL'
    GREATER = 'GREATER'
    LESS = 'LESS'
    THAN = 'THAN'

    # Timers & UI
    AFTER = 'AFTER'
    SECONDS = 'SECONDS'
    EVERY = 'EVERY'
    MINUTES = 'MINUTES'
    STOP = 'STOP'
    RUNNING = 'RUNNING'
    WINDOW = 'WINDOW'
    WIDTH = 'WIDTH'
    HEIGHT = 'HEIGHT'
    BUTTON = 'BUTTON'
    TEXT = 'TEXT'
    WHEN = 'WHEN'
    CLICKED = 'CLICKED'

    # Pattern Matching
    CHARACTER = 'CHARACTER'
    LETTER = 'LETTER'
    STARTS = 'STARTS'
    ENDS = 'ENDS'
    CONTAINS = 'CONTAINS'
    EMPTY = 'EMPTY'

    # Speech
    SPEAK = 'SPEAK'
    LISTEN = 'LISTEN'

    # Storage
    REMEMBER = 'REMEMBER'
    AS = 'AS'
    RECALL = 'RECALL'
    FORGET = 'FORGET'

    # Dates
    DATE = 'DATE'
    TIME = 'TIME'
    YEARS = 'YEARS'
    TODAY = 'TODAY'
    WEEKEND = 'WEEKEND'

    # Sound
    PLAY = 'PLAY'
    SOUND = 'SOUND'
    LOOP = 'LOOP'
    MUSIC = 'MUSIC'

    # File Management
    FOLDER = 'FOLDER'
    EXISTS = 'EXISTS'
    DELETE = 'DELETE'
    COPY = 'COPY'
    FILES = 'FILES'

    # Operators
    PLUS = 'PLUS'
    COMMA = 'COMMA'

    # Special
    EOF = 'EOF'
    NEWLINE = 'NEWLINE'


class Token:
    def __init__(self, type_, value, line):
        self.type = type_
        self.value = value
        self.line = line

    def __repr__(self):
        return f'Token({self.type}, {self.value!r}, line={self.line})'


# ============================================================================
# LEXER
# ============================================================================

KEYWORDS = {
    'set': TokenType.SET,
    'to': TokenType.TO,
    'add': TokenType.ADD,
    'subtract': TokenType.SUBTRACT,
    'from': TokenType.FROM,
    'multiply': TokenType.MULTIPLY,
    'divide': TokenType.DIVIDE,
    'by': TokenType.BY,
    'if': TokenType.IF,
    'then': TokenType.THEN,
    'else': TokenType.ELSE,
    'end': TokenType.END,
    'repeat': TokenType.REPEAT,
    'times': TokenType.TIMES,
    'while': TokenType.WHILE,
    'for': TokenType.FOR,
    'each': TokenType.EACH,
    'in': TokenType.IN,
    'say': TokenType.SAY,
    'show': TokenType.SHOW,
    'ask': TokenType.ASK,
    'and': TokenType.AND,
    'or': TokenType.OR,
    'save': TokenType.SAVE,
    'define': TokenType.DEFINE,
    'using': TokenType.USING,
    'run': TokenType.RUN,
    'with': TokenType.WITH,
    'return': TokenType.RETURN,
    'create': TokenType.CREATE,
    'list': TokenType.LIST,
    'called': TokenType.CALLED,
    'remove': TokenType.REMOVE,
    'item': TokenType.ITEM,
    'size': TokenType.SIZE,
    'of': TokenType.OF,
    'is': TokenType.IS,
    'not': TokenType.NOT,
    'equal': TokenType.EQUAL,
    'greater': TokenType.GREATER,
    'less': TokenType.LESS,
    'than': TokenType.THAN,
    'after': TokenType.AFTER,
    'seconds': TokenType.SECONDS,
    'every': TokenType.EVERY,
    'minutes': TokenType.MINUTES,
    'stop': TokenType.STOP,
    'running': TokenType.RUNNING,
    'window': TokenType.WINDOW,
    'width': TokenType.WIDTH,
    'height': TokenType.HEIGHT,
    'button': TokenType.BUTTON,
    'text': TokenType.TEXT,
    'when': TokenType.WHEN,
    'clicked': TokenType.CLICKED,
    'character': TokenType.CHARACTER,
    'letter': TokenType.LETTER,
    'starts': TokenType.STARTS,
    'ends': TokenType.ENDS,
    'contains': TokenType.CONTAINS,
    'empty': TokenType.EMPTY,
    'speak': TokenType.SPEAK,
    'listen': TokenType.LISTEN,
    'remember': TokenType.REMEMBER,
    'as': TokenType.AS,
    'recall': TokenType.RECALL,
    'forget': TokenType.FORGET,
    'date': TokenType.DATE,
    'time': TokenType.TIME,
    'years': TokenType.YEARS,
    'today': TokenType.TODAY,
    'weekend': TokenType.WEEKEND,
    'play': TokenType.PLAY,
    'sound': TokenType.SOUND,
    'loop': TokenType.LOOP,
    'music': TokenType.MUSIC,
    'folder': TokenType.FOLDER,
    'exists': TokenType.EXISTS,
    'delete': TokenType.DELETE,
    'copy': TokenType.COPY,
    'files': TokenType.FILES,
}

BOOLEANS = {'true': True, 'false': False, 'yes': True, 'no': False}


class PlainError(Exception):
    """Base error class for Plain language with friendly messages."""
    def __init__(self, message, line=None):
        self.plain_message = message
        self.line = line
        super().__init__(message)


class Lexer:
    def __init__(self, source, filename='<input>'):
        self.source = source
        self.filename = filename
        self.pos = 0
        self.line = 1
        self.tokens = []

    def error(self, msg):
        raise PlainError(
            f"Hmm, I had trouble reading line {self.line}: {msg}",
            self.line
        )

    def peek(self):
        if self.pos < len(self.source):
            return self.source[self.pos]
        return None

    def advance(self):
        ch = self.source[self.pos]
        self.pos += 1
        if ch == '\n':
            self.line += 1
        return ch

    def skip_whitespace(self):
        while self.pos < len(self.source) and self.source[self.pos] in ' \t\r':
            self.pos += 1

    def skip_comment(self):
        # Skip // comments
        if self.pos < len(self.source) - 1 and self.source[self.pos:self.pos+2] == '//':
            while self.pos < len(self.source) and self.source[self.pos] != '\n':
                self.pos += 1
            return True
        return False

    def skip_note_comment(self):
        # Skip note: comments
        if self.pos + 4 < len(self.source):
            ahead = self.source[self.pos:self.pos+5].lower()
            if ahead == 'note:':
                while self.pos < len(self.source) and self.source[self.pos] != '\n':
                    self.pos += 1
                return True
        return False

    def read_string(self):
        quote = self.advance()  # consume opening quote
        result = ''
        start_line = self.line
        while self.pos < len(self.source):
            ch = self.peek()
            if ch == '\\':
                self.advance()
                next_ch = self.advance() if self.pos < len(self.source) else ''
                if next_ch == 'n':
                    result += '\n'
                elif next_ch == 't':
                    result += '\t'
                elif next_ch == '\\':
                    result += '\\'
                elif next_ch == quote:
                    result += quote
                else:
                    result += '\\' + next_ch
            elif ch == quote:
                self.advance()  # consume closing quote
                return Token(TokenType.STRING, result, start_line)
            elif ch == '\n':
                self.error("It looks like you forgot to close a text string with a quote mark.")
            else:
                result += self.advance()
        self.error("It looks like you forgot to close a text string with a quote mark.")

    def read_number(self):
        start = self.pos
        has_dot = False
        while self.pos < len(self.source) and (self.source[self.pos].isdigit() or self.source[self.pos] == '.'):
            if self.source[self.pos] == '.':
                if has_dot:
                    break
                has_dot = True
            self.pos += 1
        text = self.source[start:self.pos]
        value = float(text) if has_dot else int(text)
        return Token(TokenType.NUMBER, value, self.line)

    def read_word(self):
        start = self.pos
        while self.pos < len(self.source) and (self.source[self.pos].isalnum() or self.source[self.pos] == '_'):
            self.pos += 1
        word = self.source[start:self.pos]
        lower = word.lower()

        if lower in BOOLEANS:
            return Token(TokenType.BOOLEAN, BOOLEANS[lower], self.line)
        elif lower in KEYWORDS:
            return Token(KEYWORDS[lower], lower, self.line)
        else:
            return Token(TokenType.IDENTIFIER, lower, self.line)

    def tokenize(self):
        tokens = []
        while self.pos < len(self.source):
            self.skip_whitespace()
            if self.pos >= len(self.source):
                break

            ch = self.peek()

            # Newline
            if ch == '\n':
                self.advance()
                if tokens and tokens[-1].type != TokenType.NEWLINE:
                    tokens.append(Token(TokenType.NEWLINE, '\\n', self.line - 1))
                continue

            # Comments
            if self.skip_comment():
                continue
            if self.skip_note_comment():
                continue

            # Strings
            if ch in ('"', "'"):
                tokens.append(self.read_string())
                continue

            # Numbers (including negative)
            if ch.isdigit() or (ch == '-' and self.pos + 1 < len(self.source) and self.source[self.pos + 1].isdigit()):
                if ch == '-':
                    self.advance()
                    tok = self.read_number()
                    tok.value = -tok.value
                    tokens.append(tok)
                else:
                    tokens.append(self.read_number())
                continue

            # Words / keywords
            if ch.isalpha() or ch == '_':
                tokens.append(self.read_word())
                continue

            # Operators
            if ch == '+':
                tokens.append(Token(TokenType.PLUS, '+', self.line))
                self.advance()
                continue

            if ch == ',':
                tokens.append(Token(TokenType.COMMA, ',', self.line))
                self.advance()
                continue

            self.error(f"I don't recognize the character '{ch}'. Plain uses English words, not special symbols.")

        tokens.append(Token(TokenType.EOF, None, self.line))
        return tokens


# ============================================================================
# AST NODES
# ============================================================================

class ASTNode:
    pass

class Program(ASTNode):
    def __init__(self, statements):
        self.statements = statements

class SetVar(ASTNode):
    def __init__(self, name, value, line):
        self.name = name
        self.value = value
        self.line = line

class MathOp(ASTNode):
    def __init__(self, op, var_name, value, line):
        self.op = op          # 'add', 'subtract', 'multiply', 'divide'
        self.var_name = var_name
        self.value = value
        self.line = line

class Say(ASTNode):
    def __init__(self, value, line):
        self.value = value
        self.line = line

class Show(ASTNode):
    def __init__(self, var_name, line):
        self.var_name = var_name
        self.line = line

class Ask(ASTNode):
    def __init__(self, prompt, var_name, line):
        self.prompt = prompt
        self.var_name = var_name
        self.line = line

class IfBlock(ASTNode):
    def __init__(self, condition, body, elseif_blocks, else_body, line):
        self.condition = condition
        self.body = body
        self.elseif_blocks = elseif_blocks  # list of (condition, body)
        self.else_body = else_body
        self.line = line

class RepeatBlock(ASTNode):
    def __init__(self, count, body, line):
        self.count = count
        self.body = body
        self.line = line

class WhileBlock(ASTNode):
    def __init__(self, condition, body, line):
        self.condition = condition
        self.body = body
        self.line = line

class ForEachBlock(ASTNode):
    def __init__(self, item_name, list_name, body, line):
        self.item_name = item_name
        self.list_name = list_name
        self.body = body
        self.line = line

class DefineFunc(ASTNode):
    def __init__(self, name, params, body, line):
        self.name = name
        self.params = params
        self.body = body
        self.line = line

class RunFunc(ASTNode):
    def __init__(self, name, args, line):
        self.name = name
        self.args = args
        self.line = line

class SetToRunFunc(ASTNode):
    def __init__(self, var_name, func_name, args, line):
        self.var_name = var_name
        self.func_name = func_name
        self.args = args
        self.line = line

class ReturnStmt(ASTNode):
    def __init__(self, value, line):
        self.value = value
        self.line = line

class CreateList(ASTNode):
    def __init__(self, name, line):
        self.name = name
        self.line = line

# --- New Feature AST Nodes ---

class TimerStmt(ASTNode):
    def __init__(self, duration_expr, unit, func_name, line):
        self.duration_expr = duration_expr
        self.unit = unit      # 'seconds' or 'minutes'
        self.func_name = func_name
        self.line = line

class StopTimerStmt(ASTNode):
    def __init__(self, func_name, line):
        self.func_name = func_name
        self.line = line

class WindowCreateStmt(ASTNode):
    def __init__(self, name, width_expr, height_expr, line):
        self.name = name
        self.width_expr = width_expr
        self.height_expr = height_expr
        self.line = line

class UiElementStmt(ASTNode):
    def __init__(self, window_name, elem_type, text_expr, line):
        self.window_name = window_name
        self.elem_type = elem_type  # 'button'
        self.text_expr = text_expr
        self.line = line

class UiEventStmt(ASTNode):
    def __init__(self, elem_type, func_name, line):
        self.elem_type = elem_type
        self.func_name = func_name
        self.line = line

class UiShowStmt(ASTNode):
    def __init__(self, window_name, line):
        self.window_name = window_name
        self.line = line

class SpeakStmt(ASTNode):
    def __init__(self, expr, line):
        self.expr = expr
        self.line = line

class ListenStmt(ASTNode):
    def __init__(self, var_name, duration_expr, line):
        self.var_name = var_name
        self.duration_expr = duration_expr
        self.line = line

class RememberStmt(ASTNode):
    def __init__(self, var_name, key_expr, line):
        self.var_name = var_name
        self.key_expr = key_expr
        self.line = line

class RecallStmt(ASTNode):
    def __init__(self, key_expr, var_name, line):
        self.key_expr = key_expr
        self.var_name = var_name
        self.line = line

class ForgetStmt(ASTNode):
    def __init__(self, key_expr, line):
        self.key_expr = key_expr
        self.line = line

class PlaySoundStmt(ASTNode):
    def __init__(self, file_expr, loop, line):
        self.file_expr = file_expr
        self.loop = loop
        self.line = line

class StopSoundStmt(ASTNode):
    def __init__(self, line):
        self.line = line

class FileManageStmt(ASTNode):
    def __init__(self, action, target_expr, dest_expr, var_name, line):
        self.action = action  # 'create_folder', 'delete_file', 'copy_file', 'list_files'
        self.target_expr = target_expr
        self.dest_expr = dest_expr
        self.var_name = var_name
        self.line = line

class AddToList(ASTNode):
    def __init__(self, value, list_name, line):
        self.value = value
        self.list_name = list_name
        self.line = line

class RemoveFromList(ASTNode):
    def __init__(self, index, list_name, line):
        self.index = index
        self.list_name = list_name
        self.line = line

# Expression nodes
class NumberLit(ASTNode):
    def __init__(self, value):
        self.value = value

class StringLit(ASTNode):
    def __init__(self, value):
        self.value = value

class BoolLit(ASTNode):
    def __init__(self, value):
        self.value = value

class VarRef(ASTNode):
    def __init__(self, name):
        self.name = name

class BinOp(ASTNode):
    def __init__(self, left, op, right):
        self.left = left
        self.op = op
        self.right = right

class Comparison(ASTNode):
    def __init__(self, left, op, right):
        self.left = left
        self.op = op   # 'eq', 'neq', 'gt', 'lt', 'gte', 'lte'
        self.right = right

class LogicalOp(ASTNode):
    def __init__(self, left, op, right):
        self.left = left
        self.op = op   # 'and', 'or'
        self.right = right

class SizeOf(ASTNode):
    def __init__(self, list_name):
        self.list_name = list_name

class ListAccess(ASTNode):
    def __init__(self, list_name, index):
        self.list_name = list_name
        self.index = index

class Concat(ASTNode):
    def __init__(self, left, right):
        self.left = left
        self.right = right


# ============================================================================
# PARSER
# ============================================================================

class Parser:
    def __init__(self, tokens):
        self.tokens = tokens
        self.pos = 0

    def error(self, msg, line=None):
        if line is None:
            line = self.current().line
        raise PlainError(msg, line)

    def current(self):
        if self.pos < len(self.tokens):
            return self.tokens[self.pos]
        return self.tokens[-1]  # EOF

    def peek(self, offset=0):
        idx = self.pos + offset
        if idx < len(self.tokens):
            return self.tokens[idx]
        return self.tokens[-1]

    def advance(self):
        tok = self.current()
        self.pos += 1
        return tok

    def expect(self, type_, error_msg=None):
        tok = self.current()
        if tok.type != type_:
            if error_msg:
                self.error(error_msg, tok.line)
            else:
                self.error(
                    f"I expected '{type_}' but found '{tok.value}' instead on line {tok.line}.",
                    tok.line
                )
        return self.advance()

    def match(self, *types):
        if self.current().type in types:
            return self.advance()
        return None

    def skip_newlines(self):
        while self.current().type == TokenType.NEWLINE:
            self.advance()

    def parse(self):
        self.skip_newlines()
        stmts = self.parse_statements()
        return Program(stmts)

    def parse_statements(self, terminators=None):
        """Parse statements until we hit a terminator keyword or EOF."""
        if terminators is None:
            terminators = set()
        stmts = []
        while True:
            self.skip_newlines()
            tok = self.current()
            if tok.type == TokenType.EOF:
                break

            # Check terminators
            if tok.type == TokenType.END:
                break
            if tok.type == TokenType.ELSE:
                break

            stmt = self.parse_statement()
            if stmt is not None:
                stmts.append(stmt)
        return stmts

    def is_end_keyword(self, keyword):
        """Check if current position is 'end <keyword>'"""
        if self.current().type == TokenType.END:
            next_tok = self.peek(1)
            if next_tok.type == KEYWORDS.get(keyword, None):
                return True
        return False

    def parse_statement(self):
        tok = self.current()
        line = tok.line

        if tok.type == TokenType.SET:
            return self.parse_set()
        elif tok.type == TokenType.SAY:
            return self.parse_say()
        elif tok.type == TokenType.SHOW:
            return self.parse_show()
        elif tok.type == TokenType.ASK:
            return self.parse_ask()
        elif tok.type == TokenType.ADD:
            return self.parse_add()
        elif tok.type == TokenType.SUBTRACT:
            return self.parse_subtract()
        elif tok.type == TokenType.MULTIPLY:
            return self.parse_multiply()
        elif tok.type == TokenType.DIVIDE:
            return self.parse_divide()
        elif tok.type == TokenType.IF:
            return self.parse_if()
        elif tok.type == TokenType.REPEAT:
            return self.parse_repeat()
        elif tok.type == TokenType.WHILE:
            return self.parse_while()
        elif tok.type == TokenType.FOR:
            return self.parse_for_each()
        elif tok.type == TokenType.DEFINE:
            return self.parse_define()
        elif tok.type == TokenType.RUN:
            return self.parse_run()
        elif tok.type == TokenType.RETURN:
            return self.parse_return()
        elif tok.type == TokenType.CREATE:
            return self.parse_create()
        elif tok.type == TokenType.REMOVE:
            return self.parse_remove()
        
        # New Feature Parses
        elif tok.type == TokenType.AFTER:
            return self.parse_after()
        elif tok.type == TokenType.EVERY:
            return self.parse_every()
        elif tok.type == TokenType.STOP:
            return self.parse_stop()
        elif tok.type == TokenType.WINDOW:
            return self.parse_window()
        elif tok.type == TokenType.BUTTON:
            return self.parse_button()
        elif tok.type == TokenType.WHEN:
            return self.parse_when()
        elif tok.type == TokenType.SPEAK:
            return self.parse_speak()
        elif tok.type == TokenType.LISTEN:
            return self.parse_listen()
        elif tok.type == TokenType.REMEMBER:
            return self.parse_remember()
        elif tok.type == TokenType.RECALL:
            return self.parse_recall()
        elif tok.type == TokenType.FORGET:
            return self.parse_forget()
        elif tok.type == TokenType.PLAY:
            return self.parse_play()
        elif tok.type == TokenType.LOOP:
            return self.parse_loop()
        elif tok.type == TokenType.DELETE:
            return self.parse_delete()
        elif tok.type == TokenType.COPY:
            return self.parse_copy()
        elif tok.type == TokenType.LIST:
            return self.parse_list_files()
            
        elif tok.type == TokenType.NEWLINE:
            self.advance()
            return None
        else:
            self.error(
                f"I don't understand the instruction '{tok.value}' on line {line}. "
                f"Did you mean 'set', 'say', 'add', or another Plain keyword?",
                line
            )

    # --- SET ---
    def parse_set(self):
        line = self.current().line
        self.advance()  # consume 'set'
        name_tok = self.expect(TokenType.IDENTIFIER,
            f"I need a variable name after 'set' on line {line}. For example: set score to 100")
        self.expect(TokenType.TO,
            f"I expected 'to' after 'set {name_tok.value}' on line {line}. For example: set {name_tok.value} to 42")

        # Check if value is 'run <func> with ...'
        if self.current().type == TokenType.RUN:
            self.advance()  # consume 'run'
            func_name = self.expect(TokenType.IDENTIFIER,
                f"I need a function name after 'run' on line {line}.")
            args = []
            if self.match(TokenType.WITH):
                args = self.parse_arg_list()
            return SetToRunFunc(name_tok.value, func_name.value, args, line)

        # Check if value is 'size of <list>'
        if self.current().type == TokenType.SIZE:
            self.advance()
            self.expect(TokenType.OF, f"I expected 'of' after 'size' on line {line}.")
            list_tok = self.expect(TokenType.IDENTIFIER,
                f"I need a list name after 'size of' on line {line}.")
            return SetVar(name_tok.value, SizeOf(list_tok.value), line)

        # Check if value is '<list> item <number>'
        value = self.parse_expression()

        # Check for 'item' access: <list_ref> item <index>
        if isinstance(value, VarRef) and self.current().type == TokenType.ITEM:
            self.advance()  # consume 'item'
            index = self.parse_expression()
            value = ListAccess(value.name, index)

        return SetVar(name_tok.value, value, line)

    # --- CREATE (LIST/WINDOW) ---
    def parse_create(self):
        line = self.current().line
        self.advance()  # consume 'create'
        
        if self.match(TokenType.LIST):
            self.expect(TokenType.CALLED,
                f"I expected 'called' after 'create list' on line {line}.")
            name_tok = self.expect(TokenType.IDENTIFIER,
                f"I need a list name after 'called' on line {line}.")
            return CreateList(name_tok.value, line)
            
        elif self.match(TokenType.WINDOW):
            self.expect(TokenType.CALLED, f"Expected 'called' on line {line}.")
            name_tok = self.expect(TokenType.STRING, f"Expected window name in quotes on line {line}.")
            self.expect(TokenType.WITH, f"Expected 'with' on line {line}.")
            self.expect(TokenType.WIDTH, f"Expected 'width' on line {line}.")
            width = self.parse_expression()
            self.expect(TokenType.AND, f"Expected 'and' on line {line}.")
            self.expect(TokenType.HEIGHT, f"Expected 'height' on line {line}.")
            height = self.parse_expression()
            return WindowCreateStmt(name_tok.value, width, height, line)
            
        self.error(f"Expected 'list' or 'window' after create on line {line}.")
    def parse_say(self):
        line = self.current().line
        self.advance()  # consume 'say'
        value = self.parse_expression()
        return Say(value, line)

    # --- SHOW ---
    def parse_show(self):
        line = self.current().line
        self.advance()  # consume 'show'
        
        if self.match(TokenType.WINDOW):
            name_tok = self.expect(TokenType.STRING, f"Expected window name in quotes on line {line}.")
            return UiShowStmt(name_tok.value, line)
            
        name_tok = self.expect(TokenType.IDENTIFIER,
            f"I need a variable name after 'show' on line {line}.")
        return Show(name_tok.value, line)

    # --- ASK ---
    def parse_ask(self):
        line = self.current().line
        self.advance()  # consume 'ask'
        prompt = self.expect(TokenType.STRING,
            f"I need a question in quotes after 'ask' on line {line}. "
            f'For example: ask "What is your name?" and save to name')
        self.expect(TokenType.AND,
            f"I expected 'and save to <variable>' after the question on line {line}.")
        self.expect(TokenType.SAVE,
            f"I expected 'save' after 'and' on line {line}. "
            f'For example: ask "question" and save to name')
        self.expect(TokenType.TO,
            f"I expected 'to' after 'save' on line {line}.")
        var_tok = self.expect(TokenType.IDENTIFIER,
            f"I need a variable name to save the answer to on line {line}.")
        return Ask(StringLit(prompt.value), var_tok.value, line)

    # --- ADD ---
    def parse_add(self):
        line = self.current().line
        self.advance()  # consume 'add'
        
        # Check for UI Element: "add a button to <window> with text ..."
        # Usually it's "add a button to window"
        # Since 'a' is just an identifier here:
        if self.match(TokenType.IDENTIFIER) and self.peek(-1).value == 'a':
            if self.match(TokenType.BUTTON):
                self.expect(TokenType.TO, f"Expected 'to' on line {line}.")
                target = self.expect(TokenType.STRING, f"I need a window name in quotes after 'to' on line {line}.")
                self.expect(TokenType.WITH, f"Expected 'with' on line {line}.")
                self.expect(TokenType.TEXT, f"Expected 'text' on line {line}.")
                text_expr = self.parse_expression()
                return UiElementStmt(target.value, 'button', text_expr, line)
            else:
                self.pos -= 1 # backtrack if it wasn't a button
                
        value = self.parse_expression()
        self.expect(TokenType.TO,
            f"I expected 'to' after the value in 'add' on line {line}. "
            f"For example: add 5 to score")
        target = self.expect(TokenType.IDENTIFIER,
            f"I need a variable or list name after 'to' on line {line}.")
            
        return MathOp('add', target.value, value, line)

    # --- SUBTRACT ---
    def parse_subtract(self):
        line = self.current().line
        self.advance()  # consume 'subtract'
        value = self.parse_expression()
        self.expect(TokenType.FROM,
            f"I expected 'from' after the value in 'subtract' on line {line}. "
            f"For example: subtract 3 from score")
        target = self.expect(TokenType.IDENTIFIER,
            f"I need a variable name after 'from' on line {line}.")
        return MathOp('subtract', target.value, value, line)

    # --- MULTIPLY ---
    def parse_multiply(self):
        line = self.current().line
        self.advance()  # consume 'multiply'
        target = self.expect(TokenType.IDENTIFIER,
            f"I need a variable name after 'multiply' on line {line}. "
            f"For example: multiply score by 2")
        self.expect(TokenType.BY,
            f"I expected 'by' after 'multiply {target.value}' on line {line}.")
        value = self.parse_expression()
        return MathOp('multiply', target.value, value, line)

    # --- DIVIDE ---
    def parse_divide(self):
        line = self.current().line
        self.advance()  # consume 'divide'
        target = self.expect(TokenType.IDENTIFIER,
            f"I need a variable name after 'divide' on line {line}. "
            f"For example: divide score by 4")
        self.expect(TokenType.BY,
            f"I expected 'by' after 'divide {target.value}' on line {line}.")
        value = self.parse_expression()
        return MathOp('divide', target.value, value, line)

    # --- IF ---
    def parse_if(self):
        line = self.current().line
        self.advance()  # consume 'if'
        condition = self.parse_condition()
        self.expect(TokenType.THEN,
            f"I expected 'then' after the condition on line {line}. "
            f"For example: if score is greater than 50 then")
        self.skip_newlines()
        body = self.parse_statements()

        elseif_blocks = []
        else_body = []

        while self.current().type == TokenType.ELSE:
            self.advance()  # consume 'else'
            if self.current().type == TokenType.IF:
                # else if
                self.advance()  # consume 'if'
                elif_line = self.current().line
                elif_cond = self.parse_condition()
                self.expect(TokenType.THEN,
                    f"I expected 'then' after the condition on line {elif_line}.")
                self.skip_newlines()
                elif_body = self.parse_statements()
                elseif_blocks.append((elif_cond, elif_body))
            else:
                # else
                self.skip_newlines()
                else_body = self.parse_statements()
                break

        self.expect(TokenType.END,
            f"It looks like you started an 'if' block on line {line} but forgot to close it with 'end if'.")
        self.expect(TokenType.IF,
            f"I expected 'if' after 'end' on line {self.current().line} to close the if-block from line {line}.")
        return IfBlock(condition, body, elseif_blocks, else_body, line)

    # --- REPEAT ---
    def parse_repeat(self):
        line = self.current().line
        self.advance()  # consume 'repeat'
        count = self.parse_expression()
        self.expect(TokenType.TIMES,
            f"I expected 'times' after the number in 'repeat' on line {line}. "
            f"For example: repeat 5 times")
        self.skip_newlines()
        body = self.parse_statements()
        self.expect(TokenType.END,
            f"It looks like you started a 'repeat' block on line {line} but forgot to close it with 'end repeat'.")
        self.expect(TokenType.REPEAT,
            f"I expected 'repeat' after 'end' on line {self.current().line}.")
        return RepeatBlock(count, body, line)

    # --- WHILE ---
    def parse_while(self):
        line = self.current().line
        self.advance()  # consume 'while'
        condition = self.parse_condition()
        self.skip_newlines()
        body = self.parse_statements()
        self.expect(TokenType.END,
            f"It looks like you started a 'while' block on line {line} but forgot to close it with 'end while'.")
        self.expect(TokenType.WHILE,
            f"I expected 'while' after 'end' on line {self.current().line}.")
        return WhileBlock(condition, body, line)

    # --- FOR EACH ---
    def parse_for_each(self):
        line = self.current().line
        self.advance()  # consume 'for'
        self.expect(TokenType.EACH,
            f"I expected 'each' after 'for' on line {line}. "
            f"For example: for each item in my_list")
        item_tok = self.expect(TokenType.IDENTIFIER,
            f"I need an item variable name after 'for each' on line {line}.")
        self.expect(TokenType.IN,
            f"I expected 'in' after 'for each {item_tok.value}' on line {line}.")
        list_tok = self.expect(TokenType.IDENTIFIER,
            f"I need a list name after 'in' on line {line}.")
        self.skip_newlines()
        body = self.parse_statements()
        self.expect(TokenType.END,
            f"It looks like you started a 'for each' block on line {line} but forgot to close it with 'end for'.")
        self.expect(TokenType.FOR,
            f"I expected 'for' after 'end' on line {self.current().line}.")
        return ForEachBlock(item_tok.value, list_tok.value, body, line)

    # --- DEFINE ---
    def parse_define(self):
        line = self.current().line
        self.advance()  # consume 'define'
        name_tok = self.expect(TokenType.IDENTIFIER,
            f"I need a function name after 'define' on line {line}.")
        params = []
        if self.match(TokenType.USING):
            # Parse parameter list
            params.append(self.expect(TokenType.IDENTIFIER,
                f"I need parameter names after 'using' on line {line}.").value)
            while self.match(TokenType.COMMA):
                params.append(self.expect(TokenType.IDENTIFIER,
                    f"I need a parameter name after the comma on line {line}.").value)
        self.skip_newlines()
        body = self.parse_statements()
        self.expect(TokenType.END,
            f"It looks like you started defining '{name_tok.value}' on line {line} but forgot to close it with 'end define'.")
        self.expect(TokenType.DEFINE,
            f"I expected 'define' after 'end' on line {self.current().line}.")
        return DefineFunc(name_tok.value, params, body, line)

    # --- RUN ---
    def parse_run(self):
        line = self.current().line
        self.advance()  # consume 'run'
        name_tok = self.expect(TokenType.IDENTIFIER,
            f"I need a function name after 'run' on line {line}.")
        args = []
        if self.match(TokenType.WITH):
            args = self.parse_arg_list()
        return RunFunc(name_tok.value, args, line)

    def parse_arg_list(self):
        args = [self.parse_expression()]
        while self.match(TokenType.COMMA):
            args.append(self.parse_expression())
        return args

    # --- RETURN ---
    def parse_return(self):
        line = self.current().line
        self.advance()  # consume 'return'
        value = self.parse_expression()
        return ReturnStmt(value, line)

    # --- CREATE LIST ---
    def parse_create_list(self):
        line = self.current().line
        self.advance()  # consume 'create'
        self.expect(TokenType.LIST,
            f"I expected 'list' after 'create' on line {line}. "
            f"For example: create list called fruits")
        self.expect(TokenType.CALLED,
            f"I expected 'called' after 'create list' on line {line}.")
        name_tok = self.expect(TokenType.IDENTIFIER,
            f"I need a list name after 'called' on line {line}.")
        return CreateList(name_tok.value, line)

    # --- REMOVE ---
    def parse_remove(self):
        line = self.current().line
        self.advance()  # consume 'remove'
        self.expect(TokenType.ITEM,
            f"I expected 'item' after 'remove' on line {line}. "
            f"For example: remove item 1 from fruits")
        index = self.parse_expression()
        self.expect(TokenType.FROM,
            f"I expected 'from' after the index in 'remove' on line {line}.")
        list_tok = self.expect(TokenType.IDENTIFIER,
            f"I need a list name after 'from' on line {line}.")
        return RemoveFromList(index, list_tok.value, line)

    # =========================================================================
    # NEW FEATURE PARSERS
    # =========================================================================

    def parse_after(self):
        line = self.current().line
        self.advance() # consume 'after'
        duration = self.parse_expression()
        unit_tok = self.expect_any_of([TokenType.SECONDS, TokenType.MINUTES], f"Expected 'seconds' or 'minutes' on line {line}.")
        self.expect(TokenType.RUN, f"Expected 'run' on line {line}.")
        func_tok = self.expect(TokenType.IDENTIFIER, f"Expected function name on line {line}.")
        return TimerStmt(duration, unit_tok.value, func_tok.value, line)

    def parse_every(self):
        line = self.current().line
        self.advance() # consume 'every'
        duration = self.parse_expression()
        unit_tok = self.expect_any_of([TokenType.SECONDS, TokenType.MINUTES], f"Expected 'seconds' or 'minutes' on line {line}.")
        self.expect(TokenType.RUN, f"Expected 'run' on line {line}.")
        func_tok = self.expect(TokenType.IDENTIFIER, f"Expected function name on line {line}.")
        return TimerStmt(duration, f"every_{unit_tok.value}", func_tok.value, line)

    def parse_stop(self):
        line = self.current().line
        self.advance() # consume 'stop'
        if self.match(TokenType.RUNNING):
            func_tok = self.expect(TokenType.IDENTIFIER, f"Expected function name on line {line}.")
            return StopTimerStmt(func_tok.value, line)
        if self.match(TokenType.ALL):
            self.expect(TokenType.SOUNDS, f"Expected 'sounds' on line {line}.")
            return StopSoundStmt(line)
        self.error(f"Expected 'running <func>' or 'all sounds' after stop on line {line}.")

    def parse_window(self):
        # NOTE: Called from parse_create since "create window"
        # Wait, 'create a window' should start with parse_create.
        pass

    def parse_button(self):
        # Called from 'add a button to window with text ...' -> Handled in parse_add!
        pass

    def parse_when(self):
        line = self.current().line
        self.advance() # consume 'when'
        
        # 'when button is clicked run <func>'
        if self.match(TokenType.BUTTON):
            self.expect(TokenType.IS, f"Expected 'is' on line {line}.")
            self.expect(TokenType.CLICKED, f"Expected 'clicked' on line {line}.")
            self.expect(TokenType.RUN, f"Expected 'run' on line {line}.")
            func_tok = self.expect(TokenType.IDENTIFIER, f"Expected function name on line {line}.")
            # The UI event hook currently requires the button name. 
            # In Plain, we say "when button is clicked run X". This implies the last created button or all buttons?
            # For simplicity, let's treat "button" as the token and rely on execution logic
            # OR we can say "when my_button is clicked run X".
            # If the user says "when start_btn is clicked", it's an IDENTIFIER.
            return UiEventStmt('button', func_tok.value, line)
            
        elem_tok = self.expect(TokenType.IDENTIFIER, f"Expected UI element name on line {line}.")
        self.expect(TokenType.IS, f"Expected 'is' on line {line}.")
        self.expect(TokenType.CLICKED, f"Expected 'clicked' on line {line}.")
        self.expect(TokenType.RUN, f"Expected 'run' on line {line}.")
        func_tok = self.expect(TokenType.IDENTIFIER, f"Expected function name on line {line}.")
        return UiEventStmt(elem_tok.value, func_tok.value, line)

    def parse_speak(self):
        line = self.current().line
        self.advance() # consume 'speak'
        expr = self.parse_expression()
        return SpeakStmt(expr, line)

    def parse_listen(self):
        line = self.current().line
        self.advance() # consume 'listen'
        self.expect(TokenType.AND, f"Expected 'and' on line {line}.")
        self.expect(TokenType.SAVE, f"Expected 'save' on line {line}.")
        self.expect(TokenType.TO, f"Expected 'to' on line {line}.")
        var_tok = self.expect(TokenType.IDENTIFIER, f"Expected variable name on line {line}.")
        return ListenStmt(var_tok.value, NumberLit(5), line)

    def parse_remember(self):
        line = self.current().line
        self.advance() # consume 'remember'
        var_tok = self.expect(TokenType.IDENTIFIER, f"Expected variable name on line {line}.")
        self.expect(TokenType.AS, f"Expected 'as' on line {line}.")
        key_expr = self.parse_expression()
        return RememberStmt(var_tok.value, key_expr, line)

    def parse_recall(self):
        line = self.current().line
        self.advance() # consume 'recall'
        key_expr = self.parse_expression()
        self.expect(TokenType.AND, f"Expected 'and' on line {line}.")
        self.expect(TokenType.SAVE, f"Expected 'save' on line {line}.")
        self.expect(TokenType.TO, f"Expected 'to' on line {line}.")
        var_tok = self.expect(TokenType.IDENTIFIER, f"Expected variable name on line {line}.")
        return RecallStmt(key_expr, var_tok.value, line)

    def parse_forget(self):
        line = self.current().line
        self.advance() # consume 'forget'
        key_expr = self.parse_expression()
        return ForgetStmt(key_expr, line)

    def parse_play(self):
        line = self.current().line
        self.advance() # consume 'play'
        self.expect(TokenType.SOUND, f"Expected 'sound' on line {line}.")
        file_expr = self.parse_expression()
        return PlaySoundStmt(file_expr, False, line)

    def parse_loop(self):
        line = self.current().line
        self.advance() # consume 'loop'
        self.expect(TokenType.MUSIC, f"Expected 'music' on line {line}.")
        file_expr = self.parse_expression()
        return PlaySoundStmt(file_expr, True, line)

    def parse_list_files(self):
        line = self.current().line
        # 'list files in folder ... and save to ...'
        # Token LIST already consumed if entered from parse_statement, but let's check
        if self.current().type == TokenType.LIST:
            self.advance()
        self.expect(TokenType.FILES, f"Expected 'files' on line {line}.")
        self.expect(TokenType.IN, f"Expected 'in' on line {line}.")
        # Optional 'folder' keyword for flexibility
        if self.current().type == TokenType.FOLDER:
            self.advance()
        folder_expr = self.parse_expression()
        self.expect(TokenType.AND, f"Expected 'and' on line {line}.")
        self.expect(TokenType.SAVE, f"Expected 'save' on line {line}.")
        self.expect(TokenType.TO, f"Expected 'to' on line {line}.")
        var_tok = self.expect(TokenType.IDENTIFIER, f"Expected variable name on line {line}.")
        return FileManageStmt('list_files', folder_expr, None, var_tok.value, line)

    def parse_delete(self):
        line = self.current().line
        self.advance() # consume 'delete'
        self.expect(TokenType.FILE, f"Expected 'file' on line {line}.") # need TokenType.FILE
        file_expr = self.parse_expression()
        return FileManageStmt('delete_file', file_expr, None, None, line)

    def parse_copy(self):
        line = self.current().line
        self.advance() # consume 'copy'
        src_expr = self.parse_expression()
        self.expect(TokenType.TO, f"Expected 'to' on line {line}.")
        dest_expr = self.parse_expression()
        return FileManageStmt('copy_file', src_expr, dest_expr, None, line)

    def expect_any_of(self, types, error_msg):
        tok = self.current()
        if tok.type not in types:
            self.error(error_msg, tok.line)
        return self.advance()

    # --- CONDITIONS ---
    def parse_condition(self):
        left = self.parse_single_condition()

        while self.current().type in (TokenType.AND, TokenType.OR):
            op_tok = self.advance()
            right = self.parse_single_condition()
            left = LogicalOp(left, op_tok.type.lower() if isinstance(op_tok.type, str) else op_tok.value, right)

        return left

    def parse_single_condition(self):
        left = self.parse_expression()

        if self.current().type == TokenType.IS:
            self.advance()  # consume 'is'

            # Check for 'not'
            negated = False
            if self.current().type == TokenType.NOT:
                negated = True
                self.advance()

            if self.current().type == TokenType.EQUAL:
                self.advance()  # consume 'equal'
                self.expect(TokenType.TO, "I expected 'to' after 'equal'.")
                right = self.parse_expression()
                op = 'neq' if negated else 'eq'
                return Comparison(left, op, right)

            elif self.current().type == TokenType.EMPTY:
                self.advance() # consume 'empty'
                return Comparison(left, 'is_not_empty' if negated else 'is_empty', None)

            elif self.current().type == TokenType.GREATER:
                self.advance()  # consume 'greater'
                self.expect(TokenType.THAN, "I expected 'than' after 'greater'.")
                # Check for 'or equal to'
                if self.current().type == TokenType.OR:
                    self.advance()
                    self.expect(TokenType.EQUAL, "I expected 'equal' after 'or'.")
                    self.expect(TokenType.TO, "I expected 'to' after 'equal'.")
                    right = self.parse_expression()
                    return Comparison(left, 'gte', right)
                right = self.parse_expression()
                return Comparison(left, 'gt', right)

            elif self.current().type == TokenType.LESS:
                self.advance()  # consume 'less'
                self.expect(TokenType.THAN, "I expected 'than' after 'less'.")
                # Check for 'or equal to'
                if self.current().type == TokenType.OR:
                    self.advance()
                    self.expect(TokenType.EQUAL, "I expected 'equal' after 'or'.")
                    self.expect(TokenType.TO, "I expected 'to' after 'equal'.")
                    right = self.parse_expression()
                    return Comparison(left, 'lte', right)
                right = self.parse_expression()
                return Comparison(left, 'lt', right)

            elif self.current().type == TokenType.BOOLEAN:
                val = self.advance().value
                if negated:
                    val = not val
                return Comparison(left, 'eq', BoolLit(val))

            else:
                self.error(
                    f"I expected a comparison like 'equal to', 'greater than', or 'less than' on line {self.current().line}."
                )

        return left

    # --- EXPRESSIONS ---
    def parse_expression(self):
        """Parse an expression with concatenation (+)."""
        left = self.parse_atom()

        while self.current().type == TokenType.PLUS:
            self.advance()  # consume '+'
            right = self.parse_atom()
            left = Concat(left, right)

        return left

    def parse_atom(self):
        tok = self.current()

        if tok.type == TokenType.NUMBER:
            self.advance()
            return NumberLit(tok.value)

        if tok.type == TokenType.STRING:
            self.advance()
            return StringLit(tok.value)

        if tok.type == TokenType.BOOLEAN:
            self.advance()
            return BoolLit(tok.value)

        if tok.type == TokenType.SIZE:
            self.advance()
            self.expect(TokenType.OF, "I expected 'of' after 'size'.")
            list_tok = self.expect(TokenType.IDENTIFIER,
                "I need a list name after 'size of'.")
            return SizeOf(list_tok.value)

        if tok.type == TokenType.IDENTIFIER:
            self.advance()
            # Check for list access: <list> item <index>
            if self.current().type == TokenType.ITEM:
                self.advance()
                index = self.parse_atom()
                return ListAccess(tok.value, index)
            # Property accesses or pattern matching syntax checks
            if self.match(TokenType.STARTS):
                self.expect(TokenType.WITH, f"Expected 'with' after starts.")
                return BinOp(VarRef(tok.value), 'starts_with', self.parse_atom())
            if self.match(TokenType.ENDS):
                self.expect(TokenType.WITH, f"Expected 'with' after ends.")
                return BinOp(VarRef(tok.value), 'ends_with', self.parse_atom())
            if self.match(TokenType.CONTAINS):
                return BinOp(VarRef(tok.value), 'contains', self.parse_atom())
            return VarRef(tok.value)

        # Dates
        if tok.type == TokenType.TODAY:
            self.advance()
            return VarRef("__today__") # Handled in execute
            
        if tok.type == TokenType.CURRENT: # if you add it to tokens
            pass # Skipping exact current date/time parse for now to rely on basic strings

        self.error(
            f"I expected a value (number, text, or variable name) but found '{tok.value}' on line {tok.line}.",
            tok.line
        )


# ============================================================================
# INTERPRETER
# ============================================================================

class ReturnSignal(Exception):
    """Used internally to handle return statements in functions."""
    def __init__(self, value):
        self.value = value


class Environment:
    def __init__(self, parent=None):
        self.vars = {}
        self.parent = parent

    def get(self, name, line=None):
        lower = name.lower()
        if lower in self.vars:
            return self.vars[lower]
        if self.parent:
            return self.parent.get(name, line)
        raise PlainError(
            f"Hmm, it looks like '{name}' hasn't been set yet. "
            f"Try using 'set {name} to ...' first!",
            line
        )

    def set(self, name, value):
        self.vars[name.lower()] = value

    def has(self, name):
        lower = name.lower()
        if lower in self.vars:
            return True
        if self.parent:
            return self.parent.has(name)
        return False


class Interpreter:
    def __init__(self, output_callback=None, input_callback=None):
        self.global_env = Environment()
        self.functions = {}
        self.output_callback = output_callback or (lambda text: print(text))
        self.input_callback = input_callback or (lambda prompt: input(prompt))

    def run(self, program):
        try:
            self.execute_block(program.statements, self.global_env)
            if hasattr(self, "_root") and self._root:
                self._root.mainloop()
        except ReturnSignal:
            pass
        except PlainError:
            raise
        except Exception as e:
            raise PlainError(f"Something unexpected happened: {e}")

    def execute_block(self, statements, env):
        for stmt in statements:
            self.execute(stmt, env)

    def execute(self, node, env):
        if hasattr(self, "_root") and self._root:
            self._root.update()

        if isinstance(node, SetVar):
            value = self.evaluate(node.value, env)
            env.set(node.name, value)

        elif isinstance(node, MathOp):
            self.execute_math(node, env)

        elif isinstance(node, Say):
            value = self.evaluate(node.value, env)
            self.output_callback(str(value))

        elif isinstance(node, Show):
            value = env.get(node.var_name, node.line)
            self.output_callback(str(value))

        # --- NEW FEATURES EXECUTORS ---
        
        elif isinstance(node, WindowCreateStmt):
            if not hasattr(self, "_root") or not self._root:
                self._root = tk.Tk()
                self._root.title("Plain UI")
            win = tk.Toplevel(self._root)
            win.title(node.name)
            w = int(self.evaluate(node.width_expr, env))
            h = int(self.evaluate(node.height_expr, env))
            win.geometry(f"{w}x{h}")
            win.withdraw() # Hide until 'show window'
            env.set(node.name, {"type": "window", "tk": win, "elements": []})
            
        elif isinstance(node, UiElementStmt):
            win_obj = env.get(node.window_name, node.line)
            if not isinstance(win_obj, dict) or win_obj.get("type") != "window":
                raise PlainError(f"'{node.window_name}' is not a window.")
            text = str(self.evaluate(node.text_expr, env))
            
            # create var for element automatically just using 'button_Text' for now or handle via event
            btn = tk.Button(win_obj["tk"], text=text)
            btn.pack(pady=5)
            # Store in env by text lowercased + '_btn' so events can hook
            elem_name = text.lower().replace(" ", "_").replace("'", "").replace('"', "") + "_btn"
            btn_obj = {"type": "button", "tk": btn}
            env.set(elem_name, btn_obj)
            env.set("button", btn_obj)
            
        elif isinstance(node, UiShowStmt):
            win_obj = env.get(node.window_name, node.line)
            if not isinstance(win_obj, dict) or win_obj.get("type") != "window":
                raise PlainError(f"'{node.window_name}' is not a window.")
            win_obj["tk"].deiconify()
            
        elif isinstance(node, UiEventStmt):
            elem_obj = env.get(node.elem_type, node.line) # elem_type here is the elem name created
            if not isinstance(elem_obj, dict) or "tk" not in elem_obj:
                raise PlainError(f"'{node.elem_type}' is not a UI element.")
                
            def cmd():
                self.call_function(node.func_name, [], env, node.line)
                
            elem_obj["tk"].config(command=cmd)

        # --- NEW FEATURES EXECUTORS ---
        
        elif isinstance(node, TimerStmt):
            duration = self.evaluate(node.duration_expr, env)
            multiplier = 60 if node.unit.endswith('minutes') else 1
            delay = float(duration) * multiplier
            
            def run_timer():
                self.call_function(node.func_name, [], env, node.line)
                
            if node.unit.startswith('every'):
                def run_interval():
                    while not getattr(self, f"_stop_{node.func_name}", False):
                        time.sleep(delay)
                        if getattr(self, f"_stop_{node.func_name}", False): break
                        run_timer()
                t = threading.Thread(target=run_interval, daemon=True)
                t.start()
            else:
                t = threading.Timer(delay, run_timer)
                t.start()
                
        elif isinstance(node, StopTimerStmt):
            setattr(self, f"_stop_{node.func_name}", True)
            
        elif isinstance(node, SpeakStmt):
            text = str(self.evaluate(node.expr, env))
            if HAS_SPEECH:
                engine = pyttsx3.init()
                engine.say(text)
                engine.runAndWait()
            else:
                self.output_callback(f"[Speech Synthesis Mock]: {text}")
                
        elif isinstance(node, ListenStmt):
            dur = float(self.evaluate(node.duration_expr, env))
            if HAS_SPEECH:
                r = sr.Recognizer()
                with sr.Microphone() as source:
                    self.output_callback(f"...listening for {dur} seconds...")
                    try:
                        audio = r.listen(source, timeout=dur, phrase_time_limit=dur)
                        text = r.recognize_google(audio)
                        env.set(node.var_name, text)
                    except Exception:
                        env.set(node.var_name, "")
            else:
                # Mock listen
                env.set(node.var_name, self.input_callback(f"[Speech Mock] Pretend to speak: "))
                
        elif isinstance(node, RememberStmt):
            key = str(self.evaluate(node.key_expr, env))
            val = env.get(node.var_name, node.line)
            data = {}
            if os.path.exists('.plain_memory.json'):
                with open('.plain_memory.json', 'r') as f:
                    data = json.load(f)
            data[key] = val
            with open('.plain_memory.json', 'w') as f:
                json.dump(data, f)
                
        elif isinstance(node, RecallStmt):
            key = str(self.evaluate(node.key_expr, env))
            val = None
            if os.path.exists('.plain_memory.json'):
                with open('.plain_memory.json', 'r') as f:
                    data = json.load(f)
                    val = data.get(key, None)
            env.set(node.var_name, val)
            
        elif isinstance(node, ForgetStmt):
            key = str(self.evaluate(node.key_expr, env))
            if os.path.exists('.plain_memory.json'):
                with open('.plain_memory.json', 'r') as f:
                    data = json.load(f)
                if key in data:
                    del data[key]
                with open('.plain_memory.json', 'w') as f:
                    json.dump(data, f)

        elif isinstance(node, PlaySoundStmt):
            file_path = str(self.evaluate(node.file_expr, env))
            if HAS_WINSOUND and file_path.endswith('.wav'):
                flags = winsound.SND_ASYNC | winsound.SND_FILENAME
                if node.loop: flags |= winsound.SND_LOOP
                winsound.PlaySound(file_path, flags)
            else:
                self.output_callback(f"[Audio Mock]: Playing {file_path}")

        elif isinstance(node, StopSoundStmt):
            if HAS_WINSOUND:
                winsound.PlaySound(None, winsound.SND_PURGE)
            else:
                self.output_callback(f"[Audio Mock]: Stopped sounds")

        elif isinstance(node, FileManageStmt):
            if node.action == 'list_files':
                folder = str(self.evaluate(node.target_expr, env))
                files = os.listdir(folder) if os.path.exists(folder) else []
                env.set(node.var_name, files)
            elif node.action == 'delete_file':
                file = str(self.evaluate(node.target_expr, env))
                if os.path.exists(file): os.remove(file)
            elif node.action == 'copy_file':
                src = str(self.evaluate(node.target_expr, env))
                dst = str(self.evaluate(node.dest_expr, env))
                if os.path.exists(src): shutil.copy2(src, dst)

        elif isinstance(node, Ask):
            prompt = self.evaluate(node.prompt, env)
            answer = self.input_callback(str(prompt))
            # Try to convert to number
            try:
                answer = int(answer)
            except ValueError:
                try:
                    answer = float(answer)
                except ValueError:
                    pass  # Keep as string
            env.set(node.var_name, answer)

        elif isinstance(node, IfBlock):
            self.execute_if(node, env)

        elif isinstance(node, RepeatBlock):
            count = self.evaluate(node.count, env)
            if not isinstance(count, (int, float)):
                raise PlainError(
                    f"I expected a number for how many times to repeat on line {node.line}, "
                    f"but got '{count}' instead.",
                    node.line
                )
            for _ in range(int(count)):
                self.execute_block(node.body, env)

        elif isinstance(node, WhileBlock):
            iterations = 0
            max_iterations = 1000000
            while self.evaluate(node.condition, env):
                self.execute_block(node.body, env)
                iterations += 1
                if iterations > max_iterations:
                    raise PlainError(
                        f"Your 'while' loop on line {node.line} has been running for over "
                        f"{max_iterations} rounds. It might be stuck in an infinite loop! "
                        f"Check your condition.",
                        node.line
                    )

        elif isinstance(node, ForEachBlock):
            lst = env.get(node.list_name, node.line)
            if not isinstance(lst, list):
                raise PlainError(
                    f"I expected '{node.list_name}' to be a list on line {node.line}, "
                    f"but it's a {type(lst).__name__} instead.",
                    node.line
                )
            for item in lst:
                loop_env = Environment(env)
                loop_env.set(node.item_name, item)
                self.execute_block(node.body, loop_env)

        elif isinstance(node, DefineFunc):
            self.functions[node.name.lower()] = node

        elif isinstance(node, RunFunc):
            self.call_function(node.name, node.args, env, node.line)

        elif isinstance(node, SetToRunFunc):
            result = self.call_function(node.func_name, node.args, env, node.line)
            env.set(node.var_name, result)

        elif isinstance(node, ReturnStmt):
            value = self.evaluate(node.value, env)
            raise ReturnSignal(value)

        elif isinstance(node, CreateList):
            env.set(node.name, [])

        elif isinstance(node, AddToList):
            # This is handled via MathOp 'add' — but also handle here for explicit list adds
            value = self.evaluate(node.value, env)
            lst = env.get(node.list_name, node.line)
            if isinstance(lst, list):
                lst.append(value)
            else:
                raise PlainError(
                    f"I tried to add to '{node.list_name}' on line {node.line}, "
                    f"but it's not a list.",
                    node.line
                )

        elif isinstance(node, RemoveFromList):
            index = self.evaluate(node.index, env)
            lst = env.get(node.list_name, node.line)
            if not isinstance(lst, list):
                raise PlainError(
                    f"I tried to remove from '{node.list_name}' on line {node.line}, "
                    f"but it's not a list.",
                    node.line
                )
            if not isinstance(index, (int, float)):
                raise PlainError(
                    f"I need a number for the item position to remove on line {node.line}.",
                    node.line
                )
            idx = int(index) - 1  # 1-based to 0-based
            if idx < 0 or idx >= len(lst):
                raise PlainError(
                    f"I can't remove item {int(index)} from '{node.list_name}' on line {node.line} "
                    f"because the list only has {len(lst)} items.",
                    node.line
                )
            lst.pop(idx)

    def execute_math(self, node, env):
        value = self.evaluate(node.value, env)

        # Check if target is a list → means "add to list"
        if node.op == 'add' and env.has(node.var_name):
            target = env.get(node.var_name, node.line)
            if isinstance(target, list):
                target.append(value)
                return

        current = env.get(node.var_name, node.line)

        if node.op == 'add':
            if isinstance(current, (int, float)) and isinstance(value, (int, float)):
                env.set(node.var_name, current + value)
            else:
                raise PlainError(
                    f"I can't add '{value}' to '{node.var_name}' on line {node.line}. "
                    f"Both need to be numbers for math.",
                    node.line
                )
        elif node.op == 'subtract':
            if isinstance(current, (int, float)) and isinstance(value, (int, float)):
                env.set(node.var_name, current - value)
            else:
                raise PlainError(
                    f"I can't subtract from '{node.var_name}' on line {node.line}. "
                    f"Both values need to be numbers.",
                    node.line
                )
        elif node.op == 'multiply':
            if isinstance(current, (int, float)) and isinstance(value, (int, float)):
                env.set(node.var_name, current * value)
            else:
                raise PlainError(
                    f"I can't multiply '{node.var_name}' on line {node.line}. "
                    f"Both values need to be numbers.",
                    node.line
                )
        elif node.op == 'divide':
            if isinstance(current, (int, float)) and isinstance(value, (int, float)):
                if value == 0:
                    raise PlainError(
                        f"Oops! You tried to divide '{node.var_name}' by zero on line {node.line}, "
                        f"which isn't possible.",
                        node.line
                    )
                if isinstance(current, int) and isinstance(value, int):
                    result = current // value
                else:
                    result = current / value
                env.set(node.var_name, result)
            else:
                raise PlainError(
                    f"I can't divide '{node.var_name}' on line {node.line}. "
                    f"Both values need to be numbers.",
                    node.line
                )

    def execute_if(self, node, env):
        if self.evaluate(node.condition, env):
            self.execute_block(node.body, env)
            return

        for cond, body in node.elseif_blocks:
            if self.evaluate(cond, env):
                self.execute_block(body, env)
                return

        if node.else_body:
            self.execute_block(node.else_body, env)

    def call_function(self, name, arg_nodes, env, line):
        lower = name.lower()
        if lower not in self.functions:
            raise PlainError(
                f"I don't know a function called '{name}' on line {line}. "
                f"Did you forget to define it with 'define {name} ...'?",
                line
            )
        func = self.functions[lower]
        args = [self.evaluate(a, env) for a in arg_nodes]

        if len(args) != len(func.params):
            raise PlainError(
                f"The function '{name}' expects {len(func.params)} "
                f"{'value' if len(func.params) == 1 else 'values'} "
                f"({', '.join(func.params)}), but you gave it {len(args)} on line {line}.",
                line
            )

        func_env = Environment(self.global_env)
        for param, arg in zip(func.params, args):
            func_env.set(param, arg)

        try:
            self.execute_block(func.body, func_env)
        except ReturnSignal as ret:
            return ret.value
        return None

    def evaluate(self, node, env):
        if isinstance(node, NumberLit):
            return node.value
        elif isinstance(node, StringLit):
            return node.value
        elif isinstance(node, BoolLit):
            return node.value
        elif isinstance(node, VarRef):
            if node.name == "__today__":
                return datetime.date.today().strftime("%Y-%m-%d")
            return env.get(node.name)
        elif isinstance(node, SizeOf):
            lst = env.get(node.list_name)
            if isinstance(lst, list):
                return len(lst)
            raise PlainError(
                f"I can't get the size of '{node.list_name}' because it's not a list."
            )
        elif isinstance(node, ListAccess):
            lst = env.get(node.list_name)
            index = self.evaluate(node.index, env)
            if not isinstance(lst, list):
                raise PlainError(f"'{node.list_name}' is not a list, so I can't get an item from it.")
            if not isinstance(index, (int, float)):
                raise PlainError(f"I need a number to get an item from '{node.list_name}', but got '{index}'.")
            idx = int(index) - 1  # 1-based
            if idx < 0 or idx >= len(lst):
                raise PlainError(
                    f"I can't get item {int(index)} from '{node.list_name}' because "
                    f"it only has {len(lst)} items."
                )
            return lst[idx]
        elif isinstance(node, Concat):
            left = self.evaluate(node.left, env)
            right = self.evaluate(node.right, env)
            return str(left) + str(right)
        elif isinstance(node, BinOp):
            left = self.evaluate(node.left, env)
            right = self.evaluate(node.right, env) if getattr(node, 'right', None) else None
            
            if node.op == 'starts_with': return str(left).startswith(str(right))
            elif node.op == 'ends_with': return str(left).endswith(str(right))
            elif node.op == 'contains': 
                if isinstance(left, list): return right in left
                return str(right) in str(left)
            elif node.op == 'is_empty':
                if isinstance(left, (list, str)): return len(left) == 0
                return False
                
        elif isinstance(node, Comparison):
            left = self.evaluate(node.left, env)
            right = self.evaluate(node.right, env)
            if node.op == 'eq':
                return left == right
            elif node.op == 'neq':
                return left != right
            elif node.op == 'gt':
                return left > right
            elif node.op == 'lt':
                return left < right
            elif node.op == 'gte':
                return left >= right
            elif node.op == 'lte':
                return left <= right
        elif isinstance(node, LogicalOp):
            left = self.evaluate(node.left, env)
            if node.op == 'and':
                return left and self.evaluate(node.right, env)
            elif node.op == 'or':
                return left or self.evaluate(node.right, env)
        else:
            raise PlainError(f"I encountered something I don't know how to evaluate: {type(node).__name__}")


# ============================================================================
# MAIN — CLI ENTRY POINT
# ============================================================================

def run_file(filename):
    """Run a .plain file."""
    if not os.path.exists(filename):
        print(f"\n  Oops! I can't find the file '{filename}'.")
        print(f"  Make sure the file exists and the path is correct.\n")
        sys.exit(1)

    with open(filename, 'r', encoding='utf-8') as f:
        source = f.read()

    try:
        lexer = Lexer(source, filename)
        tokens = lexer.tokenize()
        parser = Parser(tokens)
        program = parser.parse()
        interpreter = Interpreter()
        interpreter.run(program)
    except PlainError as e:
        line_info = f" (line {e.line})" if e.line else ""
        print(f"\n  ❌ {e.plain_message}{line_info}\n")
        sys.exit(1)


def run_repl():
    """Run the interactive Plain REPL."""
    print()
    print("  ╔══════════════════════════════════════════╗")
    print("  ║       Welcome to Plain v1.0              ║")
    print("  ║  A language that reads like English      ║")
    print("  ║                                          ║")
    print("  ║  Type your Plain code and press Enter.   ║")
    print("  ║  Type 'quit' or 'exit' to leave.         ║")
    print("  ╚══════════════════════════════════════════╝")
    print()

    interpreter = Interpreter()
    buffer = []
    block_depth = 0

    block_starters = {'if', 'repeat', 'while', 'for', 'define'}

    while True:
        try:
            if block_depth > 0:
                prompt = "  ... "
            else:
                prompt = "  plain> "

            line = input(prompt)

            if line.strip().lower() in ('quit', 'exit') and block_depth == 0:
                print("\n  Goodbye! Happy coding in Plain! 👋\n")
                break

            buffer.append(line)
            stripped = line.strip().lower()

            # Track block depth
            first_word = stripped.split()[0] if stripped.split() else ''
            if first_word in block_starters:
                block_depth += 1
            if first_word == 'end':
                block_depth = max(0, block_depth - 1)

            if block_depth > 0:
                continue

            # Execute buffered code
            source = '\n'.join(buffer)
            buffer = []

            if not source.strip():
                continue

            try:
                lexer = Lexer(source, '<repl>')
                tokens = lexer.tokenize()
                parser = Parser(tokens)
                program = parser.parse()
                interpreter.run(program)
            except PlainError as e:
                line_info = f" (line {e.line})" if e.line else ""
                print(f"  ❌ {e.plain_message}{line_info}")

        except (EOFError, KeyboardInterrupt):
            print("\n\n  Goodbye! Happy coding in Plain! 👋\n")
            break


def main():
    if len(sys.argv) > 1:
        run_file(sys.argv[1])
    else:
        run_repl()


if __name__ == '__main__':
    main()
