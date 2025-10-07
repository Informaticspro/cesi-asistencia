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
import { useLocation } from "react-router-dom";
import Bienvenida from "./Bienvenida";
import BuscarQR from "./BuscarQR";
import EscanerQR from "./EscanerQR";
import RegistrarParticipante from "./RegistrarParticipante";
import AdminParticipantes from "./AdminParticipantes";
import MiFooter from "./MiFooter";
import AgregarActualizacion from "./AgregarActualizacion";
import AsistenciaHoy from "./AsistenciaHoy";
import logoUnachi from "./assets/logo_unachi.png";

import Noticias from "./Noticias";
import AdminUsuarios from "./AdminUsuarios";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

export async function exportarAsistenciasExcel() {
  // 1. Obtener asistencias
  const { data: asistencias, error: errorAsistencias } = await supabase
    .from("asistencias")
    .select("*");

  if (errorAsistencias) {
    alert("Error al obtener asistencias.");
    return;
  }

  // 2. Obtener participantes
  const { data: participantes, error: errorParticipantes } = await supabase
    .from("participantes")
    .select("*");

  if (errorParticipantes) {
    alert("Error al obtener participantes.");
    return;
  }

  // 3. Crear un mapa de participantes por cédula
  const mapaParticipantes = {};
  participantes.forEach((p) => {
    mapaParticipantes[p.cedula] = p;
  });

  // 4. Combinar asistencias con datos del participante
  const datos = asistencias.map((a) => {
    const p = mapaParticipantes[a.cedula] || {};
    return {
      Cédula: a.cedula,
      Nombre: p.nombre || "No encontrado",
      Apellido: p.apellido || "No encontrado",
      Correo: p.correo || "No encontrado",
      Sexo: p.sexo || "No encontrado",
      Categoría: p.categoria || "No encontrado",
      Fecha: a.fecha ? new Date(a.fecha).toLocaleDateString("es-PA") : "",
      Hora: a.hora ? new Date(`1970-01-01T${a.hora}`).toLocaleTimeString("es-PA") : "",
    };
  });

  // 5. Crear hoja de Excel
  const hoja = XLSX.utils.json_to_sheet(datos);

  // 6. Ajustar ancho de columnas automáticamente
  const anchos = Object.keys(datos[0] || {}).map((key) => {
    const maxLongitud = Math.max(
      key.length,
      ...datos.map((fila) => (fila[key] ? fila[key].toString().length : 0))
    );
    return { wch: maxLongitud + 2 };
  });
  hoja["!cols"] = anchos;

  // 7. Estilizar encabezados (truco con XLSX)
  const encabezados = Object.keys(datos[0] || {});
  encabezados.forEach((col, i) => {
    const celda = hoja[XLSX.utils.encode_cell({ r: 0, c: i })];
    if (celda && typeof celda === "object") {
      celda.s = {
        fill: { fgColor: { rgb: "FFD966" } }, // Amarillo claro
        font: { bold: true, color: { rgb: "000000" } }, // Negrita y negro
        alignment: { horizontal: "center", vertical: "center" }
      };
    }
  });

  // 8. Crear libro de Excel
  const libro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libro, hoja, "Asistencias");

  // 9. Generar archivo Excel
  const arrayBuffer = XLSX.write(libro, { bookType: "xlsx", type: "array", cellStyles: true });
  const blob = new Blob([arrayBuffer], { type: "application/octet-stream" });

  saveAs(blob, "asistencias_completas.xlsx");
}



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
    top: "env(safe-area-inset-top)", // 👈 Esto ayuda a que no quede debajo de la status bar
    paddingTop: isMobile ? 10 : 15,   // 👈 Ajuste visual adicional
    opacity: 0.7,
    pointerEvents: "none",
    userSelect: "none",
    zIndex: 9999,
    backgroundColor: "#1c1c1c",
    height: isMobile ? 55 : 75,       // 👈 Aumentamos un poco para dejar espacio arriba
    display: "flex",
    alignItems: "center",
    width: "100%",
    padding: "0 15px",
    boxSizing: "border-box",
    justifyContent: "space-between",
    borderBottom: "1px solid #444",
  };
const [mostrarLogin, setMostrarLogin] = useState(false);
const [usuario, setUsuario] = useState("");
const [contraseña, setContrasena] = useState("");
const [mostrarContrasena, setMostrarContrasena] = useState(false);
const [error, setError] = useState(null);
const handleLogin = async (e) => {
  e.preventDefault();
  setError(null);
  const { data, error: err } = await supabase
    .from("usuarios")
    .select("*")
    .ilike("usuario", usuario.trim())
    .single();

  if (err || !data) return setError("Usuario no encontrado");

  if (data["contraseña"] === contraseña) {
    localStorage.setItem("autorizado", "true");
    localStorage.setItem("usuario", data.usuario);
    setMostrarLogin(false);
    window.location.reload();
  } else {
    setError("Contraseña incorrecta");
  }
};
 return (
    <Router>
  {/* HEADER FIJO */}
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: "#1c1c1c",
      padding: isMobile ? "6px 10px" : "10px 20px",
      flexDirection: isMobile ? "column" : "row",
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      zIndex: 1000,
      borderBottom: "1px solid #444",
    }}
  >
    {/* 🏛️ LOGOS IZQUIERDA */}
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: isMobile ? "4px" : "15px",
        alignSelf: isMobile ? "center" : "flex-start",
      }}
    >
      <img src="/Dato1.png" alt="Logo Dato1" style={{ height: isMobile ? 28 : 55 }} />
      <img src="/Unachi-2.png" alt="Logo UNACHI" style={{ height: isMobile ? 28 : 55 }} />
      <img src="/logoeconomia3.png" alt="Logo Economía" style={{ height: isMobile ? 28 : 55 }} />
    </div>

    {/* 🧾 TÍTULO CENTRAL */}
    <div
      style={{
        textAlign: "center",
        fontSize: isMobile ? "0.75rem" : "1.1rem",
        fontWeight: "bold",
        lineHeight: isMobile ? "1.1rem" : "1.5rem",
        color: "#fff",
        userSelect: "none",
        position: isMobile ? "static" : "absolute",
        left: isMobile ? "auto" : "50%",
        transform: isMobile ? "none" : "translateX(-50%)",
      }}
    >
      CONGRESO DE ECONOMÍA, SOCIEDAD E INNOVACIÓN
      <br />
      <span
        style={{
          fontWeight: "normal",
          fontSize: isMobile ? "0.6rem" : "0.9rem",
          display: "block",
          marginTop: "3px",
          fontStyle: "italic",
        }}
      >
        "Construyendo una cultura de datos para la ciencia, la gobernanza y el desarrollo sostenible."
      </span>
    </div>

    {/* 🔑 BOTÓN LOGIN A LA DERECHA */}
    <div
      onClick={() => setMostrarLogin(!mostrarLogin)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        cursor: "pointer",
        color: "#fff",
        fontWeight: "bold",
        fontSize: isMobile ? "0.85rem" : "1rem",
        transition: "opacity 0.2s ease, transform 0.2s ease",
        marginRight: isMobile ? "8px" : "30px",
        whiteSpace: "nowrap",
      }}
      title="Acceso de administradores"
    >
      <span
        style={{
          fontSize: isMobile ? "1.3rem" : "1.6rem",
          color: "#ffd54f",
        }}
      >
        🔑
      </span>
      <span
        style={{
          textDecoration: "underline",
          textUnderlineOffset: "3px",
          color: "#fff",
        }}
      >
        Iniciar sesión
      </span>
    </div>

    {/* 💬 FORMULARIO FLOTANTE LOGIN */}
    {mostrarLogin && (
      <>
        {/* Fondo oscuro */}
        <div
          onClick={() => setMostrarLogin(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.4)",
            backdropFilter: "blur(3px)",
            zIndex: 999,
          }}
        ></div>

        {/* Caja de login */}
        <div
          style={{
            position: "fixed",
            top: isMobile ? "90px" : "80px",
            right: isMobile ? "10px" : "25px",
            background: "linear-gradient(135deg, rgba(44,44,44,0.95), rgba(58,58,58,0.95))",
            borderRadius: "12px",
            padding: "1rem",
            width: isMobile ? "80vw" : "300px",
            zIndex: 1001,
            boxShadow: "0 4px 15px rgba(0,0,0,0.4)",
            color: "#fff",
            textAlign: "center",
          }}
        >
          <p style={{ color: "#ff1744", fontWeight: "bold" }}>
            Acceso exclusivo para administradores
          </p>
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            <input
              type="text"
              placeholder="Usuario"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              required
              style={{
                padding: "0.5rem",
                borderRadius: "6px",
                border: "1px solid #555",
                backgroundColor: "#fff",
                color: "#000",
              }}
            />
            <input
              type={mostrarContrasena ? "text" : "password"}
              placeholder="Contraseña"
              value={contraseña}
              onChange={(e) => setContrasena(e.target.value)}
              required
              style={{
                padding: "0.5rem",
                borderRadius: "6px",
                border: "1px solid #555",
                backgroundColor: "#fff",
                color: "#000",
              }}
            />
            <label style={{ fontSize: "0.85rem" }}>
              <input
                type="checkbox"
                checked={mostrarContrasena}
                onChange={() => setMostrarContrasena(!mostrarContrasena)}
                style={{ marginRight: "0.4rem" }}
              />
              Mostrar contraseña
            </label>

            {error && (
              <div
                style={{
                  backgroundColor: "#dc3545",
                  color: "#fff",
                  padding: "0.5rem",
                  borderRadius: "6px",
                }}
              >
                {error}
              </div>
            )}
            <button
              type="submit"
              style={{
                padding: "0.6rem",
                background: "linear-gradient(135deg, #00c6ff, #0072ff)",
                border: "none",
                borderRadius: "6px",
                color: "#fff",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              Ingresar
            </button>
          </form>
        </div>
      </>
    )}
  </div>

  {/* CONTENIDO PRINCIPAL */}
  <div
    style={{
      paddingTop: isMobile ? "115px" : "130px",
      backgroundColor: "#1c1c1c",
      minHeight: "100vh",
      margin: 0,
    }}
  >
    <App />
  </div>
</Router>
  );
}

function App() {
  const location = useLocation(); 

    useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  // ... el resto de tu App (Routes, lógica, etc.)
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
                      maxHeight: 400,
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
                        <button
                     onClick={exportarAsistenciasExcel}
                     style={{
                      marginTop: "1rem",
                      padding: "0.8rem 1.2rem",
                      background: "#00c6ff",
                      color: "#fff",
                       border: "none",
                     borderRadius: "6px",
                    fontWeight: "bold",
                     cursor: "pointer",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
  }}
>
  Descargar CSV de Asistencia
</button>
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

export default AppWrapper