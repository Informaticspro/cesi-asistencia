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
import EscanerQR from "./EscanerQR";
import RegistrarParticipante from "./RegistrarParticipante";
import AdminParticipantes from "./AdminParticipantes";
import MiFooter from "./MiFooter";

function AppWrapper() {
  return (
    <Router>
      <App />
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

  useEffect(() => {
  let timeout;

  const resetInactividadTimer = () => {
    clearTimeout(timeout);
    if (autorizado) {
      timeout = setTimeout(() => {
        alert("Sesión cerrada por inactividad.");
        cerrarSesion();
      }, 5 * 10 * 1000); // 5 minutos de inactividad
    }
  };

  window.addEventListener("mousemove", resetInactividadTimer);
  window.addEventListener("keydown", resetInactividadTimer);
  window.addEventListener("click", resetInactividadTimer);
  window.addEventListener("touchstart", resetInactividadTimer);

  resetInactividadTimer(); // inicializa por primera vez

  return () => {
    clearTimeout(timeout);
    window.removeEventListener("mousemove", resetInactividadTimer);
    window.removeEventListener("keydown", resetInactividadTimer);
    window.removeEventListener("click", resetInactividadTimer);
    window.removeEventListener("touchstart", resetInactividadTimer);
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
                      bbackgroundColor: "#343a40",
                        
                      color: "#fff", // agrégalo dentro del mismo style
                      padding: "0.8rem 1rem",
                      borderRadius: "8px",
                      marginBottom: "1.5rem",
                      boxShadow: "0 2px 5px rgba(0, 0, 0, 0.05)",
                    }}
                  >
                    <h1 style={{ margin: 0 }}>Registro de Asistencia CESI 2025</h1>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "14px", marginBottom: "0.3rem" }}>
                        Sesión activa: <strong>{nombreUsuario}</strong>
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

                  <EscanerQR />
                </div>
              ) : (
                <Bienvenida onLogin={handleLogin} />
              )
            }
          />

          <Route path="/registrar" element={<RegistrarParticipante />} />
          <Route
            path="/admin-participantes"
            element={autorizado ? <AdminParticipantes /> : <Navigate to="/" />}
          />
        </Routes>
      </div>
      <MiFooter />
    </div>
  );
}

export default AppWrapper;