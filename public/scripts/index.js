
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
/** Handles authentication */

//'use strict';

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
    return true;
  }

  // Display a message to the user using a Toast.
  var data = {
    message: 'You must sign-in first',
    timeout: 2000
  };
  signInSnackbarElement.MaterialSnackbar.showSnackbar(data);
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

/*=====================================================================================================*/
  // Menu selection and showing/hiding div elements
  
  
  const homeElement = document.getElementById('home-container');  
  const recipeListElement = document.getElementById('recipes-list-container'); // This is within home-container
  const recipeOuterElement = document.getElementById('recipe-outer-container');

  const NewElement = document.getElementById('new-container');
  const shoppingListElement = document.getElementById('shoppingList-container');
  const aboutElement = document.getElementById('about-container');
  
  const goHomeButtonElement = document.getElementById('goHome');
  goHomeButtonElement.addEventListener('click', function() {
    console.log('Go Home Button Clicked');   
    linkClicked("Home");
  });  

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
        NewShow();
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

/*=======================================================================================================*/
/* Home - Recipies */

// const homeElement = document.getElementById('home-container'); - Home element defined above

//const selectedRecipeCard = document.getElementsByClassName('cardAction')
//selectedRecipeCard.addEventListener('click', loadRecipeDetail);
//selectedRecipeCard.addEventListener('click', function(){    
//    console.log('Recipe card click event');
//});


//var recipiesListData = firestore.collection('recipies');

function homeShow(){
    // Display and populate the gallery.
    console.log('Show Home:');
    
    popRecipes();

    homeElement.removeAttribute('hidden');  
  }

function popRecipes(){
    console.log('popRecipes:');
   
    cleaRecipeListElement();

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
}; 

// Remove existing rows from recipe list table when selected from menu.
function cleaRecipeListElement(){
  console.log('cleaRecipeListElement...');
  
  var fc = recipeListElement.firstChild;

  while( fc ) {
    console.log('Clear recipe list row.');
    recipeListElement.removeChild( fc );
      fc = recipeListElement.firstChild;
  }
}

function displayRecipeCard(id, title, desc){
    console.log('displayListItem: ', id, title, desc);

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
}


/*=======================================================================================================*/
/* Add new recipie */
function NewShow(){
    // Display and populate the gallery.
    console.log('Show New:');
    
    NewElement.removeAttribute('hidden');  
  }

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

const galleryElement = document.getElementById('Gallery-container');

const inputItemDescData = document.querySelector("#itemDesc");
const inputItemQtyData = document.querySelector("#itemQty");
const inputItemUnitData = document.querySelector("#itemUnit");

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
})

function popShoppingList(){

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

  // Delete a shopping list item from the table.
  function deleteListItem(id) {
    console.log('deleteListItem: ', id);
    var div = document.getElementById(id);
    // If an element for that message exists we delete it.
    if (div) {
      div.parentNode.removeChild(div);
    }
  }

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