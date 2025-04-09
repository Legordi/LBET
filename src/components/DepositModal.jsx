import React, { useState } from "react";
import { db } from "../firebase/firebaseConfig";
import {
  addDoc,
  collection,
  serverTimestamp,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { PayPalButtons } from "@paypal/react-paypal-js";
import { useAuth } from "../context/AuthContext";
import "../styles/Modal.css";

const DepositModal = ({ onClose }) => {
  const { currentUser } = useAuth();
  const [amount, setAmount] = useState("");
  const [showPayPal, setShowPayPal] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleApprove = async (details, paidAmount) => {
    try {
      if (!currentUser || !currentUser.uid || !currentUser.email) {
        setErrorMessage(" Debes iniciar sesión para hacer un depósito.");
        return;
      }

      const userRef = doc(db, "users", currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        setErrorMessage(" Usuario no encontrado en la base de datos.");
        return;
      }

      const currentBalance = userSnap.data().balance || 0;
      const newBalance = currentBalance + Number(paidAmount);

      await updateDoc(userRef, {
        balance: newBalance,
      });

      await addDoc(collection(db, "depositHistory"), {
        userId: currentUser.uid,
        email: currentUser.email,
        amount: Number(paidAmount),
        timestamp: serverTimestamp(),
        payerName: details.payer.name.given_name,
        transactionId: details.id,
        method: "PayPal",
      });

      setMessage(" Depósito exitoso. Saldo actualizado.");
      setErrorMessage("");

      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error(" Error al procesar depósito:", error);
      setErrorMessage(" Ocurrió un error al registrar el depósito.");
    }
  };

  const handleAmountSubmit = (e) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    if (!numericAmount || numericAmount < 1) {
      setErrorMessage(" El monto mínimo es de $1.00 USD.");
      return;
    }
    setShowPayPal(true);
    setMessage("");
    setErrorMessage("");
  };

  const handleCancel = () => {
    setShowPayPal(false);
    setErrorMessage(" Pago cancelado.");
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>✖</button>
        <h2>Recargar Saldo</h2>

        {message && <div className="modal-message success">{message}</div>}
        {errorMessage && <div className="modal-message error">{errorMessage}</div>}

        {!showPayPal ? (
          <form onSubmit={handleAmountSubmit}>
            <label>Ingresa el monto (USD):</label>
            <input
              type="number"
              min="1"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            <button type="submit" className="submit-btn">Continuar con PayPal</button>
          </form>
        ) : (
          <PayPalButtons
            style={{ layout: "vertical" }}
            createOrder={(data, actions) => {
              return actions.order.create({
                purchase_units: [{
                  amount: {
                    value: parseFloat(amount).toFixed(2),
                  },
                }],
              });
            }}
            onApprove={(data, actions) => {
              return actions.order.capture().then((details) => {
                const paidAmount = details.purchase_units[0].amount.value;
                handleApprove(details, paidAmount);
              });
            }}
            onCancel={handleCancel}
            onError={(err) => {
              console.error("Error de PayPal:", err);
              setErrorMessage(" Hubo un problema al procesar el pago.");
              setShowPayPal(false);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default DepositModal;
