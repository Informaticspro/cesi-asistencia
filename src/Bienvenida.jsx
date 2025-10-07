import { useEffect } from "react";
import { Link } from "react-router-dom";
import ActualizacionesEvento from "./ActualizacionesEvento";

function Bienvenida() {
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

      @keyframes fondoAnimado {
        0% { background-position: 0% 0%; }
        100% { background-position: 100% 100%; }
      }

      body {
        margin: 0;
        padding: 0;
        background: transparent;
        overflow-x: hidden;
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
    return () => document.head.removeChild(style);
  }, []);

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
        width: "100vw",
        overflowX: "hidden",
        margin: 0,
      }}
    >
      {/* 🔹 Header con logo y texto principal */}
      <div style={{ width: "100%", textAlign: "center", marginBottom: "2rem" }}>
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

      {/* 🔹 Sección de Actualizaciones */}
      <div
        style={{
          backgroundColor: "#2a2a2a",
          padding: "1rem 2rem",
          maxWidth: "100vw",
          marginTop: "2rem",
          borderRadius: "10px",
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