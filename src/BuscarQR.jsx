import { useState, useRef } from "react";
import { supabase } from "./supabaseClient";
import { QRCodeCanvas } from "qrcode.react";
import { Link } from "react-router-dom";

function BuscarQR() {
  const [cedula, setCedula] = useState("");
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Ref para el canvas del QR
  const qrRef = useRef();

  const buscar = async () => {
    if (!cedula.trim()) {
      setError("Debe ingresar una cédula.");
      setResultado(null);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("participantes")
      .select("*")
      .eq("cedula", cedula.trim())
      .single();
    setLoading(false);

    if (error || !data) {
      setError("Participante no encontrado.");
      setResultado(null);
    } else {
      setError(null);
      setResultado(data);
    }
  };

  // Función para descargar el QR como imagen PNG
  const descargarQR = () => {
    if (!qrRef.current) return;
    const canvas = qrRef.current.querySelector("canvas");
    if (!canvas) return;

    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `QR_${resultado.cedula}.png`;
    a.click();
  };

  return (
    <div
      style={{
        maxWidth: 500,
        margin: "2rem auto",
        textAlign: "center",
        backgroundColor: "#121212",
        color: "#fff",
        padding: "2rem",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2 style={{ color: "#00bfa5", marginBottom: "0.5rem" }}>Buscar Código QR</h2>
      <p style={{ marginBottom: "1.5rem", color: "#bbb" }}>
        Ingresa tu cédula para recuperar tu código QR
      </p>
      <input
        type="text"
        placeholder="Cédula"
        value={cedula}
        onChange={(e) => setCedula(e.target.value)}
        style={{
          padding: "0.6rem",
          width: "80%",
          marginBottom: "1rem",
          borderRadius: "6px",
          border: "1px solid #333",
          backgroundColor: "#222",
          color: "#fff",
          fontSize: "1rem",
          outline: "none",
        }}
        disabled={loading}
      />
      <br />
      <button
        onClick={buscar}
        disabled={loading}
        style={{
          padding: "0.6rem 1.5rem",
          backgroundColor: "#00bfa5",
          color: "#121212",
          fontWeight: "bold",
          border: "none",
          borderRadius: "6px",
          cursor: loading ? "not-allowed" : "pointer",
          fontSize: "1rem",
          transition: "background-color 0.3s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#008e76")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#00bfa5")}
      >
        {loading ? "Buscando..." : "Buscar"}
      </button>

      {error && (
        <p style={{ color: "#f44336", marginTop: "1.5rem", fontWeight: "bold" }}>{error}</p>
      )}

      {resultado && (
        <div
          style={{
            marginTop: "2rem",
            backgroundColor: "#1e1e1e",
            padding: "1.5rem",
            borderRadius: "10px",
            boxShadow: "0 3px 8px rgba(0,0,0,0.4)",
          }}
        >
          <h3 style={{ marginBottom: "0.3rem", color: "#00bfa5" }}>
            {resultado.nombre} {resultado.apellido}
          </h3>
          <p style={{ marginBottom: "1rem", color: "#bbb" }}>{resultado.correo}</p>

          {/* QR con fondo blanco para mejor visibilidad */}
          <div ref={qrRef} style={{ display: "inline-block", backgroundColor: "#fff", padding: "10px", borderRadius: "8px" }}>
  <QRCodeCanvas
    value={resultado.cedula}
    size={200}
    bgColor="#ffffff"
    fgColor={resultado.colorQR || "#000000"} // reemplaza resultado.colorQR por tu color
    level="H"
    includeMargin={true}
  />
</div>

          <br />

          <button
            onClick={descargarQR}
            style={{
              marginTop: "1rem",
              padding: "0.5rem 1rem",
              backgroundColor: "#00bfa5",
              color: "#121212",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "1rem",
              transition: "background-color 0.3s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#008e76")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#00bfa5")}
          >
            Descargar QR
          </button>
        </div>
      )}

      <div style={{ marginTop: "2rem" }}>
        <Link to="/">
          <button
            style={{
              padding: "0.5rem 1.2rem",
              backgroundColor: "#00796b",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "1rem",
              transition: "background-color 0.3s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#004d40")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#00796b")}
          >
            ← Volver al inicio
          </button>
        </Link>
      </div>
    </div>
  );
}

export default BuscarQR;