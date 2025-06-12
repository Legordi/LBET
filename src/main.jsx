<<<<<<< HEAD
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/Home.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
=======
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
>>>>>>> 1d301f66074100048eca34a09004effca1aa4b73
  </React.StrictMode>
);
