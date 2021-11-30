# Inventory Application

This is the repo for the Inventory Application project in the NodeJS course of The Odin Project.  Using MongoDB, Express, and NodeJS the project builds an inventory database for an imaginary store.  The app is to be able to create, read, update, and delete \(CRUD\) items and categories in the store.

## What I Learned

### EJS

I thought switching to EJS would ease my pains with using Pug, but it turns out I forgot most of the EJS syntax and the documents were not much help.  I had to search for answers on how to escape/unescape characters, how to write if-else statements, and how to include other template files.  I think I spent more time figuring out the syntax than I was figuring out how to pass data to be rendered.  And the curly brackets were getting me all confused with the angled brackets.

### MongoDB Shell

I have been forcing myself to use a lot more CLIs \(command line interface\) so I can feel more comfortable in situations where I'm stuck with only a command line.  GUIs \(graphical user interface\) have been a luxury of modern development, but back in the day there was only a prompt and that blinking cursor to look at.  After fixing my issues with MongoDB on WSL \(Windows Subsytem for Linux\), I realized that I didn't have Compass to help display the data.  I resorted to using MongoDB Shell for the first time.  I had done a previous tutorial on MongoDB that used the shell so I was somewhat comfortable.  I had to use the `help` command and look up a lot of stuff, but I think I got the hang of at least moving around the database and looking at the data through shell queries.

### [Multer](https://github.com/expressjs/multer)

For extra credit, the app needed the ability to add images to individual items.  The project recommended using Multer to handle file storage.

#### Form Type
For Multer to work on forms, the form type had to be changed to `multipart/form-data`.  I figured I could just change my item form and add the ability to add images.  But when I did the form type change, it caused errors in my form validation.  I decided to work around this by creating another route and form for adding images.  I can imagine that there is a way to work with the same form and resolve the error, but creating a new route seemed like a faster workaround.

#### How To Open Files

I was able to get the file to save on the server and save the file information within the item document in the database, but was having issues trying to access the file.  I had to go back to a Traversy Media YouTube video on [Node.js Image Uploading With Multer](https://www.youtube.com/watch?v=9Qzmri1WaaE) to figure out how to get the filename correctly saving on the server so I could access the file.  I needed to configure Multer such that the file name was accessible and not just some randomly generated filename by default.  Once the file name was sorted out, it was easy to get the item detail template to read the file and render it on the item detail page.

### Deleting Files On The Server

With the ability to add image files, there will be a lot of files saved on the server.  It concerned me that there would be a lot of files left on the server should the items get deleted.  For more extra credit that I assigned myself, I added some code to delete files from the file system that were linked to the item that was being deleted.  I found this article on [How to remove a file in Node.js](https://flaviocopes.com/how-to-remove-file-node/) and implented a `for...of` loop on the deleted item's image array to go through and delete all the associated images.