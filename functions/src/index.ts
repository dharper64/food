import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin'; //SDK
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

