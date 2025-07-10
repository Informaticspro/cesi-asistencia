import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";

function Bienvenida({ onLogin }) {
  const [usuario, setUsuario] = useState("");
  const [contraseña, setContrasena] = useState("");
  const [error, setError] = useState(null);
  const [mostrarContrasena, setMostrarContrasena] = useState(false);

  const navigate = useNavigate();

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
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        width: "100vw",
        backgroundColor: "#1c1c1c", // fondo oscuro completo
      }}
    >
      <div
        style={{
          maxWidth: "400px",
          width: "90%",
          padding: "2rem 1rem",
          border: "1px solid #ccc",
          borderRadius: "12px",
          backgroundColor: "#ffffff",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          textAlign: "center",
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          color: "#000000",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <h2
          style={{
            color: "#28a745",
            marginBottom: "1.5rem",
            backgroundColor: "#ffffff",
            padding: "0.3rem",
            borderRadius: "4px",
            display: "inline-block",
          }}
        >
          Bienvenido a CESI 2025
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1rem", textAlign: "left" }}>
            <label
              style={{
                fontWeight: "bold",
                backgroundColor: "#ffffff",
                padding: "0.2rem 0.3rem",
                display: "inline-block",
                borderRadius: "4px",
                color: "#000000",
              }}
            >
              Usuario:
            </label>
            <input
              type="text"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              required
              style={{
                width: "80%",
                padding: "0.6rem",
                borderRadius: "6px",
                border: "1px solid #ccc",
                marginTop: "0.25rem",
                backgroundColor: "#ffffff",
                color: "#000000",
                fontSize: "1rem",
              }}
            />
          </div>
          <div style={{ marginBottom: "1rem", textAlign: "left" }}>
            <label
              style={{
                fontWeight: "bold",
                backgroundColor: "#ffffff",
                padding: "0.2rem 0.3rem",
                display: "inline-block",
                borderRadius: "4px",
                color: "#000000",
              }}
            >
              Contraseña:
            </label>
            <input
              type={mostrarContrasena ? "text" : "password"}
              value={contraseña}
              onChange={(e) => setContrasena(e.target.value)}
              required
              style={{
                width: "80%",
                padding: "0.6rem",
                borderRadius: "6px",
                border: "1px solid #ccc",
                marginTop: "0.25rem",
                backgroundColor: "#ffffff",
                color: "#000000",
                fontSize: "1rem",
              }}
            />
            <div style={{ marginTop: "0.5rem" }}>
              <label
                style={{
                  fontSize: "0.9rem",
                  backgroundColor: "#ffffff",
                  padding: "0.2rem 0.4rem",
                  borderRadius: "4px",
                  display: "inline-block",
                  color: "#000000",
                }}
              >
                <input
                  type="checkbox"
                  checked={mostrarContrasena}
                  onChange={() => setMostrarContrasena(!mostrarContrasena)}
                  style={{ marginRight: "0.3rem" }}
                />
                Mostrar contraseña
              </label>
            </div>
          </div>

          {error && (
            <div
              style={{
                color: "#dc3545",
                marginBottom: "1rem",
                fontSize: "0.9rem",
                backgroundColor: "#ffffff",
                padding: "0.4rem",
                borderRadius: "4px",
                border: "1px solid #dc3545",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "0.6rem 1.5rem",
              backgroundColor: "#28a745",
              color: "#ffffff",
              border: "none",
              borderRadius: "6px",
              fontWeight: "bold",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            Ingresar
          </button>
        </form>

        <hr style={{ margin: "2rem 0", borderColor: "#ccc" }} />

        <p
          style={{
            fontSize: "0.95rem",
            marginBottom: "0.5rem",
            backgroundColor: "#ffffff",
            padding: "0.2rem 0.4rem",
            display: "inline-block",
            borderRadius: "4px",
            color: "#000000",
          }}
        >
          ¿Eres participante y aún no estás registrado?
        </p>
        <Link to="/registrar" style={{ textDecoration: "none" }}>
          <button
            type="button"
            style={{
              width: "100%",
              padding: "0.6rem 1.2rem",
              backgroundColor: "#007bff",
              color: "#ffffff",
              border: "none",
              borderRadius: "6px",
              fontWeight: "bold",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            Registro de Participantes
          </button>
        </Link>
      </div>
    </div>
  );
}

export default Bienvenida;