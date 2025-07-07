import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "./supabaseClient";

function Bienvenida({ onLogin }) {
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { data, error } = await supabase
      .from("usuarios")
      .select("usuario, contraseña")
      .eq("usuario", usuario)
      .single();

    if (error || !data) {
      setError("Usuario no encontrado");
      return;
    }

    if (data["contraseña"] === contrasena) {
      setError(null);
      onLogin(true);
    } else {
      setError("Contraseña incorrecta");
    }
  };

  return (
    <div
      style={{
        maxWidth: 400,
        margin: "2rem auto",
        padding: "1rem",
        border: "1px solid #ccc",
        borderRadius: 6,
        textAlign: "center",
      }}
    >
      <h2>Bienvenido a CESI 2025</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "1rem", textAlign: "left" }}>
          <label>Usuario:</label>
          <input
            type="text"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            required
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>
        <div style={{ marginBottom: "1rem", textAlign: "left" }}>
          <label>Contraseña:</label>
          <input
            type="password"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            required
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>
        {error && <div style={{ color: "red", marginBottom: "1rem" }}>{error}</div>}
        <button type="submit" style={{ padding: "0.5rem 1rem" }}>
          Ingresar
        </button>
      </form>

      <hr style={{ margin: "2rem 0" }} />

<p>¿Eres participante y aún no estás registrado?</p>

<Link to="/registrar" style={{ textDecoration: "none" }}>
  <button
    type="button"
    style={{
      marginTop: "0.5rem",
      padding: "0.5rem 1rem",
      backgroundColor: "#007bff",
      color: "#fff",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
    }}
  >
    Quiero registrarme como participante
  </button>
</Link>
    </div>
  );
}

export default Bienvenida;