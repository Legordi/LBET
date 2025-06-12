import React, { useState, useRef } from "react";
import { FaHome } from "react-icons/fa";
import "../styles/Home.css";
import rocketImg from "../assets/crash.png";
import minesImg from "../assets/mines.png";
import wheelImg from "../assets/wheel.png";
import coheteImg from "../assets/cohete.png";

// Multiplicadores disponibles para Wheel
const WHEEL_MULTIPLIERS = [
  0, 0.5, 1, 2, 3, 5, 10, 20, 50, 100
];

// Algoritmo de selección ponderada
function weightedRandomIndex(weights) {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    if (r < weights[i]) return i;
    r -= weights[i];
  }
  return weights.length - 1;
}

// --- Tabla de multiplicadores para Mines (solo primeras filas, completa si lo necesitas) ---
const MINES_MULTIPLIERS = [
  [1.01, 1.08, 1.12, 1.18, 1.24, 1.28, 1.37, 1.46, 1.55, 1.65, 1.77, 1.92, 2.06, 2.25, 2.47, 2.75, 3.09, 3.54, 4.12, 4.95, 6.19, 8.25, 12.37, 24.75],
  [1.08, 1.17, 1.29, 1.41, 1.56, 1.74, 1.94, 2.18, 2.47, 2.81, 3.26, 3.81, 4.51, 5.4, 6.6, 8.25, 10.61, 14.14, 19.8, 29.7, 49.5, 99, 297, 0],
  [1.14, 1.29, 1.41, 1.61, 1.85, 2.15, 2.53, 3.01, 3.62, 4.41, 5.44, 6.81, 8.64, 11.13, 14.5, 19.31, 26.91, 39.11, 59.84, 99, 227.7, 569.3, 2277, 0],
  [1.2, 1.41, 1.56, 1.81, 2.13, 2.56, 3.13, 3.91, 5, 6.56, 8.82, 12.09, 17.04, 25.56, 41.87, 73.95, 142.45, 297, 0, 0, 0, 0, 0, 0],
  [1.26, 1.54, 1.76, 2.09, 2.53, 3.16, 4.09, 5.5, 7.7, 11.23, 17.04, 27.39, 47.59, 89.19, 178.91, 417.45, 936.2, 2504, 5693, 0, 0, 0, 0, 0],
  [1.32, 1.69, 2, 2.41, 3, 3.91, 5.38, 7.98, 12.09, 19.31, 33.22, 61.48, 122.77, 294.18, 834.95, 2504, 0, 0, 0, 0, 0, 0, 0, 0],
  [1.39, 1.85, 2.27, 2.81, 3.54, 4.95, 7.7, 12.38, 21.25, 39.11, 79.93, 202.25, 569.3, 2022.54, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [1.45, 2.02, 2.56, 3.26, 4.19, 6.19, 10.61, 19.8, 39.11, 83.42, 202.25, 648.9, 3236.07, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [1.52, 2.2, 2.88, 3.81, 4.95, 7.7, 14.5, 29.7, 69.89, 176.4, 490.31, 2022.54, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [1.59, 2.39, 3.22, 4.51, 5.94, 9.5, 19.31, 49.5, 138.66, 490.31, 2941.88, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

// Mines multiplicador
function getMinesMultiplier(diamantes, minas) {
  if (diamantes < 1 || minas < 1 || minas > 24 || diamantes > 25 - minas) return 0;
  const row = diamantes - 1;
  const col = minas - 1;
  return MINES_MULTIPLIERS[row]?.[col] || 0;
}

// Algoritmo de explosión para Rocket adaptado a tus reglas
function getExplosionMultiplier({
  apuesta,
  saldo,
  historial,
  montoPerdido,
}) {
  if (apuesta === saldo && Math.random() < 0.7) {
    return +(Math.random() * 0.5).toFixed(2);
  }
  let posibleGanancia = apuesta * 10;
  let maxMult = 10;
  if (montoPerdido > 0 && posibleGanancia < montoPerdido * 0.8) {
    maxMult = 10;
  } else if (montoPerdido > 0 && posibleGanancia < montoPerdido * 1.5) {
    maxMult = 5;
  } else {
    maxMult = 2.5;
  }
  return +(Math.random() * (maxMult - 0.01) + 0.01).toFixed(2);
}

function getExplosionMessageMultiplier(multRecolectado) {
  if (multRecolectado < 2) {
    return +(Math.random() * (12 - 2) + 2).toFixed(2);
  } else if (multRecolectado < 4) {
    return +(Math.random() * (multRecolectado + 5 - (multRecolectado + 0.5)) + (multRecolectado + 0.5)).toFixed(2);
  } else if (multRecolectado < 8) {
    return +(Math.random() * (multRecolectado + 1 - (multRecolectado + 0.2)) + (multRecolectado + 0.2)).toFixed(2);
  } else {
    return +(Math.random() * (multRecolectado + 0.3 - (multRecolectado + 0.01)) + (multRecolectado + 0.01)).toFixed(2);
  }
}

// RocketGame
const RocketGame = ({ onBack, infoUsuario, actualizarSaldo }) => {
  const [apuesta, setApuesta] = useState("");
  const [autoCobro, setAutoCobro] = useState("");
  const [autoCobroActivo, setAutoCobroActivo] = useState(false);
  const [jugando, setJugando] = useState(false);
  const [multiplicador, setMultiplicador] = useState(0);
  const [intervalId, setIntervalId] = useState(null);
  const [detenido, setDetenido] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [botonRojo, setBotonRojo] = useState(false);
  const [cuentaRegresiva, setCuentaRegresiva] = useState(0);
  const [historial, setHistorial] = useState([]); // [{apuesta, resultado}]
  const [montoPerdido, setMontoPerdido] = useState(0);

  const explosionRef = useRef(null);
  const cuentaRef = useRef(null);

  const resetGame = () => {
    setJugando(false);
    setMultiplicador(0);
    setDetenido(false);
    setMensaje("");
    setBotonRojo(false);
    explosionRef.current = null;
    setAutoCobroActivo(false);
    setCuentaRegresiva(0);
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    if (cuentaRef.current) {
      clearInterval(cuentaRef.current);
      cuentaRef.current = null;
    }
  };

  const iniciarCuentaRegresiva = () => {
    setCuentaRegresiva(5);
    cuentaRef.current = setInterval(() => {
      setCuentaRegresiva(prev => {
        if (prev <= 1) {
          clearInterval(cuentaRef.current);
          cuentaRef.current = null;
          resetGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleJugar = () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    setDetenido(false);
    setMensaje("");
    setMultiplicador(0);

    const monto = Number(apuesta);
    if (!monto || monto < 1000) {
      setMensaje("La apuesta mínima es de $1000");
      return;
    }
    if (monto > infoUsuario.saldo) {
      setMensaje("No tienes saldo suficiente.");
      return;
    }
    setJugando(true);
    setBotonRojo(true);
    actualizarSaldo(s => s - monto);

    // Calcula historial de pérdidas
    let perdidas = 0;
    for (let h of historial.slice(-30)) {
      if (h.resultado < h.apuesta) perdidas += (h.apuesta - h.resultado);
    }
    setMontoPerdido(perdidas);

    // Algoritmo de explosión adaptado
    const explosionMult = getExplosionMultiplier({
      apuesta: monto,
      saldo: infoUsuario.saldo,
      historial,
      montoPerdido: perdidas,
    });
    explosionRef.current = explosionMult;

    const id = setInterval(() => {
      setMultiplicador(prev => {
        const next = +(prev + 0.01).toFixed(2);

        // Auto cobro
        if (autoCobroActivo && autoCobro && next >= Number(autoCobro)) {
          handleRecolectar(next);
          clearInterval(id);
          setIntervalId(null);
          return next;
        }

        // Explosión
        if (next >= explosionRef.current) {
          clearInterval(id);
          setIntervalId(null);
          setDetenido(true);
          setBotonRojo(false);
          setMensaje("¡El cohete explotó! Perdiste tu apuesta.");
          setHistorial(h => [...h, { apuesta: monto, resultado: 0 }]);
          setTimeout(() => {
            iniciarCuentaRegresiva();
          }, 500);
          return explosionRef.current;
        }

        return next;
      });
    }, 100);
    setIntervalId(id);
  };

  const handleRecolectar = (mult = null) => {
    if (!jugando || detenido) return;
    const monto = Number(apuesta);
    const multGanador = mult !== null ? mult : multiplicador;
    const ganancia = +(monto * multGanador).toFixed(0);

    // Mensaje de explosión simulado
    const explosionMsgMult = getExplosionMessageMultiplier(multGanador);

    actualizarSaldo(s => s + ganancia);
    setMensaje(
      `¡Recolectaste $${ganancia.toLocaleString("es-CO")}! El cohete iba a estallar en X${explosionMsgMult}`
    );
    setJugando(false);
    setBotonRojo(false);
    setDetenido(true);
    setHistorial(h => [...h, { apuesta: monto, resultado: ganancia }]);
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    setTimeout(() => {
      iniciarCuentaRegresiva();
    }, 500);
  };

  React.useEffect(() => {
    return () => {
      if (intervalId) clearInterval(intervalId);
      if (cuentaRef.current) clearInterval(cuentaRef.current);
    };
  }, [intervalId]);

  return (
    <div className="rocket-game-container" style={{
      background: "#000",
      borderRadius: 18,
      border: "1px solid #444",
      padding: 32,
      margin: 32,
      minHeight: 500,
      position: "relative"
    }}>
      <button
        className="btn-home"
        onClick={onBack}
        style={{
          position: "absolute",
          left: 30,
          top: 30,
          fontSize: 32,
          background: "none",
          border: "none",
          color: "#fff",
          cursor: "pointer",
        }}
      >
        <FaHome />
      </button>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 40 }}>
        <div style={{ fontSize: 48, fontWeight: 700, color: "#fff", marginBottom: 16 }}>
          X{multiplicador.toFixed(2)}
        </div>
        <img src={coheteImg} alt="Rocket" style={{ width: 90, height: 120, marginBottom: 32 }} />
        <div style={{
          background: "#181818",
          borderRadius: 16,
          padding: 32,
          minWidth: 480,
          display: "flex",
          flexDirection: "column",
          gap: 24,
          boxShadow: "0 0 16px #0004"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <label style={{ color: "#fff", fontWeight: 600, width: 90 }}>Apuesta</label>
            <input
              className="input-monto"
              type="number"
              min="1000"
              placeholder=""
              value={apuesta}
              onChange={e => setApuesta(e.target.value)}
              disabled={jugando || cuentaRegresiva > 0}
              style={{
                background: cuentaRegresiva > 0 ? "#444" : "#222",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "10px 16px",
                fontSize: 18,
                width: 120
              }}
            />
            <button
              className="btn-depositar-modal"
              style={{
                background: cuentaRegresiva > 0
                  ? "#888"
                  : botonRojo
                  ? "#ff3b3b"
                  : "#00ff7b",
                color: "#111",
                border: "none",
                borderRadius: 12,
                fontWeight: 700,
                fontSize: 20,
                padding: "10px 32px",
                marginLeft: 16,
                transition: "background 0.2s"
              }}
              onClick={jugando ? () => handleRecolectar() : handleJugar}
              disabled={detenido || (mensaje && !jugando) || cuentaRegresiva > 0}
            >
              {jugando ? "Recolectar" : "Jugar"}
            </button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <label style={{ color: "#fff", fontWeight: 600, width: 90 }}>Auto cobro</label>
            <input
              className="input-autocobro"
              type="number"
              min="1"
              step="0.01"
              placeholder="Ej: 2.5"
              value={autoCobro}
              onChange={e => setAutoCobro(e.target.value)}
              disabled={jugando || cuentaRegresiva > 0}
              style={{
                background: cuentaRegresiva > 0 ? "#444" : "#222",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "10px 16px",
                fontSize: 18,
                width: 120
              }}
            />
            <label style={{ display: "flex", alignItems: "center", marginLeft: 16, cursor: (jugando || cuentaRegresiva > 0) ? "not-allowed" : "pointer" }}>
              <input
                type="checkbox"
                checked={autoCobroActivo}
                onChange={() => setAutoCobroActivo(a => !a)}
                disabled={jugando || cuentaRegresiva > 0}
                style={{ width: 0, height: 0, opacity: 0, position: "absolute" }}
              />
              <span
                style={{
                  display: "inline-block",
                  width: 48,
                  height: 28,
                  background: autoCobroActivo ? "#00ff7b" : "#444",
                  borderRadius: 16,
                  position: "relative",
                  transition: "background 0.2s"
                }}
              >
                <span
                  style={{
                    display: "block",
                    width: 22,
                    height: 22,
                    background: "#fff",
                    borderRadius: "50%",
                    position: "absolute",
                    top: 3,
                    left: autoCobroActivo ? 24 : 4,
                    transition: "left 0.2s"
                  }}
                />
              </span>
            </label>
          </div>
          {mensaje && (
            <div style={{ color: detenido ? "#ff3b3b" : "#00ff7b", marginTop: 16, fontWeight: 600 }}>
              {mensaje}
              {cuentaRegresiva > 0 && (
                <span style={{ color: "#fff", marginLeft: 16 }}>
                  Siguiente ronda en {cuentaRegresiva}...
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// MinesGame y WheelGame igual que antes (sin cambios)
const MinesGame = ({ onBack, infoUsuario, actualizarSaldo }) => {
  const [apuesta, setApuesta] = useState("");
  const [minas, setMinas] = useState("");
  const [gridState, setGridState] = useState(Array(25).fill(null));
  const [jugando, setJugando] = useState(false);
  const [diamantes, setDiamantes] = useState(0);
  const [perdio, setPerdio] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [minasRestantes, setMinasRestantes] = useState(0);
  const [casillasRestantes, setCasillasRestantes] = useState(25);

  const minesCount = Math.max(1, Math.min(24, Number(minas)));
  const multiplicador = getMinesMultiplier(diamantes, minesCount);

  const handleJugarORetirar = () => {
    if (!jugando) {
      const monto = Number(apuesta);
      if (!monto || monto < 1000) {
        setMensaje("La apuesta mínima es de $1000");
        return;
      }
      if (monto > infoUsuario.saldo) {
        setMensaje("No tienes saldo suficiente.");
        return;
      }
      if (!minas || minesCount < 1 || minesCount > 24) {
        setMensaje("Elige una cantidad de minas válida (1-24).");
        return;
      }
      setGridState(Array(25).fill(null));
      setJugando(true);
      setDiamantes(0);
      setPerdio(false);
      setMensaje("");
      setMinasRestantes(minesCount);
      setCasillasRestantes(25);
      actualizarSaldo(s => s - monto);
    } else {
      setJugando(false);
      const monto = Number(apuesta);
      if (diamantes === 0) {
        actualizarSaldo(s => s + monto);
        setMensaje("No abriste ninguna casilla, tu apuesta ha sido devuelta.");
      } else if (multiplicador > 0 && monto > 0) {
        const ganancia = monto * multiplicador;
        actualizarSaldo(s => s + ganancia);
        setMensaje(`¡Te retiraste y ganaste $${ganancia.toLocaleString("es-CO")}!`);
      }
    }
  };

  const handleCellClick = (idx) => {
    if (!jugando || gridState[idx] !== null || perdio) return;
    if (casillasRestantes <= 0 || minasRestantes < 0) return;
    const probabilidadMina = minasRestantes / casillasRestantes;
    const esMina = Math.random() < probabilidadMina;
    const newGrid = [...gridState];
    if (esMina) {
      newGrid[idx] = "mine";
      setGridState(newGrid);
      setPerdio(true);
      setJugando(false);
      setMensaje("¡Perdiste! Era una mina.");
      setMinasRestantes(minasRestantes - 1);
      setCasillasRestantes(casillasRestantes - 1);
    } else {
      newGrid[idx] = "diamond";
      setGridState(newGrid);
      setDiamantes(d => d + 1);
      setMensaje("");
      setCasillasRestantes(casillasRestantes - 1);
    }
  };

  return (
    <div className="mines-game-container" style={{
      display: "flex",
      alignItems: "flex-start",
      padding: 40,
      minHeight: 600,
      position: "relative"
    }}>
      <button
        className="btn-home"
        onClick={onBack}
        style={{
          position: "absolute",
          left: 50,
          top: 50,
          fontSize: 32,
          background: "none",
          border: "none",
          color: "#fff",
          cursor: "pointer",
        }}
      >
        <FaHome />
      </button>
      <div className="mines-panel" style={{
        background: "#111",
        borderRadius: 18,
        border: "2px solid #444",
        padding: 32,
        minWidth: 300,
        marginRight: 60,
        color: "#fff",
        boxShadow: "0 0 16px #0004",
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch"
      }}>
        <h2 style={{ textAlign: "center", marginBottom: 24 }}>Bienvenido a Mines</h2>
        <label style={{ marginBottom: 8, fontWeight: 600 }}>Realiza tu apuesta</label>
        <input
          className="input-monto"
          type="number"
          min="1000"
          placeholder=""
          value={apuesta}
          onChange={e => setApuesta(e.target.value)}
          disabled={jugando}
          style={{
            marginBottom: 18,
            background: "#222",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "10px 16px",
            fontSize: 18
          }}
        />
        <label style={{ marginBottom: 8, fontWeight: 600 }}>Escoge la cantidad de minas</label>
        <input
          className="input-minas"
          type="number"
          min="1"
          max="24"
          placeholder=""
          value={minas}
          onChange={e => {
            const val = e.target.value.replace(/\D/g, "");
            if (val === "") {
              setMinas("");
            } else {
              const num = Math.max(1, Math.min(24, Number(val)));
              setMinas(num);
            }
          }}
          disabled={jugando}
          style={{
            marginBottom: 24,
            background: "#222",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "10px 16px",
            fontSize: 18
          }}
        />
        <button
          className="btn-depositar-modal"
          style={{
            marginTop: 10,
            width: "100%",
            background: "#00ff7b",
            color: "#111",
            border: "none",
            borderRadius: 12,
            fontWeight: 700,
            fontSize: 20,
            padding: "10px 0"
          }}
          onClick={handleJugarORetirar}
          disabled={
            (!jugando && (!apuesta || !minas)) ||
            (jugando && perdio)
          }
        >
          {jugando ? "Retirarse" : "Jugar"}
        </button>
        <div style={{ marginTop: 24, color: "#fff", fontWeight: 600 }}>
          {mensaje && (
            <div style={{ color: perdio ? "#ff3b3b" : "#00ff7b", marginBottom: 10 }}>
              {mensaje}
            </div>
          )}
          {jugando && !perdio && (
            <>
              <div>Diamantes: {diamantes}</div>
              <div>Multiplicador actual: x{multiplicador}</div>
            </>
          )}
        </div>
      </div>
      <div className="mines-grid" style={{
        display: "grid",
        gridTemplateColumns: "repeat(5, 64px)",
        gridTemplateRows: "repeat(5, 64px)",
        gap: "18px",
        marginTop: 10,
        marginLeft: 30
      }}>
        {Array.from({ length: 25 }).map((_, i) => (
          <div
            key={i}
            className="mines-cell"
            style={{
              width: 64,
              height: 64,
              border: "2px solid #444",
              borderRadius: 12,
              background: gridState[i] === "diamond" ? "#00ff7b" : gridState[i] === "mine" ? "#ff3b3b" : "#111",
              boxSizing: "border-box",
              cursor: jugando && !perdio && gridState[i] === null ? "pointer" : "default"
            }}
            onClick={() => handleCellClick(i)}
          />
        ))}
      </div>
    </div>
  );
};

const WheelGame = ({ onBack, infoUsuario, actualizarSaldo, redirigirLogin }) => {
  const [apuesta, setApuesta] = useState("");
  const [girando, setGirando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [multiplicadorActual, setMultiplicadorActual] = useState(1);
  const [historialResultados, setHistorialResultados] = useState([]);

  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  const handleJugar = async () => {
    if (!infoUsuario) {
      if (redirigirLogin) redirigirLogin();
      return;
    }

    const monto = Number(apuesta);
    if (!monto || monto < 1000) {
      setResultado({ mensaje: "La apuesta mínima es de $1000.", exito: false });
      return;
    }
    if (monto > infoUsuario.saldo) {
      setResultado({ mensaje: "No tienes saldo suficiente.", exito: false });
      return;
    }
    if (girando) return;

    setGirando(true);
    setResultado(null);

    await actualizarSaldo(infoUsuario.saldo - monto);

    intervalRef.current = setInterval(() => {
      const idx = Math.floor(Math.random() * WHEEL_MULTIPLIERS.length);
      setMultiplicadorActual(WHEEL_MULTIPLIERS[idx]);
    }, 80);

    const getPerdidasUltimasN = (n) => {
      const ultimasN = historialResultados.slice(-n);
      let perdidas = 0;
      for (let r of ultimasN) {
        if (r.premio < r.apuesta) perdidas += (r.apuesta - r.premio);
      }
      return perdidas;
    };

    let idxGanador;
    let intentos = 0;
    do {
      const lowMults = [0, 0.5, 1, 2, 3];
      const lowWeights = [25, 20, 35, 10, 10];
      let weights = WHEEL_MULTIPLIERS.map((m) => {
        const i = lowMults.indexOf(m);
        return i !== -1 ? lowWeights[i] : 1;
      });

      idxGanador = weightedRandomIndex(weights);
      const multiplicador = WHEEL_MULTIPLIERS[idxGanador];
      const posiblePremio = monto * multiplicador;

      let cumpleCondicion = false;

      if (multiplicador === 5) {
        const perdidas = getPerdidasUltimasN(5);
        if (perdidas > 0 && posiblePremio < 0.9 * perdidas) cumpleCondicion = true;
      } else if (multiplicador === 10) {
        const perdidas = getPerdidasUltimasN(10);
        if (perdidas > 0 && posiblePremio < 0.8 * perdidas) cumpleCondicion = true;
      } else if (multiplicador === 20) {
        const perdidas = getPerdidasUltimasN(20);
        if (perdidas > 0 && posiblePremio < 0.7 * perdidas) cumpleCondicion = true;
      } else if (multiplicador === 50) {
        const perdidas = getPerdidasUltimasN(30);
        if (perdidas > 0 && posiblePremio < 0.5 * perdidas) cumpleCondicion = true;
      } else if (multiplicador === 100) {
        const perdidas = getPerdidasUltimasN(50);
        if (perdidas > 0 && posiblePremio < 0.5 * perdidas) cumpleCondicion = true;
      }

      if ([5, 10, 20, 50, 100].includes(multiplicador)) {
        if (cumpleCondicion) break;
        intentos++;
        continue;
      }
      break;
    } while (intentos < 100);

    timeoutRef.current = setTimeout(() => {
      clearInterval(intervalRef.current);
      setMultiplicadorActual(WHEEL_MULTIPLIERS[idxGanador]);

      const multiplicador = WHEEL_MULTIPLIERS[idxGanador];
      let ganancia = 0;
      let mensaje = "";

      if (multiplicador > 0) {
        ganancia = monto * (multiplicador - 1);
        actualizarSaldo((s) => s + ganancia);
        mensaje = `¡Ganaste! Multiplicador: x${multiplicador} | Ganancia: $${(monto * multiplicador).toLocaleString("es-CO")}`;
      } else {
        mensaje = "¡Perdiste! La rueda cayó en x0.";
      }

      setHistorialResultados(prev => {
        const nuevo = [...prev, { apuesta: monto, premio: monto * multiplicador }];
        return nuevo.length > 100 ? nuevo.slice(-100) : nuevo;
      });

      setResultado({ mensaje, exito: multiplicador > 0 });
      setGirando(false);
    }, 10000);
  };

  React.useEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
      clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div className="wheel-game-container">
      <button
        className="btn-home"
        onClick={onBack}
        style={{
          position: "absolute",
          left: 30,
          top: 30,
          fontSize: 32,
          background: "none",
          border: "none",
          color: "#fff",
          cursor: "pointer",
        }}
      >
        <FaHome />
      </button>
      <div className="wheel-game-content">
        <div className="wheel-single-visual">
          <div className="wheel-single-arrow">&#9654;</div>
          <div className="wheel-single-window">
            <div className="wheel-single-mult">
              X{multiplicadorActual}
            </div>
          </div>
        </div>
        <div className="wheel-game-panel">
          <h2>Bienvenido a Wheel</h2>
          <p>Haz tu apuesta, gira la rueda y GANA increíbles premios!</p>
          <label>Realiza tu apuesta</label>
          <input
            className="input-monto"
            type="number"
            min="1000"
            placeholder="Ingresa tu apuesta"
            value={apuesta}
            onChange={(e) => setApuesta(e.target.value)}
            disabled={girando}
          />
          <button
            className="btn-depositar-modal"
            style={{ marginTop: 10, width: "100%" }}
            onClick={handleJugar}
            disabled={girando}
          >
            {girando ? "Girando..." : "JUGAR"}
          </button>
          {resultado && (
            <div
              className={
                resultado.exito ? "resultado-exito" : "resultado-error"
              }
              style={{ marginTop: 16 }}
            >
              {resultado.mensaje}
            </div>
          )}
          <div style={{ marginTop: 16, color: "#fff" }}>
            Saldo actual: <b>${infoUsuario ? infoUsuario.saldo.toLocaleString("es-CO") : "0"}</b>
          </div>
        </div>
      </div>
    </div>
  );
};

const Inicio = ({ infoUsuario, actualizarSaldo, redirigirLogin }) => {
  const [juego, setJuego] = useState(null);

  if (juego === "rocket") {
    return (
      <RocketGame
        onBack={() => setJuego(null)}
        infoUsuario={infoUsuario}
        actualizarSaldo={actualizarSaldo}
      />
    );
  }

  if (juego === "wheel") {
    return (
      <WheelGame
        onBack={() => setJuego(null)}
        infoUsuario={infoUsuario}
        actualizarSaldo={actualizarSaldo}
        redirigirLogin={redirigirLogin}
      />
    );
  }

  if (juego === "mines") {
    return (
      <MinesGame
        onBack={() => setJuego(null)}
        infoUsuario={infoUsuario}
        actualizarSaldo={actualizarSaldo}
      />
    );
  }

  return (
    <div className="inicio-container">
      <div className="casino-games-container">
        <h1>¡Bienvenido a LuckyDay!</h1>
        <p>
          Elige uno de nuestros juegos disponibles y comienza a ganar increíbles <b>RECOMPENSAS</b>
        </p>
        <div className="games-grid-horizontal">
          <img
            src={rocketImg}
            alt="Rocket"
            style={{ cursor: "pointer", width: 300, height: 360, borderRadius: 18 }}
            onClick={() => setJuego("rocket")}
          />
          <img
            src={minesImg}
            alt="Mines"
            style={{ cursor: "pointer", width: 300, height: 360, borderRadius: 18 }}
            onClick={() => setJuego("mines")}
          />
          <img
            src={wheelImg}
            alt="Wheel"
            style={{ cursor: "pointer", width: 300, height: 360, borderRadius: 18 }}
            onClick={() => setJuego("wheel")}
          />
        </div>
      </div>
    </div>
  );
};

export default Inicio;