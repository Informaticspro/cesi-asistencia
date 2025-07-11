import { useState, useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Link, useNavigate } from "react-router-dom"; // <-- importar useNavigate
import { supabase } from "./supabaseClient";

function RegistrarParticipante() {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [cedula, setCedula] = useState("");
  const [correo, setCorreo] = useState("");
  const [sexo, setSexo] = useState("");
  const [categoria, setCategoria] = useState("");
  const [mensaje, setMensaje] = useState(null);
  const [loading, setLoading] = useState(false);
  const [qrVisible, setQrVisible] = useState(false);

  const qrRef = useRef(null);
  const navigate = useNavigate(); // <-- inicializar useNavigate

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nombre || !apellido || !cedula || !correo || !sexo || !categoria) {
      setMensaje({ tipo: "error", texto: "⚠️ Todos los campos son obligatorios" });
      return;
    }

    setLoading(true);
    setMensaje(null);

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
      setMensaje({
        tipo: "error",
        texto: "⚠️ Ya existe un participante con esa cédula o correo.",
      });
      return;
    }

    const { error } = await supabase.from("participantes").insert([
      {
        nombre,
        apellido,
        cedula,
        correo,
        sexo,
        categoria,
        qr_code: cedula,
      },
    ]);

    if (error) {
      setLoading(false);
      setMensaje({ tipo: "error", texto: "❌ Error al registrar participante" });
      return;
    }

    setMensaje({
      tipo: "success",
      texto: "✅ Participante registrado exitosamente",
    });
    setLoading(false);
    setQrVisible(true);
  };

  const resetFormulario = () => {
    setNombre("");
    setApellido("");
    setCedula("");
    setCorreo("");
    setSexo("");
    setCategoria("");
    setMensaje(null);
  };

  const descargarQR = () => {
    const canvas = qrRef.current.querySelector("canvas");
    if (!canvas) return;
    const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");

    const downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `codigo_qr_${cedula}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    setQrVisible(false);
    resetFormulario();
    navigate("/"); // <-- redirigir al inicio tras descargar
  };

  return (
    <div
      style={{
        maxWidth: 420,
        margin: "2rem auto",
        padding: "2rem",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        borderRadius: 12,
        backgroundColor: "#f5f5f5",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          marginBottom: 20,
          color: "#004d40",
          fontWeight: "700",
        }}
      >
       Registro de participantes CESI 2025
      </h2>

      {mensaje && (
        <div
          style={{
            padding: "0.75rem 1rem",
            marginBottom: "1.2rem",
            borderRadius: 6,
            color: mensaje.tipo === "error" ? "#fff" : "#155724",
            backgroundColor: mensaje.tipo === "error" ? "#d32f2f" : "#c8e6c9",
            border: mensaje.tipo === "error" ? "1px solid #f44336" : "1px solid #4caf50",
            fontWeight: "600",
            textAlign: "center",
            boxShadow: "0 0 8px rgba(0,0,0,0.05)",
          }}
        >
          {mensaje.texto}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "14px" }}
      >
        <input
          type="text"
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          style={{
            padding: "0.7rem",
            fontSize: 16,
            borderRadius: 6,
            border: "2px solid #004d40",
            outlineColor: "#1565c0",
            fontWeight: "600",
          }}
          disabled={qrVisible}
        />
        <input
          type="text"
          placeholder="Apellido"
          value={apellido}
          onChange={(e) => setApellido(e.target.value)}
          style={{
            padding: "0.7rem",
            fontSize: 16,
            borderRadius: 6,
            border: "2px solid #004d40",
            outlineColor: "#1565c0",
            fontWeight: "600",
          }}
          disabled={qrVisible}
        />
        <input
          type="text"
          placeholder="Cédula"
          value={cedula}
          onChange={(e) => setCedula(e.target.value)}
          style={{
            padding: "0.7rem",
            fontSize: 16,
            borderRadius: 6,
            border: "2px solid #004d40",
            outlineColor: "#1565c0",
            fontWeight: "600",
          }}
          disabled={qrVisible}
        />
        <input
          type="email"
          placeholder="Correo"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          style={{
            padding: "0.7rem",
            fontSize: 16,
            borderRadius: 6,
            border: "2px solid #004d40",
            outlineColor: "#1565c0",
            fontWeight: "600",
          }}
          disabled={qrVisible}
        />

        {/* Campos nuevos para Sexo y Categoría */}
        <select
          value={sexo}
          onChange={(e) => setSexo(e.target.value)}
          disabled={qrVisible}
          style={{
            padding: "0.7rem",
            fontSize: 16,
            borderRadius: 6,
            border: "2px solid #004d40",
            outlineColor: "#1565c0",
            fontWeight: "600",
          }}
        >
          <option value="" disabled>
            Sexo
          </option>
          <option value="Hombre">Hombre</option>
          <option value="Mujer">Mujer</option>
        </select>

        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          disabled={qrVisible}
          style={{
            padding: "0.7rem",
            fontSize: 16,
            borderRadius: 6,
            border: "2px solid #004d40",
            outlineColor: "#1565c0",
            fontWeight: "600",
          }}
        >
          <option value="" disabled>
            Categoría
          </option>
          <option value="Estudiante">Estudiante</option>
          <option value="Docente">Docente</option>
          <option value="Funcionario">Funcionario</option>
          <option value="Invitado">Invitado</option>
          <option value="Egresado">Egresado</option>
        </select>

        <button
          type="submit"
          disabled={loading || qrVisible}
          style={{
            padding: "0.85rem",
            fontSize: 16,
            fontWeight: "700",
            borderRadius: 8,
            border: "none",
            backgroundColor: loading || qrVisible ? "#9e9e9e" : "#1565c0",
            color: "#fff",
            cursor: loading || qrVisible ? "not-allowed" : "pointer",
            marginTop: 10,
            boxShadow: loading || qrVisible ? "none" : "0 4px 10px rgba(21,101,192,0.5)",
            transition: "background-color 0.3s ease",
          }}
        >
          {loading ? "Registrando..." : "Registrar y mostrar QR"}
        </button>
      </form>

      <div style={{ marginTop: 20, textAlign: "center" }}>
        <Link
          to="/"
          style={{
            color: "#d32f2f",
            textDecoration: "none",
            fontWeight: "700",
            fontSize: 16,
          }}
          onMouseEnter={(e) => (e.target.style.textDecoration = "underline")}
          onMouseLeave={(e) => (e.target.style.textDecoration = "none")}
        >
          ⬅️ Volver al inicio
        </Link>
      </div>

      {qrVisible && (
        <div
          onClick={() => {
            setQrVisible(false);
            resetFormulario();
            navigate("/"); // <-- redirigir al inicio al cerrar modal clic en fondo
          }}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "#fff",
              padding: 30,
              borderRadius: 12,
              boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
              textAlign: "center",
              maxWidth: 320,
              border: "3px solid #004d40",
            }}
          >
            <h3
              style={{
                marginBottom: 20,
                color: "#004d40",
                fontWeight: "700",
                fontSize: 22,
              }}
            >
              Tu código QR
            </h3>

            <div ref={qrRef} style={{ marginBottom: 15 }}>
              <QRCodeCanvas
                value={cedula}
                size={256}
                bgColor="#ffffff"
                fgColor="#004d40"
                level="H"
                includeMargin={true}
              />
            </div>

            <button
              onClick={descargarQR}
              style={{
                marginBottom: 15,
                padding: "0.6rem 1.2rem",
                backgroundColor: "#004d40",
                color: "white",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: "700",
                fontSize: 16,
                boxShadow: "0 4px 12px rgba(0,77,64,0.7)",
                transition: "background-color 0.3s ease",
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#00796b")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "#004d40")}
            >
              Descargar QR
            </button>

            <button
              onClick={() => {
                setQrVisible(false);
                resetFormulario();
                navigate("/"); // <-- redirigir al inicio al cerrar modal con botón
              }}
              style={{
                padding: "0.6rem 1.2rem",
                backgroundColor: "#d32f2f",
                color: "white",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: "700",
                fontSize: 16,
                boxShadow: "0 4px 12px rgba(211,47,47,0.7)",
                transition: "background-color 0.3s ease",
                marginTop: 10,
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#b71c1c")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "#d32f2f")}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default RegistrarParticipante;