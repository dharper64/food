# food
Web page for recipies with built in shopping list

# Set up the project to use Firebase
1.	Install the CLI by running the following npm command: npm -g install firebase-tools
2.	Verify that the CLI has been installed correctly by running the following command: firebase --version
3.	Authorize the Firebase CLI by running the following command: firebase login
    (Make sure your project has a database set up before proceding)
4.	Make sure that your command line is accessing your app's local 'top level' directory.
5.	Associate your app with your Firebase project by running the following command: firebase use --add
6.	When prompted, select your Project ID, then give your Firebase project an alias. An alias is useful if you have multiple environments (production, staging, etc). 


# Run the starter app locally
Now that you have imported and configured your project, you are ready to run the web app for the first time.
1.	In a console from the 'top level' directory, run the following Firebase CLI command: 
    firebase serve --only hosting
2.	Your command line should display the following response: ✔ hosting: Local server: http://localhost:5000
3.	Using your browser, open your app at http://localhost:5000.

# Test functions localy
To run a function locally, run the following Firebase CLI command: 
    firebase serve --only functions

# Building and testing functions
To build functions written in type script:
1. cd to the functions folder and enter...
    npm run-script build

To test functions:
1. Still in the functions folder enter...
    npm run-script lint

# Deploy to Firebase hosting
To deploy, run the following Firebase CLI command:
    - Everything
        firebase deploy
    - Hosting only
        firebase deploy --only hosting
    - Functions only
        firebase deploy --only functions


# ToDo
1. Investigate Navigo javascript router as used in Friendly Eats.
    Mentioned in this tutorial for sql like joins. https://www.youtube.com/watch?v=rffbpMzLrZ0

2. Review Friendly Eats for use of multiple JS files.


