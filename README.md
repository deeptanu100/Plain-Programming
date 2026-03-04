<p align="center">
  <img src="https://img.shields.io/badge/language-Plain-7c3aed?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJ3aGl0ZSI+PHRleHQgeD0iNCIgeT0iMjAiIGZvbnQtc2l6ZT0iMjAiIGZvbnQtZmFtaWx5PSJzZXJpZiIgZm9udC13ZWlnaHQ9ImJvbGQiPlA8L3RleHQ+PC9zdmc+" alt="Plain">
  <img src="https://img.shields.io/badge/version-1.0-34d399?style=for-the-badge" alt="Version">
  <img src="https://img.shields.io/badge/license-Custom-f59e0b?style=for-the-badge" alt="License">
  <img src="https://img.shields.io/badge/python-3.8+-3b82f6?style=for-the-badge&logo=python&logoColor=white" alt="Python">
</p>

# Plain 🗣️

**A programming language that reads like English.**

Plain is designed so anyone who speaks English can read and write code without prior programming experience. No brackets, braces, semicolons, or cryptic symbols — just clear, readable instructions.

```plain
set name to "World"
say "Hello, " + name + "!"

repeat 3 times
    say "Plain is awesome!"
end repeat
```

---

## ✨ Features

| Category | Highlights |
|----------|-----------|
| 🗣️ **Natural Syntax** | Code reads like instructions to a human |
| 🔤 **Case-Insensitive** | `set`, `SET`, and `Set` all work |
| 💬 **Friendly Errors** | No `SyntaxError` or `NullPointerException` — errors are in plain English |
| 🧮 **Core Language** | Variables, math, conditions, loops, functions, and lists |
| 📅 **Date & Time** | Built-in `today` keyword and timer scheduling |
| 🔍 **Pattern Matching** | `starts with`, `contains`, `ends with`, `is empty` |
| 💾 **Memory** | `remember`, `recall`, and `forget` for persistent key-value storage |
| 🎵 **Audio & Speech** | `play sound` and `speak` for multimedia |
| 🖼️ **Window UI** | Create windows, buttons, and handle click events |
| 📂 **Virtual File System** | `list files in`, `write file`, `read file` |
| 🐍 **Python Interpreter** | Run `.plain` files from the command line |
| 🌐 **Web Playground** | Jupyter-style notebook in the browser |
| 🎨 **VS Code Extension** | Syntax highlighting for `.plain` files |

---

## 🚀 Quick Start

### Option 1: Python Interpreter

```bash
# Run a Plain program
python plain.py examples/greeting.plain

# Interactive REPL
python plain.py
```

### Option 2: Web Playground

```bash
cd playground
python -m http.server 8000
# Open http://localhost:8000 in your browser
```

The web playground features a dark-themed Jupyter-style notebook with:
- 🎨 Syntax-highlighted code cells
- ▶️ One-click execution
- 📚 Built-in example programs
- ❓ Keyword reference panel
- 📱 Responsive mobile layout

---

## 📖 Language Reference

### Variables & Output
```plain
set name to "Alice"
set age to 25
say "Hello, " + name + "! You are " + age + " years old."
```

### Input
```plain
ask "What is your name? " and save to user_name
say "Nice to meet you, " + user_name + "!"
```

### Math
```plain
set score to 100
add 50 to score
subtract 20 from score
multiply score by 2
divide score by 4
say "Final score: " + score
```

### Conditions
```plain
if score is greater than 200 then
    say "Amazing!"
else if score is greater than 100 then
    say "Great job!"
else
    say "Keep trying!"
end if
```

### Loops
```plain
// Count-based loop
repeat 5 times
    say "Hello!"
end repeat

// While loop
set count to 1
while count is less than or equal to 10
    say count
    add 1 to count
end while

// For-each loop
create list called fruits
add "apple" to fruits
add "banana" to fruits
for each fruit in fruits
    say "I like " + fruit
end for
```

### Functions
```plain
define greet using name
    say "Hello, " + name + "!"
end define

call greet with "World"
```

### Pattern Matching
```plain
set sentence to "The quick brown fox"

if sentence starts with "The" then
    say "Starts with 'The'"
end if

if sentence contains "brown" then
    say "Found 'brown'!"
end if
```

### Date & Timers
```plain
say "Today is: " + today

define alarm
    say "Time's up!"
end define

after 5 seconds run alarm
```

### Memory (Persistent Storage)
```plain
remember "Alice" as "username"
recall "username" to name
say "Welcome back, " + name + "!"
forget "username"
```

### Window UI (Web Playground)
```plain
create window called "My App" with width 400 and height 300
add a button to "My App" with text "Click Me"

define on_click
    say "Button clicked!"
    speak "Hello from Plain!"
end define

when button is clicked run on_click
show window "My App"
```

### Audio & Speech (Web Playground)
```plain
speak "Hello, I am Plain!"
play sound "notification.wav"
```

For the complete specification, see:
- 📘 [Language Specification](docs/language_spec.md)
- 📋 [Keyword Reference](docs/keyword_reference.md)
- 💡 [Extension Ideas](docs/extension_ideas.md)

---

## 📁 Project Structure

```
Plain Programming/
├── plain.py                          # Python interpreter + REPL
├── README.md                         # This file
├── .gitignore
│
├── docs/
│   ├── language_spec.md              # Full language specification
│   ├── keyword_reference.md          # Keyword cheat sheet
│   └── extension_ideas.md            # Future feature ideas
│
├── examples/                         # Example Plain programs
│   ├── greeting.plain                # Hello + greeting
│   ├── guessing_game.plain           # Number guessing game
│   ├── calculator.plain              # Basic calculator
│   ├── todo_list.plain               # To-do list manager
│   ├── fizzbuzz.plain                # FizzBuzz challenge
│   ├── pattern_timer_test.plain      # Pattern matching + dates
│   ├── test_all_features.plain       # Comprehensive feature test
│   ├── timer_tests.plain             # Timer/scheduler demo
│   ├── ui_test.plain                 # Window UI demo
│   ├── vfs_demo.plain                # Virtual file system demo
│   └── web_ui_demo.plain             # Web UI + speech demo
│
├── playground/                       # Web-based IDE
│   ├── index.html                    # Notebook interface
│   ├── style.css                     # Dark theme + responsive CSS
│   ├── app.js                        # UI controller logic
│   └── plain_interpreter.js          # JavaScript interpreter
│
└── vscode-extension/                 # VS Code syntax support
    ├── package.json                  # Extension manifest
    ├── language-configuration.json   # Editor config (brackets, etc.)
    └── syntaxes/
        └── plain.tmLanguage.json     # TextMate grammar
```

---

## 🛠️ Development

### Requirements
- **Python 3.8+** for the command-line interpreter
- Any modern **web browser** for the playground
- **VS Code** (optional) for syntax highlighting

### Running the Playground Locally
```bash
cd playground
python -m http.server 8000
```
Then open [http://localhost:8000](http://localhost:8000).

### Installing the VS Code Extension
1. Open VS Code
2. Go to Extensions → `...` → "Install from VSIX" (or copy the folder to `~/.vscode/extensions/`)
3. Open any `.plain` file to see syntax highlighting

---

## 🤝 Contributing

Plain is open to contributions! Here's how you can help:

1. **Report bugs** — Open an issue if something doesn't work
2. **Add examples** — Write cool `.plain` programs and submit a PR
3. **Extend the language** — See [extension_ideas.md](docs/extension_ideas.md) for planned features
4. **Improve the playground** — UI enhancements, themes, or new editor features

---

## 📄 License

**Custom License** — see [LICENSE](LICENSE) for full terms.

- ✅ Free to use, modify, and build upon
- ❌ Cannot directly sell the Software as a standalone product
- 📝 Commercial derivative works require written authorization with signatures from the Author, Head Engineer, and Founder
- 🏷️ Proper attribution and credit required in all derivative works
- ⚖️ Disputes subject to exclusive jurisdiction of the **Delhi High Court, New Delhi, India**
- 🔒 License text is **immutable** — unauthorized modification voids all granted rights

---

<p align="center">
  <i>Made with ❤️ to make programming accessible to everyone.</i>
</p>
