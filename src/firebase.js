import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDxatkoAPigG4YdJOs-UNtFH9ea1Jnp7c4",
  authDomain: "luckyday-oficial.firebaseapp.com",
  projectId: "luckyday-oficial",
  storageBucket: "luckyday-oficial.firebasestorage.app",
  messagingSenderId: "437081776145",
  appId: "1:437081776145:web:ad5d6c12e4f32eb9f951b0",
  measurementId: "G-PTQ0GP833J"
};

// Solo inicializa si no hay apps creadas
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };