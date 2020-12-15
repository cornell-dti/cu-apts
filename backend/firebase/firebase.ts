import firebase from "firebase"
import "firebase/firestore"

import dotenv from 'dotenv'
dotenv.config();

// Your web app's Firebase configuration
var firebaseConfig = {
    apiKey: process.env.API_KEY,
    authDomain: process.env.AUTH_DOMAIN,
    databaseURL: process.env.DATABASE_URL,
    projectId: process.env.PROJECT_ID,
    storageBucket: process.env.STORAGE_BUCKET,
    messagingSenderId: process.env.MESSAGING_SENDER_ID,
    appId: process.env.APP_ID
  };
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

let db = firebase.firestore();
let increment = firebase.firestore.FieldValue.increment(1)

export  {db, increment};