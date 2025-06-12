import React, { useState, useEffect } from "react";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";

const SorteosRecientes = ({ infoUsuario }) => {
  const [mostrarDeposito, setMostrarDeposito] = useState(false);
  const [mostrarRetiro, setMostrarRetiro] = useState(false);
  const [montoDeposito, setMontoDeposito] = useState("");
  const [montoRetiro, setMontoRetiro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [solicitudes, setSolicitudes] = useState([]);
  const [procesando, setProcesando] = useState(null);

  // Cargar solicitudes en tiempo real
  useEffect(() => {
    if (!infoUsuario) return;

    let q;
    if (infoUsuario.rol === "Admin") {
      q = query(collection(db, "solicitudes"), orderBy("fecha", "desc"));
    } else if (infoUsuario.uid) {
      q = query(
        collection(db, "solicitudes"),
        where("usuarioId", "==", infoUsuario.uid)
      );
    } else {
      setSolicitudes([]);
      return;
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      docs.sort((a, b) => {
        if (!a.fecha && !b.fecha) return 0;
        if (!a.fecha) return -1;
        if (!b.fecha) return 1;
        return b.fecha.seconds - a.fecha.seconds;
      });
      setSolicitudes(docs);
    });

    return () => unsubscribe();
  }, [infoUsuario]);

  if (!infoUsuario) return null;

  // Crear solicitud de depósito
  const handleDepositar = async () => {
    if (!montoDeposito || isNaN(montoDeposito) || Number(montoDeposito) <= 0) {
      alert("Ingresa un monto válido.");
      return;
    }
    setEnviando(true);
    try {
      await addDoc(collection(db, "solicitudes"), {
        usuarioId: infoUsuario.uid || "",
        nombreUsuario: infoUsuario.nombreUsuario,
        tipo: "Deposito",
        monto: Number(montoDeposito),
        estado: "Pendiente",
        fecha: serverTimestamp(),
      });
      setMostrarDeposito(false);
      setMontoDeposito("");
      alert("Solicitud de depósito enviada.");
    } catch (e) {
      alert("Error al enviar la solicitud.");
    }
    setEnviando(false);
  };

  // Crear solicitud de retiro
  const handleRetirar = async () => {
    if (!montoRetiro || isNaN(montoRetiro) || Number(montoRetiro) <= 0) {
      alert("Ingresa un monto válido.");
      return;
    }
    if (Number(montoRetiro) > (infoUsuario.saldo || 0)) {
      alert("No tienes saldo suficiente para retirar esa cantidad.");
      return;
    }
    setEnviando(true);
    try {
      await addDoc(collection(db, "solicitudes"), {
        usuarioId: infoUsuario.uid || "",
        nombreUsuario: infoUsuario.nombreUsuario,
        tipo: "Retiro",
        monto: Number(montoRetiro),
        estado: "Pendiente",
        fecha: serverTimestamp(),
      });
      setMostrarRetiro(false);
      setMontoRetiro("");
      alert("Solicitud de retiro enviada.");
    } catch (e) {
      alert("Error al enviar la solicitud.");
    }
    setEnviando(false);
  };

  // Aprobar solicitud
  const aprobarSolicitud = async (solicitud) => {
    setProcesando(solicitud.id);
    try {
      await updateDoc(doc(db, "solicitudes", solicitud.id), {
        estado: "Aprobada",
      });
      const userRef = doc(db, "users", solicitud.usuarioId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const saldoActual = userSnap.data().saldo || 0;
        if (solicitud.tipo === "Deposito") {
          await updateDoc(userRef, {
            saldo: saldoActual + solicitud.monto,
          });
        } else if (solicitud.tipo === "Retiro") {
          await updateDoc(userRef, {
            saldo: saldoActual - solicitud.monto,
          });
        }
      }
    } catch (e) {
      alert("Error al aprobar la solicitud.");
    }
    setProcesando(null);
  };

  // Rechazar solicitud
  const rechazarSolicitud = async (solicitud) => {
    setProcesando(solicitud.id);
    try {
      await updateDoc(doc(db, "solicitudes", solicitud.id), {
        estado: "Rechazada",
      });
    } catch (e) {
      alert("Error al rechazar la solicitud.");
    }
    setProcesando(null);
  };

  // Formatear fecha y hora
  const formatFecha = (fecha) => {
    if (!fecha?.toDate) return "";
    const d = fecha.toDate();
    return d.toLocaleDateString("es-CO");
  };
  const formatHora = (fecha) => {
    if (!fecha?.toDate) return "";
    const d = fecha.toDate();
    return d.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
  };

  // Vista para ADMIN
  if (infoUsuario.rol === "Admin") {
    return (
      <div className="seccion-recientes">
        <div className="panel-transacciones">
          <h3 className="titulo-transacciones">Solicitudes recientes</h3>
          <table className="tabla-transacciones">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Tipo de transacción</th>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Monto</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {solicitudes.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ color: "#888", textAlign: "center" }}>
                    No hay solicitudes recientes.
                  </td>
                </tr>
              ) : (
                solicitudes.map((sol) => (
                  <tr key={sol.id}>
                    <td>{sol.nombreUsuario}</td>
                    <td>{sol.tipo}</td>
                    <td>
                      {sol.fecha?.toDate
                        ? formatFecha(sol.fecha)
                        : <span style={{ color: "#888" }}>Pendiente...</span>}
                    </td>
                    <td>
                      {sol.fecha?.toDate
                        ? formatHora(sol.fecha)
                        : <span style={{ color: "#888" }}>Pendiente...</span>}
                    </td>
                    <td>${sol.monto?.toLocaleString("es-CO")}</td>
                    <td>
                      {sol.estado === "Pendiente" && (
                        <>
                          <span className="estado-pendiente">Pendiente</span>
                          <FaCheckCircle
                            className="icono-accion aceptar"
                            title="Aprobar"
                            style={{ cursor: "pointer", marginLeft: 8 }}
                            onClick={() => aprobarSolicitud(sol)}
                            disabled={procesando === sol.id}
                          />
                          <FaTimesCircle
                            className="icono-accion rechazar"
                            title="Rechazar"
                            style={{ cursor: "pointer", marginLeft: 8 }}
                            onClick={() => rechazarSolicitud(sol)}
                            disabled={procesando === sol.id}
                          />
                        </>
                      )}
                      {sol.estado === "Aprobada" && (
                        <span className="estado-aprobada">Aprobada</span>
                      )}
                      {sol.estado === "Rechazada" && (
                        <span className="estado-rechazada">Rechazada</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Vista para USUARIO NORMAL
  return (
    <div className="seccion-recientes">
      <div className="panel-cuenta">
        <div>
          <h2 className="nombre-usuario">{infoUsuario.nombreUsuario}</h2>
          <p className="saldo-usuario">
            ${infoUsuario?.saldo?.toLocaleString("es-CO") || "0"}
          </p>
        </div>
        <div className="acciones-cuenta">
          <button className="btn-depositar" onClick={() => setMostrarDeposito(true)}>
            Depositar
          </button>
          <button className="btn-retirar" onClick={() => setMostrarRetiro(true)}>
            Retirar
          </button>
        </div>
      </div>

      {/* Modal de depósito */}
      {mostrarDeposito && (
        <div className="modal-deposito-overlay">
          <div className="modal-deposito">
            <button className="cerrar-modal" onClick={() => setMostrarDeposito(false)}>
              &times;
            </button>
            <h2>Depositar</h2>
            <p>Elige el monto a depositar</p>
            <input
              type="number"
              min="1"
              placeholder="Monto"
              value={montoDeposito}
              onChange={e => setMontoDeposito(e.target.value)}
              className="input-monto"
              disabled={enviando}
            />
            <button
              className="btn-depositar-modal"
              onClick={handleDepositar}
              disabled={enviando}
            >
              {enviando ? "Enviando..." : "Depositar"}
            </button>
          </div>
        </div>
      )}

      {/* Modal de retiro */}
      {mostrarRetiro && (
        <div className="modal-deposito-overlay">
          <div className="modal-deposito">
            <button className="cerrar-modal" onClick={() => setMostrarRetiro(false)}>
              &times;
            </button>
            <h2>Retirar</h2>
            <p>Elige el monto a retirar</p>
            <input
              type="number"
              min="1"
              placeholder="Monto"
              value={montoRetiro}
              onChange={e => setMontoRetiro(e.target.value)}
              className="input-monto"
              disabled={enviando}
            />
            <button
              className="btn-depositar-modal"
              onClick={handleRetirar}
              disabled={enviando}
            >
              {enviando ? "Enviando..." : "Retirar"}
            </button>
          </div>
        </div>
      )}

      <div className="panel-transacciones">
        <h3 className="titulo-transacciones">Transacciones recientes</h3>
        <table className="tabla-transacciones">
          <thead>
            <tr>
              <th>Tipo de transacción</th>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Monto</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {solicitudes.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ color: "#888", textAlign: "center" }}>
                  No hay transacciones recientes.
                </td>
              </tr>
            ) : (
              solicitudes.map((sol) => (
                <tr key={sol.id}>
                  <td>{sol.tipo}</td>
                  <td>
                    {sol.fecha?.toDate
                      ? formatFecha(sol.fecha)
                      : <span style={{ color: "#888" }}>Pendiente...</span>}
                  </td>
                  <td>
                    {sol.fecha?.toDate
                      ? formatHora(sol.fecha)
                      : <span style={{ color: "#888" }}>Pendiente...</span>}
                  </td>
                  <td>${sol.monto?.toLocaleString("es-CO")}</td>
                  <td>
                    {sol.estado === "Pendiente" && (
                      <span className="estado-pendiente">Pendiente</span>
                    )}
                    {sol.estado === "Aprobada" && (
                      <span className="estado-aprobada">Aprobada</span>
                    )}
                    {sol.estado === "Rechazada" && (
                      <span className="estado-rechazada">Rechazada</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SorteosRecientes;