// 
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin'; //SDK
admin.initializeApp()

 // Start writing Firebase Functions
 // https://firebase.google.com/docs/functions/typescript

 // Set function region to London - europe-west2

// When a comment changes, remove any unsuitable words.
export const cleanUpComments = functions
    .region('europe-west2') // Don't forget to set the region to London.
    .firestore
    .document('recipes/{recipeID}/Comments/{CommentID}')
    .onWrite((change, context) => {
        const commentData = change.after.data();
        if (commentData) {
            const commentText = commentData.comment;
            const updatedText = sanitizedForYourProtection(commentText);
            if (commentText === updatedText) {
                // To avoid infinit loops, check for actual changes.
                console.log('No change, do nothing.')
                return null;
            }
            return change.after.ref.update({comment: updatedText})
        } else {
            return null;
        }        
    });

function sanitizedForYourProtection(inputText: String) {
    console.log('inputText:', inputText)
    const re = /shit|bum/gi;
    const cleanedText = inputText.replace(re, "****");
    console.log('cleanedText: ', cleanedText)
    return cleanedText;
}

/* ==================================================================================== */ 
/* ================================ Test function blow ================================ */
/* ==================================================================================== */ 

export const helloWorld = functions
.region('europe-west2')
.https.onRequest((request, response) => {

    console.log('Hello!')
    response.send("Hello from Firebase! " + Date.now());

});

/* 
// onCreate version of the text sanitizer
export const cleanUpComments = functions.firestore
    .document('recipes/{recipeID}/Comments/{CommentID}')
    .onCreate((snapshot, context) => {
        const commentData = snapshot.data();
        if (commentData) {
            const commentText = commentData.comment;
            const updatedText = sanitizedForYourProtection(commentText);
            return snapshot.ref.update({comment: updatedText})
        } else {
            return null;
        }        
    });
*/

 /*
// Firestore trigger runs on update to document. https://www.youtube.com/watch?v=d9GrysWH1Lc
export const getAreaWeather = 
functions.https.onRequest((request,response) => {
    admin.firestore().doc("areas/hampshire").get()
    .then(areaSnapShot => {
        const places = areaSnapShot.data().places
        const promises = [] // create array
        for (const place in places) {
            const p = admin.firestore().doc(`weather/${place}`).get()
            promises.push(p) // add data to array
        }
        
        return Promise.all(promises) // When we have all data
    })
    .then(areaSnapShot => {
        const results: (FirebaseFirestore.DocumentData | undefined)[] = []
        areaSnapShot.forEach(placeSnap => {
            const data = placeSnap.data()
            data.place = placeSnap.id
            results.push(data)
        })
        response.send(results)
    })
    .catch(error => {
        console.log(error)
        response.status(500).send(error)
    })
})
*/
/*
// Firestore trigger runs on update to document. https://www.youtube.com/watch?v=652XeeKNHSk
//  exmaple only, not tested.
export const onHambleWeatherUpdate =
functions.firestore.document('weather/hamble').onUpdate(change => {
    const after = change.after.data()
    const payLoad = {
        data: {
            temp: String(after.temp),
            conditions: after.conditions
        }
    }
    return admin.messaging().sendToTopic("weather_hamble", payLoad)
})
*/

 // HTTP API end point function. https://www.youtube.com/watch?v=7IkUgCLr5oA
export const getWeatherData = functions//.https.onRequest((request, response) => {
    .region('europe-west2')
    .https.onRequest((request, response) => {

    console.log('Hello!')
    
    admin.firestore().doc('weather/hamble').get()
    .then(snapshot =>{
        const data = snapshot.data()        
        response.send(data)
    })    
    .catch(error => {
        // Handle error
        console.log(error)
        response.status(500).send(error)
    })

    console.log('Done.')
});

