import { useState } from "react";
import { supabase } from "./supabaseClient";

function RegistroManual() {
  const [cedula, setCedula] = useState("");
  const [mensaje, setMensaje] = useState(null);
  const [datosParticipante, setDatosParticipante] = useState(null);
  const [loading, setLoading] = useState(false);

  const reproducirSonido = (tipo) => {
    const audio = new Audio(tipo === "success" ? "/success.mp3" : "/error.mp3");
    audio.play().catch(() => {});
  };

  const registrar = async () => {
    if (!cedula.trim()) {
      setMensaje({ tipo: "error", texto: "Por favor ingresa una cédula" });
      reproducirSonido("error");
      return;
    }

    const ahora = new Date();
    const fecha = ahora.toISOString().split("T")[0]; // YYYY-MM-DD
    const hora = ahora.toTimeString().split(" ")[0]; // HH:mm:ss

    setLoading(true);
    setMensaje(null);
    setDatosParticipante(null);

    const { data: yaAsistio, error: errorConsulta } = await supabase
      .from("asistencias")
      .select("*")
      .eq("cedula", cedula.trim())
      .eq("fecha", fecha);

    if (errorConsulta) {
      setMensaje({ tipo: "error", texto: "❌ Error consultando asistencia" });
      reproducirSonido("error");
      setLoading(false);
      return;
    }

    if (yaAsistio.length > 0) {
      setMensaje({ tipo: "error", texto: "⚠️ Ya registró asistencia hoy" });
      reproducirSonido("error");
      setLoading(false);
      return;
    }

    const { data: participante, error: errorParticipante } = await supabase
      .from("participantes")
      .select("nombre, apellido, cedula")
      .eq("cedula", cedula.trim())
      .single();

    if (errorParticipante || !participante) {
      setMensaje({ tipo: "error", texto: "❌ Participante no encontrado" });
      reproducirSonido("error");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("asistencias").insert([
      { cedula: cedula.trim(), fecha, hora },
    ]);

    if (error) {
      setMensaje({ tipo: "error", texto: "❌ Error al registrar asistencia" });
      reproducirSonido("error");
    } else {
      setDatosParticipante(participante);
      setMensaje({ tipo: "success", texto: "✅ Asistencia registrada correctamente" });
      reproducirSonido("success");
      setCedula("");
    }

    setLoading(false);
  };

  return (
    <div style={{ marginTop: "1rem" }}>
      <input
        type="text"
        placeholder="Cédula del participante"
        value={cedula}
        onChange={(e) => setCedula(e.target.value)}
        disabled={loading}
        style={{
          width: "100%",
          padding: "0.75rem",
          marginBottom: "0.5rem",
          fontSize: "16px",
          borderRadius: "8px",
          border: "1px solid #ccc",
        }}
      />
      <button
        onClick={registrar}
        disabled={loading}
        style={{
          width: "100%",
          padding: "0.75rem",
          backgroundColor: "#198754",
          color: "white",
          border: "none",
          borderRadius: "8px",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        Registrar asistencia manual
      </button>

      {mensaje && (
        <div
          style={{
            marginTop: "1rem",
            padding: "1rem",
            backgroundColor: mensaje.tipo === "success" ? "#d1e7dd" : "#f8d7da",
            color: mensaje.tipo === "success" ? "#0f5132" : "#842029",
            borderRadius: "10px",
            textAlign: "center",
            fontSize: "16px",
          }}
        >
          <strong>{mensaje.texto}</strong>
          {datosParticipante && (
            <div style={{ marginTop: "0.5rem" }}>
              <div><strong>Nombre:</strong> {datosParticipante.nombre}</div>
              <div><strong>Apellido:</strong> {datosParticipante.apellido}</div>
              <div><strong>Cédula:</strong> {datosParticipante.cedula}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default RegistroManual;