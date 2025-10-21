import { useRef, useState, useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { supabase } from "./supabaseClient";
import RegistroManual from "./RegistroManual";

function EscanerQR() {
  const html5QrCodeRef = useRef(null);
  const scanningRef = useRef(false);
  const lectorRef = useRef(null);
  const confirmacionRef = useRef(null);
  const [scannerActivo, setScannerActivo] = useState(false);
  const [mostrarManual, setMostrarManual] = useState(false);
  const [datosParticipante, setDatosParticipante] = useState(null);
  const [confirmacion, setConfirmacion] = useState(null);
  const inactivityTimer = useRef(null);
  const warningTimer = useRef(null);

  const reproducirSonido = (tipo) => {
    const audio = new Audio(tipo === "success" ? "/success.mp3" : "/error.mp3");
    audio.play().catch(() => {});
  };

  const clearTimers = () => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    if (warningTimer.current) clearTimeout(warningTimer.current);
  };

  const resetInactivityTimer = () => {
    clearTimers();

    warningTimer.current = setTimeout(() => {
      setConfirmacion({
        tipo: "error",
        mensaje: "⚠️ Atención: La cámara se cerrará en 20 segundos por inactividad.",
      });
    }, 40000);

    inactivityTimer.current = setTimeout(() => {
      detenerScanner();
      setConfirmacion({
        tipo: "error",
        mensaje: "⏰ Cámara cerrada por inactividad. La página se recargará.",
      });
      setDatosParticipante(null);
      setTimeout(() => window.location.reload(), 3000);
    }, 60000);
  };

  const iniciarScanner = async () => {
    if (scannerActivo) return;

    setScannerActivo(true);
    setMostrarManual(false);
    await new Promise((resolve) => setTimeout(resolve, 100));

    const qrRegionId = "reader";
    const readerElement = document.getElementById(qrRegionId);
    if (!readerElement) return;

    if (!html5QrCodeRef.current) {
      html5QrCodeRef.current = new Html5Qrcode(qrRegionId);
    }

    try {
      await html5QrCodeRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
        qrbox: (w, h) => {
  const size = Math.floor(Math.min(w, h) * 0.9); // antes era 0.8
  return { width: size, height: size };
},
        },
        async (decodedText) => {
          if (scanningRef.current) return;
          scanningRef.current = true;

          await registrarAsistencia(decodedText);
          resetInactivityTimer();

          setTimeout(() => {
            scanningRef.current = false;
          }, 2000);
        }
      );

      resetInactivityTimer();

      // Aquí centramos el lector en pantalla al abrir la cámara
      if (lectorRef.current) {
        lectorRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    } catch (err) {
      console.error("Error iniciando escáner", err);
    }
  };

  const detenerScanner = async () => {
    clearTimers();
    if (html5QrCodeRef.current && scannerActivo) {
      await html5QrCodeRef.current.stop();
      await html5QrCodeRef.current.clear();
      setScannerActivo(false);
      scanningRef.current = false;
    }
  };

  const registrarAsistencia = async (cedula) => {
  // Ya NO tomamos la fecha del dispositivo
  // const hoy = new Date().toISOString().split("T")[0];
  // const hora = new Date().toLocaleTimeString("es-ES", { hour12: false });

  // Verificamos si ya registró asistencia hoy (desde Supabase)
  const { data: yaAsistio, error: errorYa } = await supabase.rpc("verificar_asistencia", {
  p_cedula: cedula,
});

if (errorYa) {
  mostrarConfirmacion("error", "❌ Error verificando asistencia");
  reproducirSonido("error");
  return;
}

if (yaAsistio === true) {
  mostrarConfirmacion("error", "⚠️ Ya registró asistencia hoy");
  reproducirSonido("error");
  return;
}

  // Buscar participante
  const { data: participante, error: errorParticipante } = await supabase
    .from("participantes")
    .select("nombre, apellido, cedula")
    .eq("cedula", cedula)
    .single();

  if (errorParticipante || !participante) {
    mostrarConfirmacion("error", "❌ Participante no encontrado");
    setDatosParticipante(null);
    reproducirSonido("error");
    return;
  }

  // Registrar asistencia — ahora SIN enviar fecha ni hora
  const { error } = await supabase.from("asistencias").insert([
    { cedula }
  ]);

  if (error) {
    mostrarConfirmacion("error", "❌ Error al registrar asistencia");
    setDatosParticipante(null);
    reproducirSonido("error");
  } else {
    setDatosParticipante(participante);
    mostrarConfirmacion("success", "✅ Asistencia registrada");
    reproducirSonido("success");
  }
};

  const mostrarConfirmacion = (tipo, mensaje) => {
    setConfirmacion({ tipo, mensaje });
    setTimeout(() => {
      if (confirmacionRef.current) {
        confirmacionRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 200);

    // Desaparecer después de 5 segundos y volver al lector
    setTimeout(() => {
      setConfirmacion(null);
      setDatosParticipante(null);
      if (lectorRef.current) {
        lectorRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 5000);
  };

  useEffect(() => {
    return () => clearTimers();
  }, []);

  return (
    <div style={{ padding: "1rem", maxWidth: "500px", margin: "0 auto", color: "#ffffff", }}>
      <h2 style={{ textAlign: "center" }}>Escanear QR</h2>

      {!scannerActivo && (
        <button onClick={iniciarScanner} style={botonEstilo("#0d6efd")}>
          📷 Iniciar escáner
        </button>
      )}

      {scannerActivo && (
        <button onClick={detenerScanner} style={botonEstilo("#dc3545")}>
          🛑 Detener escáner
        </button>
      )}

      <button
        onClick={() => {
          setMostrarManual((prev) => !prev);
          if (scannerActivo) detenerScanner();
        }}
        style={botonEstilo("#6c757d")}
      >
        {mostrarManual ? "Ocultar registro manual" : "Registrar asistencia manual"}
      </button>

      {scannerActivo && (
        <div
          id="reader"
          ref={lectorRef}
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
          ref={confirmacionRef}
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
              <div>
                <strong>Nombre:</strong> {datosParticipante.nombre}
              </div>
              <div>
                <strong>Apellido:</strong> {datosParticipante.apellido}
              </div>
              <div>
                <strong>Cédula:</strong> {datosParticipante.cedula}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function botonEstilo(color) {
  return {
    width: "100%",
    padding: "0.75rem",
    marginBottom: "0.5rem",
    backgroundColor: color,
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    cursor: "pointer",
  };
}

export default EscanerQR;