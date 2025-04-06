import React, { useState, useEffect } from "react";
import "../styles/Home.css";
import "../styles/Modal.css";
import "../styles/Menu.css";
import logo from "/src/assets/images/lbet-logo.png";
import ImagenRifa from '../assets/images/imagenrifa.png';
import ImagenRuletax from '../assets/images/roulette.png';
import ImagenBono from '../assets/images/imagenbono.png';
import iconoJuegos from "/src/assets/images/iconojuegos.png";
import rocketImg from "/src/assets/images/rocket.png";
import rouletteImg from "/src/assets/images/roulette.png";
import plinkoImg from "/src/assets/images/plinko.png";
import minesImg from "/src/assets/images/mines.png";
import classicRouletteImg from "/src/assets/images/classic-roulette.png";
import LoginModal from "../components/LoginModal";
import RegisterModal from "../components/RegisterModal";
import Menu from "/src/components/Menu.jsx";
import { auth, db } from "../firebase/firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import '@fortawesome/fontawesome-free/css/all.min.css';

function Home() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const isModalOpen = showLogin || showRegister;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUser({ 
            username: userDoc.data().username, 
            balance: userDoc.data().balance || 0 
          });
        }
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  useEffect(() => {
    if (isModalOpen) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }

    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [isModalOpen]);

  // 🔒 Desactivar scroll cuando el menú está abierto
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [menuOpen]);

  return (
    <div className="home-container">
      <header className="header">
        <img src={logo} alt="LBET Logo" className="logo" />
        <div className="user-section">
          {user ? (
            <div className="user-info">
              <div className="user-details">
                <span className="username">{user.username}</span>
                <span className="balance">${user.balance.toLocaleString()}</span>
              </div>
              <button className="menu-btn" onClick={() => {
                setMenuOpen(!menuOpen);
                console.log("Estado del menú:", !menuOpen);
              }}>
                <i className="fas fa-ellipsis-v"></i>
              </button>
            </div>
          ) : (
            <div className="buttons">
              <button className="login-btn" onClick={() => setShowLogin(true)}>Iniciar sesión</button>
              <button className="register-btn" onClick={() => setShowRegister(true)}>Registrarse</button>
            </div>
          )}
        </div>
      </header>

      {/* Menú deslizante */}
      {menuOpen && <Menu user={user} onClose={() => setMenuOpen(false)} />}

      <main className="main-content">
      <section className="carousel-section">
  <div className="carousel-container">
    <div className="carousel-card">
    <div className="card-info">
      <span className="tag">Recomendado</span>
      <h3>Rifa Semanal</h3>
      <p>Participa en nuestras rifas semanales, compra uno o más tickets y espera el resultado.</p>
      <button className="carousel-btn">Detalles</button>
      </div>
      <img src={ImagenRifa} alt="Imagen Rifa" className="imagen-rifa" />
      
    </div>
    <div className="carousel-card">
    <div className="card-info">
      <span className="tag">Recomendado</span>
      <h3>Roulette X</h3>
      <p>¡Bienvenido a Roulette X! Haz tu apuesta, gira la ruleta y recibe premios únicos.</p>
      <button className="carousel-btn">Jugar</button>
      </div>
      <img src={ImagenRuletax} alt="Imagen Ruleta X" className="imagen-ruletax" />
      
    </div>
    <div className="carousel-card">
      <div className="card-info">
      <span className="tag">Recomendado</span>
      <h3>Bono inicial</h3>
      <p>¡Haz tu primer depósito en LBET Casino y recibe un 20% extra en el saldo de tu cuenta!</p>
      <button className="carousel-btn">Detalles</button>
      </div>
      <img src={ImagenBono} alt="Imagen Bono" className="imagen-bono" />
      
    </div>
  </div>
</section>


        <hr className="divider" />

        {/* Sección de Juegos */}
        <div className="games-section">
          <div className="section-header">
            <img src={iconoJuegos} className="section-icon" alt="Juegos Icono" />
            <h2>Juegos</h2>
          </div>

          <div className="games-carousel">
            <button className="game-card">
              <img src={rocketImg} alt="Rocket" />
            </button>
            <button className="game-card">
              <img src={rouletteImg} alt="Roulette X" />
            </button>
            <button className="game-card">
              <img src={plinkoImg} alt="Plinko" />
            </button>
            <button className="game-card">
              <img src={minesImg} alt="Mines" />
            </button>
            <button className="game-card">
              <img src={classicRouletteImg} alt="Classic Roulette" />
            </button>
          </div>
        </div>
      </main>

      {isModalOpen && <div className="modal-overlay"></div>}

      {showLogin && (
        <LoginModal 
          onClose={() => setShowLogin(false)} 
          onSwitch={() => {
            setShowLogin(false);
            setShowRegister(true);
          }}
        />
      )}

      {showRegister && (
        <RegisterModal 
          onClose={() => setShowRegister(false)} 
          onSwitch={() => {
            setShowRegister(false);
            setShowLogin(true);
          }}
        />
      )}
    </div>
  );
}

export default Home;
