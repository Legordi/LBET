import React, { useState } from "react";
import { auth, db } from "../firebase/firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";

function LoginModal({ onClose, onSwitch }) {
  const [identifier, setIdentifier] = useState(""); // Usuario o correo
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); // Estado para errores

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage(""); // Limpiar error previo
    let email = identifier;

    if (!identifier.includes("@")) {
      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("username", "==", identifier));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          email = querySnapshot.docs[0].data().email;
        } else {
          setErrorMessage("Usuario no encontrado.");
          return;
        }
      } catch (error) {
        setErrorMessage("Error al buscar usuario.");
        return;
      }
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      onClose();
    } catch (error) {
      console.log("Código de error:", error.code); // Para verificar errores

      let errorMsg = "Error al iniciar sesión.";
      if (error.code === "auth/user-not-found") errorMsg = "Usuario no encontrado.";
      if (error.code === "auth/invalid-credential") errorMsg = "Contraseña incorrecta.";
      if (error.code === "auth/invalid-email") errorMsg = "Correo inválido.";
      if (error.code === "auth/too-many-requests") errorMsg = "Demasiados intentos. Intenta más tarde.";

      setErrorMessage(errorMsg);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>✖</button>
        <h2>Iniciar Sesión</h2>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Correo o Usuario"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="modal-btn">Ingresar</button>
        </form>
        <p>
          ¿No tienes una cuenta?{" "}
          <span className="interactive-text" onClick={onSwitch}>
            <strong>Regístrate</strong>
          </span>
        </p>
      </div>
    </div>
  );
}

export default LoginModal;
