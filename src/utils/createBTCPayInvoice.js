// utils/createBTCPayInvoice.js

const API_KEY = '4b426d43f90857e4b28eb763cb8ffdd046e96e31'; // Reemplaza por tu token API
const STORE_ID = 'FeE918KvYNxsLDf8p7cBw4SKmp2JZqLVvz2LHSvJa9az'; // Reemplaza por tu store ID
const BTCPAY_URL = "https://mainnet.demo.btcpayserver.org"; // Reemplaza si usás otro BTCPay

const createBTCPayInvoice = async (amount, user) => {
  try {
    const response = await fetch(`${BTCPAY_URL}/api/v1/stores/${STORE_ID}/invoices`, {
      method: 'POST',
      headers: {
        Authorization: `token ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amount.toString(),
        currency: 'USD',
        metadata: {
          email: user.email,
          userId: user.uid,
        },
        checkout: {
          speedPolicy: 'HighSpeed',
          redirectURL: 'https://tusitio.com/deposito-exitoso',
          defaultLanguage: 'es',
        },
      }),
    });

    if (!response.ok) throw new Error('Error creando la factura');

    const data = await response.json();

    return {
      invoiceId: data.id,
      checkoutLink: data.checkoutLink,
    };
  } catch (error) {
    console.error('Error al crear la factura:', error);
    throw error;
  }
};

export default createBTCPayInvoice;
