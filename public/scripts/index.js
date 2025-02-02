
document.addEventListener('DOMContentLoaded', function() {
  // // 🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥
  // // The Firebase SDK is initialized and available here!
  //
  // firebase.auth().onAuthStateChanged(user => { });
  // firebase.database().ref('/path/to/ref').on('value', snapshot => { });
  // firebase.messaging().requestPermission().then(() => { });
  // firebase.storage().ref('/path/to/ref').getDownloadURL().then(() => { });
  //
  // // 🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥

  try {
    let app = firebase.app();
    let features = ['auth', 'database', 'messaging', 'storage', 'functions'].filter(feature => typeof app[feature] === 'function');
    document.getElementById('load').innerHTML = `Firebase SDK loaded with ${features.join(', ')}`;
  } catch (e) {
    console.error(e);
    document.getElementById('load').innerHTML = 'Error loading the Firebase SDK, check the console.';
  }
});
  
  // Get a reference to the database service
  var firestore = firebase.firestore();
  
  // Initialize Cloud Functions through Firebase
  var functions = firebase.functions();


/*=====================================================================================================*/
/* #region Authentication */

// Shortcuts to DOM Elements.
var userPicElement = document.getElementById('user-pic');
var userNameElement = document.getElementById('user-name');
var signInButtonElement = document.getElementById('sign-in');
var signOutButtonElement = document.getElementById('sign-out');
var signInWithEmailButtonElement = document.getElementById('sign-in-email');

var signInSnackbarElement = document.getElementById('must-signin-snackbar');


var newUserNameDivElement = document.getElementById('newUserNameDiv'); 
var newUserNameElement = document.getElementById('newUserName'); 

var logInEmailElement = document.getElementById('logInWithEmail'); // See commentTxtElement
var logInPassElement = document.getElementById('userpass'); 
var cancelSignInElement = document.getElementById('cancel-sign-in'); 


// Saves message on form submit.
signOutButtonElement.addEventListener('click', signOut);
signInButtonElement.addEventListener('click', signIn);
signInWithEmailButtonElement.addEventListener('click', signInWithEmail);

var logInDialog = document.querySelector('dialog');
var showDialogButton = document.querySelector('#show-dialog');

if (! logInDialog.showModal) {
  console.log("Hi...");
  dialogPolyfill.registerDialog(logInDialog);
}
showDialogButton.addEventListener('click', function() {
  console.log("Click...");
  
  console.log("Hide newUserNameDivElement")
  newUserNameDivElement.setAttribute('hidden', 'true');

  signInButtonElement.removeAttribute('hidden');

  signInWithEmailButtonElement.innerHTML = '<i class="material-icons">email</i> Sign In With Email';

  logInDialog.showModal();
});  

cancelSignInElement.addEventListener('click', function(){
  logInPassElement.value = "";
  logInDialog.close();
})

// A loading image URL.
var LOADING_IMAGE_URL = 'https://www.google.com/images/spin-32.gif?a';

// Checks that Firebase has been imported.
checkSetup();

// initialize Firebase
initFirebaseAuth();

// Configure offline persistence
enablePersistence();

// Checks that the Firebase SDK has been correctly setup and configured.
function checkSetup() {
  console.log("checkSetup...");
  if (!window.firebase || !(firebase.app instanceof Function) || !firebase.app().options) {
    window.alert('You have not configured and imported the Firebase SDK. ' +
        'Make sure you go through the codelab setup instructions and make ' +
        'sure you are running the codelab using `firebase serve`');
  }
}

// Initiate firebase auth.
function initFirebaseAuth() {
  console.log("initFirebaseAuth...");
  // Listen to auth state changes.
  firebase.auth().onAuthStateChanged(authStateObserver);
}

// Configure offline persistence
function enablePersistence(){
  // See https://firebase.google.com/docs/firestore/manage-data/enable-offline for more details
  console.log("enablePersistence...");
  firebase.firestore().enablePersistence()
  .catch(function(err) {
    console.log("Error in enablePersistence: ", err.code);
    if (err.code == 'failed-precondition') {
        // Multiple tabs open, persistence can only be enabled
        // in one tab at a a time.
        // ...
    } else if (err.code == 'unimplemented') {
        // The current browser does not support all of the
        // features required to enable persistence
        // ...
    }
  });
// Subsequent queries will use persistence, if it was enabled successfully  
}

// Signs-in.
function signIn() {
  // Sign into Firebase using popup auth & Google as the identity provider.
  console.log("signIn...");
  
  logInDialog.close();

  var provider = new firebase.auth.GoogleAuthProvider();
  
  firebase.auth().signInWithPopup(provider).then(function(result) {
    
    console.log("Google login result:", result);

  }).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // The email of the user's account used.
    var email = error.email;
    // The firebase.auth.AuthCredential type that was used.
    var credential = error.credential;
    // ...
    console.error("Error in signIn(): ", errorMessage);
  });  
  console.log("signIn done.");
}

function signInWithEmail(){
  console.log("signInWithEmail... ");

  const email = logInEmailElement.value;
  const password = logInPassElement.value;
  
  console.log("signInWithEmail email:", email);

  // Set the tenant ID on Auth instance.
  //firebase.auth().tenantId = '' //'TENANT_PROJECT_ID';
  //console.log("firebase.auth().tenantId:", firebase.auth().tenantId);

  // All future sign-in request now include tenant ID.
  firebase.auth().signInWithEmailAndPassword(email, password).then(function(result) {

    logInPassElement.value = "";
    console.log("Google login result:", result);
    
  }).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;

    console.error("Error in signIn() errorCode: ", errorCode);
    console.error("Error in signIn() error: ", errorMessage);

    if (errorCode === "auth/user-not-found") {
      console.error("User not found, call create new user.");
      var isNameDivHidden = newUserNameDivElement.getAttribute('hidden');
      console.log("newUserNameDivElement hidden", isNameDivHidden)

      if (isNameDivHidden){
        if (confirm("Not been here before? Do you want to register with these credentials?")){      
          console.log("Prompt for name");
          newUserNameDivElement.removeAttribute('hidden');
          signInButtonElement.setAttribute('hidden', 'true');
          newUserNameElement.focus();            
          signInWithEmailButtonElement.innerHTML = '<i class="material-icons">email</i> Register'
          console.log("signInWithEmailButtonElement.innerHTML", signInWithEmailButtonElement.innerHTML);
          alert('Please enter your name.');
        } 
      } else {
        console.log("newUserNameDivElement not hidden")

        newUserName = newUserNameElement.value;

        if (newUserName === "") {
          alert('Please enter your name.')
        } else {
          console.log("New user: ", newUserName)
          createNewUserFromEmail(email, password)

          firebase.auth().onAuthStateChanged(function(user) {
            if (user) {
              // User is signed in.
              console.log("New user looged in so update display name: ", newUserName)
              updateUserDisplayName(newUserName)
            }
          });
        } 
      }    
    } else if (errorCode === "auth/wrong-password"){
      alert('Oops. Your user name or password may be incorrect.')
    } else {
      alert('Oops. please try again.')
    }
  });  
}

function createNewUserFromEmail(email, password){
  console.log('createNewUserFromEmail email:', email)
  console.log('createNewUserFromEmail password:', password)

  //Create User with Email and Password
  firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    console.log(errorCode);
    console.log(errorMessage);
    if (errorCode === "auth/weak-password") {
      alert("Oops, " + errorMessage)
    }
  });
}

function updateUserDisplayName(newUserName){
  console.log('updateUserDisplayName newUserName:', newUserName)

  var user = firebase.auth().currentUser;

  console.log('New user: ', user)

  userNameElement.textContent = newUserName;

  user.updateProfile({
    displayName: newUserName
  }).then(function() {
    // Update successful.
    console.log("User name updated", user);
  }).catch(function(error) {
    // An error happened.
    var errorCode = error.code;
    var errorMessage = error.message;
    console.log("createNewUserFromEmail Error", errorCode);
    console.log("createNewUserFromEmail Msg", errorMessage);        
  }); 
}

//===========================================================================================================


//===========================================================================================================

function getAccessLevel(){
  console.log("getAccessLevel...");
  //ToDo: Testing only - test rules for setting data access to user only

  try{
    //var userCol = firestore.collection('users');  

    var userId = firebase.auth().currentUser.uid;
    console.log("getAccessLevel userId:", userId);

    var messageText = 'Test'

    var testFunction = firebase.functions().httpsCallable('testFunction');
    console.log("getAccessLevel: 1");
    testFunction({text: messageText}).then(function(result) {
      console.log("getAccessLevel: 2");
      // Read result of the Cloud Function.
      var rText = result.data.text;
      console.log("getAccessLevel: 3 - ", rText);
    });

    console.log("getAccessLevel called function.");
  }
  catch(err) {
    console.error("Error getAccessLevel: ", err.textContent);
  }

  console.log("getAccessLevel done.");
}

/*
function getAccessLevel(){
  console.log("getAccessLevel...");
  //ToDo: Testing only - test rules for setting data access to user only

  try{
    //var userCol = firestore.collection('users');  

    var userId = firebase.auth().currentUser.uid;
    console.log("getAccessLevel userId:", userId);

    firestore.collection("testData").where("userId", "==", userId)
    .get()
    .then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            // doc.data() is never undefined for query doc snapshots
            //console.log(doc.id, " => ", doc.data());
            console.log("Doc is: ", doc.data());
        });
    })
    .catch(function(error) {
        console.log("Error getting documents: ", error);
    });

  }
  catch(err) {
    console.error("Error getAccessLevel: ", err.textContent);
  }

  console.log("getAccessLevel done.");
}
*/

// Signs-out of Friendly Chat.
function signOut() {
  console.log("signOut...");
  // Sign out of Firebase.
  // firebase.auth().signOut();
  firebase.auth().signOut().then(function() {
    // Sign-out successful.
    console.log('User signed out');

    hideAllDynamicDivs();
    updateMainDiv("Home");

  }).catch(function(error) {
    // An error happened.
    console.error('Error logging out', error);
  });
}

function getProfilePicUrl() {
  return firebase.auth().currentUser.photoURL || '/images/profile_placeholder.png';
}

// Returns the signed-in user's profile Pic URL.
/*
function getProfilePicUrl() {
  try {
    console.log("getProfilePicUrl...");

    //return firebase.auth().currentUser.photoURL || '/images/profile_placeholder.png';
    
    var profilePic = firebase.auth().currentUser.photoURL || '/images/profile_placeholder.png';
    console.log("profilePic ", profilePic);

    console.log("getProfilePicUrl done.");

    return profilePic
  }
  catch(err) {
    console.log("getProfilePicUrl error.");
    console.error("Error logging on: ", err.textContent);
  }
}
*/

// Returns the signed-in user's display name.
function getUserName() {
  console.log("getUserName...");

  var UserName = firebase.auth().currentUser.displayName;

  if(UserName === ""||!UserName || 0 === UserName.length){
    console.log("No name so get email...", firebase.auth().currentUser.email);
    UserName = firebase.auth().currentUser.email;
  }

  console.log("UserName: ", UserName);

  return UserName;
}

// Returns true if a user is signed-in.
function isUserSignedIn() {
  console.log("isUserSignedIn...");
  console.log("Is User Signed In...", firebase.auth().currentUser);
  return !!firebase.auth().currentUser;
}

// Triggers when the auth state change for instance when the user signs-in or signs-out.
function authStateObserver(user) {
  if (user) {
    console.log("User is signed in!...", user);

    // Get the signed-in user's profile pic and name.
    var profilePicUrl = getProfilePicUrl();
    var userName = getUserName();
    var picUrl = 'url(' + addSizeToGoogleProfilePic(profilePicUrl) + ')';

    // Set the user's profile pic and name.
    userPicElement.style.backgroundImage = picUrl;

    console.log("picUrl:", userPicElement.style.backgroundImage);

    userNameElement.textContent = userName;

    // Show user's profile and sign-out button.
    userNameElement.removeAttribute('hidden');
    userPicElement.removeAttribute('hidden');
    signOutButtonElement.removeAttribute('hidden');

    // Hide sign-in button.
    //signInButtonElement.setAttribute('hidden', 'true');
    showDialogButton.setAttribute('hidden', 'true');
    logInDialog.close();

    // Show recipe edit button
    editRecipeButtonElement.removeAttribute('hidden');
    console.log("Un-Hidded Edit button!...");

    // log sign in
    logSignIn(user); //, token);
    
    getAccessLevel();


  } else { // User is signed out!
    // Hide user's profile and sign-out button.
    console.log("User is not signed in!...");
    userNameElement.setAttribute('hidden', 'true');
    userPicElement.setAttribute('hidden', 'true');    
    signOutButtonElement.setAttribute('hidden', 'true');

    // Show sign-in button.
    //signInButtonElement.removeAttribute('hidden');

    console.log('Unhide login dialog button');
    showDialogButton.removeAttribute('hidden');

    // Hide recipe edit button
    editRecipeButtonElement.setAttribute('hidden', 'true');
    console.log("Hidded Edit button!...");


    //loggedInLinks.setAttribute('hidden', 'true');
  }
}

function logSignIn(user){
  // Log a user signing on

  var currentDate = dateStringShort();

  console.log("Save logon event to Firebase as ", currentDate);

  var users = firestore.collection("users").doc(user.email);  

  // Build JSON object to save
  const signInLogJSON = {userName: user.displayName, lastLogOn: firebase.firestore.FieldValue.serverTimestamp()}

  users.set({
    signInLogJSON
    })
    .then(function(docRef) {
      console.log("Logon event saved Firebase", user.displayName);

      //var usersTimeStamp = firestore.collection("users").doc(user.email).collection('log');
      var logDoc = users.collection('logDetail').doc(currentDate);

      // Build JSON object to save
      const DateTimeJSON = {date: firebase.firestore.FieldValue.serverTimestamp()};

      logDoc.set({
          DateTimeJSON
        })
        .then(function(docRef) { 
          console.log("Logon timestamp saved.", user.displayName);
        })
        .catch(function(error) {
            console.error("Error adding Log timestamp: ", error);
        });  
    })
    .catch(function(error) {
        console.error("Error adding Log: ", error);
    });        
}

// Returns true if user is signed-in. Otherwise false and displays a message.
function checkSignedInWithMessage() {
  console.log("checkSignedIn...");
  // Return true if the user is signed in Firebase
  if (isUserSignedIn()) {
    console.log("User is signed in.");
    return true;
  }

  popupToastMsg('You must sign-in first');

  return false;
}


// Resets the given MaterialTextField.
function resetMaterialTextfield(element) {
  console.log("resetMaterialTextfield...");
  element.value = '';
  element.parentNode.MaterialTextfield.boundUpdateClassesHandler();
}

// Adds a size to Google Profile pics URLs.
function addSizeToGoogleProfilePic(url) {
  console.log("addSizeToGoogleProfilePic...");

  if (url.indexOf('googleusercontent.com') !== -1 && url.indexOf('?') === -1) {
    console.log("addSizeToGoogleProfilePic. Add size.");
    return url + '?sz=150';
  } else {
    console.log("addSizeToGoogleProfilePic. Doh.");
  }
  console.log("addSizeToGoogleProfilePic. Done.");

  return url;
}
/* #endregion */
/*=====================================================================================================*/
/* #region MenuSelection */
  // Menu selection and showing/hiding div elements
  
  const dynamicDivs = document.getElementsByClassName('template')

  const homeElement = document.getElementById('home-container');  
  const recipeListElement = document.getElementById('recipes-list-container'); // This is within home-container
  const recipeOuterElement = document.getElementById('recipe-outer-container');

  const NewElement = document.getElementById('new-container');
  const shoppingListElement = document.getElementById('shoppingList-container');
  const aboutElement = document.getElementById('about-container');

  document.querySelector('.mdl-layout__drawer').addEventListener('click', closeMenu);

  // Close the menu when clicked.
  function closeMenu() {
    var d = document.querySelector('.mdl-layout');
    d.MaterialLayout.toggleDrawer();
  }
  
  // Hide all elements prior to displaying element selected from menu.
  function hideAllDynamicDivs(){
    console.log("Hide all Divs :");

    //dynamicDivs.setAttribute('hidden', 'true');

    //dynamicDivs.style.visibility = "hidden";

    //for (var i = 0; i < dynamicDivs.length; i ++) {
    //  dynamicDivs[i].style.visibility = "hidden";
    //}

    homeElement.setAttribute('hidden', 'true');  
    recipeOuterElement.setAttribute('hidden', 'true');  
    NewElement.setAttribute('hidden', 'true');
    shoppingListElement.setAttribute('hidden', 'true');
    aboutElement.setAttribute('hidden', 'true');

    console.log("All hidden.");
  }

  // Click event to call function that populates the main div.
  function linkClicked(selection) {
    console.log("linkClicked :", selection);
    
    hideAllDynamicDivs();

    updateMainDiv(selection);
    }
  
  /* Load home content by default */
  updateMainDiv("Home");

  // Populate the main section
  function updateMainDiv(selection) {
    console.log('updateMainDiv : ' + selection);
    
    switch(selection) {
      case 'Home':
        homeShow();
        break;
      case 'AddRecipe':        
        if (checkSignedInWithMessage()) {
          NewRecipeShow();
        } else {            
          hideAllDynamicDivs();
          updateMainDiv("Home");
        }        
        break;
      case 'ShoppingList':
        if (checkSignedInWithMessage()) {
          shoppingListHTML();
        } else {            
          hideAllDynamicDivs();
          updateMainDiv("Home");
        }
        break;
      case 'About':
        aboutShow();
        break;
      default:
        homeShow();
        break
    }
  }

/* #endregion */
/*=======================================================================================================*/


/*=======================================================================================================*/
// Query on search text - test
// searchText

const searchTextElement = document.getElementById('searchText');

searchTextElement.addEventListener('change', searchTextChanged);

function searchTextChanged(){
  console.log('searchTextChanged: ', this.value);   

  var searchTxt = this.value;

  searchTxt = searchTxt.toLowerCase()
  console.log('searchTextChanged: ', searchTxt);  
  var searchArr = searchTxt.split(" ");

  console.log('searchText Array: ', searchArr);  

  hideAllDynamicDivs();

  popRecipes(searchArr);
  
  homeElement.removeAttribute('hidden');  

  // Clear search text after search
  document.getElementById("searchText").value = ""; 

}

/*=======================================================================================================*/
/* #region RecipieCards */
/* Home - Recipie Cards */

// const homeElement = document.getElementById('home-container'); - Home element defined above

//const selectedRecipeCard = document.getElementsByClassName('cardAction')
//selectedRecipeCard.addEventListener('click', loadRecipeDetail);
//selectedRecipeCard.addEventListener('click', function(){    
//    console.log('Recipe card click event');
//});

var selectedRecipeID = 0;
var selectedRecipeTitle ="";

const recipeTitleIDElement = document.getElementById('recipeTitle');
//const recipeIDElement = document.getElementById('recipeID');
const recipeAddedByElement = document.getElementById('recipeAddedBy');
const recipeDescElement = document.getElementById('recipeDesc');
const ingredientsElement = document.getElementById('ingredients');
const methodElement = document.getElementById('method');

const goHomeButtonElement = document.getElementById('goHome');
const addToShoppingListButtonElement = document.getElementById('addToShoppingList');
const editRecipeButtonElement = document.getElementById('editRecipe');

goHomeButtonElement.addEventListener('click', function() {
  console.log('Go Home Button Clicked');   
  linkClicked("Home");
});  

addToShoppingListButtonElement.addEventListener('click', function() {
  console.log('Add to shopping list Button Clicked');   

  if (checkSignedInWithMessage()) {
    addRecipeIngredientToShoppingList();
  }
}); 

editRecipeButtonElement.addEventListener('click', function() {
  console.log('Edit Button Clicked');   
  
  console.log('addIncredientsToEditList ', selectedRecipeID);

  // Clear lists used for menu view
  clearIngredientsListElement();
  clearMethodListElement();

  // Display editable version
  UpdateShow();

  //linkClicked("Home");
}); 

function homeShow(){
    // Display and populate the gallery.
    console.log('Show Home:');
    
    popRecipes("");

    homeElement.removeAttribute('hidden');  
  }

function popRecipes(searchArr){
  console.log('popRecipes:', recipeListElement.childElementCount);
  
  if (recipeListElement.childElementCount > 0){
    console.log('Recipe cards already loaded so clear...');
    var fc = recipeListElement.firstChild;

    while( fc ) {
      console.log('Clear recipe list row.');
      recipeListElement.removeChild( fc );
        fc = recipeListElement.firstChild;
    }
  } 
  
  var query; // = firestore.collection('recipes');

  /*
  if(!!searchTxt){
    console.log('Get all recipes with: ', searchTxt);
    query = firestore.collection('recipes').where("searchTxt", "array-contains", searchTxt);
  } else {
    console.log('Get all recipes.');
    //query = firestore.collection('recipes');
  }
  */

  if(typeof searchArr != "undefined"  
      && searchArr != ""  
      && searchArr != null  
      && searchArr.length != null  
      && searchArr.length > 0){
    // Display all recipes with search text
    
    console.log('Get all recipes with: ', searchArr);
    console.log('Or title is: ', searchArr[0]);

    popupToastMsg("Search for '" + searchArr[0] + "'");

    query = firestore.collection('recipes').where("searchTxt", "array-contains-any", searchArr);

  } else {
    // Display all recipes
    console.log('Get all recipes.');
    query = firestore.collection('recipes');
  }

  console.log('Got Recipes:');   

  // Start listening to the query to get recipe list data.
  query.onSnapshot(function(snapshot) {
      snapshot.docChanges().forEach(function(change) {     
      if (change.type === 'removed') {
          deleteListItem(change.doc.id);
      } else {
          var ListItem = change.doc.data();
          console.log('Resipes list: ', ListItem.title, ', ', ListItem.desc);
          displayRecipeCard(change.doc.id, ListItem.title, ListItem.desc)      
          loadRecipeImage("img-" + change.doc.id, change.doc.id);
      }
      });
  })
   

}; 

// Remove existing rows from recipe list when selected from menu.
function clearRecipeListElement(){
  console.log('clearRecipeListElement...');
    
  // If the <ul> element has any child nodes, remove its first child node
  if (recipeListElement.hasChildNodes()) {
    recipeListElement.removeChild(recipeListElement.childNodes[0]);
  }
}

function displayRecipeCard(id, title, desc){
    console.log('displayListItem: ', id, title, desc);

    //popupToastMsg(title);

    //var imgURL = getRecipeImageURL(id);
    //console.log('imgURL', imgURL);

    if (desc.length > 125){
      console.log('Recipe description too long', desc.length);
      desc = desc.substring(1, 122);
      desc = desc + '...';
    } else {
      console.log('Recipe description too short', desc.length);
      desc = desc.padEnd(125);
    }

    const container = document.createElement('div');
    container.setAttribute('id', id);

    var tableRow = document.getElementById(id) 

    var imgID = "img-" + id;
    console.log('imgID ', imgID);

    var content = '';
    content += `<div class="mdl-cell mdl-cell--6-col">`
    content += `<div class="recipeCard demo-card-square mdl-card mdl-shadow--2dp">`
    content += `<div id="` + id + `>`

    //content += `<figure class="mdl-card__media">
    //                <img  id=` + imgID + ` src="/images/default.jpg" alt="" style="width:100%" />
    //            </figure>`

    content += `<figure class="mdl-card__media">
                <img  id=` + imgID + ` src="" alt="Recipe image" style="width:100%" />
                </figure>`

    content += `<div class="mdl-card__title mdl-card--expand"><h2 class="mdl-card__title-text">` + title + `</h2></div>`;
    content += `<div class="mdl-card__supporting-text">` + desc + `</div>`;
    content += `</div>
                </div>
                </div>
                </div>`;
    
    container.innerHTML = content;
        
    console.log('container.innerHTML: ', container.innerHTML);
    
    container.addEventListener('click', function() {
      console.log('Click',container.id);   
      loadRecipeDetail(container.id);
    });  

    recipeListElement.appendChild(container);
}

function printDetails(e) {
  console.log("Clicked " + this.id);
}

function loadRecipeDetail(id){        
    console.log('loadRecipeDetail:', id);
    
    hideAllDynamicDivs();

    recipeOuterElement.removeAttribute('hidden'); 

    // Get data for selected recipe

    // recipeIDElement.innerHTML = "Recipe ID : " + id

    // Load Recipe Header
    loadRecipeHeader(id);

    // Load Recipe Metingredients
    loadRecipeIngredients(id);

    // Load Recipe Method
    loadRecipeMethod(id);

    // Load comments
    loadRecipeComments(id); //loadRecipeMethod

    loadRecipeImage("recipeImageDt", id);

    console.log('loadRecipeDetail: Done', id);

    recipeOuterElement.removeAttribute('hidden'); 
    
    console.log('recipeOuterElement: unhidden');
}

function loadRecipeHeader(id){ 
  console.log('loadRecipeHeader: ', id);

  var docRef = firestore.collection('recipes').doc(id);

  docRef.get().then(function(doc) {
      if (doc.exists) {
        selectedRecipeID = id;

        //console.log("Document data:", doc.data());

        var RecipeItem = doc.data();
        console.log('Resipe id:', selectedRecipeID);
        console.log('Resipe: ', RecipeItem.title, ', ', RecipeItem.addedBy, ', ', RecipeItem.desc);

        recipeTitleIDElement.innerHTML = RecipeItem.title
        recipeAddedByElement.innerHTML = "Submitted By : " + RecipeItem.addedBy
        recipeDescElement.innerHTML = RecipeItem.desc

        selectedRecipeTitle = RecipeItem.title;

      } else {
          // doc.data() will be undefined in this case
          console.log("No such document!");
        selectedRecipeID = '';
      }
  }).catch(function(error) {
      console.log("Error getting document:", error);
  });

}

function loadRecipeIngredients(id){ 
  console.log('loadRecipeIngredients: ', id);

  clearIngredientsListElement();

  const query = firestore.collection('recipes').doc(id).collection('Ingredients')
  .orderBy('orderBy', 'asc');
  // See https://firebase.google.com/docs/firestore/data-model for sub collection.

  methodElement.deleteListItem;

  // Start listening to the query to get ingredients list data.
  query.onSnapshot(function(snapshot) {
    snapshot.docChanges().forEach(function(change) {
    //console.log("Document data:", change.doc.data());

    var ListItem = change.doc.data();
    console.log('Method: ', ListItem.orderBy, ListItem.item, ListItem.qty, ListItem.unit);
    displayIngredientItem(change.doc.id, ListItem.orderBy, ListItem.item, ListItem.qty, ListItem.unit);

    }) 
  })
}

function clearIngredientsListElement(){
  console.log('cleaMethodListElement...', ingredientsElement.children.length);
  
  var fc = ingredientsElement.firstChild;

  while( fc ) {
    console.log('Clear method list row.');
    ingredientsElement.removeChild( fc );
      fc = ingredientsElement.firstChild;
  }

  console.log('cleaMethodListElement...', ingredientsElement.children.length);  
}

function displayIngredientItem(id, orderBy, item, qty, unit) {
  console.log('displayMethodItem: ', orderBy, item, qty, unit);
  
  var ingredientStr = item;

  if (qty == 0){
    console.log('qty is zero');
    ingredientStr = ingredientStr + ' ' + unit;
  } else {
    console.log('qty is not zero');
    ingredientStr = item + ' ' + qty + ' ' + unit;
  }

  console.log('ingredientStr: ', ingredientStr);

  const container = document.createElement('li');
  container.setAttribute('id', id);

  var tableRow = document.getElementById(id)

  // item + ` ` + qty + ` ` + unit

  var content = `<li id="row[` + id + `] class="mdl-list__item">
          <span class="mdl-list__item-primary-content">
          ` + ingredientStr + ` 
          </span>
        </li>`;

  container.innerHTML = content;
    
  console.log('container.innerHTML: ', container.innerHTML);

  ingredientsElement.appendChild(container);
}

function loadRecipeMethod(id){ 
  console.log('loadRecipeHeader: ', id);
  // methodElement

  clearMethodListElement();

  const query = firestore.collection('recipes').doc(id).collection('Method')
  .orderBy('orderBy', 'asc');
  // See https://firebase.google.com/docs/firestore/data-model for sub collection.

  methodElement.deleteListItem;

  // Start listening to the query to get recipe list data.
  query.onSnapshot(function(snapshot) {
    snapshot.docChanges().forEach(function(change) {
    //console.log("Document data:", change.doc.data());

    var ListItem = change.doc.data();
    console.log('Method: ', ListItem.orderBy, ListItem.method);
    displayMethodItem(change.doc.id, ListItem.orderBy, ListItem.method);

    }) 
  })
}

function clearMethodListElement(){
  console.log('cleaMethodListElement...', methodElement.children.length);
  
  var fc = methodElement.firstChild;

  while( fc ) {
    console.log('Clear method list item.');
    methodElement.removeChild( fc );
      fc = methodElement.firstChild;
  }
  
  console.log('cleaMethodListElement...', methodElement.children.length);
}

function displayMethodItem(id, orderBy, method) {
  console.log('displayMethodItem: ', orderBy, method);
  
  const container = document.createElement('li');
  container.setAttribute('id', id);

  var tableRow = document.getElementById(id)

  var content = `<li id="row[` + id + `]class="mdl-list__item">
          <span class="mdl-list__item-primary-content">
          ` + orderBy + `. ` + method + `
          </span>
        </li>
        <br>`;

  container.innerHTML = content;
    
  console.log('container.innerHTML: ', container.innerHTML);

  methodElement.appendChild(container);
}

/*=======================================================================================================*/
/* Recipe Comments */

const submitCommentButton = document.getElementById('submitComment'); // Button to save comment
const commentAddedByElement = document.getElementById('commentAddedBy'); 
const commentTxtElement = document.getElementById('commentTxt'); 
const commentsListContents = document.getElementById('Comments'); 

function loadRecipeComments(id){
  console.log('loadRecipeComments');

  clearCommentsListElement();

  const query = firestore.collection('recipes').doc(id).collection('Comments')
  .orderBy('dateAdded', 'desc');

  // Start listening to the query to get recipe list data.
  query.onSnapshot(function(snapshot) {
    snapshot.docChanges().forEach(function(change) {

    var ListItem = change.doc.data();
    console.log('Comment: ', ListItem.addedBy, ListItem.comment);
    displayCommentItem(change.doc.id, ListItem.addedBy, ListItem.comment);

    }) 
  })
  console.log('loadRecipeComments - Done');
} 

submitCommentButton.addEventListener('click', function(){
  console.log("submitCommentButton.addEventListener.");

  if (isUserSignedIn()) {
    if (commentAddedByElement.value == ""){
      console.log("Name not entered.");
      popupToastMsg("Please enter your name.");    
    } else if (commentTxtElement.value == ""){
      console.log("Comment not entered.");
      popupToastMsg("You have not entered a comment.");    
    } else {
        const addedBy = commentAddedByElement.value;
        const comment = commentTxtElement.value;
        
        console.log("Instanciate comments collection.");

        var commentsUpdateListData = firestore.collection('recipes').doc(selectedRecipeID).collection('Comments');

        return commentsUpdateListData.add({
          addedBy: addedBy,
          comment: comment,
          dateAdded: firebase.firestore.FieldValue.serverTimestamp(),
          user: firebase.auth().currentUser.email
        }).then(function() {
          
          resetMaterialTextfield(commentAddedByElement);
          resetMaterialTextfield(commentTxtElement);
          
          console.log("Comment saved")

        }).catch(function (error){
          console.log("Got an error: ", error)
        });
    }
  } else {
    console.log("User is signed in.");
    popupToastMsg('Please log-in to add acomment,');
  }
  console.log("click done.");
});

function displayCommentItem(id, addedBy, comment) {
  console.log('displayCommentItem: ', addedBy, comment);
  
  const container = document.createElement('li');
  container.setAttribute('id', id);

  var tableRow = document.getElementById(id)

  var content = `<li class="mdl-list__item mdl-list__item--three-line">
    <span class="mdl-list__item-primary-content">
      <i class="material-icons mdl-list__item-avatar">person</i>
        <span>` + addedBy + `</span>
        <span class="mdl-list__item-text-body">` + comment + `</span>
      </span>
    </li>`

  container.innerHTML = content;
    
  console.log('container.innerHTML: ', container.innerHTML);

  commentsListContents.appendChild(container);
}

function clearCommentsListElement(){
  // Remove existing rows from the comments list table before being repopulated.
  console.log('clearCommentsList...');
  
  var fc = commentsListContents.firstChild;

  while( fc ) {
    console.log('Clear ingredient list row.');
    commentsListContents.removeChild( fc );
      fc = commentsListContents.firstChild;
  }
}

/* #endregion */

/*=======================================================================================================*/








/*=======================================================================================================*/
/* Add new recipie */

const NewUpdateTitleElement = document.getElementById('NewUpdateTitle');  // NewUpdateTitle - Display New or update as required.
const newTitleElement = document.getElementById('newTitle');              // newTitle
const newSubmittedByElement = document.getElementById('NewSubmittedBy');  // NewSubmittedBy
const newDescElement = document.getElementById('NewDescription');         // NewDesc
const saveRecipeHeadeButtonElement = document.getElementById('saveRecipeHeader'); // Submit new/update recipe header button
const recipeDetailUpdateEement = document.getElementById('detail-Update');// Container for ingredients and method

saveRecipeHeadeButtonElement.addEventListener('click', SaveUpdateRecipe);

function popIngredientDetailForUpdate(){
  console.log("popIngredientDetailForUpdate");

  if (ingredientListContents.childElementCount > 0){
    console.log('Remove ingredients from previous recipe.');
    clearIngredientsList();
  }

  var ingredientsUpdateListData = firestore.collection('recipes').doc(selectedRecipeID).collection('Ingredients').orderBy('orderBy');

  console.log('ingredientListTableRowHTML...');

  // Start listening to the query to get ingredients list data.
  ingredientsUpdateListData.onSnapshot(function(snapshot) {
    snapshot.docChanges().forEach(function(change) {
    
    var rowid = 0
    
    if (change.type === 'removed') {
      deleteListItem(change.doc.id);
    } else {
      var ListItem = change.doc.data();
      console.log('Ingredients list item: ', ListItem.orderBy, ListItem.item, ListItem.qty, ListItem.unit);
      displayIngredientListItem(change.doc.id, ListItem.orderBy, ListItem.item, ListItem.qty, ListItem.unit)      
    }
    });
  })    
  recipeDetailUpdateEement.removeAttribute('hidden');   
  console.log('popIngredientDetailForUpdate - Done');
}

function popMethodDetailForUpdate(){
  console.log("popMethodDetailForUpdate");

  if (methodListContents.childElementCount > 0){
    console.log('Remove instructions from previous recipe.');
    clearMethodList();
  }

  var methodUpdateListData = firestore.collection('recipes').doc(selectedRecipeID).collection('Method').orderBy('orderBy');

  console.log('methodUpdateListData...');

  // Start listening to the query to get method list data.
  methodUpdateListData.onSnapshot(function(snapshot) {
    snapshot.docChanges().forEach(function(change) {
    
    var rowid = 0
    
    if (change.type === 'removed') {
      deleteListItem(change.doc.id);
    } else {
      var ListItem = change.doc.data();
      console.log('Method list item: ', ListItem.orderBy, ListItem.method);
      displayMethodListItem(change.doc.id, ListItem.orderBy, ListItem.method)      
    }
    });
  })    
  recipeDetailUpdateEement.removeAttribute('hidden');   
  console.log('popMethodDetailForUpdate - Done');
}

function NewRecipeShow(){
    // Display and populate the gallery.
    console.log('Show New:');
    
    selectedRecipeID = '';

    NewRecipeForm();

    NewElement.removeAttribute('hidden');  
  }
  
  function UpdateShow(){
    // Display and populate the gallery.
    console.log('Show Update:');

    recipeOuterElement.setAttribute('hidden', 'true');  
    
    popRecipeForm();

    NewElement.removeAttribute('hidden');  
  }

  function NewRecipeForm(){    
    console.log('NewRecipeForm ');

    recipeDetailUpdateEement.setAttribute('hidden', 'true');  
    
    console.log('User: ', firebase.auth().currentUser.displayName);
    
    document.forms['UpdateNew-form'].elements['newTitle'].value = "";
    document.forms['UpdateNew-form'].elements['NewSubmittedBy'].value = firebase.auth().currentUser.displayName;
    document.forms['UpdateNew-form'].elements['NewDescription'].value = "";

    NewUpdateTitleElement.innerHTML = 'New Recipe'
    
    selectedRecipeTitle = "";
    
    console.log('NewRecipeForm defaults set');
  }

  function popRecipeForm(){
    
    console.log('popRecipeForm ', selectedRecipeID);

    loadRecipeImage("recipeImageEd", selectedRecipeID);

    if (selectedRecipeID !== ""){
      console.log('popRecipeForm : Show detail');
    } else {
      console.log('SaveUpdateRecipe : Hide detail');
    }

    var recipeHeader = firestore.collection("recipes").doc(selectedRecipeID);

    recipeHeader.get().then(function(doc) {
      if (doc.exists) {
        console.log("Recipe Header data:", doc.data());

        var RecipeItem = doc.data();
        console.log('Resipe id:', selectedRecipeID);
        console.log('Resipe: ', RecipeItem.title, ', ', RecipeItem.addedBy, ', ', RecipeItem.desc);

        selectedRecipeTitle = RecipeItem.title;
        console.log('***********************************************');
        console.log('RecipeItem.title : ', RecipeItem.title);
        console.log('RecipeItem.addedBy : ', RecipeItem.addedBy);
        console.log('RecipeItem.desc : ', RecipeItem.desc);
        console.log('selectedRecipeTitle : ', selectedRecipeTitle);

        NewUpdateTitleElement.innerHTML = 'Update Recipe';

        document.forms['UpdateNew-form'].elements['newTitle'].value = RecipeItem.title;
        document.forms['UpdateNew-form'].elements['NewSubmittedBy'].value = RecipeItem.addedBy;       
        document.forms['UpdateNew-form'].elements['NewDescription'].value = RecipeItem.desc;
        
        popIngredientDetailForUpdate();
        popMethodDetailForUpdate();
                
      } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
      }
    }).catch(function(error) {
        console.log("Error getting document:", error);
    });
    
    console.log('popRecipeForm: Done');
  }
  
  function SaveUpdateRecipe(){
    if (selectedRecipeID !== ""){
      console.log('SaveUpdateRecipe : Update - ', selectedRecipeID);
    } else {
      console.log('SaveUpdateRecipe : New');
    }

    var titleTxt = newTitleElement.value;
    var submittedTxt = newSubmittedByElement.value;
    var descTxt = newDescElement.value;

    console.log('titleTxt : ', titleTxt);
    console.log('submittedTxt : ', submittedTxt);
    console.log('descTxt : ', descTxt);
    console.log('selectedRecipeTitle : ', selectedRecipeTitle);

    if(validateHeaderUpdate(titleTxt, submittedTxt, descTxt)){
      if(selectedRecipeID !== ""){

        // Get current recipe title so it can be removed from searchTxt        
        var recipeDoc = firestore.collection('recipes').doc(selectedRecipeID);
        
        // Build JSON object to save
        var recipeHeaderJSON = {title: titleTxt, addedBy: submittedTxt, desc: descTxt}

        firestore.collection("recipes").doc(selectedRecipeID).update({
          recipeHeaderJSON
        });

        console.log('Recipe header updated');
        popupToastMsg('Recipe has been updated');    
        
        // Clear old recipe title from searchTxt
        removeSearchTxt(selectedRecipeTitle);
        selectedRecipeTitle = titleTxt;
        
        // Save recipe title to searchTxt
        addSearchTxt(titleTxt);

      } else {
        // Add a new document with a generated id.
        firestore.collection("recipes").add({
          title: titleTxt,
          addedBy: submittedTxt, // Name chosen by user to display with recipe.
          desc: descTxt,
          user: firebase.auth().currentUser.email // Used to identify owner for allowing updates etc.          
        })
        .then(function(docRef) {
          selectedRecipeID = docRef.id;
          console.log("New recipe header saved with ID: ", docRef.id);
          popRecipeForm();
          popupToastMsg('New recipe header has been added');    
          
          // Save recipe title to searchTxt
          addSearchTxt(titleTxt);
        })
        .catch(function(error) {
          console.error("Error adding new recipe header: ", error);
        });
      }
  
    } else {
      console.log('Recipe header updated failed');
    }
  }

  function validateHeaderUpdate(titleTxt, submittedTxt, descTxt){
    if (titleTxt == "") {
      popupToastMsg("Please enter a recipe title");
      return false;
    }
    if (submittedTxt == "") {
      popupToastMsg("Please enter a your name.");
      return false;
    }
    if (descTxt == "") {
      popupToastMsg("Please enter a recipe description.");
      return false;
    }
    return true;
  }

/*----------------------------------------------------------------------------------------------------------*/
/* Recipe Image */
var imageFormElement = document.getElementById('image-form');
var mediaCaptureElement = document.getElementById('mediaCapture');
var imageButtonElement = document.getElementById('submitImage');
var recipeImageEdElement = document.getElementById('recipeImageEd');
var uploaderElement = document.getElementById('uploader');

// Events for image upload.
imageButtonElement.addEventListener('click', function(e) {
  e.preventDefault();
  mediaCaptureElement.click();
});

mediaCaptureElement.addEventListener('change', onMediaFileSelected);

// Triggered when a file is selected via the media picker.
function onMediaFileSelected(event) {
  console.log("onMediaFileSelected");
  
  event.preventDefault();

  // Get the file
  var file = event.target.files[0];

  // Clear the selection in the file picker input.
  imageFormElement.reset();

  // Check if the file is an image.
  if (!file.type.match('image.*')) {
    var data = {
      message: 'You can only share images',
      timeout: 2000
    };
    signInSnackbarElement.MaterialSnackbar.showSnackbar(data);
    return;
  }
  // Check if the user is signed-in
  if (checkSignedInWithMessage()) {
    saveRecipeImage(file);
  }
}

// Saves a new message containing an image in Firebase.
// This first saves the image in Firebase storage.
function saveRecipeImage(file) {
  console.log("saveRecipeImage");

  // "uploader" hidden
  uploaderElement.removeAttribute('hidden');

  // Set image path
  var filePath = 'recipeImages/' + selectedRecipeID;

  console.log("filePath", filePath);

  // Create a storage ref
  var storageRef = firebase.storage().ref(filePath);

  // Upload the 
  var task = storageRef.put(file);

  // Update progress bar
  task.on('state_changed',
    function progress(snapshot){
      var percentage = (snapshot.bytesTransfered / snapshot.totalBytes) * 100;
      uploader.value = percentage;
    },

    function error(err){
      console.error('There was an error uploading a file to Cloud Storage:', error);
    },

    function complete(){
      console.log('Image upladed:');
      popupToastMsg("Recipe image saved.");    
      uploader.value = 100;
      loadRecipeImage("recipeImageEd", selectedRecipeID);
      uploaderElement.setAttribute('hidden', 'true');
    }
  );
  console.log("saveRecipeImage - done");
}

function loadRecipeImage(imageElm, RecipeID){
  console.log("loadRecipeImage for : ", imageElm);
  console.log("loadRecipeImage id : ", RecipeID);


  var storage    = firebase.storage();
  var storageRef = storage.ref();

  var image = document.getElementById(imageElm);
  
  //image.width = "400";
  //console.log("image.width: ", image.width);

  storageRef.child('recipeImages/' + RecipeID).getDownloadURL().then(function(url) {
      console.log("loadRecipeImage - url : ", url);

      image.src = url;
      
      console.log("image.src: ", image.src);
  }).catch(function(error) {
    if (error.code == "storage/object-not-found") {
      console.log("loadRecipeImage - File NOT found! Load the default.");
      image.src = "/images/default.jpg";      
    } else {
      console.error('There was an error downloading a file from Cloud Storage:', error);  
    }
  });
  
  console.log("loadRecipeImage - done");
}

/*----------------------------------------------------------------------------------------------------------*/
/* Ingredients update & add */
const ingredientListContents = document.getElementById('ingredientsListForEdit'); // List of ingredients
const submitIngredientButton = document.getElementById('submitIngredient'); // Button to add ingredient

const inputIngredientNumData = document.querySelector("#ingredientNum");
const inputIngredientDescData = document.querySelector("#ingredientDesc");
const inputIngredientQtyData = document.querySelector("#ingredientQty");
const inputIngredientUnitData = document.querySelector("#ingredientUnit");

//inputIngredientNumData.addEventListener('mouseover', ingredientNumSet);
inputIngredientNumData.addEventListener('click', ingredientNumSet);

function ingredientNumSet(){
  console.log("mouseOverTest");
  inputIngredientNumData.value = listGetNextIntemNum('ingredientsListForEdit');
}


submitIngredientButton.addEventListener('click', function(){
  console.log("addEventListener.");

  if (inputIngredientNumData.value == ""){
    console.log("methodNum not entered. ", inputIngredientNumData.value);
    inputIngredientNumData.value = listGetNextIntemNum('ingredientsListForEdit');
    console.log("methodNum not entered so default to ", inputIngredientNumData.value);
  }

  //if(isNaN(inputIngredientNumData.value)){
  //  console.log("inputIngredientNumData.value is not a number.");
  //  popupToastMsg("The 'Item No.' must be a number.");    
  //} else 
  if (isNaN(inputIngredientQtyData.value)){
    console.log("inputIngredientQtyData.value is not a number.");
    popupToastMsg("The 'Quantity' must be a number.");    
  } else {
    if (inputIngredientDescData.value){
      const itemNum = inputIngredientNumData.value;
      const itemDesc = inputIngredientDescData.value;
      const itemQty = inputIngredientQtyData.value;
      const itemUnit = inputIngredientUnitData.value;
      
      console.log("Instanciate ingredient collection.");

      //var ingredientsUpdateListData = firestore.collection('recipes').doc(selectedRecipeID).collection('Ingredients');
      var ingredientsUpdateListData = firestore.collection('recipes').doc(selectedRecipeID);

      //return ingredientsUpdateListData.add({
      return ingredientsUpdateListData.collection('Ingredients').add({
        orderBy: Number(itemNum),
        item: itemDesc,
        qty: Number(itemQty),
        unit: itemUnit,
        user: firebase.auth().currentUser.email
      }).then(function() {
        
        resetMaterialTextfield(inputIngredientNumData);
        resetMaterialTextfield(inputIngredientDescData);
        resetMaterialTextfield(inputIngredientQtyData);
        resetMaterialTextfield(inputIngredientUnitData);
        
        console.log("Ingredient list item saved")

        addSearchTxt(itemDesc);

      }).catch(function (error){
        console.log("Got an error: ", error)
      });
    } else {
      console.log("Nothing to save.");
      popupToastMsg('Please enter a description of the ingredients.');    
    }
  }
  console.log("click done.");
});

function clearIngredientsList(){
  // Remove existing rows from the ingredients list table before being repopulated.
  console.log('clearIngredientsList...');
  
  var fc = ingredientListContents.firstChild;

  while( fc ) {
    console.log('Clear ingredient list row.');
    ingredientListContents.removeChild( fc );
      fc = ingredientListContents.firstChild;
  }
}

// Build HTML for the ingredient list rows
function displayIngredientListItem(id, orderBy, item, qty, unit){
  console.log('displayIngredientListItem: ', orderBy, item, qty, unit);

  var ingredientStr = item;

  if (qty == 0){
    console.log('qty is zero');
    ingredientStr = orderBy + '. ' +  item + ' ' + unit;
  } else {
    console.log('qty is not zero');
    ingredientStr = orderBy + '. ' +  item + ' ' + qty + ' ' + unit;
  }

  console.log('ingredientStr: ', ingredientStr);

  // orderBy + `. ` +  item + ` ` + qty + ` ` + unit

  const container = document.createElement('li');
  container.setAttribute('id', id);

  var tableRow = document.getElementById(id)

  var content = `<li id="row[` + id + `] class="mdl-list__item">
          <span class="mdl-list__item-primary-content">
          ` + ingredientStr + ` 
          </span>
        </li>`;

  container.innerHTML = content;

  container.addEventListener('click', function(e) {
    console.log('Click',e);   
    
    var r = confirm("Remove '" + item + "' from the ingredients list?");
    if (r == true) {
      deleteIngredient(container.id, container.innerText);
    } else {
      console.log('ignore click');  
    }
  });  

  console.log('container.innerHTML: ', container.innerHTML);

  ingredientListContents.appendChild(container);
}

function deleteIngredient(rowId, titleTxt){  
  console.log('Recipe ', selectedRecipeID);   
  console.log('deleteIngredient', rowId);   
  console.log('Ingredient title', titleTxt);   

  var ingredientsListData = firestore.collection('recipes').doc(selectedRecipeID);
  
  // Delete the row...
  // firestore.collection('recipes').doc(selectedRecipeID).collection('Ingredients').doc(rowId).delete().then(function() {
  ingredientsListData.collection('Ingredients').doc(rowId).delete().then(function() {
    console.log("Item successfully deleted!");
    listRemoveRowByID(rowId);

    removeSearchTxt(titleTxt);

  }).catch(function(error) {
      console.error("Error removing document: ", error);
  });
}

function addSearchTxt(searchTxt){
  console.log("addSearchTxt: ", searchTxt)

  searchTxt = searchTxt.toLowerCase();

  console.log("addSearchTxt: ", searchTxt)

  // Add to searchTxt array
  const itemDescArr = searchTxt.split(" ");
  const ignoreTxt = [" ", "&", "a", "in", "of", "on", "and", "the", "with"];
  
  var recipeDoc = firestore.collection('recipes').doc(selectedRecipeID);

  console.log("Add Ingredient to searchTxt array.", itemDescArr)

  itemDescArr.forEach(function(element){
    if (ignoreTxt.includes(element)){
      console.log('Not adding:', element)
    } else {
      console.log('Adding:', element)
      recipeDoc.update({
        searchTxt: firebase.firestore.FieldValue.arrayUnion(element)
      })
    }
  })
  console.log("addSearchTxt: Done")
}

function removeSearchTxt(searchTxt){
  console.log("removeSearchTxt: ", searchTxt)

  // Add to searchTxt array
  const serachTxtArr = searchTxt.split(" ");

  var recipeDoc = firestore.collection('recipes').doc(selectedRecipeID);

  serachTxtArr.forEach(function(element){
    console.log('Removing:', element)
    recipeDoc.update({
      searchTxt: firebase.firestore.FieldValue.arrayRemove(element)
    })
  })
  console.log("removeSearchTxt: Done")
}

/*----------------------------------------------------------------------------------------------------------*/
/* Method update & add */
const methodListContents = document.getElementById('methodListForEdit'); // List of method steps
const submitMethodButton = document.getElementById('submitMethod'); // Button to add methos step

const inputMethodNumData = document.querySelector("#methodNum");
const inputMethodDescData = document.querySelector("#methodDesc");

//inputIngredientNumData.addEventListener('mouseover', ingredientNumSet);
inputMethodNumData.addEventListener('click', methodNumSet);

function methodNumSet(){
  console.log("methodNumSet");
  inputMethodNumData.value = listGetNextIntemNum('methodListForEdit');
}

submitMethodButton.addEventListener('click', function(){
  console.log("Adding method item.");

  if(isNaN(inputMethodNumData.value)){
    console.log("inputMethodNumData.value is not a number.");
    popupToastMsg("The 'Item No.' must be a number.");    
  }  else {
    if (inputMethodDescData.value){
      if (inputMethodNumData.value == ""){
        console.log("methodNum not entered. ", inputMethodNumData.value);
        inputMethodNumData.value = listGetNextIntemNum('methodListForEdit');
        console.log("methodNum not entered so default to ", inputMethodNumData.value);
      }
            
      const methodNum = inputMethodNumData.value;
      const methodDesc = inputMethodDescData.value;
      
      console.log("Instanciate method collection.");

      var methodUpdateListData = firestore.collection('recipes').doc(selectedRecipeID).collection('Method');

      return methodUpdateListData.add({
        orderBy: Number(methodNum),
        method: methodDesc,
        user: firebase.auth().currentUser.email
      }).then(function() {
        
        resetMaterialTextfield(inputMethodNumData);
        resetMaterialTextfield(inputMethodDescData);
        
        console.log("Method list item saved")

      }).catch(function (error){
        console.log("Got an error: ", error)
      });
    } else {
      console.log("Nothing to save.");
      popupToastMsg('Please enter the detail of the method.');    
    }
  }
  console.log("click done.");
});


function clearMethodList(){
  // Remove existing rows from the method list table before being repopulated.
  console.log('clearMethodList...');
  
  var fc = methodListContents.firstChild;

  while( fc ) {
    console.log('Clear method list row.');
    methodListContents.removeChild( fc );
      fc = methodListContents.firstChild;
  }
}

// Build HTML for the method list rows
function displayMethodListItem(id, orderBy, method){
  console.log('displayMethodListItem: ', orderBy, method);

  const container = document.createElement('tr');
  container.setAttribute('id', id);

  var tableRow = document.getElementById(id) 

  var content = `<li id="row[` + id + `]class="mdl-list__item">
          <span class="mdl-list__item-primary-content">
          ` + orderBy + `. ` + method + `
          </span>
        </li>
        <br>`;

  container.innerHTML = content;
    
  container.addEventListener('click', function(e) {
    console.log('Click',e);   
    
    var r = confirm("Remove '" + method + "' from the instructions list?");
    if (r == true) {
      deleteMethod(container.id);
    } else {
      console.log('ignore click');  
    }
  });  

  console.log('container.innerHTML: ', container.innerHTML);

  methodListContents.appendChild(container);
}

function deleteMethod(rowId){  
  console.log('Recipe ', selectedRecipeID);   
  console.log('deleteMethod',rowId);   

  // Delete the row...
  firestore.collection('recipes').doc(selectedRecipeID).collection('Method').doc(rowId).delete().then(function() {
    console.log("Item successfully deleted!");
    listRemoveRowByID(rowId);
  }).catch(function(error) {
      console.error("Error removing document: ", error);
  });
}

/*=======================================================================================================*/









/*=======================================================================================================*/
/* Shopping List */
function shoppingListHTML(){
    // Display and populate the shopping list.
    console.log('Show shopping list:');
    
    clearShoppingList();  
    popShoppingList();
  
    shoppingListElement.removeAttribute('hidden');
  
  }

const shoppingListContents = document.getElementById('shoppingListContents');

//const galleryElement = document.getElementById('Gallery-container');

const inputItemDescData = document.querySelector("#itemDesc");
const inputItemQtyData = document.querySelector("#itemQty");
const inputItemUnitData = document.querySelector("#itemUnit");

// Shopping list buttons
const submitItemButtonElement = document.getElementById('submitItem');
const submitRefreshButtonElement = document.getElementById('submitRefresh');

//var shoppingListId = getShoppingListId();
var shoppingListData = firestore.collection('shoppingList');//.where("userId", "==", userId);

submitItemButtonElement.addEventListener("click", function() {
  console.log("Adding new item:");
  console.log("Adding new item:", firebase.auth().currentUser.email);

  if (inputItemDescData.value){
    const itemDesc = inputItemDescData.value;
    const itemQty = inputItemQtyData.value;
    const itemUnit = inputItemUnitData.value;
    
    addNewItemToShoppingList(itemDesc, itemQty, itemUnit)
  }
  console.log("click done.");
})

// Delete items ticked in list.
submitRefreshButtonElement.addEventListener("click", function() {
  console.log("click refresh...");

  if (confirm('Permanently remove all ticked items?')){
    //Reference the Table.
    var grid = document.getElementById("shoppingList-table");

    //Reference the CheckBoxes in Table.
    var checkBoxes = grid.getElementsByTagName("input");

    //Loop through the rows and check CheckBoxes.
    for (var i = 0; i < checkBoxes.length; i++) {
      if (checkBoxes[i].checked) {
        console.log("Row checked: ", i);
        try{  
          // Get details of the row.
          var row = document.getElementById("shoppingList-table").rows[i+1].cells;
          var itemName = row[1].innerHTML;

          // Is there a better way of getting the id?
          var colZero = row[0].innerHTML;
          var start = colZero.lastIndexOf("[") + 1;
          var end = colZero.lastIndexOf("]");
          var rowId = colZero.slice(start, end);
          
          // Delete the row...
          firestore.collection('shoppingList').doc(rowId).delete().then(function() {
            console.log("Item successfully deleted!", itemName);
          }).catch(function(error) {
              console.error("Error removing document: ", error);
          });
        } catch (e) {
          console.error("Error", e);
        }
      }
    }
  }
  console.log("click done.");
})

function popShoppingList(){
  console.log("popShoppingList");
 
  // Set access by user.

  var userId = firebase.auth().currentUser.uid;

  const query = firestore.collection('shoppingList')
  .where("userId", "==", userId)
  .orderBy('desc', 'asc');

  console.log('shoppingListTableRowHTML...', userId);

  // Start listening to the query to get shopping list data.
  query.onSnapshot(function(snapshot) {
    console.log("ShoppingList snapshot.");

    snapshot.docChanges().forEach(function(change) {
    
    var rowid = 0
    
    if (change.type === 'removed') {
      console.log('Remove Shopping list item');
      deleteListItem(change.doc.id);
    } else {
      var ListItem = change.doc.data();
      console.log('Shopping list item: ', ListItem.desc, ListItem.qty, ListItem.unit, ListItem.gotit);
      displayListItem(change.doc.id, ListItem.desc, ListItem.qty, ListItem.unit, ListItem.gotit)      
    }
    });
  })

  console.log("popShoppingList done.");
}; 

  // Build HTML for the shopping list rows
  function displayListItem(id, desc, qty, unit, gotit){
    console.log('displayListItem: ', desc, qty, unit, gotit);
  
    const container = document.createElement('tr');
    container.setAttribute('id', id);
  
    var tableRow = document.getElementById(id) //|| createAndInsertMessage(id, timestamp);
  
    //div.querySelector('.name').textContent = desc;
    //var listElement = div.querySelector('.table');
  
    var content = '<tr>';
  
    content += `<td>
    <label class="mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect mdl-data-table__select" for="row[` + id + `]">
      <input type="checkbox" id="row[` + id + `]" class="mdl-checkbox__input" />
    </label>
    </td>`
    content += '<td class="mdl-data-table__cell--non-numeric">' + desc + '</td>';
    content += '<td>' + qty + '</td>';
    content += '<td>' + unit + '</td>';
    content += '</tr>';
  
    container.innerHTML = content;
      
    console.log('container.innerHTML: ', container.innerHTML);
  
    shoppingListContents.appendChild(container);
  }

  /*
  // Delete a shopping list item from the table.
  function deleteListItem(id) {
    console.log('deleteListItem: ', id);
    var div = document.getElementById(id);
    // If an element for that message exists we delete it.
    if (div) {
      div.parentNode.removeChild(div);
    }
  }
  */

  // Remove existing rows from shopping list table when selected from menu.
  function clearShoppingList(){
    console.log('clearShoppingList...');
    
    var fc = shoppingListContents.firstChild;

    while( fc ) {
      console.log('Clear shopping list row.');
      shoppingListContents.removeChild( fc );
        fc = shoppingListContents.firstChild;
    }
  }

  function addNewItemToShoppingList(itemDesc, itemQty, itemUnit){
    console.log("addNewItemToShoppingList.");
  
      //var shoppingListData = firestore.collection('shoppingList');
      //var shoppingListData = firestore.collection('shoppingList').doc('user.email').collection('items');
      // See https://firebase.google.com/docs/firestore/data-model for sub collection.
  
      //var shoppingListId = getShoppingListId();
      //console.log("Adding new item to list ID:", shoppingListId);
      console.log("  itemDesc: ", itemDesc);
      console.log("  itemQty:  ", itemQty);
      console.log("  itemUnit: ", itemUnit);
      console.log("  User:     ", firebase.auth().currentUser.email);
      console.log("  userId:   ", firebase.auth().currentUser.uid);
  
      // Saves a new item on the Cloud Firestore.
      //return firestore.collection('shoppingList').add({
      return shoppingListData.add({
        desc: itemDesc,
        qty: itemQty,
        unit: itemUnit,
        gotit: false,
        user: firebase.auth().currentUser.email,
        userId: firebase.auth().currentUser.uid,
        //listId: shoppingListId,
        Timestamp: firebase.firestore.FieldValue.serverTimestamp()
      }).then(function() {
        
        resetMaterialTextfield(inputItemDescData);
        resetMaterialTextfield(inputItemQtyData);
        resetMaterialTextfield(inputItemUnitData);
        
        console.log("Shopping list item saved")
      }).catch(function (error){
        console.log("Got an error: ", error)
      });
  
    console.log("addNewItemToShoppingList done.");
  }

  function addRecipeIngredientToShoppingList(){
    console.log('addRecipeIngredientToShoppingList');
    // Copy ingredients from recipe ingredients sub collection to shopping list.

    try{    
      const query = firestore.collection('recipes').doc(selectedRecipeID).collection('Ingredients')

      query.onSnapshot(function(snapshot) {
        snapshot.docChanges().forEach(function(change) {
    
        var ListItem = change.doc.data();
        console.log('Ingredient: ', ListItem.orderBy, ListItem.item, ListItem.qty, ListItem.unit);
        addNewItemToShoppingList(ListItem.item, ListItem.qty, ListItem.unit);
        }) 
      })
      alert("Ingredients added to shopping list.");

    }
    catch(err) {
      console.error("Error addRecipeIngredientToShoppingList: ", err.textContent);
    }
    console.log('addRecipeIngredientToShoppingList - Done');
  }

/*=======================================================================================================*/
/* About */
function aboutShow(){
    // Display the about info.
    console.log('Show About:');
    
    aboutElement.removeAttribute('hidden');  
  }

// Currently defined by HTML.

/*=======================================================================================================*/
// Utility functions

  function popupToastMsg(msgTxt){
    // Display a message to the user using a Toast.
    var data = {
      message: msgTxt,
      timeout: 2000
    };
    signInSnackbarElement.MaterialSnackbar.showSnackbar(data);
  }

  // Delete item in shopping list or ingredient list from the data table.
  function deleteListItem(id) {
    console.log('deleteListItem: ', id);
    var div = document.getElementById(id);
    // If an element for that message exists we delete it.
    if (div) {
      console.log('removeChild: ', div);
      console.log('parentNode: ', div.parentNode.nodeName);
      div.parentNode.removeChild(div);
    } else {
      console.log('problem with div: ', div);
    }
  }

  function tableGetNextIntemNum(tableName){
    console.log("tableGetNextIntemNum", tableName); // "ingredients-table"
  
    //Reference the Table.
    var table = document.getElementById(tableName);
    var rows = table.getElementsByTagName("tr");
    var nextItemNum = 1;
  
    for(var i = 1; i < rows.length; i++) {
      try{
        console.log("Row : ", i);
        var cellVal = table.rows[i].cells[0].innerHTML;
        console.log("cellVal", cellVal);
  
        if (cellVal >= nextItemNum){
          nextItemNum = Number(cellVal) + 1;
        }
  
      } catch (e) {
        console.error("Error", e);
      }
    }
  
    console.log('nextItemNum: ', nextItemNum);
    return nextItemNum;
  }

  function listGetNextIntemNum(listName){
    console.log("listGetNextIntemNum", listName);
  
    //Reference the list.
    var ul = document.getElementById(listName);
    var nextItemNum = 1;

    var items = ul.getElementsByTagName("li");

    console.log("List item count : ", items.length);

    for (var i = 0; i < items.length; ++i) {
      var itemVal = items[i].innerHTML;
      var start = itemVal.indexOf(">") + 1;
      var end = itemVal.indexOf(".");
      var thisRowId = itemVal.slice(start, end);

      if (thisRowId >= nextItemNum){
        nextItemNum = Number(thisRowId) + 1;
      }
    }
  
    console.log('nextItemNum: ', nextItemNum);
    return nextItemNum;
  }


  function listRemoveRowByID(id){
    console.log('deleteListItem: ', id);

    var div = document.getElementById(id);
    // If an element for that message exists we delete it.
    if (div) {
      console.log('removeChild: ', div);
      console.log('parentNode: ', div.parentNode.nodeName);
      div.parentNode.removeChild(div);
    } else {
      console.log('problem with div: ', div);
    }

    /*
    console.log("listRemoveRowByID ID: ", RowID);
    
    var ListItem = document.getElementById(RowID);

    try{
      ListItem.parentNode.removeChild[ListItem];
      console.log("List item deleted");
    } catch (e) {
      console.error(e);
      console.log("Problem deleting list item");
    }    
    */
  }

  function listRemoveRow(listName, RowID){
    console.log("listRemoveRow List: ", listName);
    console.log("listRemoveRow ID: ", RowID);
  
    var ul = document.getElementById(listName);
    var items = ul.getElementsByTagName("li");

    console.log("List item count : ", items.length);

    for (var i = 0; i < items.length; ++i) {
      var item = items[i];
      var itemVal = item.id;
      
      console.log('itemVal: ', itemVal);

      var start = itemVal.indexOf('row[') + 4;

      if (start > 0){
        var end = itemVal.indexOf(']');
        var thisRowId = itemVal.slice(start, end);

        console.log('thisRowId: ', thisRowId);
        
        if (RowID == thisRowId){
          console.log('RowId found', thisRowId);
          //items.deleteListItem(i);
          item.parentNode.removeChild[item]; // Still not removing list item!!!

          console.log('Row deleted: ', i);
          break;
        }
      }
    }  
  }

  /* Date Formatting */
  function dateStringShort(){
    var monthArray = ["January", "February", "March","April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var weekdayArray = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    
    let current_datetime = new Date()
    
    // var weekday = monthArray[current_datetime.getDate()];
    // var month = monthArray[current_datetime.getMonth()];

    var weekday = current_datetime.getDate();
    var month = current_datetime.getMonth() + 1; // Note: January is 0.
    var year = current_datetime.getFullYear();
    var hour = current_datetime.getHours();
    var minutes = current_datetime.getMinutes();
  
    let formatted_date = year + "-" + month + "-" + weekday + "-" + hour + "-" + minutes
    console.log("formatted_date", formatted_date);
  
    return formatted_date;
  }

  /* Date Formatting */
  function dateString(){
    var monthArray = ["January", "February", "March","April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var weekdayArray = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    
    let current_datetime = new Date()
    var weekday = weekdayArray[current_datetime.getDay()];
    var dayNum = current_datetime.getDate();
    var month = monthArray[current_datetime.getMonth()];
    var year = current_datetime.getFullYear();
    var ordinal = '';
    switch(dayNum){
      case '1', '21', '31':
        ordinal = 'st';
        break;
      case '2', '22':
        ordinal = 'nd';
        break;
        case '3', '23':
          ordinal = 'rd';
          break;
      default:
        ordinal = 'th';
    }
  
    let formatted_date = weekday + " " + dayNum + '<sup>' + ordinal + "</sup> " + month + " " + year;
    console.log(formatted_date);
  
    return formatted_date;
  }
  
/*=======================================================================================================*/