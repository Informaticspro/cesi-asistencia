import { useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { supabase } from "./supabaseClient";
import RegistroManual from "./RegistroManual";

function EscanerQR() {
  const html5QrCodeRef = useRef(null);
  const scanningRef = useRef(false);
  const [scannerActivo, setScannerActivo] = useState(false);
  const [mostrarManual, setMostrarManual] = useState(false);

  const iniciarScanner = async () => {
    if (scannerActivo) return;

    const qrRegionId = "reader";

    setScannerActivo(true);
    setMostrarManual(false); // Ocultar manual mientras escanea

    // Esperar a que el div con id="reader" se haya renderizado
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
        {
          fps: 10,
          qrbox: 250,
        },
        async (decodedText) => {
          if (scanningRef.current) return;
          scanningRef.current = true;

          console.log("QR leído:", decodedText);
          await registrarAsistencia(decodedText);

          try {
            await detenerScanner();
          } catch (err) {
            console.warn("Error al detener el escáner:", err.message);
          }
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
      alert("❌ Error al consultar asistencia.");
      scanningRef.current = false;
      return;
    }

    if (yaAsistio.length > 0) {
      alert("⚠️ Ya registró asistencia hoy.");
      scanningRef.current = false;
      return;
    }

    const { error } = await supabase.from("asistencias").insert([
      {
        cedula,
        fecha: hoy,
        hora,
      },
    ]);

    if (error) {
      alert("❌ Error al registrar asistencia.");
    } else {
      alert("✅ Asistencia registrada.");
    }

    scanningRef.current = false;
  };

  return (
    <div>
      <h2>Escanear QR</h2>

      {!scannerActivo && (
        <button
          onClick={iniciarScanner}
          className="btn btn-primary"
          style={{ marginRight: "10px" }}
        >
          📷 Iniciar escáner
        </button>
      )}

      {scannerActivo && (
        <button
          onClick={detenerScanner}
          className="btn btn-danger"
          style={{ marginRight: "10px" }}
        >
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
    </div>
  );
}

export default EscanerQR;