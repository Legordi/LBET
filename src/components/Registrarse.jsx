import { useState } from 'react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const Registrarse = ({ setActiveSection }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleRegister = async (e) => {
    e.preventDefault();
    const { username, email, password, confirmPassword } = formData;

    if (password !== confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Guardar datos en Firestore
      await setDoc(doc(db, 'users', user.uid), {
        nombreUsuario: username,
        correo: email,
        rol: 'Usuario',
        saldo: 0 // <--- Aquí agregas el campo saldo en users
      });

      alert('Registro exitoso');
      setActiveSection('inicio');
    } catch (error) {
      console.error('Error al registrar:', error.message);
      alert('Error al registrar: ' + error.message);
    }
  };

  return (
    <div className="seccion-register">
      <div className="formulario">
      <h2>Registrarse</h2>
      <p>Bienvenido a LuckyDay, crea tu cuenta <br/> y comienza a ganar</p>
      <form onSubmit={handleRegister}>
        <p>Nombre IC</p>
        <input
          type="text"
          placeholder="Usuario"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
        />
        <p>Vincula tu correo electrónico</p>
        <input
          type="email"
          placeholder="Correo"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        <p>Crea una contraseña</p>
        <input
          type="password"
          placeholder="Contraseña"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        />
        <p>Confirma tu contraseña</p>
        <input
          type="password"
          placeholder="Confirmar contraseña"
          value={formData.confirmPassword}
          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
        />
        <button type="submit">Registrarse</button>
      </form>
      <div className="registro-link">
        ¿Ya tienes una cuenta?{" "}
        <span
          onClick={() => setActiveSection("iniciar-sesion")}
        >
          Inicia sesión
        </span>
      </div>
      </div>
    </div>
  );
};

export default Registrarse;