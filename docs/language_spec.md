# Plain Language Specification v1.0

**Plain** is a programming language that reads like English. Anyone who speaks English can read and write Plain code without prior coding experience.

---

## Core Principles

1. Every keyword is a common English word
2. No brackets, braces, semicolons, or cryptic symbols
3. Code reads like instructions to a smart human
4. Errors are explained in plain English
5. Case-insensitive: `set`, `SET`, and `Set` all work
6. Indentation is optional but encouraged for readability

---

## 1. Variables

### Declaration
```plain
set <name> to <value>
```
Variables are created on first use. No type declarations needed — Plain infers the type.

**Supported types:**
| Type | Examples |
|------|---------|
| Number | `42`, `3.14`, `-7` |
| Text (String) | `"Hello"`, `"Plain is fun"` |
| Boolean | `true`, `false`, `yes`, `no` |
| List | Created via `create list called ...` |

### Naming Rules
- Variable names can contain letters, numbers, and underscores
- Must start with a letter
- Case-insensitive: `score`, `Score`, and `SCORE` refer to the same variable
- Spaces in names are NOT allowed (use underscores: `my_score`)

### Examples
```plain
set name to "Alice"
set age to 25
set is_active to true
set pi to 3.14159
```

---

## 2. Math & Operations

### Arithmetic
```plain
add <value> to <variable>
subtract <value> from <variable>
multiply <variable> by <value>
divide <variable> by <value>
```

All operations modify the variable in-place and work with both numbers and variables.

### Examples
```plain
set score to 100
add 5 to score           // score is now 105
subtract 3 from score    // score is now 102
multiply score by 2      // score is now 204
divide score by 4        // score is now 51
```

### Expressions in Conditions
Plain supports inline comparison expressions:
- `<value> is equal to <value>`
- `<value> is not equal to <value>`
- `<value> is greater than <value>`
- `<value> is less than <value>`
- `<value> is greater than or equal to <value>`
- `<value> is less than or equal to <value>`

### String Concatenation
Use `+` to join text:
```plain
say "Hello, " + name + "!"
```

---

## 3. Conditions (if / else if / else)

### Syntax
```plain
if <condition> then
    <statements>
else if <condition> then
    <statements>
else
    <statements>
end if
```

### Conditions
Conditions use natural English comparisons:
```plain
if age is greater than 18 then
if name is equal to "Alice" then
if score is less than or equal to 50 then
if is_active is true then
```

### Logical Operators
```plain
if age is greater than 18 and name is equal to "Alice" then
if score is less than 10 or lives is equal to 0 then
```

### Examples
```plain
if age is greater than 18 then
    say "You are an adult"
else if age is equal to 18 then
    say "You just became an adult!"
else
    say "You are a minor"
end if
```

---

## 4. Loops

### Repeat Loop (counted)
```plain
repeat <number> times
    <statements>
end repeat
```

### While Loop (conditional)
```plain
while <condition>
    <statements>
end while
```

### For Each Loop (iterate over list)
```plain
for each <item_name> in <list_name>
    <statements>
end for
```

### Examples
```plain
// Print "Hello" 5 times
repeat 5 times
    say "Hello"
end repeat

// Count up to 10
set count to 0
while count is less than 10
    add 1 to count
    say count
end while

// Print all fruits
for each fruit in fruits
    say fruit
end for
```

---

## 5. Input & Output

### Output
```plain
say <value>           // Print a value with a newline
show <variable>       // Display a variable's value
```

### Input
```plain
ask "<prompt>" and save to <variable>
```

The `ask` statement always reads text. If you need a number, use the value in a math operation — Plain will convert it automatically.

### Examples
```plain
say "Hello, World!"
ask "What is your name?" and save to name
say "Nice to meet you, " + name + "!"
show name
```

---

## 6. Functions

### Define a Function
```plain
define <name> using <param1>, <param2>, ...
    <statements>
end define
```

Functions with no parameters:
```plain
define <name>
    <statements>
end define
```

### Call a Function
```plain
run <name> with <arg1>, <arg2>, ...
run <name>                                // No arguments
```

### Return Values
```plain
define double using number
    set result to number
    multiply result by 2
    return result
end define

set x to run double with 5
say x    // Prints 10
```

### Examples
```plain
define greet using person_name
    say "Hello, " + person_name + "!"
end define

run greet with "Alice"
run greet with "Bob"
```

---

## 7. Lists

### Create a List
```plain
create list called <name>
```

### Add Items
```plain
add <value> to <list_name>
```

### Access Items
```plain
set item to <list_name> item <number>    // 1-based index
```

### Remove Items
```plain
remove item <number> from <list_name>
```

### List Length
```plain
set length to size of <list_name>
```

### Iterate
```plain
for each <item_name> in <list_name>
    say item_name
end for
```

### Examples
```plain
create list called fruits
add "apple" to fruits
add "banana" to fruits
add "cherry" to fruits

say "I have " + size of fruits + " fruits"

for each fruit in fruits
    say fruit
end for
```

---

## 8. Advanced Features

### 8.1 Timers & Schedulers
```plain
after <number> seconds run <function_name>
every <number> minutes run <function_name>
stop running <function_name>
```

### 8.2 UI Creation
```plain
create window called <name> with width <w> and height <h>
add a button to <window_name> with text <string>
when button is clicked run <function_name>
show window <name>
```

### 8.3 Pattern Matching & Strings
Expressions can include string matchers:
```plain
if text starts with <string>
if text ends with <string>
if text contains <string>
if text is empty
```

### 8.4 Audio & Speech
```plain
speak <string>
listen and save to <variable_name>
play sound <filepath>
play sound <filepath> loop
stop sound
```

### 8.5 Persistent Storage
Data can be saved across sessions.
```plain
remember <variable> as <string_key>
recall <string_key> and save to <variable>
forget <string_key>
```

### 8.6 Dates
The `today` variable automatically provides the current date.
```plain
set current_date to today
```

### 8.7 File Management
```plain
list files in <directory_path> and save to <list_name>
copy files <source> to <destination>
delete folder <folder_path>
```

## 9. Comments

### Single-Line Comments
```plain
// This is a comment
note: This is also a comment
```

Comments are ignored during execution and are for human readers only.

---

## 10. Block Structure

All blocks are terminated with an `end` keyword:

| Block | Terminator |
|-------|-----------|
| `if ... then` | `end if` |
| `repeat ... times` | `end repeat` |
| `while ...` | `end while` |
| `for each ...` | `end for` |
| `define ...` | `end define` |

Indentation inside blocks is optional but strongly recommended for readability.

---

| Unknown command | "I don't understand the instruction on line 5. Did you mean 'set' or 'say'?" |

---

## 11. Error Messages

Plain never shows cryptic error codes. All errors are explained in friendly English:

| Situation | Error Message |
|-----------|--------------|
| Undefined variable | "Hmm, it looks like 'x' hasn't been set yet. Try using `set x to ...` first!" |
| Division by zero | "Oops! You tried to divide by zero, which isn't possible." |
| Wrong type | "I expected a number here, but got text instead. Try using a number." |
| Missing end | "It looks like you started a block but forgot to close it with 'end if'." |
| Unknown command | "I don't understand the instruction on line 5. Did you mean 'set' or 'say'?" |

---

## 12. Reserved Keywords

The following words are reserved and cannot be used as variable names:

`set`, `to`, `add`, `subtract`, `from`, `multiply`, `by`, `divide`, `if`, `then`, `else`, `end`, `repeat`, `times`, `while`, `for`, `each`, `in`, `say`, `show`, `ask`, `and`, `save`, `define`, `using`, `run`, `with`, `return`, `create`, `list`, `called`, `remove`, `item`, `size`, `of`, `is`, `not`, `equal`, `greater`, `less`, `than`, `or`, `true`, `false`, `yes`, `no`, `note`, `after`, `seconds`, `every`, `minutes`, `stop`, `running`, `window`, `width`, `height`, `button`, `text`, `when`, `clicked`, `character`, `letter`, `starts`, `ends`, `contains`, `empty`, `speak`, `listen`, `remember`, `as`, `recall`, `forget`, `date`, `time`, `years`, `today`, `weekend`, `play`, `sound`, `loop`, `music`, `folder`, `exists`, `delete`, `copy`, `files`

---

## 13. Program Structure

A Plain program is a sequence of statements, one per line. Blank lines are ignored. There is no required main function — execution starts at the first line and proceeds top to bottom.

```plain
// My first Plain program
set name to "World"
say "Hello, " + name + "!"
```

Save your programs with the `.plain` file extension (e.g., `hello.plain`).
