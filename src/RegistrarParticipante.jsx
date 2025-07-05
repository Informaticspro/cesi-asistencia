import { useState } from "react";
import { supabase } from "./supabaseClient";
import { Link } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";

function RegistrarParticipante() {
  const [nombre, setNombre] = useState("");
  const [cedula, setCedula] = useState("");
  const [correo, setCorreo] = useState("");
  const [qrValue, setQrValue] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nombre || !cedula || !correo) {
      alert("⚠️ Todos los campos son obligatorios");
      return;
    }

    // Verificar duplicados por cédula o correo
    const { data: existente, error: errorExistente } = await supabase
      .from("participantes")
      .select("*")
      .or(`cedula.eq.${cedula},correo.eq.${correo}`);

    if (errorExistente) {
      alert("❌ Error al verificar duplicados");
      console.error(errorExistente);
      return;
    }

    if (existente.length > 0) {
      alert("⚠️ Ya existe un participante con esa cédula o correo.");
      return;
    }

    // Insertar nuevo participante con qr_code = cedula
    const { data, error } = await supabase.from("participantes").insert([
      {
        nombre,
        cedula,
        correo,
        qr_code: cedula,  // <-- Aquí guardamos el qr_code igual a la cédula
      },
    ]);

    if (error) {
      alert("❌ Error al registrar participante");
      console.error(error);
    } else {
      setQrValue(cedula); // Generar QR con la cédula
      alert("✅ Participante registrado exitosamente");
      // Limpiar formulario si quieres:
      setNombre("");
      setCedula("");
      setCorreo("");
    }
  };

  return (
    <div>
      <h2>Registrar Participante</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nombre:</label><br />
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </div>
        <div>
          <label>Cédula:</label><br />
          <input
            type="text"
            value={cedula}
            onChange={(e) => setCedula(e.target.value)}
          />
        </div>
        <div>
          <label>Correo:</label><br />
          <input
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
          />
        </div>
        <button type="submit">Registrar y generar QR</button>
      </form>

      {qrValue && (
        <div style={{ marginTop: "20px" }}>
          <h3>QR generado:</h3>
          <QRCodeCanvas value={qrValue} size={256} />
          <p>Este QR es escaneable para registrar asistencia.</p>
        </div>
      )}

      <br />
      <Link to="/">⬅️ Volver al inicio</Link>
    </div>
  );
}

export default RegistrarParticipante;