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
    const style = document.createElement("style");
    style.innerHTML = `
    body::before {
      content: "";
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      z-index: -1;
      background: radial-gradient(circle at 20% 30%, rgba(0,255,255,0.3) 0%, transparent 40%),
                  radial-gradient(circle at 80% 70%, rgba(255,0,255,0.3) 0%, transparent 50%),
                  linear-gradient(135deg, #111, #222);
      background-blend-mode: screen;
      animation: fondoAnimado 20s ease-in-out infinite alternate;
    }

    body {
      margin: 0;
      padding: 0;
      background: transparent;
      overflow-x: hidden;
    }

    .login-box-gradient {
      background: linear-gradient(135deg, rgba(44,44,44,0.95), rgba(58,58,58,0.95));
      backdrop-filter: blur(8px);
    }

    .titulo-cesi {
      font-size: 2.5rem;
      font-weight: bold;
      text-align: center;
      margin-bottom: 2rem;
      background: linear-gradient(90deg, #f0f, #0ff, #ff0, #f0f);
      background-size: 600% 100%;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: gradientMove 6s ease infinite;
      text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
    }

    @keyframes gradientMove {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

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
        justifyContent: "start",
        alignItems: "center",
        backgroundColor: "#1c1c1c",
        padding: "1rem",
        boxSizing: "border-box",
        width: "100vw",
        overflowX: "hidden",
        margin: 0,
      }}
    >
       {/* Header con logo, título y botón de registro */}
      <div style={{ width: "100%", textAlign: "center", marginBottom: "2rem" }}>
        {/* Logo CESI */}
        <img
          src="/logocesiblanco.png"
          alt="Logo CESI 2025"
          style={{
            width: "300px",
            marginBottom: "1rem",
            marginTop: "1rem",
          }}
        />
        
        <h1 className="titulo-cesi">Bienvenido a CESI 2025</h1>
        <p style={{ color: "#ffffff", fontSize: "1.1rem", marginBottom: "1rem" }}>
          ¿Aún no estás registrado?
        </p>
        <Link to="/registrar" style={{ textDecoration: "none" }}>
          <button
            style={{
              padding: "1rem 2rem",
              background: "linear-gradient(to right, #007bff, #00bfff)",
              border: "none",
              borderRadius: "10px",
              fontWeight: "bold",
              fontSize: "1.2rem",
              color: "#fff",
              cursor: "pointer",
              boxShadow: "0 6px 14px rgba(0, 123, 255, 0.6)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
              e.currentTarget.style.boxShadow =
                "0 8px 18px rgba(0, 123, 255, 0.7)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow =
                "0 6px 14px rgba(0, 123, 255, 0.6)";
            }}
          >
            Registro de Participante
          </button>
        </Link>
      </div>

      {/* Login exclusivo para administradores */}
      <div
        className="login-box-gradient"
        style={{
          padding: "1.5rem",
          borderRadius: "14px",
          boxShadow: "0 6px 20px rgba(0,0,0,0.4)",
          width: "100%",
          maxWidth: "280px",
          marginTop: "1rem",
          textAlign: "center",
        }}
      >
        <p
          style={{
            color: "#ff1744",
            fontWeight: "bold",
            marginBottom: "1rem",
            fontSize: "0.95rem",
          }}
        >
          Acceso exclusivo para administradores
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1rem", textAlign: "left" }}>
            <label style={{ fontWeight: "bold", color: "#fff", fontSize: "0.9rem" }}>
              Usuario
            </label>
            <input
              type="text"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "0.5rem",
                borderRadius: "6px",
                border: "1px solid #555",
                backgroundColor: "#fff",
                color: "#000",
              }}
            />
          </div>

          <div style={{ marginBottom: "1rem", textAlign: "left" }}>
            <label style={{ fontWeight: "bold", color: "#fff", fontSize: "0.9rem" }}>
              Contraseña
            </label>
            <input
              type={mostrarContrasena ? "text" : "password"}
              value={contraseña}
              onChange={(e) => setContrasena(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "0.5rem",
                borderRadius: "6px",
                border: "1px solid #555",
                backgroundColor: "#fff",
                color: "#000",
              }}
            />
            <label
              style={{
                display: "block",
                marginTop: "0.5rem",
                fontSize: "0.85rem",
                color: "#fff",
              }}
            >
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
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "0.7rem",
              background: "linear-gradient(135deg, #00c6ff, #0072ff)",
              color: "#fff",
              fontWeight: "bold",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              transition: "transform 0.2s ease, box-shadow 0.3s ease",
              boxShadow: "0 4px 12px rgba(0, 114, 255, 0.4)",
            }}
          >
            Ingresar
          </button>
        </form>
      </div>

      {/* Sección de Actualizaciones */}
      <div
        style={{
          backgroundColor: "#2a2a2a",
          padding: "1rem 2rem",
          maxWidth: "100vw",
          marginTop: "2rem",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            fontSize: "1.5rem",
            marginBottom: "1rem",
            color: "#ffffff",
          }}
        >
          Boletín CESI 2025
        </h2>
        <ActualizacionesEvento />
      </div>
    </div>
  );
}

export default Bienvenida;
