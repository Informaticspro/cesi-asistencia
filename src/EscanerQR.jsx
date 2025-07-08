import { useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { supabase } from "./supabaseClient";
import RegistroManual from "./RegistroManual";

function EscanerQR() {
  const html5QrCodeRef = useRef(null);
  const [scannerActivo, setScannerActivo] = useState(false);
  const [mostrarManual, setMostrarManual] = useState(false);
  const [datosParticipante, setDatosParticipante] = useState(null);
  const [confirmacion, setConfirmacion] = useState(null);
  const scanningRef = useRef(false);

  const reproducirSonido = (tipo) => {
    const audio = new Audio(tipo === "success" ? "/success.mp3" : "/error.mp3");
    audio.play().catch((e) => console.log("🔇 Error al reproducir sonido:", e));
  };

  const iniciarScanner = async () => {
  if (scannerActivo) return;

  setScannerActivo(true);
  setMostrarManual(false);
  setDatosParticipante(null);
  setConfirmacion(null);

  await new Promise((res) => setTimeout(res, 100)); // Esperar a que se monte el div

  const readerElement = document.getElementById("reader");
  if (!readerElement) {
    console.error("❌ No se encontró el elemento #reader");
    alert("Error: No se encontró el lector QR en el DOM.");
    setScannerActivo(false);
    return;
  }

  if (!html5QrCodeRef.current) {
    html5QrCodeRef.current = new Html5Qrcode("reader");
  }

  try {
    await html5QrCodeRef.current.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: 250 },
      async (decodedText) => {
        if (scanningRef.current) return;
        scanningRef.current = true;

        console.log("QR leído:", decodedText);
        await registrarAsistencia(decodedText);

        setTimeout(() => {
          setConfirmacion(null);
          setDatosParticipante(null);
          scanningRef.current = false;
        }, 3000);
      }
    );
  } catch (err) {
    console.error("❌ Error al iniciar el escáner:", err);
    alert("No se pudo acceder a la cámara. Revisa los permisos del navegador.");
    setScannerActivo(false);
  }
};

  const detenerScanner = async () => {
    if (html5QrCodeRef.current && scannerActivo) {
      await html5QrCodeRef.current.stop();
      await html5QrCodeRef.current.clear();
      setScannerActivo(false);
    }
  };

  const registrarAsistencia = async (cedula) => {
    const hoy = new Date().toISOString().split("T")[0];
    const hora = new Date().toISOString();

    const { data: yaAsistio, error: errSelect } = await supabase
      .from("asistencias")
      .select("*")
      .eq("cedula", cedula)
      .eq("fecha", hoy);

    if (errSelect) {
      setConfirmacion({ tipo: "error", mensaje: "❌ Error consultando asistencia" });
      reproducirSonido("error");
      return;
    }

    if (yaAsistio.length > 0) {
      setConfirmacion({ tipo: "error", mensaje: "⚠️ Ya registró asistencia hoy" });
      reproducirSonido("error");
      return;
    }

    const { data: participante, error: errorParticipante } = await supabase
      .from("participantes")
      .select("nombre, apellido, cedula")
      .eq("cedula", cedula)
      .single();

    if (errorParticipante || !participante) {
      setConfirmacion({ tipo: "error", mensaje: "❌ Participante no encontrado" });
      setDatosParticipante(null);
      reproducirSonido("error");
      return;
    }

    const { error } = await supabase.from("asistencias").insert([
      { cedula, fecha: hoy, hora }
    ]);

    if (error) {
      setConfirmacion({ tipo: "error", mensaje: "❌ Error al registrar asistencia" });
      setDatosParticipante(null);
      reproducirSonido("error");
    } else {
      setDatosParticipante(participante);
      setConfirmacion({ tipo: "success", mensaje: "✅ Asistencia registrada" });
      reproducirSonido("success");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "1rem auto", padding: "1rem" }}>
      <h2>Escanear QR</h2>

      {!scannerActivo && (
        <button onClick={iniciarScanner} className="btn btn-primary" style={{ marginRight: "10px" }}>
          📷 Iniciar escáner
        </button>
      )}

      {scannerActivo && (
        <button onClick={detenerScanner} className="btn btn-danger" style={{ marginRight: "10px" }}>
          🛑 Detener escáner
        </button>
      )}

      <button
        className="btn btn-secondary"
        onClick={() => {
          setMostrarManual((prev) => !prev);
          if (scannerActivo) detenerScanner();
        }}
      >
        {mostrarManual ? "Ocultar registro manual" : "Registrar asistencia manual"}
      </button>

      {scannerActivo && (
        <div id="reader" style={{ width: "300px", marginTop: "1rem" }}></div>
      )}

      {mostrarManual && <RegistroManual />}

      {confirmacion && (
        <div
          style={{
            marginTop: "1rem",
            padding: "1.5rem",
            borderRadius: "10px",
            backgroundColor: confirmacion.tipo === "success" ? "#e6ffed" : "#ffe6e6",
            color: confirmacion.tipo === "success" ? "#155724" : "#721c24",
            border: `2px solid ${confirmacion.tipo === "success" ? "#28a745" : "#dc3545"}`,
            textAlign: "center",
            fontSize: "18px",
            position: "fixed",
            bottom: "1rem",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 9999,
            width: "90%",
            maxWidth: "400px",
            boxShadow: "0 0 8px rgba(0,0,0,0.1)"
          }}
        >
          <div style={{ fontWeight: "bold", fontSize: "20px", marginBottom: "0.5rem" }}>
            {confirmacion.mensaje}
          </div>
          {datosParticipante && (
            <div>
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

export default EscanerQR;