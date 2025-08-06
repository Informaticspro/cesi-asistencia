import { useState, useRef, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Link, useNavigate } from "react-router-dom";
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
  const [sugerencias, setSugerencias] = useState([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const cedulaInputRef = useRef(null);
  
  
  const qrRef = useRef(null);
  const navigate = useNavigate();

   const yaSeleccionado = useRef(false); // 🔑 clave para evitar doble clic

  useEffect(() => {
    const buscarCedulas = async () => {
      if (cedula.length < 3) {
        setSugerencias([]);
        return;
      }

      const { data, error } = await supabase
        .from("participantes_autorizados")
        .select("cedula, nombre, apellido, correo")
        .ilike("cedula", `${cedula}%`);

      if (!error && data) {
        setSugerencias(data);
        setMostrarSugerencias(true);
      }
    };

    buscarCedulas();
  }, [cedula]);

  const handleSeleccion = (participante) => {
    setCedula(participante.cedula);
    setNombre(participante.nombre);
    setApellido(participante.apellido);
    setCorreo(participante.correo);
    setMostrarSugerencias(false);
  };
  
  
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setMensaje(null); // Limpia mensajes anteriores

  // Validación básica
  if (!cedula || !nombre || !apellido || !correo || !sexo || !categoria) {
    setMensaje({ tipo: "error", texto: "❌ Todos los campos son obligatorios" });
    setLoading(false);
    return;
  }

  try {
    // Verifica si el participante ya existe por cédula
    const { data: existente, error } = await supabase
      .from("participantes")
      .select("*")
      .eq("cedula", cedula);

    if (error) throw error;

    if (existente.length > 0) {
      setMensaje({ tipo: "error", texto: "❌ Participante ya registrado" });
      setLoading(false);
      return;
    }

    // Inserta participante en Supabase
   const { data, error: insertError } = await supabase.from("participantes").insert([
        { cedula, nombre, apellido, correo, sexo, categoria, qr_code: cedula,} // 👈 Aquí guardamos el valor del QR},
        ]);
        console.log("Resultado insert:", data);
    if (insertError) {
      console.error("Error insert Supabase:", insertError);
        }

    if (insertError) throw insertError;

    // Enviar QR al backend Express
    const response = await fetch("https://cesi-servidor.onrender.com/api/registro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cedula, nombre, correo }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      setMensaje({
        tipo: "error",
        texto: `❌ Error en el servidor: ${errorData.error || "desconocido"}`,
      });
    } else {
      setMensaje({
        tipo: "success",
        texto: "✅ Participante registrado exitosamente",
      });
      setQrVisible(true);
    }
  } catch (err) {
    console.error(err);
    setMensaje({
      tipo: "error",
       texto: `❌ Ocurrió un error inesperado: ${err.message}`,
    });
  }

  setLoading(false);
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
    navigate("/");
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
        position: "relative",
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
          autoComplete="off"
          ref={cedulaInputRef}
          onBlur={() => setTimeout(() => setMostrarSugerencias(false), 150)}
        />

        {mostrarSugerencias && sugerencias.length > 0 && (
          <ul
            style={{
              listStyle: "none",
              padding: "0.5rem",
              border: "1px solid #ccc",
              borderRadius: "6px",
              backgroundColor: "#fff",
              position: "absolute",
              zIndex: 1000,
              marginTop: "-8px",
              maxHeight: "150px",
              overflowY: "auto",
            }}
          >
            {sugerencias.map((item) => (
      <li
        key={item.cedula}
        onMouseDown={(e) => {
          // Evitar que el blur se dispare antes de esta acción
          e.preventDefault();
          handleSeleccion(item);
          // Cerrar lista con un pequeño delay
          setTimeout(() => {
            setMostrarSugerencias(false);
          }, 0);
        }}
                style={{
                  padding: "0.4rem 0.6rem",
                  cursor: "pointer",
                  borderBottom: "1px solid #eee",
                  backgroundColor: "#fff",
                  color: "#333",
                }}
                onMouseEnter={(e) => (e.target.style.backgroundColor = "#f0f0f0")}
                onMouseLeave={(e) => (e.target.style.backgroundColor = "#fff")}
              >
                {item.cedula} - {item.nombre} {item.apellido}
              </li>
            ))}
          </ul>
        )}

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
          <option value="" disabled>Sexo</option>
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
          <option value="" disabled>Categoría</option>
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
            navigate("/");
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
                {/* ✅ MENSAJE DE CONFIRMACIÓN */}
      <div
        style={{
          backgroundColor: "#e0f2f1",
          padding: "0.8rem",
          borderRadius: "8px",
          marginBottom: "1rem",
          color: "#004d40",
          fontWeight: "600",
          fontSize: "0.95rem",
          boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
        }}
      >
        <p style={{ marginBottom: 4 }}>¡Has sido registrado exitosamente!</p>
        <p style={{ margin: 0, fontSize: "0.85rem" }}>
          Puedes revisar tu confirmación en tu correo electrónico.
        </p>
      </div>
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
                navigate("/");
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