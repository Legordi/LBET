import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBXvmrTiT56RGl5g-PmjNEhrmvww0T9Ub0",
  authDomain: "lbet-casino-online.firebaseapp.com",
  projectId: "lbet-casino-online",
  storageBucket: "lbet-casino-online.appspot.com",
  messagingSenderId: "868631277773",
  appId: "1:868631277773:web:d5a24bdb162d2e8347f984",
  measurementId: "G-E70D7RQ955",
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

// Exporta la configuración
export { firebaseConfig, app, auth, db };
