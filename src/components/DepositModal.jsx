import React, { useState, useEffect } from "react";
import "../styles/Modal.css";
import mercadoPagoLogo from "../assets/images/LogoMercadoPago.png";
import nequiLogo from "../assets/images/LogoNequi.png";
import bitcoinLogo from "../assets/images/LogoBitcoin.png";
import qrImage from "../assets/images/qrNequi.png";

import { db } from "../firebase/firebaseConfig";
import {
  doc,
  getDoc,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

const DepositModal = ({ onClose }) => {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [nequiConfirmed, setNequiConfirmed] = useState(false);
  const [userCountry, setUserCountry] = useState("");

  const paymentMethods = [
    { name: "Mercado Pago", key: "MercadoPago", logo: mercadoPagoLogo },
    { name: "Nequi", key: "Nequi", logo: nequiLogo },
    { name: "Bitcoin", key: "Bitcoin", logo: bitcoinLogo },
  ];

  const handleSelect = (methodKey) => {
    setSelectedMethod(methodKey);
    setShowForm(false);
    setNequiConfirmed(false);
  };

  const handleContinue = () => {
    if (selectedMethod) {
      setShowForm(true);
    }
  };

  const getSelectedMethodName = () => {
    const method = paymentMethods.find((m) => m.key === selectedMethod);
    return method ? method.name : "";
  };

  useEffect(() => {
    const fetchCountry = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const userData = userSnap.data();
            setUserCountry(userData.pais || "");
          }
        }
      } catch (error) {
        console.error("Error al obtener país del usuario:", error);
      }
    };

    fetchCountry();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const auth = getAuth();
    const user = auth.currentUser;

    const form = e.target;
    const name = form[0].value;
    const amount = parseFloat(form[1].value);
    const transactionRef = form[2].value;

    if (!user) return;

    try {
      await addDoc(collection(db, "solicitudesdeposito"), {
        userId: user.uid,
        usuario: user.email,
        pais: userCountry,
        hora: serverTimestamp(),
        fecha: new Date().toLocaleDateString(),
        metodo: "Nequi",
        monto: amount,
        nombreTitular: name,
        referencia: transactionRef,
        estado: "Pendiente",
        
      });

      alert("Solicitud enviada correctamente.");
      onClose();
    } catch (error) {
      console.error("Error al enviar solicitud:", error);
      alert("Hubo un error al enviar la solicitud.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className={`deposit-modal-content ${showForm ? "form-view" : "method-view"}`}>
        <button className="close-btn" onClick={onClose}>✖</button>
        <h2 className="modal-title">Depositar saldo</h2>
        <hr className="divider" />

        {!showForm && (
          <>
            <p className="subtitle">Elige un método de pago</p>
            <div className="payment-options">
              {paymentMethods.map((method) => (
                <div
                  key={method.key}
                  className={`payment-option ${selectedMethod === method.key ? "active" : ""}`}
                  onClick={() => handleSelect(method.key)}
                >
                  <img src={method.logo} alt={method.name} className="payment-logo" />
                </div>
              ))}
            </div>

            <button
              className="continue-btn"
              onClick={handleContinue}
              disabled={!selectedMethod}
            >
              Continuar con: {getSelectedMethodName()}
            </button>
          </>
        )}

        {showForm && selectedMethod === "Nequi" && (
          <div className="nequi-form-horizontal">
            <div className="qr-section">
              <img src={qrImage} alt="QR Nequi" className="qr-image" />
              <p className="qr-instruction">
                Escanea nuestro QR y realiza<br />tu depósito por Nequi
              </p>
            </div>

            <div className="form-section">
              <form className="nequi-form-fields" onSubmit={handleSubmit}>
                <label>Titular de la cuenta Nequi (Tu nombre)</label>
                <input type="text" disabled={!nequiConfirmed} required />

                <label>Monto a depositar</label>
                <input type="number" disabled={!nequiConfirmed} required />

                <label>Referencia de la transacción</label>
                <input type="text" disabled={!nequiConfirmed} required />

                <div className="checkbox-group">
                  <input
                    type="checkbox"
                    id="nequi-confirm"
                    checked={nequiConfirmed}
                    onChange={() => setNequiConfirmed(!nequiConfirmed)}
                  />
                  <label htmlFor="nequi-confirm">
                    Realicé la transacción mediante Nequi
                  </label>
                </div>

                <button
                  type="submit"
                  className="modal-btn"
                  disabled={!nequiConfirmed}
                >
                  Recargar saldo
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DepositModal;
