import React, { useState, useEffect } from "react";
import "../styles/Home.css";
import "../styles/Modal.css";
import "../styles/Menu.css";
import "../styles/AdminPanel.css";
import logo from "/src/assets/images/lbet-logo.png";
import Menu from "/src/components/Menu.jsx";
import LoginModal from "../components/LoginModal";
import RegisterModal from "../components/RegisterModal";
import { auth, db } from "../firebase/firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  orderBy,
  limit
} from "firebase/firestore";
import "@fortawesome/fontawesome-free/css/all.min.css";
import {
  FaCrown,
  FaUsers,
  FaArrowCircleUp,
  FaCoins,
  FaArrowCircleDown,
  FaDollarSign,
  FaChartBar
} from "react-icons/fa";

function AdminPanel() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalDeposits, setTotalDeposits] = useState(0);
  const [totalBalances, setTotalBalances] = useState(0);
  const [recentDeposits, setRecentDeposits] = useState([]);
  const [newUsers, setNewUsers] = useState([]);
  const isModalOpen = showLogin || showRegister;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUser({
            uid: user.uid,
            email: user.email,
            username: userDoc.data().username,
            balance: userDoc.data().balance || 0,
            rol: userDoc.data().rol,
          });
        }
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchAdminData = async () => {
      const usersSnapshot = await getDocs(collection(db, "users"));
      const depositSnapshot = await getDocs(collection(db, "depositHistory"));

      setTotalUsers(usersSnapshot.size);

      const balances = usersSnapshot.docs.map(doc => doc.data().balance || 0);
      setTotalBalances(balances.reduce((acc, val) => acc + val, 0));

      const deposits = depositSnapshot.docs.map(doc => doc.data().amount || 0);
      setTotalDeposits(deposits.reduce((acc, val) => acc + val, 0));

      const recentQuery = query(
        collection(db, "depositHistory"),
        orderBy("timestamp", "desc"),
        limit(5)
      );
      const recentSnapshot = await getDocs(recentQuery);
      const recent = recentSnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      }));
      setRecentDeposits(recent);

      const sortedUsers = usersSnapshot.docs
        .map(doc => ({ username: doc.data().username, createdAt: doc.data().createdAt }))
        .filter(u => u.username)
        .slice(-5)
        .reverse();
      setNewUsers(sortedUsers);
    };

    fetchAdminData();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  useEffect(() => {
    document.body.classList.toggle("modal-open", isModalOpen);
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [isModalOpen]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [menuOpen]);

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    return date.toLocaleDateString();
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    return date.toLocaleTimeString();
  };

  return (
    <div className="home-container">
      <header className="header">
        <img src={logo} alt="LBET Logo" className="logo" />
        <div className="user-section">
          {user ? (
            <div className="user-info">
              <div className="user-details">
                <span className="username">
                  {user?.username}
                  {user?.rol === "admin" && (
                    <FaCrown style={{ color: "gold", marginLeft: "7px" }} />
                  )}
                </span>
                <span className="balance">${user.balance.toLocaleString()}</span>
              </div>
              <button className="menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
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

      {menuOpen && <Menu user={user} onClose={() => setMenuOpen(false)} />}

      <main className="admin-panel">
        <aside className="sidebar">
          <h2>ADMIN PANEL</h2>
          <div className="menu-item active">
            <FaChartBar className="icon" />
            Estadísticas
          </div>
        </aside>

        <section className="dashboard">
          <div className="cards">
            <div className="card usuarios"><FaUsers /> <span>{totalUsers}<br />Total Usuarios</span></div>
            <div className="card depositos"><FaArrowCircleUp /> <span>${totalDeposits.toLocaleString()}<br />Depósitos totales</span></div>
            <div className="card balances"><FaCoins /> <span>${totalBalances.toLocaleString()}<br />Balance Usuarios</span></div>
            <div className="card retiros"><FaArrowCircleDown /> <span>$0<br />Retiros totales</span></div>
            <div className="card ganancias"><FaDollarSign /> <span>${totalDeposits.toLocaleString()}<br />Ganancias totales</span></div>
          </div>

          <div className="middle-section">
            <div className="chart-section">
              <h3>Estadísticas de usuarios</h3>
              <div className="chart-placeholder">
                <p className="axis-label y">Cantidad de usuarios nuevos</p>
                <p className="axis-label x">Fecha x días</p>
              </div>
            </div>

            <div className="new-users-section">
              <h3>Nuevos Usuarios</h3>
              <ul>
                {newUsers.map((u, i) => (
                  <li key={i}>
                    <span>{u.username}</span>
                    <span>{u.createdAt ? formatDate(u.createdAt) : "N/A"}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="recent-activity">
            <h3>Movimientos recientes</h3>
            <table>
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Usuario</th>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Cantidad</th>
                </tr>
              </thead>
              <tbody>
                {recentDeposits.map((d) => (
                  <tr key={d.id}>
                    <td>Depósito</td>
                    <td>{d.payerName || d.email}</td>
                    <td>{formatDate(d.timestamp)}</td>
                    <td>{formatTime(d.timestamp)}</td>
                    <td className="amount" style={{ color: "#00ff47" }}>
                      ${d.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
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

export default AdminPanel;
