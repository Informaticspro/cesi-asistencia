import { useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { supabase } from "./supabaseClient";
import RegistroManual from "./RegistroManual";

function EscanerQR() {
  const html5QrCodeRef = useRef(null);
  const scanningRef = useRef(false);
  const [scannerActivo, setScannerActivo] = useState(false);
  const [mostrarManual, setMostrarManual] = useState(false);
  const [datosParticipante, setDatosParticipante] = useState(null);
  const [confirmacion, setConfirmacion] = useState(null);

  const reproducirSonido = (tipo) => {
    const audio = new Audio(tipo === "success" ? "/success.mp3" : "/error.mp3");
    audio.play().catch(() => {}); // Silencia errores si el audio no puede reproducirse
  };

  const iniciarScanner = async () => {
    if (scannerActivo) return;

    const qrRegionId = "reader";

    setScannerActivo(true);
    setMostrarManual(false);

    await new Promise((resolve) => setTimeout(resolve, 100));

    const readerElement = document.getElementById(qrRegionId);
    if (!readerElement) {
      console.error("❌ El elemento #reader no existe.");
      return;
    }

    if (!html5QrCodeRef.current) {
      html5QrCodeRef.current = new Html5Qrcode(qrRegionId);
    }

    try {
      await html5QrCodeRef.current.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          if (scanningRef.current) return;
          scanningRef.current = true;

          console.log("QR leído:", decodedText);
          await registrarAsistencia(decodedText);

          // Espera 2 segundos antes de permitir otro escaneo
          setTimeout(() => {
            scanningRef.current = false;
          }, 2000);
        }
      );
    } catch (err) {
      console.error("Error iniciando escáner", err);
    }
  };

  const detenerScanner = async () => {
    if (html5QrCodeRef.current && scannerActivo) {
      await html5QrCodeRef.current.stop();
      await html5QrCodeRef.current.clear();
      setScannerActivo(false);
      scanningRef.current = false;
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
    <div style={{ padding: "1rem", maxWidth: "500px", margin: "0 auto" }}>
      <h2 style={{ textAlign: "center" }}>Escanear QR</h2>

      {!scannerActivo && (
        <button
          onClick={iniciarScanner}
          sstyle={{
             width: "90vw",               // usa el 90% del ancho del viewport
              maxWidth: "400px",           // pero no más grande que 400px
              aspectRatio: "1 / 1",        // cuadrado
              margin: "1rem auto",
               borderRadius: "12px",
              overflow: "hidden",
                boxShadow: "0 0 12px rgba(0,0,0,0.2)",
}}
        >
          📷 Iniciar escáner
        </button>
      )}

      {scannerActivo && (
        <button
          onClick={detenerScanner}
          style={{
            width: "100%",
            padding: "0.75rem",
            marginBottom: "0.5rem",
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          🛑 Detener escáner
        </button>
      )}

      <button
        onClick={() => {
          setMostrarManual((prev) => !prev);
          if (scannerActivo) detenerScanner();
        }}
        style={{
          width: "100%",
          padding: "0.75rem",
          marginBottom: "1rem",
          backgroundColor: "#6c757d",
          color: "white",
          border: "none",
          borderRadius: "8px",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        {mostrarManual ? "Ocultar registro manual" : "Registrar asistencia manual"}
      </button>

      {scannerActivo && (
        <div
          id="reader"
          style={{
            width: "100%",
            maxWidth: "360px",
            margin: "1rem auto",
            aspectRatio: "1 / 1",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 0 12px rgba(0,0,0,0.2)",
          }}
        ></div>
      )}

      {mostrarManual && <RegistroManual />}

      {confirmacion && (
        <div
          style={{
            marginTop: "1rem",
            padding: "1rem",
            backgroundColor: confirmacion.tipo === "success" ? "#d1e7dd" : "#f8d7da",
            color: confirmacion.tipo === "success" ? "#0f5132" : "#842029",
            borderRadius: "10px",
            textAlign: "center",
            fontSize: "16px",
          }}
        >
          <strong>{confirmacion.mensaje}</strong>
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

export default EscanerQR;