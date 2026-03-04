# Plain — Keyword Reference Cheat Sheet

| Keyword | What It Does | Example |
|---------|-------------|---------|
| `set ... to` | Creates or updates a variable | `set name to "Alice"` |
| `say` | Prints a value to the screen | `say "Hello, World!"` |
| `show` | Displays a variable's value | `show score` |
| `ask ... and save to` | Prompts the user for input | `ask "Your name?" and save to name` |
| `add ... to` | Adds a number to a variable, or an item to a list | `add 5 to score` |
| `subtract ... from` | Subtracts a number from a variable | `subtract 3 from score` |
| `multiply ... by` | Multiplies a variable by a number | `multiply score by 2` |
| `divide ... by` | Divides a variable by a number | `divide score by 4` |
| `if ... then` | Starts a conditional block | `if age is greater than 18 then` |
| `else if ... then` | Alternative condition | `else if age is equal to 18 then` |
| `else` | Fallback when no conditions match | `else` |
| `end if` | Closes a conditional block | `end if` |
| `repeat ... times` | Loops a set number of times | `repeat 5 times` |
| `end repeat` | Closes a repeat block | `end repeat` |
| `while` | Loops while a condition is true | `while score is less than 100` |
| `end while` | Closes a while block | `end while` |
| `for each ... in` | Iterates over a list | `for each item in fruits` |
| `end for` | Closes a for-each block | `end for` |
| `define ... using` | Defines a function with parameters | `define greet using name` |
| `define` | Defines a function with no parameters | `define say_hi` |
| `end define` | Closes a function block | `end define` |
| `run ... with` | Calls a function with arguments | `run greet with "Alice"` |
| `run` | Calls a function with no arguments | `run say_hi` |
| `return` | Returns a value from a function | `return result` |
| `create list called` | Creates an empty list | `create list called fruits` |
| `remove item ... from` | Removes an item from a list by index | `remove item 1 from fruits` |
| `size of` | Gets the number of items in a list | `set n to size of fruits` |
| `... item` | Accesses a list item by index (1-based) | `set x to fruits item 1` |
| `is equal to` | Checks equality | `if x is equal to 5 then` |
| `is not equal to` | Checks inequality | `if x is not equal to 5 then` |
| `is greater than` | Checks greater-than | `if x is greater than 10 then` |
| `is less than` | Checks less-than | `if x is less than 10 then` |
| `is greater than or equal to` | Checks ≥ | `if x is greater than or equal to 10 then` |
| `is less than or equal to` | Checks ≤ | `if x is less than or equal to 10 then` |
| `and` | Logical AND in conditions | `if x is greater than 0 and x is less than 10 then` |
| `or` | Logical OR in conditions | `if x is equal to 0 or y is equal to 0 then` |
| `true` / `yes` | Boolean true value | `set active to true` |
| `false` / `no` | Boolean false value | `set active to false` |
| `//` | Single-line comment | `// This is a comment` |
| `note:` | Alternative comment style | `note: This is a comment` |
| `+` | Concatenates text or adds in expressions | `say "Hi " + name` |
| `after ... seconds run` | Schedules a function to run once after a delay | `after 5 seconds run hi` |
| `every ... minutes run` | Schedules a function to run repeatedly | `every 2 minutes run hi` |
| `stop running` | Stops a scheduled function | `stop running hi` |
| `create window` | Generates a UI Window | `create window called "App" ...` |
| `add a button to ...` | Inserts a UI Button to a specified Window | `add a button to "App"` |
| `when button is clicked run` | Binds a click listener to the last created UI Button | `when button is clicked run hi` |
| `starts with` | Checks if a string begins with | `if name starts with "A" then` |
| `ends with` | Checks if a string ends with | `if name ends with "B" then` |
| `contains` | Checks if a string has a substring | `if name contains "C" then` |
| `is empty` | Checks if a string or list is empty | `if name is empty then` |
| `speak` | Uses text-to-speech to talk aloud | `speak "Hello!"` |
| `listen and save to` | Replaces a variable with transcribed microphone audio | `listen and save to my_text` |
| `remember ... as` | Persistently stores a variable value inside storage | `remember score as "high_score"` |
| `recall ... and save to` | Retrieves a permanently stored value | `recall "high_score" and save to score` |
| `forget` | Deletes a stored key from memory | `forget "high_score"` |
| `today` | Evaluates to today's Date string | `set day to today` |
| `play sound` | Plays an audio file | `play sound "beep.wav" loop` |
| `stop sound` | Stops all playing audio | `stop sound` |
| `list files in ...` | Gets an array of filenames within a system folder | `list files in "." and save to files` |
| `delete folder` | Removes a file or folder from the disk | `delete folder "temp"` |
| `copy files ... to` | Copies files from one location to another | `copy files "a.txt" to "b.txt"` |
---

### Quick Examples

**Variables & Math:**
```plain
set score to 100
add 10 to score
multiply score by 2
say score
```

**Conditions:**
```plain
if score is greater than 150 then
    say "Great score!"
else
    say "Keep trying!"
end if
```

**Loops:**
```plain
repeat 3 times
    say "Hip hip hooray!"
end repeat
```

**Functions:**
```plain
define greet using person
    say "Hello, " + person + "!"
end define

run greet with "Alice"
```

**Lists:**
```plain
create list called colors
add "red" to colors
add "blue" to colors
for each color in colors
    say color
end for
```
