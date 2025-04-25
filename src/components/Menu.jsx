import React, { useState } from "react";
import "../styles/Menu.css";
import { FiClock, FiUser, FiInfo, FiLogOut } from "react-icons/fi";
import { MdAdminPanelSettings } from "react-icons/md";
import { getAuth, signOut } from "firebase/auth";
import DepositModal from "./DepositModal";
import { Link } from 'react-router-dom';

const Menu = ({ user, onClose, onLogout }) => {
  const [closing, setClosing] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      onClose();
    }, 500);
  };

  const handleLogout = () => {
    const auth = getAuth();
    setClosing(true);
    setTimeout(() => {
      onClose();
    }, 500);

    signOut(auth)
      .then(() => {
        console.log("Sesión cerrada");
        onLogout();
      })
      .catch((error) => {
        console.error("Error al cerrar sesión:", error);
      });
  };

  return (
    <>
      <div className="menu-overlay" onClick={handleClose}>
        <div
          className={`menu-modal ${closing ? "closing" : ""}`}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="close-btn" onClick={handleClose}>✕</button>
          <div className="menu-user-box">
            <span className="menu-username">{user?.username || "Usuario"}</span>
            <span className="menu-balance">${user?.balance?.toLocaleString() || "0"}</span>
          </div>
          <div className="menu-buttons">
            <button className="menu-action-btn" onClick={() => setShowDepositModal(true)}>
              Recargar
            </button>
            <button className="menu-action-btn">Retirar</button>
          </div>

          <span className="menu-section-title">Cuenta</span>

          <ul className="menu-list">
            <li className="menu-item">
              <FiClock className="menu-icon" />
              Historial de transacciones
            </li>
            <li className="menu-item">
              <FiInfo className="menu-icon" />
              Juego responsable
            </li>
            <li className="menu-item">
              <FiUser className="menu-icon" />
              Afiliación
            </li>
          </ul>
          {user?.rol === "admin" && (
            <>
              <span className="menu-section-title">Administración</span>
              <ul className="menu-list">
                <li className="menu-item">
                  <MdAdminPanelSettings className="menu-icon" />
                  <Link to="/admin" className="menu-link">
                    Admin Panel
                  </Link>
                </li>
              </ul>
            </>
          )}
          <button className="logout-btn" onClick={handleLogout}>
            <FiLogOut className="menu-icon" />
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* MODAL DE DEPÓSITO - **PASANDO LA PROP `user`** */}
      {showDepositModal && (
        <DepositModal
          user={user}
          onClose={() => setShowDepositModal(false)}
        />
      )}
    </>
  );
};

export default Menu;