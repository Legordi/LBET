import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { app } from "../firebase/firebaseConfig"; // Asegúrate de que la ruta es correcta

const auth = getAuth(app);
const db = getFirestore(app);

// Función para registrar usuario
export const registerUser = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error; // Manejo de error en el frontend
  }
};

export { auth, db };

