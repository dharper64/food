import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
admin.initializeApp()

 // Start writing Firebase Functions
 // https://firebase.google.com/docs/functions/typescript

 // Set function region to London - europe-west2

 export const helloWorld = functions
    .region('europe-west2')
    .https.onRequest((request, response) => {
    
        console.log('Hello!')
        response.send("Hello from Firebase! " + Date.now());

 });

export const getTestData = functions.https.onRequest((request, response) => {
    //.region('europe-west2')
    //.https.onRequest((request, response) => {

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

