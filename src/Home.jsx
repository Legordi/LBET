import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

import CasinoGames from './components/Inicio';
import SorteosRecientes from './components/SorteosRecientes';
import TerminosCondiciones from './components/TerminosCondiciones';
import IniciarSesion from './components/IniciarSesion';
import Registrarse from './components/Registrarse';

import logo from './assets/luckyday-logo.png';
import './styles/Home.css';

const Home = () => {
  const [activeSection, setActiveSection] = useState('inicio');
  const [usuario, setUsuario] = useState(null);
  const [infoUsuario, setInfoUsuario] = useState(null);
  const [loading, setLoading] = useState(true); // Nuevo estado

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUsuario(user);
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setInfoUsuario({ uid: user.uid, ...userDoc.data() });
        } else {
          setInfoUsuario(null);
        }
      } else {
        setInfoUsuario(null);
      }
      setLoading(false); // Ya terminó de cargar
    });
    return () => unsubscribe();
  }, []);

  // Actualiza el saldo en Firestore y en el estado local
  const actualizarSaldo = async (nuevoSaldo) => {
    if (!usuario) return;
    let saldoFinal = typeof nuevoSaldo === "function" ? nuevoSaldo(infoUsuario.saldo) : nuevoSaldo;
    await updateDoc(doc(db, "users", usuario.uid), { saldo: saldoFinal });
    setInfoUsuario(u => ({ ...u, saldo: saldoFinal }));
  };

  const cerrarSesion = async () => {
    try {
      await signOut(auth);
      setActiveSection('inicio');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'inicio':
        return (
          <CasinoGames
            infoUsuario={infoUsuario}
            setInfoUsuario={setInfoUsuario}
            actualizarSaldo={actualizarSaldo}
          />
        );
      case 'sorteos-recientes':
        return (
          <SorteosRecientes
            setActiveSection={setActiveSection}
            infoUsuario={infoUsuario}
            actualizarSaldo={actualizarSaldo}
          />
        );
      case 'terminos-y-condiciones':
        return <TerminosCondiciones />;
      case 'iniciar-sesion':
        return <IniciarSesion setActiveSection={setActiveSection} />;
      case 'registrarse':
        return <Registrarse setActiveSection={setActiveSection} />;
      default:
        return <CasinoGames infoUsuario={infoUsuario} setInfoUsuario={setInfoUsuario} actualizarSaldo={actualizarSaldo} />;
    }
  };

  // Mostrar pantalla de carga mientras Firebase determina el usuario
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
        <p style={{ color: "#fff", marginTop: 16 }}>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="home">
      <header className="header">
        <img src={logo} className="logo" alt="Lucky Day Logo" />
        {usuario && infoUsuario && (
          <div className="user-info" style={{ textAlign: 'right', marginLeft: 'auto' }}>
            <p><strong>{infoUsuario.nombreUsuario}</strong></p>
            <p>${infoUsuario.saldo?.toLocaleString("es-CO")}</p>
          </div>
        )}
      </header>

      <nav className="menu">
        <button onClick={() => setActiveSection('inicio')}>Inicio</button>
        <button onClick={() => setActiveSection('terminos-y-condiciones')}>Términos y condiciones</button>
        {!usuario ? (
          <>
            <button onClick={() => setActiveSection('iniciar-sesion')}>Iniciar sesión</button>
            <button onClick={() => setActiveSection('registrarse')}>Registrarse</button>
          </>
        ) : (
          <>
            <button onClick={() => setActiveSection('sorteos-recientes')}>Mi cuenta</button>
            <button onClick={cerrarSesion}>Cerrar sesión</button>
          </>
        )}
      </nav>

      <main className="content">{renderSection()}</main>
    </div>
  );
};

export default Home;