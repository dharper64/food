
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
    let features = ['auth', 'database', 'messaging', 'storage'].filter(feature => typeof app[feature] === 'function');
    document.getElementById('load').innerHTML = `Firebase SDK loaded with ${features.join(', ')}`;
  } catch (e) {
    console.error(e);
    document.getElementById('load').innerHTML = 'Error loading the Firebase SDK, check the console.';
  }
});
  
  // Get a reference to the database service
  var firestore = firebase.firestore();

/*=====================================================================================================*/
/* #region Authentication */

// Shortcuts to DOM Elements.
var userPicElement = document.getElementById('user-pic');
var userNameElement = document.getElementById('user-name');
var signInButtonElement = document.getElementById('sign-in');
var signOutButtonElement = document.getElementById('sign-out');

var signInSnackbarElement = document.getElementById('must-signin-snackbar');

// Saves message on form submit.
signOutButtonElement.addEventListener('click', signOut);
signInButtonElement.addEventListener('click', signIn);

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
  
  var provider = new firebase.auth.GoogleAuthProvider();
  
  firebase.auth().signInWithPopup(provider).then(function(result) {
    // This gives you a Google Access Token. You can use it to access the Google API.
    var token = result.credential.accessToken;
    
    console.log("session token...", token);
    // The signed-in user info.    
    try {
      var newUser = result.user;
      logSignIn(newUser, token);
      //logSignIn();
      console.log("User displayName...", newUser.displayName);
      //console.log("User details...", newUser);
    }
    catch(err) {
      console.error("Error logging on: ", err.textContent);
    }
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

// Returns the signed-in user's profile Pic URL.
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

// Returns the signed-in user's display name.
function getUserName() {
  console.log("getUserName...");
  return firebase.auth().currentUser.displayName;
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

    // Set the user's profile pic and name.
    userPicElement.style.backgroundImage = 'url(' + addSizeToGoogleProfilePic(profilePicUrl) + ')';

    userNameElement.textContent = userName;

    // Show user's profile and sign-out button.
    userNameElement.removeAttribute('hidden');
    userPicElement.removeAttribute('hidden');
    signOutButtonElement.removeAttribute('hidden');

    // Hide sign-in button.
    signInButtonElement.setAttribute('hidden', 'true');

  } else { // User is signed out!
    // Hide user's profile and sign-out button.
    console.log("User is not signed in!...");
    userNameElement.setAttribute('hidden', 'true');
    userPicElement.setAttribute('hidden', 'true');    
    signOutButtonElement.setAttribute('hidden', 'true');

    // Show sign-in button.
    signInButtonElement.removeAttribute('hidden');

    //loggedInLinks.setAttribute('hidden', 'true');
  }
}

function logSignIn(user, token){
//function logSignIn(){
  // Log a user signing on

  console.log("logSignIn...");

  var currentDate = dateStringShort();

  console.log("Save logon event to Firebase as ", currentDate);

  var signInLog = firestore.collection("signInLog").doc(user.email);  

  signInLog.set({
    userName: user.displayName,
    lastLogOn: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(function(docRef) {
      console.log("Logon event saved Firebase", user.displayName);

      //var signInLogTimeStamp = firestore.collection("signInLog").doc(user.email).collection('log');
      var logDoc = signInLog.collection('logDetail').doc(currentDate);

      logDoc.set({
        date: firebase.firestore.FieldValue.serverTimestamp(),
        token: token
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

    //mainDiv.setAttribute('hidden', 'true');
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
/* #region RecipieCards */
/* Home - Recipie Cards */

// const homeElement = document.getElementById('home-container'); - Home element defined above

//const selectedRecipeCard = document.getElementsByClassName('cardAction')
//selectedRecipeCard.addEventListener('click', loadRecipeDetail);
//selectedRecipeCard.addEventListener('click', function(){    
//    console.log('Recipe card click event');
//});

var selectedRecipeID = 0;

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

  //var x = document.getElementById("myLI").parentElement.nodeName;
  //var id = addToShoppingListButtonElement.parentElement.id

  console.log('addIncredientsToShoppingList ', selectedRecipeID);

  //linkClicked("Home");
}); 

editRecipeButtonElement.addEventListener('click', function() {
  console.log('Edit Button Clicked');   
  
  //var x = document.getElementById("myLI").parentElement.nodeName;
  //var id = editRecipeButtonElement.parentElement.id;

  console.log('addIncredientsToEditList ', selectedRecipeID);

  // Clear lists used for menu view
  clearIngredientsListElement();
  clearMethodListElement();

  // Display editable version
  UpdateShow();

  //linkClicked("Home");
}); 



//addToShoppingListButtonElement.addEventListener('click', addIncredientsToShoppingList());
//editRecipeButtonElement.addEventListener('click', editRecipe());



//var recipiesListData = firestore.collection('recipies');

function homeShow(){
    // Display and populate the gallery.
    console.log('Show Home:');
    
    popRecipes();

    homeElement.removeAttribute('hidden');  
  }

function popRecipes(){
  console.log('popRecipes:', recipeListElement.childElementCount);
  
  if (recipeListElement.childElementCount > 0){
    console.log('Recipe cards already loaded.');
  } else {

    //clearRecipeListElement();

    const query = firestore.collection('recipes');

    console.log('Got Recipes:');

    // Start listening to the query to get shopping list data.
    query.onSnapshot(function(snapshot) {
        snapshot.docChanges().forEach(function(change) {                
        if (change.type === 'removed') {
            deleteListItem(change.doc.id);
        } else {
            var ListItem = change.doc.data();
            console.log('Resipes list: ', ListItem.title, ', ', ListItem.desc);
            displayRecipeCard(change.doc.id, ListItem.title, ListItem.desc)      
        }
        });
    })
  }
}; 

// Remove existing rows from recipe list when selected from menu.
function clearRecipeListElement(){
  console.log('clearRecipeListElement...');
    
  // If the <ul> element has any child nodes, remove its first child node
  if (recipeListElement.hasChildNodes()) {
    recipeListElement.removeChild(recipeListElement.childNodes[0]);
  }

  /*
  var fc = recipeListElement.firstChild;

  while( fc ) {
    console.log('Clear recipe list row.');
    recipeListElement.removeChild( fc ); // ToDo: This may be erroring
      fc = recipeListElement.firstChild;
  }
  */
}

function displayRecipeCard(id, title, desc){
    console.log('displayListItem: ', id, title, desc);

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

    var content = '';
    content += `<div class="mdl-cell mdl-cell--6-col">`
    content += `<div class="recipeCard demo-card-square mdl-card mdl-shadow--2dp">`
    content += `<div id="` + id + `>`

    content += `<figure class="mdl-card__media">
                    <img src="/images/default.jpg" alt="" style="width:100%" />
                </figure>`

    content += `<div class="mdl-card__title mdl-card--expand"><h2 class="mdl-card__title-text">` + title + `"</h2></div>`;
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

  // Start listening to the query to get shopping list data.
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
  
  const container = document.createElement('li');
  container.setAttribute('id', id);

  var tableRow = document.getElementById(id)

  var content = `<li id="row[` + id + `] class="mdl-list__item">
          <span class="mdl-list__item-primary-content">
          ` +  item + ` ` + qty + ` ` + unit + ` 
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

  // Start listening to the query to get shopping list data.
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

  // Start listening to the query to get shopping list data.
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

  // Start listening to the query to get shopping list data.
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
    
    console.log('NewRecipeForm defaults set');
  }

  function popRecipeForm(){
    
    console.log('popRecipeForm ', selectedRecipeID);

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

    if(validateHeaderUpdate(titleTxt, submittedTxt, descTxt)){
      if(selectedRecipeID !== ""){
        firestore.collection("recipes").doc(selectedRecipeID).update({
          title: titleTxt,
          addedBy: submittedTxt,
          desc: descTxt
        });

        console.log('Recipe header updated');
        popupToastMsg('Recipe has been updated');    

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
      loadRecipeImage();
    }
  );
  console.log("saveRecipeImage - done");
}

function loadRecipeImage(){
  console.log("loadRecipeImage - done");

  var storage    = firebase.storage();
  var storageRef = storage.ref();
  var spaceRef = storageRef.child('recipeImages/' + selectedRecipeID);
  
  storageRef.child('recipeImages/' + selectedRecipeID).getDownloadURL().then(function(url) {
  
  //var test = url;
  //  add this line here:
  //document.getElementById("recipeImageEd").src = test;
  //document.getElementById("recipeImageEd").src = "/images/testcard.jpg";

  console.log("loadRecipeImage - url : ", url);

  //recipeImageEdElement.src = url;
  recipeImageEdElement.src = "/images/default.jpg";

  }).catch(function(error) {
      console.error('There was an error downloading a file from Cloud Storage:', error);  
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

  // ToDo : Set default item number
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

      var ingredientsUpdateListData = firestore.collection('recipes').doc(selectedRecipeID).collection('Ingredients');

      return ingredientsUpdateListData.add({
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

  const container = document.createElement('li');
  container.setAttribute('id', id);

  var tableRow = document.getElementById(id)

  var content = `<li id="row[` + id + `] class="mdl-list__item">
          <span class="mdl-list__item-primary-content">
          ` + orderBy + `. ` +  item + ` ` + qty + ` ` + unit + ` 
          </span>
        </li>`;

  container.innerHTML = content;

  container.addEventListener('click', function(e) {
    console.log('Click',e);   
    
    var r = confirm("Remove '" + item + "' from the ingredients list?");
    if (r == true) {
      deleteIngredient(container.id);
    } else {
      console.log('ignore click');  
    }
  });  

  console.log('container.innerHTML: ', container.innerHTML);

  ingredientListContents.appendChild(container);
}

function deleteIngredient(rowId){  
  console.log('Recipe ', selectedRecipeID);   
  console.log('deleteIngredient',rowId);   

  // Delete the row...
  firestore.collection('recipes').doc(selectedRecipeID).collection('Ingredients').doc(rowId).delete().then(function() {
    console.log("Item successfully deleted!");
    listRemoveRowByID(rowId);
  }).catch(function(error) {
      console.error("Error removing document: ", error);
  });
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

// Build HTML for the shopping list rows
function displayMethodListItem(id, orderBy, method){
  console.log('displayMethodListItem: ', orderBy, method);

  //id = 'ed-' + id;

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

var shoppingListData = firestore.collection('shoppingList');

submitItemButtonElement.addEventListener("click", function() {
  console.log("Adding new item:", firebase.auth().currentUser.email);

  if (inputItemDescData.value){
    const itemDesc = inputItemDescData.value;
    const itemQty = inputItemQtyData.value;
    const itemUnit = inputItemUnitData.value;
    
    //var shoppingListData = firestore.collection('shoppingList');
    //var shoppingListData = firestore.collection('shoppingList').doc('user.email').collection('items');
    // See https://firebase.google.com/docs/firestore/data-model for sub collection.

    // Saves a new item on the Cloud Firestore.
    //return firestore.collection('shoppingList').add({
    return shoppingListData.add({
      desc: itemDesc,
      qty: itemQty,
      unit: itemUnit,
      gotit: false,
      user: firebase.auth().currentUser.email
    }).then(function() {
      
      resetMaterialTextfield(inputItemDescData);
      resetMaterialTextfield(inputItemQtyData);
      resetMaterialTextfield(inputItemUnitData);
      
      console.log("Shopping list item saved")
    }).catch(function (error){
      console.log("Got an error: ", error)
    });
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

          // ToDo: Is there a better way of getting the id?
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

  const query = firestore.collection('shoppingList');
  //const query = firestore.collection('shoppingList').doc('user.email').collection('items');
  // See https://firebase.google.com/docs/firestore/data-model for sub collection.

  console.log('shoppingListTableRowHTML...');

  //var query = firestore.collection('shoppingList');
  //.orderBy('order', 'desc')
  //.limit(12);

  // Start listening to the query to get shopping list data.
  query.onSnapshot(function(snapshot) {
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
  })}; 

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