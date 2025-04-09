import React from "react";
import { Routes, Route } from "react-router-dom";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import Home from "./pages/Home";
import AdminPanel from "./pages/AdminPanel";

function App() {
  return (
    <PayPalScriptProvider
      options={{
        "client-id": "ARxB95oNac9jTq1ODC-4PD7yeWx7_cfaW2-gh33WPvHBzxb-85bfzc9-1_ZqRNMtwRr-yw4D90r5EcnS",
        currency: "USD",
      }}
    >
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </PayPalScriptProvider>
  );
}

export default App;

