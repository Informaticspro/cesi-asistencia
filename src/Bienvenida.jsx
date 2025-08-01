import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";
import ActualizacionesEvento from "./ActualizacionesEvento";

function Bienvenida({ onLogin }) {
  const [usuario, setUsuario] = useState("");
  const [contraseña, setContrasena] = useState("");
  const [error, setError] = useState(null);
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 480);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .ilike("usuario", usuario.trim())
      .single();

    if (error || !data) {
      setError("Usuario no encontrado");
      return;
    }

    if (data["contraseña"] === contraseña) {
      setError(null);
      onLogin(true, data.usuario);
      navigate("/");
    } else {
      setError("Contraseña incorrecta");
    }
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
      {/* Header con logos */}
      <div
        style={{
          position: "relative",
          padding: "1rem",
          paddingTop: isMobile ? "5rem" : "3.5rem", // MÁS ESPACIO EN MÓVIL PARA NO TAPAR EL TÍTULO
          minHeight: "90px",
          maxWidth: "100vw", // Evitar desborde horizontal
        }}
      >
        <img
          src="/logo_unachi.png"
          alt="Logo UNACHI"
          style={{
            position: "absolute",
            top: isMobile ? 20 : 10,
            left: 10,
            height: isMobile ? 30 : 50,
            zIndex: 10,
            maxWidth: "100%",  // Imagen responsiva
            objectFit: "contain",
          }}
        />
        <img
          src="/Logo2025.jpeg"
          alt="Logo Congreso"
          style={{
            position: "absolute",
            top: isMobile ? 20 : 10,
            right: 10,
            height: isMobile ? 30 : 50,
            zIndex: 10,
            maxWidth: "100%",
            objectFit: "contain",
          }}
        />
        <h1
          style={{
            textAlign: "center",
            fontSize: "2rem",
            fontWeight: "bold",
            marginTop: "1rem",
            position: "relative",
            zIndex: 15, // PARA QUE EL TÍTULO QUDE ENCIMA DE LOS LOGOS
            padding: "0 1rem", // Un poco de padding lateral para móviles
            wordWrap: "break-word", // Que no desborde texto
            maxWidth: "100%",
          }}
        >
          Bienvenido al CESI 2025
        </h1>
        <p
          style={{
            textAlign: "center",
            fontSize: "1rem",
            color: "#ccc",
            position: "relative",
            zIndex: 15,
            padding: "0 1rem",
            wordWrap: "break-word",
            maxWidth: "100%",
          }}
        >
          Inicia sesión o regístrate para participar
        </p>
      </div>

      {/* Caja de login centrada */}
      <div
        style={{
          maxWidth: "400px",
          width: "90%",
          margin: "2rem auto",
          backgroundColor: "#2c2c2c",
          borderRadius: "12px",
          padding: "2rem",
          boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
          overflowX: "hidden",
          boxSizing: "border-box",
        }}
      >
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1rem" }}>
            <label
              style={{ display: "block", marginBottom: "0.3rem", fontWeight: "bold" }}
            >
              Usuario
            </label>
            <input
              type="text"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              required
              style={{
                width: "100%", // Cambiado de 80% a 100% para que no provoque scroll horizontal
                padding: "0.6rem",
                borderRadius: "6px",
                border: "1px solid #555",
                backgroundColor: "#fff",
                color: "#000",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label
              style={{ display: "block", marginBottom: "0.3rem", fontWeight: "bold" }}
            >
              Contraseña
            </label>
            <input
              type={mostrarContrasena ? "text" : "password"}
              value={contraseña}
              onChange={(e) => setContrasena(e.target.value)}
              required
              style={{
                width: "100%", // Igual 100% para evitar desborde
                padding: "0.6rem",
                borderRadius: "6px",
                border: "1px solid #555",
                backgroundColor: "#fff",
                color: "#000",
                boxSizing: "border-box",
              }}
            />
            <label style={{ display: "block", marginTop: "0.5rem", fontSize: "0.9rem" }}>
              <input
                type="checkbox"
                checked={mostrarContrasena}
                onChange={() => setMostrarContrasena(!mostrarContrasena)}
                style={{ marginRight: "0.4rem" }}
              />
              Mostrar contraseña
            </label>
          </div>

          {error && (
            <div
              style={{
                backgroundColor: "#dc3545",
                color: "#fff",
                padding: "0.6rem",
                borderRadius: "6px",
                marginBottom: "1rem",
                fontSize: "0.9rem",
                textAlign: "center",
                wordBreak: "break-word",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "0.50rem",
              backgroundColor: "#28a745",
              border: "none",
              borderRadius: "6px",
              fontWeight: "bold",
              fontSize: "1rem",
              cursor: "pointer",
              marginBottom: "1rem",
            }}
          >
            Ingresar
          </button>
        </form>

              <p
            style={{
             textAlign: "center",
             fontSize: "0.9rem",
                 marginBottom: "0.5rem",
              fontWeight: "bold", // 👈 esto lo pone en negrita
              }}
> 
  ¿Aún no estás registrado?
</p>
        <Link to="/registrar" style={{ textDecoration: "none" }}>
        <button
    style={{
      width: "100%",
      padding: "1rem",
      background: "linear-gradient(to right, #007bff, #00bfff)", // Gradiente azul llamativo
      border: "none",
      borderRadius: "10px",
      fontWeight: "bold",
      fontSize: "1.1rem",
      color: "#fff",
      cursor: "pointer",
      boxShadow: "0 4px 10px rgba(0, 123, 255, 0.5)",
      transition: "transform 0.2s ease, box-shadow 0.2s ease",
    }}
    onMouseOver={(e) => {
      e.currentTarget.style.transform = "scale(1.03)";
      e.currentTarget.style.boxShadow = "0 6px 14px rgba(0, 123, 255, 0.6)";
    }}
    onMouseOut={(e) => {
      e.currentTarget.style.transform = "scale(1)";
      e.currentTarget.style.boxShadow = "0 4px 10px rgba(0, 123, 255, 0.5)";
    }}
  >
    Registro de Participante
  </button>
        </Link>
      </div>

      {/* Sección de Actualizaciones */}
      <div
        style={{
          backgroundColor: "#2a2a2a",
          padding: "1rem 2rem",
          maxWidth: "100vw",   // Para que no se desborde
          overflowX: "hidden", // Evita scroll horizontal
        }}
      >
        <h2
          style={{
            textAlign: "center",
            fontSize: "1.5rem",
            marginBottom: "1rem",
            wordWrap: "break-word",
          }}
        >
          Noticias del Evento
        </h2>
        <ActualizacionesEvento />
      </div>
    </div>
  );
}

export default Bienvenida;