import { useState } from "react";
import { supabase } from "./supabaseClient";
import { QRCodeCanvas } from "qrcode.react";
import { Link } from "react-router-dom";

function BuscarQR() {
  const [cedula, setCedula] = useState("");
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState(null);

  const buscar = async () => {
    if (!cedula.trim()) {
      setError("Debe ingresar una cédula.");
      setResultado(null);
      return;
    }

    const { data, error } = await supabase
      .from("participantes")
      .select("*")
      .eq("cedula", cedula.trim())
      .single();

    if (error || !data) {
      setError("Participante no encontrado.");
      setResultado(null);
    } else {
      setError(null);
      setResultado(data);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: "2rem auto", textAlign: "center" }}>
      <h2>Buscar Código QR</h2>
      <p>Ingresa tu cédula para recuperar tu código QR</p>
      <input
        type="text"
        placeholder="Cédula"
        value={cedula}
        onChange={(e) => setCedula(e.target.value)}
        style={{ padding: "0.5rem", width: "80%", marginBottom: "1rem" }}
      />
      <br />
      <button onClick={buscar} style={{ padding: "0.5rem 1rem" }}>
        Buscar
      </button>

      {error && <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>}

      {resultado && (
        <div style={{ marginTop: "2rem" }}>
          <h3>{resultado.nombre} {resultado.apellido}</h3>
          <p>{resultado.correo}</p>
          <QRCodeCanvas
            value={resultado.cedula}
            size={200}
            bgColor="#ffffff"
            fgColor="#000000"
            level="H"
            includeMargin={true}
          />
        </div>
      )}

      <div style={{ marginTop: "2rem" }}>
        <Link to="/">
          <button>← Volver al inicio</button>
        </Link>
      </div>
    </div>
  );
}

export default BuscarQR;