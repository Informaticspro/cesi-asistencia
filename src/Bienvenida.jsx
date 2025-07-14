import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";
import ActualizacionesEvento from "./ActualizacionesEvento";

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
    <div style={{ minHeight: "100vh", backgroundColor: "#1c1c1c", color: "#fff", display: "flex", flexDirection: "column" }}>
      {/* Header con logos */}
      <div style={{ position: "relative", padding: "1rem", paddingTop: "3.5rem", minHeight: "9opx"}}>
        <img src="/logo_unachi.png" alt="Logo UNACHI" style={{ position: "absolute", top: 10, left: 10, height: "50px" }} />
        <img src="/logo_congreso.png" alt="Logo Congreso" style={{ position: "absolute", top: 10, right: 10, height: "50px" }} />
        <h1 style={{ textAlign: "center", fontSize: "2rem", fontWeight: "bold", marginTop: "1rem" }}>Bienvenido al CESI 2025</h1>
        <p style={{ textAlign: "center", fontSize: "1rem", color: "#ccc" }}>
          Inicia sesión o regístrate para participar
        </p>
      </div>

      {/* Caja de login centrada */}
      <div style={{
        maxWidth: "400px",
        width: "90%",
        margin: "2rem auto",
        backgroundColor: "#2c2c2c",
        borderRadius: "12px",
        padding: "2rem",
        boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
      }}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.3rem", fontWeight: "bold" }}>Usuario</label>
            <input
              type="text"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "0.6rem",
                borderRadius: "6px",
                border: "1px solid #555",
                backgroundColor: "#fff",
                color: "#000",
              }}
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.3rem", fontWeight: "bold" }}>Contraseña</label>
            <input
              type={mostrarContrasena ? "text" : "password"}
              value={contraseña}
              onChange={(e) => setContrasena(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "0.6rem",
                borderRadius: "6px",
                border: "1px solid #555",
                backgroundColor: "#fff",
                color: "#000",
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
            <div style={{
              backgroundColor: "#dc3545",
              color: "#fff",
              padding: "0.6rem",
              borderRadius: "6px",
              marginBottom: "1rem",
              fontSize: "0.9rem",
              textAlign: "center"
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "0.75rem",
              backgroundColor: "#28a745",
              border: "none",
              borderRadius: "6px",
              fontWeight: "bold",
              fontSize: "1rem",
              cursor: "pointer",
              marginBottom: "1rem"
            }}
          >
            Ingresar
          </button>
        </form>

        <p style={{ textAlign: "center", fontSize: "0.9rem", marginBottom: "0.5rem" }}>
          ¿Aún no estás registrado?
        </p>
        <Link to="/registrar" style={{ textDecoration: "none" }}>
          <button
            style={{
              width: "100%",
              padding: "0.75rem",
              backgroundColor: "#007bff",
              border: "none",
              borderRadius: "6px",
              fontWeight: "bold",
              fontSize: "1rem",
              color: "#fff",
              cursor: "pointer"
            }}
          >
            Registro de Participantes
          </button>
        </Link>
      </div>

      {/* Sección de Actualizaciones */}
      <div style={{ backgroundColor: "#2a2a2a", padding: "1rem 2rem" }}>
        <h2 style={{ textAlign: "center", fontSize: "1.5rem", marginBottom: "1rem" }}>Noticias del Evento</h2>
        <ActualizacionesEvento />
      </div>
    </div>
  );
}

export default Bienvenida;