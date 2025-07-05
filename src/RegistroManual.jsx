import { useState } from "react";
import { supabase } from "./supabaseClient";

function RegistroManual() {
  const [cedula, setCedula] = useState("");
  const [mensaje, setMensaje] = useState("");

  const registrarAsistenciaManual = async () => {
    if (!cedula.trim()) {
      setMensaje("⚠️ Por favor ingresa una cédula válida.");
      return;
    }

    // 1. Validar si la cédula existe en la tabla participantes
    const { data: participante, error: errorParticipante } = await supabase
      .from("participantes")
      .select("*")
      .eq("cedula", cedula)
      .single();

    if (errorParticipante || !participante) {
      setMensaje("❌ La cédula no está registrada como participante.");
      return;
    }

    // 2. Validar si ya registró asistencia hoy
    const hoy = new Date().toISOString().split("T")[0];
    const hora = new Date().toISOString(); // para timestamp

    const { data: yaAsistio, error: errorAsistencia } = await supabase
      .from("asistencias")
      .select("*")
      .eq("cedula", cedula)
      .eq("fecha", hoy);

    if (errorAsistencia) {
      setMensaje("❌ Error al verificar asistencia.");
      return;
    }

    if (yaAsistio.length > 0) {
      setMensaje("⚠️ Ya registró asistencia hoy.");
      return;
    }

    // 3. Insertar asistencia si todo está OK
    const { error } = await supabase.from("asistencias").insert([
      {
        cedula,
        fecha: hoy,
        hora, // timestamp (timestamptz)
      },
    ]);

    if (error) {
      setMensaje("❌ Error al registrar asistencia.");
    } else {
      setMensaje("✅ Asistencia registrada correctamente.");
      setCedula("");
    }
  };

  return (
    <div style={{ marginTop: "1rem", padding: "1rem", border: "1px solid #ccc" }}>
      <h3>Registro Manual de Asistencia</h3>
      <input
        type="text"
        placeholder="Ingrese cédula"
        value={cedula}
        onChange={(e) => setCedula(e.target.value)}
      />
      <button onClick={registrarAsistenciaManual} style={{ marginLeft: "0.5rem" }}>
        Registrar
      </button>
      {mensaje && <p style={{ marginTop: "0.5rem" }}>{mensaje}</p>}
    </div>
  );
}

export default RegistroManual;