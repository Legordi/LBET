import React, { useState, useEffect } from 'react';
import "../styles/Modal.css";
import { db } from '../firebase/firebaseConfig';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import createBTCPayInvoice from '../utils/createBTCPayInvoice';
import checkBTCPayInvoiceStatus from '../utils/checkBTCPayInvoiceStatus';

const DepositModal = ({ user, onClose }) => {
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState('');
  const [invoiceData, setInvoiceData] = useState(null);
  const [status, setStatus] = useState('pending');
  const [isLoadingIframe, setIsLoadingIframe] = useState(true);

  useEffect(() => {
    let interval;
    if (step === 2 && invoiceData?.invoiceId) {
      interval = setInterval(async () => {
        const invoiceStatus = await checkBTCPayInvoiceStatus(invoiceData.invoiceId);
        if (invoiceStatus === 'Settled' || invoiceStatus === 'Confirmed') {
          clearInterval(interval);
          setStatus('success');
          await handleSuccess();
        } else if (invoiceStatus === 'Invalid') {
          clearInterval(interval);
          setStatus('error');
        }
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [step, invoiceData]);

  const handleSuccess = async () => {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    const currentBalance = userSnap.data().balance || 0;
    await updateDoc(userRef, { balance: currentBalance + Number(amount) });
    setStep(3);
  };

  const handleNext = async () => {
    if (!amount || isNaN(amount) || Number(amount) <= 0) return;

    if (!user || !user.email || !user.uid) {
      console.error('Usuario inválido:', user);
      setStatus('error');
      return;
    }

    try {
      const { invoiceId, checkoutLink } = await createBTCPayInvoice(amount, user);
      setInvoiceData({ invoiceId, checkoutLink });
      setStep(2);
    } catch (err) {
      console.error('Error al crear factura:', err);
      setStatus('error');
    }
  };

  const renderContent = () => {
    if (step === 1) {
      return (
        <>
          <h2>Depositar saldo</h2>
          <div className="progress-bar">
            <div className="circle active" />
            <div className="circle" />
            <div className="circle" />
          </div>
          <p>Ingrese el monto a depositar</p>
          <label>Monto en USD</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
          />
          <button className="green-btn" onClick={handleNext}>Siguiente</button>
        </>
      );
    }

    if (step === 2) {
      return (
        <>
          <h2>Depositar saldo</h2>
          <div className="progress-bar">
            <div className="circle active" />
            <div className="circle active" />
            <div className="circle" />
          </div>
          {status === 'pending' && (
            <>
              <p>Escanea el código QR o paga desde tu billetera</p>
              <div className="qr-section">
                {isLoadingIframe && (
                  <div className="spinner-container">
                    <div className="spinner"></div>
                  </div>
                )}
                {invoiceData?.checkoutLink && (
                  <iframe
                    className="btcpay-iframe"
                    src={invoiceData.checkoutLink}
                    title="BTCPay Checkout"
                    frameBorder="0"
                    width="300"
                    height="450"
                    style={{
                      borderRadius: '12px',
                      display: isLoadingIframe ? 'none' : 'block'
                    }}
                    onLoad={() => setIsLoadingIframe(false)}
                  ></iframe>
                )}
              </div>
              <ol>
                <li>Escanea el código QR o realiza el pago directo.</li>
                <li>Espera la confirmación automática de la red.</li>
                <li>Tu saldo se actualizará apenas se confirme.</li>
              </ol>
            </>
          )}
          {status === 'error' && (
            <div className="error-section">
              <p style={{ color: 'red' }}>❌ Error en la transacción</p>
              <button className="green-btn" onClick={() => onClose()}>Cerrar</button>
            </div>
          )}
        </>
      );
    }

    if (step === 3) {
      return (
        <>
          <h2>Depositar saldo</h2>
          <div className="progress-bar">
            <div className="circle active" />
            <div className="circle active" />
            <div className="circle active" />
          </div>
          <div className="success-section">
            <p className="success-icon">✅</p>
            <h3>Depósito realizado con éxito</h3>
            <button className="green-btn" onClick={onClose}>Volver a la página de inicio</button>
          </div>
        </>
      );
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <button className="close-button" onClick={onClose}>×</button>
        {renderContent()}
      </div>
    </div>
  );
};

export default DepositModal;
