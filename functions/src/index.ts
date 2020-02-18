import * as functions from 'firebase-functions';

 // Start writing Firebase Functions
 // https://firebase.google.com/docs/functions/typescript

 // Set function region to London - europe-west2

 export const helloWorld = functions
    .region('europe-west2')
    .https.onRequest((request, response) => {
    
        console.log('Hello!')
        response.send("Hello from Firebase!");

 });

