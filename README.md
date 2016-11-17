-----------------Implemented User experience extra’s:
- Don’t show login form when user is logged in
- Make messages show newest first (reverse did not work)
- Datestamp 
- Validation on front-end
- Emails get registered to lowercase
- In login, email is capital insensitive

-----------------Possible future improvements:
- Add input type reset button
- Make datestamp look pretty
- Notify: you have caps turned on (when typing password)
- Option to change password
- Option to delete posts
- Option to delete comments
- Make all form entries the same, materialize style

-------------------Exercise requirement:
Submit your gameplan document in a text file as part of your application.

- make repository git
-- git clone ctrl-v
- make directory
-- npm initialize  npm init
-- make .gitignore
--- fill gitignore with modules
-- make app.js file
-- npm install express pug body-parser fs pg sequelize –save
-- npm install express-session --save
ADD, COMMIT, PUSH
- make folder static
-- make main.css
- Make folder views
-- Make pug files:
--- Index
--- Register
--- Allposts
--- Ownposts
-- Fill all pug files with basic pug/html
- Put required modules in app.js
- Put listening port in app.js
- Put where to find static and view in app.js
ADD, COMMIT, PUSH
- create database “blog”
-- open psql
-- create database blog;
- use environment variable “POSTGRES_USER”  kan later nog
- use environment variable “POSTGRES_PASSWORD”  kan later nog
- Create table “users” (user) in app
-- Columns: name, email, password (timestamp on, id automatic)
- Create table “posts” (post) in app
-- Columns: title, body (timestamp on, id automatic)
-- Connected to userID: zelf al standaard invoeren, of dmv code?
- Establish relation:
-- Users can have many posts: User.hasMany(Post)
-- Post are made by one user: Post.belongsTo(User)
- check entries/debug  no mistakes, ping/pong works
- make the table delete itself everytime for developing purposes
- sync the tables to make them truly exist.
ADD COMMIT PUSH
- get index page  make it exist
-- can be viewed logged out
-- Have a login form
-- Fields: email, password
-- Have a link to the register page
-- Have a connection to potential error message
-- Have a connection to the user in session
--- Use app.use(session) at the top of the doc, where importing modules
ADD COMMIT PUSH
- post index page  make it work
-- link the entry fields email & password to the app.js
--- check with database USER
---- If no match: stay on page, but with message “wrong email/password” (render ‘/?message= + encodeURIComponent("Invalid email or password."))
---- If match: redirect allposts
ADD COMMIT PUSH
- Get register page  make it exist
-- can be viewed logged out
-- Have a register form
-- Fields: name, email, password
-- Have a link to the login page (when already a member)
ADD COMMIT PUSH
- Post register page  make it work
-- Link the entry fields to the app.js
-- Let user know password should be 7 characters 
-- Check if email does not already exist in database 
--- If so: stay on page, but with message “user already exists”
--- If not: add name, email, password to database
-- Redirect to login
ADD COMMIT PUSH
- GET allposts page  make it exist
-- Shows all posts, only logged in.
-- Show user who posted it, not just the user ID  komt later  gedaan mhv jimmy: je stuurt de user mee (include: [User]), en dan in pug kies je thing.user.firstname
-- Make link to own posts
-- Make user redirect to login when not logged in with error message showing ('/?message=' + encodeURIComponent("Please log in to view all posts.")
ADD COMMIT PUSH
- Post allposts page  make it work
-- Make a form to create a post
--- Fields: title, body (user ID will be provided by being logged in)
--- Link the entry fields to the app.js
--- Add title, body, user ID to database
--- get redirected to a refreshed allposts page, once submit is pressed
-- From database “posts”, get title, body, userID (name only), date
-- Make them sort by date, new boven 
-- Get them to show in pug
-- ?have a form to post a comment?  no just have amount of comments appear
-- ?use ajax to view one post with comments, or make a page for each post?  use a app.post for a certain ID (use template)
-- Logout ability
ADD COMMIT PUSH
- GET ownposts page  make it exist
-- Shows all posts, only logged in
-- Make link to all posts
-- Make user redirect to login when not logged in with error message showing ('/?message=' + encodeURIComponent("Please log in to view all posts.")
-- Have the amount of comments show
-- Link to individual pages
include: [[{model: User}], [{ model: Comment, include: [{ model: User }] }] ]
ADD COMMIT PUSH
- Post ownposts page  make it work
-- From database “posts”, get title, body, userID (name only), date WHERE user == you
-- Make them sort by date, new boven
-- Get them to show in pug
--  ?have a form to post a comment? no just have amount of comments appear
-- ?use ajax to view one post with comments, or make a page for each post?
-- Logout ability
ADD COMMIT PUSH
- GET viewsinglepost: Make viewpost-page exist
-- Iets met een ID? 
-- Add links to the own-posts and all-posts pages
-- Make extra table: comments? 
--- Linked to user (who commented) ( establish relation)
--- Linked to post (on what post) ( establish relation)
-- Have ID of a post transfer to viewsinglepostpage, 
--- so only that post is shown
--- so the user of that post is shown
--- so new comments will automatically have that post ID
Bcrypted passwords:
- npm install bcrypt-nodejs --save
- require bcrypt-nodejs
- put ‘create user’ inside a bcrypt.hash
- put ‘match user’ inside a bcrypt.compare

Extra what occurred while working on the app:
- Nog drop down maken van “mood” bij post achterlaten
-Use materialize for structure and linking to scripts; make responsive
- Create a readme: include database name, tables names, etc
- Validation on back-end
- Use modules and routes
- When registering, check whether email already exists in database




