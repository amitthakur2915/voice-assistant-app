import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "majorbot1.firebaseapp.com",
  projectId: "majorbot1",
  storageBucket: "majorbot1.firebasestorage.app",
  messagingSenderId: "940524571624",
  appId: "1:940524571624:web:4fb402ce213847655ef25d"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();


export { auth, provider };