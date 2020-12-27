# QEdit
An editor for Quest 6

## FORK INFO

### Windows 10

At first, this named folders with a "." at the end, which Windows does not like.  (In fact, it took a bit of research to learn how to even delete those folders!)

I modified a few bits of code to fix that, and the files refused to copy during the "Save to JS" process afterwards.

At this point, I was tired of working in Windows 10 (because I don't like working in Windows 10 very much), so . . .

### Arch Linux

What I'd done in Windows didn't exactly fix anything. So, I forked the main repo, cloned that fork, and started over.

First, I fixed the filename stuff again (removing the "." from the end of the directory name and changing corresponding code so everything can be accessed properly afterwards).

Then, I added the folders and the files the app tries to copy from "questjs" to "questjs".

That's where I'm at as of 12-26-2020 at 10:10 CST.

I can open the editor, name the game, and save to JS.  It works that way as of this moment.

Next, I shall add an object and see how that goes.

More on this as it comes in . . .

---
### UPDATE

It now works in Linux and Windows 10.

I can add objects, rooms, exits, descriptions, and use functions in the room descriptions.

Further testing in progress . . .

---
See [this issue](https://github.com/KVonGit/QEdit/issues/1) for updates (and whatnot).
