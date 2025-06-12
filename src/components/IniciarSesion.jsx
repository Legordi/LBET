import { useState } from 'react';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';

const IniciarSesion = ({ setActiveSection }) => {
  const [formData, setFormData] = useState({ username: '', password: '' });

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // 1. Buscar en Firestore el usuario por nombreUsuario
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('nombreUsuario', '==', formData.username));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        alert('Nombre de usuario no encontrado');
        return;
      }

      // 2. Obtener el correo del primer resultado
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      const email = userData.correo;

      // 3. Iniciar sesión con correo y contraseña
      await signInWithEmailAndPassword(auth, email, formData.password);
      setActiveSection('inicio');
    } catch (error) {
      console.error('Error al iniciar sesión:', error.message);
      alert('Error al iniciar sesión: ' + error.message);
    }
  };

  return (
    <div className="seccion-login">
      <div className="formulario">
      <h2>Iniciar sesión</h2>
      <p>Bienvenido de nuevo, por favor inicia sesión</p>
      <form onSubmit={handleLogin}>
        <p>Nombre IC</p>
        <input
          type="text"
          placeholder="Nombre de usuario"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
        />
        <p>Contraseña</p>
        <input
          type="password"
          placeholder="Contraseña"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        />
        <button type="submit">Entrar</button>
      </form>
        <div className="registro-link">
        ¿No tienes una cuenta?{" "}
        <span
          onClick={() => setActiveSection("registrarse")}
        >
          Regístrate
        </span>
      </div>
      </div>
    </div>
  );
};

export default IniciarSesion;
