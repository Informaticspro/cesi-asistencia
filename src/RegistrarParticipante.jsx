import { useState } from "react";
import { supabase } from "./supabaseClient";
import { Link } from "react-router-dom";

function RegistrarParticipante() {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [cedula, setCedula] = useState("");
  const [correo, setCorreo] = useState("");
  const [mensaje, setMensaje] = useState(null);
  const [loading, setLoading] = useState(false);

  // Función para enviar correo llamando al backend local
  async function enviarCorreoConQR(participante) {
    // Aquí generamos la URL del QR (igual que Google Sheets)
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(participante.cedula)}`;

    try {
      const res = await fetch("http://localhost:4000/api/enviarQR", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: participante.nombre,
          apellido: participante.apellido,
          correo: participante.correo,
          qrUrl,
        }),
      });

      if (!res.ok) {
        throw new Error("Error al enviar correo");
      }

      return true;
    } catch (error) {
      console.error("Error en enviarCorreoConQR:", error);
      return false;
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nombre || !apellido || !cedula || !correo) {
      setMensaje({ tipo: "error", texto: "⚠️ Todos los campos son obligatorios" });
      return;
    }

    setLoading(true);
    setMensaje(null);

    // Verificar si ya existe participante
    const { data: existente, error: errorExistente } = await supabase
      .from("participantes")
      .select("*")
      .or(`cedula.eq.${cedula},correo.eq.${correo}`);

    if (errorExistente) {
      setLoading(false);
      setMensaje({ tipo: "error", texto: "❌ Error al verificar duplicados" });
      return;
    }

    if (existente.length > 0) {
      setLoading(false);
      setMensaje({ tipo: "error", texto: "⚠️ Ya existe un participante con esa cédula o correo." });
      return;
    }

    // Insertar participante en Supabase
    const { data, error } = await supabase.from("participantes").insert([
      {
        nombre,
        apellido,
        cedula,
        correo,
        qr_code: cedula, // Guardamos cédula para generar QR después
      },
    ]);

    if (error) {
      setLoading(false);
      setMensaje({ tipo: "error", texto: "❌ Error al registrar participante" });
      return;
    }

    // Llamar backend para enviar correo con QR
    const correoEnviado = await enviarCorreoConQR({ nombre, apellido, correo, cedula });

    if (correoEnviado) {
      setMensaje({ tipo: "success", texto: "✅ Participante registrado y correo enviado con QR" });
    } else {
      setMensaje({ tipo: "error", texto: "❌ Participante registrado, pero error al enviar correo" });
    }

    setLoading(false);

    // Limpiar formulario
    setNombre("");
    setApellido("");
    setCedula("");
    setCorreo("");
  };

  return (
    <div style={{ maxWidth: 500, margin: "auto", padding: "1rem" }}>
      <h2>Registrar Participante</h2>

      {mensaje && (
        <div
          style={{
            padding: "0.5rem 1rem",
            marginBottom: "1rem",
            borderRadius: 4,
            color: mensaje.tipo === "error" ? "white" : "green",
            backgroundColor: mensaje.tipo === "error" ? "#d9534f" : "#5cb85c",
          }}
        >
          {mensaje.texto}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <label>Nombre:</label>
        <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} />

        <label>Apellido:</label>
        <input type="text" value={apellido} onChange={(e) => setApellido(e.target.value)} />

        <label>Cédula:</label>
        <input type="text" value={cedula} onChange={(e) => setCedula(e.target.value)} />

        <label>Correo:</label>
        <input type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} />

        <button type="submit" disabled={loading} style={{ marginTop: 10 }}>
          {loading ? "Registrando..." : "Registrar y enviar QR"}
        </button>
      </form>

      <br />
      <Link to="/">⬅️ Volver al inicio</Link>
    </div>
  );
}

export default RegistrarParticipante;