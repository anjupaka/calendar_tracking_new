// Import the Firebase modules
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAAHsbBNMHWagT4EqiTa573j6X7aZknPK4",
  authDomain: "reactcalenderentnt.firebaseapp.com",
  projectId: "reactcalenderentnt",
  storageBucket: "reactcalenderentnt.firebasestorage.app",
  messagingSenderId: "1027293700378",
  appId: "1:1027293700378:web:f5a11871a58bad24ae0ca3",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firestore database
const db = getFirestore(app);

export { db };

