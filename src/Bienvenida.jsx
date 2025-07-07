import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";

function Bienvenida({ onLogin }) {
  const [usuario, setUsuario] = useState("");
  const [contraseña, setContrasena] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("handleSubmit ejecutado");
    console.log("Usuario ingresado:", usuario);
    console.log("Contraseña ingresada:", contraseña);

    const { data, error: queryError } = await supabase
      .from("usuarios")
      .select("*")
      .eq("usuario", usuario)
      .single();

    if (queryError || !data) {
      setError("Usuario no encontrado");
      return;
    }

    console.log("Respuesta de Supabase:", data);

    if (data["contraseña"] === contraseña.trim()) {
      setError(null);
      onLogin(true);
      navigate("/");
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
            value={contraseña}
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