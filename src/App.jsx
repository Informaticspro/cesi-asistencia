import { useEffect, useState,useRef } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
  useNavigate,
} from "react-router-dom";
import { supabase } from "./supabaseClient"; // 👈 IMPORTANTE

import Bienvenida from "./Bienvenida";
import BuscarQR from "./BuscarQR";
import EscanerQR from "./EscanerQR";
import RegistrarParticipante from "./RegistrarParticipante";
import AdminParticipantes from "./AdminParticipantes";
import MiFooter from "./MiFooter";
import AgregarActualizacion from "./AgregarActualizacion";
import AsistenciaHoy from "./AsistenciaHoy";
import logoUnachi from "./assets/logo_unachi.png";
import logoCongreso from "./assets/logo_congreso.png";
import Noticias from "./Noticias";
import AdminUsuarios from "./AdminUsuarios";



function AppWrapper() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 480);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const logoBaseStyle = {
    position: "fixed",
    top: 15,
    opacity: 0.5,
    pointerEvents: "none",
    userSelect: "none",
    zIndex: 9999,
  };

  return (
    <Router>
      <div style={{ width: "100%", position: "fixed", top: 0, left: 0, zIndex: 1000 }}>
        <img
          src={logoUnachi}
          alt="Logo UNACHI"
          style={{
            ...logoBaseStyle,
            left: 15,
            height: isMobile ? 30 : 50,
          }}
        />
        <img
          src={logoCongreso}
          alt="Logo Congreso"
          style={{
            ...logoBaseStyle,
            right: 15,
            height: isMobile ? 30 : 50,
          }}
        />
      </div>
      <div style={{ paddingTop: isMobile ? 60 : 80 }}>
        <App />
      </div>
    </Router>
  );
}

function App() {
  const [autorizado, setAutorizado] = useState(false);
  const [nombreUsuario, setNombreUsuario] = useState("");
  const navigate = useNavigate();

  // Usamos useRef para mantener referencias a los timers entre renders
  const timeoutAdvertencia = useRef(null);
  const timeoutCierre = useRef(null);

  useEffect(() => {
    // Cargar sesión guardada en localStorage al iniciar la app
    const savedAuth = localStorage.getItem("autorizado");
    const savedUser = localStorage.getItem("usuario");
    if (savedAuth === "true") {
      setAutorizado(true);
      setNombreUsuario(savedUser || "");
    }
  }, []);

  // ⏰ Manejo de inactividad para cerrar sesión automáticamente
  useEffect(() => {
    if (!autorizado) return;

    const mostrarAdvertencia = () => {
      alert("⚠️ ¡Atención! Tu sesión se cerrará en 2 minutos por inactividad si no haces nada.");
    };

    const cerrarPorInactividad = () => {
      alert("❌ Sesión cerrada por inactividad.");
      cerrarSesion();
    };

    const resetInactividadTimers = () => {
      clearTimeout(timeoutAdvertencia.current);
      clearTimeout(timeoutCierre.current);
      timeoutAdvertencia.current = setTimeout(mostrarAdvertencia, 13 * 60 * 1000);
      timeoutCierre.current = setTimeout(cerrarPorInactividad, 15 * 60 * 1000);
    };

    resetInactividadTimers();

    const handleActivity = () => resetInactividadTimers();
    const eventos = ["mousemove", "keydown", "click", "touchstart"];
    eventos.forEach(e => window.addEventListener(e, handleActivity));

    return () => {
      clearTimeout(timeoutAdvertencia.current);
      clearTimeout(timeoutCierre.current);
      eventos.forEach(e => window.removeEventListener(e, handleActivity));
    };
  }, [autorizado]);

  // 🛡️ Escuchar eventos de cambio de sesión en Supabase
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        alert("⚠️ Tu sesión ha expirado o ha sido cerrada. Por favor, inicia sesión nuevamente.");
        cerrarSesion();
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogin = (isAuth, usuario) => {
    setAutorizado(isAuth);
    setNombreUsuario(usuario);
    localStorage.setItem("autorizado", "true");
    localStorage.setItem("usuario", usuario);
  };

  const cerrarSesion = () => {
    setAutorizado(false);
    setNombreUsuario("");
    localStorage.removeItem("autorizado");
    localStorage.removeItem("usuario");
    navigate("/", { replace: true });
    window.location.reload();
  };
  return (
<div
  style={{
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",  // centra vertical
    alignItems: "center",      // centra horizontal
    backgroundColor: "#1c1c1c",
    padding: "1rem",
    boxSizing: "border-box",
    width: "100vw",
    overflowX: "hidden",
    margin: 0,
  }}
  >
      <div style={{ flex: 1 }}>
        <Routes>
          <Route
            path="/"
            element={
              autorizado ? (
                <div style={{ padding: "1rem" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      backgroundColor: "#343a40",
                      color: "#fff",
                      padding: "0.8rem 1rem",
                      borderRadius: "8px",
                      marginBottom: "1.5rem",
                      boxShadow: "0 2px 5px rgba(0, 0, 0, 0.05)",
                    }}
                  >
                    <h1
                      style={{
                        margin: 0,
                        padding: "20px 30px",
                        backgroundColor: "#003366",
                        color: "#ffffff",
                        borderRadius: "12px",
                        textAlign: "center",
                        fontSize: "2rem",
                        fontWeight: "bold",
                        width: "100%",
                        maxWidth: "600px",
                        marginInline: "auto",
                        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
                      }}
                    >
                      Registro de Asistencia CESI 2025
                    </h1>
                    <div style={{ textAlign: "right" }}>
                      <div
                        style={{
                          backgroundColor: "#f0f0f0",
                          padding: "6px 12px",
                          borderRadius: "8px",
                          display: "inline-block",
                          fontWeight: "bold",
                          marginTop: "6px",
                          color: "#333",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                          fontSize: "12px",
                        }}
                      >
                        Sesión activa: {nombreUsuario}
                      </div>
                      <button
                        onClick={cerrarSesion}
                        style={{
                          padding: "0.2rem 0.8rem",
                          fontSize: "12px",
                          backgroundColor: "#dc3545",
                          color: "#fff",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          marginLeft: "0.5rem",
                        }}
                      >
                        Cerrar sesión
                      </button>
                    </div>
                  </div>

                  <Link to="/registrar">
                    <button style={{ marginRight: "10px" }}>Registrar Participante</button>
                  </Link>
                  <Link to="/admin-participantes">
                    <button style={{ marginRight: "10px" }}>Lista de Participantes</button>
                  </Link>
                  <Link to="/admin-usuarios">
                    <button style={{ marginRight: "10px" }}>Lista de Usuarios</button>
                  </Link>
                  <Link to="/agregar-actualizacion">
                    <button style={{ marginRight: "10px" }}>Agregar Actualización</button>
                  </Link>
                 
                  <div
  style={{
    marginTop: "2rem",
    display: "flex",
    justifyContent: "center", // centrado horizontal
    alignItems: "center",     // centrado vertical (si aplica)
  }}
>
  <EscanerQR />
</div>

                  <div
                    style={{
                      marginTop: "2rem",
                      maxHeight: 320,
                      overflowY: "auto",
                      overflowX: "hidden",
                      borderRadius: "10px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                      backgroundColor: "#1e1e1e",
                      padding: "1rem",
                      maxWidth: "100%",
                      wordBreak: "break-word",
                    }}
                  >
                    <AsistenciaHoy />
                  </div>
                </div>
              ) : (
             <div>
  <Bienvenida onLogin={handleLogin} />

  {/* NUEVO BOTÓN DE MÁS NOTICIAS */}
  <div style={{ textAlign: "center", marginTop: "1rem" }}>
    <Link to="/noticias">
      <button
        style={{
          padding: "0.6rem 1.2rem",
          fontSize: "15px",
          fontWeight: "bold",
          borderRadius: "8px",
          backgroundColor: "#3366cc",
          color: "white",
          border: "none",
          cursor: "pointer",
          marginBottom: "1rem",
          boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
          transition: "background-color 0.3s",
        }}
        onMouseEnter={(e) => (e.target.style.backgroundColor = "#003399")}
        onMouseLeave={(e) => (e.target.style.backgroundColor = "#3366cc")}
      >
        📰 Más noticias del evento
      </button>
    </Link>
  </div>

  {/* BOTÓN BUSCAR QR */}
  <div style={{ textAlign: "center", marginTop: "0.5rem" }}>
    <Link to="/buscar-qr">
      <button
        style={{
          padding: "0.7rem 1.2rem",
          fontSize: "16px",
          fontWeight: "bold",
          borderRadius: "8px",
          backgroundColor: "#00796b",
          color: "white",
          border: "none",
          cursor: "pointer",
          boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
          transition: "background-color 0.3s",
        }}
        onMouseEnter={(e) => (e.target.style.backgroundColor = "#004d40")}
        onMouseLeave={(e) => (e.target.style.backgroundColor = "#00796b")}
      >
        🔍 Buscar mi Código QR
      </button>
    </Link>
  </div>
</div>
              )
            }
          />

          <Route path="/registrar" element={<RegistrarParticipante />} />
          <Route
            path="/admin-participantes"
            element={autorizado ? <AdminParticipantes /> : <Navigate to="/" />}
          />
          <Route path="/buscar-qr" element={<BuscarQR />} />
          <Route
            path="/admin-usuarios"
            element={autorizado ? <AdminUsuarios /> : <Navigate to="/" />}
          />
          <Route
            path="/agregar-actualizacion"
            element={autorizado ? <AgregarActualizacion /> : <Navigate to="/" />}
          />
          <Route path="/noticias" element={<Noticias />} />
        </Routes>
      </div>
      <MiFooter />
    </div>
  );
}

export default AppWrapper;