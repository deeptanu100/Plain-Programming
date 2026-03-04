# Plain — Extension Ideas

Here are 10 features that could be added to Plain in future versions, with Plain-style syntax examples for each.

---

## 1. 📁 File Handling
Read and write text files with natural syntax.

```plain
read file "notes.txt" and save to content
say content

write "Hello, file!" to file "output.txt"
append "Another line" to file "output.txt"
```

---

## 2. 🎲 Random Numbers
Generate random numbers for games and simulations.

```plain
pick a random number between 1 and 100 and save to roll
say "You rolled: " + roll
```

---

## 3. ⏰ Date & Time
Work with the current date and time.

```plain
set today to the current date
set now to the current time

say "Today is " + today
say "The time is " + now

wait 3 seconds
say "3 seconds just passed!"
```

---

## 4. 🎨 Drawing & Graphics (Turtle-style)
Draw shapes and pictures with simple commands.

```plain
create a canvas called art
set color to "blue"
move forward 100 steps
turn right 90 degrees
move forward 50 steps
draw a circle with size 30
show canvas art
```

---

## 5. 🌐 Web Requests
Fetch data from the internet.

```plain
fetch "https://api.example.com/joke" and save to response
say response

send "Hello!" to "https://api.example.com/messages"
```

---

## 6. 📊 Dictionaries / Maps
Store key-value pairs for structured data.

```plain
create map called person
set person "name" to "Alice"
set person "age" to 30

say person "name"
say "Age: " + person "age"

if person has key "email" then
    say person "email"
else
    say "No email on file."
end if
```

---

## 7. 🧩 Modules & Imports
Break code into reusable files.

```plain
use "math_helpers.plain"
use "string_tools.plain"

set result to run calculate_area with 5, 10
say "Area: " + result
```

---

## 8. 🔁 Try / Recover (Error Handling)
Handle errors gracefully without crashing.

```plain
try
    divide score by 0
recover
    say "Something went wrong, but we handled it!"
end try
```

---

## 9. 📝 String Operations
Manipulate text with natural commands.

```plain
set message to "Hello, World!"

set upper to message in uppercase
set lower to message in lowercase
set length to length of message
set part to characters 1 to 5 of message

say upper        // HELLO, WORLD!
say length       // 13
say part         // Hello

if message contains "World" then
    say "Found it!"
end if

replace "World" with "Plain" in message
say message      // Hello, Plain!
```

---

## 10. 🧮 Advanced Math
Built-in math functions for more complex calculations.

```plain
set root to square root of 144
set powered to 2 to the power of 10
set rounded to round 3.7

say root       // 12
say powered    // 1024
say rounded    // 4

set remainder to 17 modulo 5
say remainder  // 2
```

---

Each of these extensions follows Plain's philosophy: **readable, English-like syntax** with no cryptic symbols. They can be added incrementally as the language evolves!
