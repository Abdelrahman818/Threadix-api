<!-- ## signup steps
1- user enter the data and click submit
2- data goes to backend to be validate
3- backend sends varification mail to user
4- user click on the link 
5- user is redirected to verify page with token
6- token is sent to backend to be verified
7- user redirected to home page
8- token is stored in localStrorage -->

<!-- ## Login
1- user enters his email and pwd
2- user clicks submit
3- user's data is sent to the backend to be validated
4- user's token is generated with payload (name, email, isAdmin)
5- response is sent from backend containing successful message
6- save the token to localStorage then redirect to home page -->

## Home page
<!-- 1- on startup check if there is stored token in localStroage -->
<!-- 2- send the token to be verified -->
<!-- 3- return the response with valide or not -->
<!-- 4- render signup and login or profile and cart due to auth status -->
<!-- 5- Shop now btn that navigate user to shop page -->
<!-- 6- collections btn that scrolls to down -->
<!-- 7- shop by category section contain categories that navigate the user to shop with filtering by category -->
<!-- 8- featured drops section that navigate user to specified product -->
<!-- 9- why threadix section is just a UI section component -->
10- edit subscribe section to be only button that navigate the user to login if not logged in or mark the user as subscribed
<!-- 11- footer that contains the code craft name and copy rights. -->
12- logout, setting, profile and cart

## About page
This page is static page that carries just a paragraph

## Checkout
This page contains the choosen product from user to be sold with it's details like price, name, discription, etc...

## Contact
This page contains a form that consists of message and subject
1- user enters his message selecting the subject
2- user clicks on submit
3- data is sent to the backend to be validated
4- message is saved to the database
5- response is sent from the backend containing success message

## Shop
1- sending a get request to the backend
2- backend checks the token and retrun back a limited products
3- user scroll down untill the end and click on next for the secound page
4- user can serach products by category, name or other
5- user can sort products by price

## Track
This is a page that make the user able to track his order's status like orderd, indelever, canceld, etc...

## Dashboard
It will has its own route that gets users number, total orders, total proudcts, total revenues, last orders and best selling items

## Product managment
1- on editing a poduct show the images uploaded and make ability to remove one of them
