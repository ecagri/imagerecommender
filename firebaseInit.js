import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore.js"
import { getAuth } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-auth.js"

const firebaseConfig = {
    apiKey: "AIzaSyDit5WizzZAiSiMNkC8NmkiBOQVkLacC9A",
    authDomain: "graduationproject-1a0b8.firebaseapp.com",
    projectId: "graduationproject-1a0b8",
    storageBucket: "graduationproject-1a0b8.appspot.com",
    messagingSenderId: "280995730331",
    appId: "1:280995730331:web:ee414c94fcc28286b3073e"
  };
  
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const auth = getAuth(app);
  export { app, db, auth};