import React from "react"; 
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./styles/Home.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);