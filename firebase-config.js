// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD33676NSY6qMOTXoxxxmnJQMZbWA13UEw",
  authDomain: "myfinance111084.firebaseapp.com",
  projectId: "myfinance111084",
  storageBucket: "myfinance111084.firebasestorage.app",
  messagingSenderId: "517392883691",
  appId: "1:517392883691:web:045d4027bc985ff8ad43ae",
  measurementId: "G-VWT10CLV5P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
};
