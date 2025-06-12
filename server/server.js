// server/server.js
const express = require("express");
const cors = require("cors");
const mercadopago = require("mercadopago");

const app = express();
const PORT = 3001;

// Configurar MercadoPago con tu Access Token real
mercadopago.configure({
  access_token: "APP_USR-4542587318471605-040523-2e3e43dea59d4a7d87c75607477b2d4f-2372130931", // ← reemplaza esto con tu token
});

// Middleware
app.use(cors());
app.use(express.json());

// Ruta para crear una preferencia de pago
app.post("/crear-preferencia", async (req, res) => {
  const { amount, description } = req.body;

  try {
    const preference = {
      items: [
        {
          title: description,
          unit_price: Number(amount),
          quantity: 1,
        },
      ],
      back_urls: {
        success: "http://localhost:3000/success",
        failure: "http://localhost:3000/failure",
      },
      auto_return: "approved",
    };

    const response = await mercadopago.preferences.create(preference);
    res.json({ init_point: response.body.init_point });
  } catch (error) {
    console.error("Error al crear preferencia:", error);
    res.status(500).json({ error: "Error al crear preferencia" });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
