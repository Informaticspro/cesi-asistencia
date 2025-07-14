import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
  useNavigate,
} from "react-router-dom";
import Bienvenida from "./Bienvenida";
import BuscarQR from "./BuscarQR";
import EscanerQR from "./EscanerQR";
import RegistrarParticipante from "./RegistrarParticipante";
import AdminParticipantes from "./AdminParticipantes";
import MiFooter from "./MiFooter";
import AgregarActualizacion from "./AgregarActualizacion";
import AsistenciaHoy from "./AsistenciaHoy"; // componente que muestra la tabla de asistencia del día
import logoUnachi from "./assets/logo_unachi.png";
import logoCongreso from "./assets/logo_congreso.png";
import Noticias from "./Noticias";

function AppWrapper() {
  // Detecta si es móvil para ajustar tamaño de logos
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 480);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Estilos base para logos
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
      {/* Logos fijos arriba */}
      <div
        style={{ width: "100%", position: "fixed", top: 0, left: 0, zIndex: 1000 }}
      >
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

      {/* Contenido app con padding top para que no quede tapado por logos */}
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

  useEffect(() => {
    const savedAuth = localStorage.getItem("autorizado");
    const savedUser = localStorage.getItem("usuario");
    if (savedAuth === "true") {
      setAutorizado(true);
      setNombreUsuario(savedUser || "");
    }
  }, []);

  // Inactividad (desconexión automática)
  useEffect(() => {
    if (!autorizado) return;

    let timeoutAdvertencia;
    let timeoutCierre;

    const mostrarAdvertencia = () => {
      alert(
        "⚠️ ¡Atención! Tu sesión se cerrará en 1 minuto por inactividad si no haces nada."
      );
    };

    const cerrarPorInactividad = () => {
      alert("❌ Sesión cerrada por inactividad.");
      cerrarSesion();
    };

    const resetInactividadTimers = () => {
      clearTimeout(timeoutAdvertencia);
      clearTimeout(timeoutCierre);
      timeoutAdvertencia = setTimeout(mostrarAdvertencia, 14 * 60 * 1000);
      timeoutCierre = setTimeout(cerrarPorInactividad, 15 * 60 * 1000);
    };

    resetInactividadTimers();

    const handleActivity = () => resetInactividadTimers();

    const eventos = ["mousemove", "keydown", "click", "touchstart"];
    eventos.forEach((e) => window.addEventListener(e, handleActivity));

    return () => {
      clearTimeout(timeoutAdvertencia);
      clearTimeout(timeoutCierre);
      eventos.forEach((e) => window.removeEventListener(e, handleActivity));
    };
  }, [autorizado]);

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
    navigate("/"); // Redirige al login
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1 }}>
        <Routes>
          <Route
            path="/"
            element={
              autorizado ? (
                <div style={{ padding: "1rem" }}>
                  {/* CABECERA */}
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
                        padding: "12px 20px",
                        backgroundColor: "#003366",
                        color: "#ffffff",
                        borderRadius: "8px",
                        textAlign: "center",
                        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)",
                      }}
                    >
                      Registro de Asistencia CESI 2025
                    </h1>
                    <div style={{ textAlign: "right" }}>
                      <div
                        style={{
                          backgroundColor: "#f0f0f0",
                          padding: "10px 15px",
                          borderRadius: "8px",
                          display: "inline-block",
                          fontWeight: "bold",
                          marginTop: "10px",
                          color: "#333",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                        }}
                      >
                        Sesión activa: {nombreUsuario}
                      </div>
                      <button
                        onClick={cerrarSesion}
                        style={{
                          padding: "0.4rem 0.8rem",
                          fontSize: "14px",
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

                  {/* BOTONES */}
                  <Link to="/registrar">
                    <button style={{ marginRight: "10px" }}>Registrar Participante</button>
                  </Link>

                  <Link to="/admin-participantes">
                    <button style={{ marginRight: "10px" }}>Administrar Participantes</button>
                  </Link>

                  {/* Botón nuevo */}
                  <Link to="/agregar-actualizacion">
                    <button style={{ marginRight: "10px" }}>Agregar Actualización</button>
                  </Link>

                  <EscanerQR />

                  {/* ------------------- ASISTENCIA HOY ------------------ */}
                  <div
                    style={{
                      marginTop: "2rem",
                      maxHeight: 320,
                      overflowY: "auto",
                      borderRadius: "10px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                      backgroundColor: "#1e1e1e",
                      padding: "1rem",
                    }}
                  >
                    <AsistenciaHoy />
                  </div>
                  {/* ----------------------------------------------------- */}
                </div>
              ) : (
                <div>
                  <Bienvenida onLogin={handleLogin} />
                  <div style={{ textAlign: "center", marginTop: "1rem" }}>
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

          {/* Ruta nueva protegida */}
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