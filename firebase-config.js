// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCOXb_povaRfZbO8CJ407iqVm7TgP71KtE",
  authDomain: "my-project-add4e.firebaseapp.com",
  projectId: "my-project-add4e",
  storageBucket: "my-project-add4e.firebasestorage.app",
  messagingSenderId: "709725024198",
  appId: "1:709725024198:web:6ac8943350917999b94cc7",
  measurementId: "G-77LCSCPELH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
};
