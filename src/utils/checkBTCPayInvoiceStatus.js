// utils/checkBTCPayInvoiceStatus.js
const API_KEY = "4b426d43f90857e4b28eb763cb8ffdd046e96e31"; // Usa una variable de entorno si prefieres
const STORE_ID = "FeE918KvYNxsLDf8p7cBw4SKmp2JZqLVvz2LHSvJa9az";
const BTCPAY_URL = "https://mainnet.demo.btcpayserver.org"; // sin slash final

const checkBTCPayInvoiceStatus = async (invoiceId) => {
  try {
    const res = await fetch(`${BTCPAY_URL}/api/v1/stores/${STORE_ID}/invoices/${invoiceId}`, {
      headers: {
        Authorization: `token ${API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) throw new Error('No se pudo obtener el estado');

    const data = await res.json();
    return data.status; // Ej: New, Processing, Settled, Invalid, Expired
  } catch (error) {
    console.error('Error consultando el estado del invoice:', error);
    return null;
  }
};

export default checkBTCPayInvoiceStatus;
