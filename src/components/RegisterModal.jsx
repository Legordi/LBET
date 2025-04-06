import React, { useState } from "react";
import { db, registerUser } from "../firebase/auth"; // Importamos la función registerUser
import { collection, query, where, getDocs, doc, setDoc } from "firebase/firestore";

function RegisterModal({ onClose, onSwitch }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); // Estado para mensajes de error

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage(""); // Limpiar mensaje de error previo

    if (password !== confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden.");
      return;
    }

    try {
      // Verificar si el nombre de usuario o correo ya existen
      const usersRef = collection(db, "users");

      // Consultar por nombre de usuario
      const usernameQuery = query(usersRef, where("username", "==", username));
      const usernameSnapshot = await getDocs(usernameQuery);
      if (!usernameSnapshot.empty) {
        setErrorMessage("El nombre de usuario ya está en uso.");
        return;
      }

      // Consultar por correo electrónico
      const emailQuery = query(usersRef, where("email", "==", email));
      const emailSnapshot = await getDocs(emailQuery);
      if (!emailSnapshot.empty) {
        setErrorMessage("El correo ya está en uso.");
        return;
      }

      // Crear usuario con Firebase Auth
      const user = await registerUser(email, password);

      // Guardar en Firestore
      await setDoc(doc(db, "users", user.uid), {
        username: username,
        email: email
      });

      onClose(); // Cerrar modal tras registro exitoso
    } catch (error) {
      let errorMsg = "Error al registrar.";
      if (error.code === "auth/email-already-in-use") errorMsg = "El correo ya está en uso.";
      if (error.code === "auth/weak-password") errorMsg = "La contraseña es muy débil.";
      if (error.code === "auth/invalid-email") errorMsg = "Correo inválido.";

      setErrorMessage(errorMsg);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>✖</button>
        <h2>Registrarse</h2>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Nombre de usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirmar contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button type="submit" className="modal-btn">Registrarse</button>
        </form>
        <p>
          ¿Ya tienes una cuenta?{" "}
          <span className="interactive-text" onClick={onSwitch}>
            <strong>Inicia sesión</strong>
          </span>
        </p>
      </div>
    </div>
  );
}

export default RegisterModal;
