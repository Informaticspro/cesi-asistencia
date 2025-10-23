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
  const [nacionalidad, setNacionalidad] = useState("");
  const [otraNacionalidad, setOtraNacionalidad] = useState("");
  const [modalidad, setModalidad] = useState("");
  const [tipoParticipacion, setTipoParticipacion] = useState("");
  const [entidad, setEntidad] = useState("");
  const [otraEntidad, setOtraEntidad] = useState("");
  const [mensaje, setMensaje] = useState(null);
  const [loading, setLoading] = useState(false);
  const [qrVisible, setQrVisible] = useState(false);
  const [sugerencias, setSugerencias] = useState([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const cedulaInputRef = useRef(null);
  const [mostrarErrorCedula, setMostrarErrorCedula] = useState(false);
  const [errorCedula, setErrorCedula] = useState("");
  const mensajeRef = useRef(null);
  
  const [cuposPlan2, setCuposPlan2] = useState(0);

// 🔹 Función para contar cuántos ya están en Plan 2
async function verificarCupoPlan2() {
  const { count, error } = await supabase
    .from("participantes")
    .select("*", { count: "exact", head: true })
    .ilike("modalidad", "%Plan 2%");

  if (error) {
    console.error("Error verificando cupo:", error);
    return false;
  }

  return count < 80; // true si aún hay cupo
}

  const qrRef = useRef(null);
  const navigate = useNavigate();

   const yaSeleccionado = useRef(false); // 🔑 clave para evitar doble clic

  useEffect(() => {
    async function cargarCupo() {
    const { count } = await supabase
      .from("participantes")
      .select("*", { count: "exact", head: true })
      .ilike("modalidad", "%Plan 2%");
    setCuposPlan2(count);
  }
  cargarCupo();
    const buscarCedulas = async () => {
      if (cedula.length < 3) {
        setSugerencias([]);
        return;
      }
const validarCedula = (valor) => {
  const regex = /^[0-9]+-[0-9]+-[0-9]+$/;
  if (valor === "") {
    setErrorCedula(""); // vacío no muestra error
  } else if (!regex.test(valor)) {
    setErrorCedula("Formato inválido. Ej: 4-760-2153");
  } else {
    setErrorCedula(""); // válido
  }
};
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
  if (!cedula || !nombre || !apellido || !sexo || !categoria) {
    setMensaje({ tipo: "error", texto: "❌ Algunos campos son obligatorios" });
    setLoading(false);
    return;
  }
if (!cedula) {
  setMostrarErrorCedula(true);
  return;
}
setMostrarErrorCedula(false);
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
// 🧩 Verificar cupo antes de registrar
if (modalidad.includes("Plan 2")) {
  const hayCupo = await verificarCupoPlan2();
  if (!hayCupo) {
    setMensaje({
      tipo: "error",
      texto: "❌ El Plan 2 (todo incluido) ya alcanzó su límite de 50 participantes.",
    });
    setLoading(false);
    return;
  }
}
    // Inserta participante en Supabase
   const { data, error: insertError } = await supabase.from("participantes").insert([
  {
    cedula,
    nombre,
    apellido,
    correo,
    sexo,
    categoria,
    nacionalidad,
    otra_nacionalidad: otraNacionalidad,
    modalidad,
    tipo_participacion: tipoParticipacion,
    entidad,
    otra_entidad: otraEntidad,
    qr_code: cedula,
  }
])// 👈 Aquí guardamos el valor del QR},
      
        console.log("Resultado insert:", data);
    if (insertError) {
      console.error("Error insert Supabase:", insertError);
        }

    if (insertError) throw insertError;

        const API_URL = import.meta.env.VITE_API_URL;

 /* ===========================================================
   🚀 ENVÍO AL BACKEND EXPRESS (DESACTIVADO TEMPORALMENTE)
   ===========================================================
   Antes: este bloque enviaba los datos al servidor en DigitalOcean
   para generar y enviar el correo con el código QR.
   Ya que el backend fue eliminado, lo dejamos comentado para evitar
   errores de red ("Failed to fetch").
   Si más adelante reactivas tu backend, solo descomenta este bloque.
*/

/*
console.log("🚀 Enviando al backend:", {
  cedula,
  nombre,
  correo,
  categoria,
  modalidad,
});

const response = await fetch(`${import.meta.env.VITE_API_URL}/registro`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ cedula, nombre, correo, categoria, modalidad }),
});

if (!response.ok) {
  const errorData = await response.json();
  setMensaje({
    tipo: "error",
    texto: `❌ Error en el servidor: ${errorData.error || "desconocido"}`,
  });
  return; // salir si hubo error real del backend
}
*/

/* ===========================================================
   🧾 MODO LOCAL (SIN BACKEND)
   ===========================================================
   Aquí simulamos la respuesta exitosa para que la app siga funcionando.
   No se envía correo, pero muestra el mensaje y genera el QR localmente.
*/

console.log("🧾 Registro local de participante:", {
  cedula,
  nombre,
  correo,
  categoria,
  modalidad,
});

setMensaje({
  tipo: "success",
  texto: "✅ Participante registrado exitosamente (modo sin backend)",
});

setQrVisible(true);

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
        maxWidth: "700px",
        width: "90%",
        margin: "2rem auto",
        padding: "2rem",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        borderRadius: 12,
        backgroundColor: "#f5f5f5",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        position: "relative",
      }}
    >   {/* Botón Volver atrás */}
      <div style={{ textAlign: "left", marginBottom: "1rem" }}>
        <button
          onClick={() => navigate(-1)} // retrocede una página
          style={{
            padding: "0.6rem 1.2rem",
            backgroundColor: "#004d40",
            color: "#fff",
            fontWeight: "bold",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          ⬅ Volver atrás
        </button>
      </div>
      {/* BLOQUE DE INSTRUCCIONES */}
      <div
        style={{
          backgroundColor: "#e0f2f1",
          padding: "1.5rem",
          borderRadius: "12px",
          border: "2px solid #004d40",
          marginBottom: "2rem",
          color: "#004d40",
          lineHeight: 1.6,
        }}
      >
        <h2 style={{ textAlign: "center", fontWeight: "700", marginBottom: "1rem" }}>
          Inscripciones a CESI 2025
        </h2>
        <h3 style={{ fontWeight: "600", marginBottom: "0.5rem" }}>ORIENTACIONES GENERALES</h3>
        <p style={{ marginBottom: "0.5rem" }}>
          Agradecemos considere la información siguiente antes de formalizar su preinscripción:
        </p>
        <ol style={{ paddingLeft: "1.2rem" }}>
          <li>CESI 2025 se desarrollará del 27 al 31 de octubre de 2025.</li>
          <li>El congreso tiene un costo y las conferencias son presenciales y virtuales.</li>
          <li>Los horarios de CESI estarán distribuidos en tres bloques: Conferencias presenciales en el turno matutino, talleres para grupos seleccionados en el turno vespertino y videoconferencias en el turno nocturno.</li>
          <li>Se validará un único acceso por participante. Ningún participante podrá registrarse más de una vez.</li>
          <li>Para los participantes de la Universidad Autónoma el ingreso al congreso será mediante correo institucional (por favor validen el acceso con Microsoft 365).</li>
          <li>El programa del congreso se remitirá al correo de inscripción.</li>
          <li>Se emitirá certificado a quien cumpla con más del 70% de asistencia a las conferencias.</li>
          <li>Los certificados son digitales y se remiten al correo de inscripción.</li>
          <li>La comunicación durante las ponencias se hará a través del chat donde habrá uno o varios moderadores.</li>
          <li>A los participantes preinscritos se les remitirá el enlace para la inscripción oficial (Vía formulario Teams) al congreso.</li>
          <li>Para el cómputo de las horas es importante usar un ÚNICO correo de acceso. Si ingresa con dos correos, sólo se tomará en cuenta uno.</li>
          <li>Sólo se permitirá el ingreso al congreso de los participantes que hayan formalizado el proceso de registro.</li>
          <li>La reserva de su cupo quedará garantizada únicamente con la cancelación del plan seleccionado. 
            Las licenciadas Magela Atencio y Yulitza Vigil atenderán en la biblioteca de la Facultad para 
            la gestión de pagos de los participantes.</li>
            <li>Cuenta Banco Nacional, N°:10000338685, Cuenta Corriente, Universidad Autónoma de Chiriquí A.I.P.
              (Enviar comprobante al correo: econtinua.economia@unachi.ac.pa)
            </li>
        </ol>
      </div>

      <h2 style={{ textAlign: "center", marginBottom: 20, color: "#004d40", fontWeight: "700" }}>
        Registro de participantes CESI 2025
      
  </h2>

  {mensaje && (
    <div
     ref={mensajeRef} 
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

  <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
   {/* CÉDULA */}
<div style={{ display: "flex", flexDirection: "column", marginBottom: "1rem" }}>
  <label style={{ marginBottom: "4px", fontWeight: 700, color: "#004d40" }}>
    Ingrese su Cédula o I.D (ejemplo 4-718-888) <span style={{ color: "red" }}>*</span>
  </label>
  <input
  type="text"
  value={cedula}
  onChange={(e) => {
    const valor = e.target.value.replace(/\s+/g, ""); // quita espacios
    setCedula(valor);
    validarCedula(valor); // valida en tiempo real
  }}
  required
  placeholder="Ej: 0-000-000"
  style={{
    padding: "0.7rem",
    fontSize: 16,
    borderRadius: 6,
    border: errorCedula ? "2px solid red" : "2px solid #004d40",
    outlineColor: errorCedula ? "red" : "#1565c0",
    fontWeight: 600,
    backgroundColor: "#f5f5f5",
    color: "#004d40",
  }}
  disabled={qrVisible}
  autoComplete="off"
  ref={cedulaInputRef}
  onBlur={() => setTimeout(() => setMostrarSugerencias(false), 150)}
/>

{errorCedula && (
  <p style={{ color: "red", fontSize: "0.85rem", marginTop: "0.3rem" }}>
    {errorCedula}
  </p>
)}

  {/* Mensaje de error si cédula está vacío */}
  {!cedula && mostrarErrorCedula && (
    <p style={{ color: "red", fontSize: "0.85rem", marginTop: "4px" }}>
      ❌ Este campo es obligatorio
    </p>
  )}

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
        marginTop: "4px",
        maxHeight: "150px",
        overflowY: "auto",
      }}
    >
      {sugerencias.map((item) => (
        <li
          key={item.cedula}
          onMouseDown={(e) => {
            e.preventDefault();
            handleSeleccion(item);
            setTimeout(() => setMostrarSugerencias(false), 0);
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
</div>

 {/* NOMBRE */}
<div style={{ display: "flex", flexDirection: "column", marginBottom: "1rem" }}>
  <label style={{ marginBottom: "4px", fontWeight: 700, color: "#004d40" }}>
    Nombre <span style={{ color: "red" }}>*</span>
  </label>
  <input
    type="text"
    placeholder="Nombre"
    value={nombre}
    onChange={(e) => {
      const valor = e.target.value.replace(/[^a-zA-ZÁÉÍÓÚáéíóúñÑ\s]/g, ""); // solo letras y espacios
      setNombre(valor);
    }}
    required
    style={{
      padding: "0.7rem",
      fontSize: 16,
      borderRadius: 6,
      border: "2px solid #004d40",
      outlineColor: "#1565c0",
      fontWeight: 600,
      backgroundColor: "#f5f5f5",
      color: "#004d40",
    }}
    disabled={qrVisible}
  />
  {!nombre && (
    <p style={{ color: "red", fontSize: "0.85rem", marginTop: "0.3rem" }}>
      Ingrese su nombre
    </p>
  )}
</div>

{/* APELLIDO */}
<div style={{ display: "flex", flexDirection: "column", marginBottom: "1rem" }}>
  <label style={{ marginBottom: "4px", fontWeight: 700, color: "#004d40" }}>
    Apellido <span style={{ color: "red" }}>*</span>
  </label>
  <input
    type="text"
    placeholder="Apellido"
    value={apellido}
    onChange={(e) => {
      const valor = e.target.value.replace(/[^a-zA-ZÁÉÍÓÚáéíóúñÑ\s]/g, "");
      setApellido(valor);
    }}
    required
    style={{
      padding: "0.7rem",
      fontSize: 16,
      borderRadius: 6,
      border: "2px solid #004d40",
      outlineColor: "#1565c0",
      fontWeight: 600,
      backgroundColor: "#f5f5f5",
      color: "#004d40",
    }}
    disabled={qrVisible}
  />
  {!apellido && (
    <p style={{ color: "red", fontSize: "0.85rem", marginTop: "0.3rem" }}>
      Ingrese su apellido
    </p>
  )}
</div>

{/* CORREO ELECTRÓNICO */}
<div style={{ display: "flex", flexDirection: "column", marginBottom: "1rem" }}>
  <label style={{ marginBottom: "4px", fontWeight: 700, color: "#004d40" }}>
    Correo electrónico <span style={{ color: "red" }}>*</span>
  </label>
  <input
    type="email"
    placeholder="ejemplo@unachi.ac.pa o ejemplo@gmail.com"
    value={correo}
    onChange={(e) => setCorreo(e.target.value)}
    required
    style={{
      padding: "0.7rem",
      fontSize: 16,
      borderRadius: 6,
      border: "2px solid #004d40",
      outlineColor: "#1565c0",
      fontWeight: 600,
      backgroundColor: "#f5f5f5",
      color: "#004d40",
    }}
    disabled={qrVisible}
  />
  {!correo && (
    <p style={{ color: "red", fontSize: "0.85rem", marginTop: "0.3rem" }}>
      ⚠️Verifique que su correo esté escrito completo⚠️*
    </p>
  )}
</div>


 {/* SEXO */}
<fieldset style={{ border: "none", margin: 0, padding: 0 }}>
  <legend style={{ marginBottom: "4px", fontWeight: 700, color: "#004d40" }}>
    Sexo <span style={{ color: "red" }}>*</span>
  </legend>
  <div
    style={{
      padding: "0.7rem",
      borderRadius: 6,
      border: "2px solid #004d40",
      backgroundColor: "#fff",
      display: "flex",
      gap: "12px",
    }}
  >
    <label style={{ fontWeight: 600, color: "#004d40" }}>
      <input
        type="radio"
        name="sexo"
        value="Hombre"
        required
        checked={sexo === "Hombre"}
        onChange={(e) => setSexo(e.target.value)}
        disabled={qrVisible}
      />
      Hombre
    </label>

    <label style={{ fontWeight: 600, color: "#004d40" }}>
      <input
        type="radio"
        name="sexo"
        value="Mujer"
        required
        checked={sexo === "Mujer"}
        onChange={(e) => setSexo(e.target.value)}
        disabled={qrVisible}
      />
      Mujer
    </label>
  </div>
  {!sexo && (
    <p style={{ color: "red", fontSize: "0.85rem", marginTop: "0.3rem" }}>
      Seleccione una opción
    </p>
  )}
</fieldset>

{/* NACIONALIDAD */}
<fieldset style={{ border: "none", margin: 0, padding: 0 }}>
  <legend style={{ marginBottom: "4px", fontWeight: 700, color: "#004d40" }}>
    Nacionalidad <span style={{ color: "red" }}>*</span>
  </legend>
  <div
    style={{
      padding: "0.7rem",
      borderRadius: 6,
      border: "2px solid #004d40",
      backgroundColor: "#fff",
      display: "flex",
      gap: "12px",
    }}
  >
    <label style={{ fontWeight: 600, color: "#004d40" }}>
      <input
        type="radio"
        name="nacionalidad"
        value="Panameña"
        required
        checked={nacionalidad === "Panameña"}
        onChange={(e) => setNacionalidad(e.target.value)}
        disabled={qrVisible}
      />
      Panameña
    </label>

    <label style={{ fontWeight: 600, color: "#004d40" }}>
      <input
        type="radio"
        name="nacionalidad"
        value="Otra"
        required
        checked={nacionalidad === "Otra"}
        onChange={(e) => setNacionalidad(e.target.value)}
        disabled={qrVisible}
      />
      Otra
    </label>
  </div>
  {!nacionalidad && (
    <p style={{ color: "red", fontSize: "0.85rem", marginTop: "0.3rem" }}>
      Seleccione una opción
    </p>
  )}
  {nacionalidad === "Otra" && (
    <input
      type="text"
      placeholder="Indique su nacionalidad"
      value={otraNacionalidad}
      onChange={(e) => setOtraNacionalidad(e.target.value)}
      disabled={qrVisible}
      required
      style={{
        padding: "0.7rem",
        fontSize: 16,
        borderRadius: 6,
        border: "2px solid #004d40",
        outlineColor: "#1565c0",
        fontWeight: 600,
        backgroundColor: "#f5f5f5",
        color: "#004d40",
        marginTop: "0.5rem",
      }}
    />
  )}
</fieldset>

{/* CATEGORÍA */}
<fieldset style={{ border: "none", margin: 0, padding: 0 }}>
  <legend style={{ marginBottom: "4px", fontWeight: 700, color: "#004d40" }}>
    Categoría <span style={{ color: "red" }}>*</span>
  </legend>
  <div
    style={{
      padding: "0.7rem",
      borderRadius: 6,
      border: "2px solid #004d40",
      backgroundColor: "#fff",
      display: "flex",
      flexDirection: "column",
      gap: "6px",
    }}
  >
    {["Estudiante", "Docente", "Funcionario", "Invitado", "Egresado"].map((cat, i) => (
      <label key={cat} style={{ fontWeight: 600, color: "#004d40" }}>
        <input
          type="radio"
          name="categoria"
          value={cat}
          required={i === 0}
          checked={categoria === cat}
          onChange={(e) => setCategoria(e.target.value)}
          disabled={qrVisible}
        />
        {cat}
      </label>
    ))}
  </div>
  {!categoria && (
    <p style={{ color: "red", fontSize: "0.85rem", marginTop: "0.3rem" }}>
      Seleccione una opción
    </p>
  )}
</fieldset>

{/* MODALIDAD */}
<fieldset style={{ border: "none", margin: 0, padding: 0 }}>
  <legend style={{ marginBottom: "4px", fontWeight: 700, color: "#004d40" }}>
    Modalidad de participación <span style={{ color: "red" }}>*</span>
  </legend>
  <div
    style={{
      padding: "0.7rem",
      borderRadius: 6,
      border: "2px solid #004d40",
      backgroundColor: "#fff",
      display: "flex",
      flexDirection: "column",
      gap: "6px",
    }}
  >
    {[
      { value: "Estudiante-Plan 1: $15.00 (congreso presencial y virtual, talleres, refrigerios, certificados, otros)" },
      { value: "Estudiante-Plan 2: $25.00 (congreso todo incluido + cena)" },
      { value: "Administrativo: $30.00" },
      { value: "Estudiante de postgrado: $25.00" },
      { value: "Docente-Plan 1: $60.00 (TC)" },
      { value: "Docente-Plan 2: $50.00 (TM)" },
      { value: "Docente-Plan 3: $40.00 (EVE)" },
      { value: "Público en general: $50.00" }
    ].map((m, i) => (
      <label key={m.value} style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 600, color: "#004d40" }}>
        <input
          type="radio"
          name="modalidad"
          value={m.value}
          required={i === 0}
          checked={modalidad === m.value}
          onChange={async (e) => {
  const seleccion = e.target.value;
  setModalidad(seleccion);

  if (seleccion.includes("Plan 2")) {
    const hayCupo = await verificarCupoPlan2();
    if (!hayCupo) {
      setMensaje({
        tipo: "error",
        texto: "❌ El Plan 2 (todo incluido) ya alcanzó su límite de 50 participantes.",
      });
      setModalidad(""); // 👈 Desmarca la opción automáticamente
   setTimeout(() => {
        if (mensajeRef.current) {
          mensajeRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
    }  else {
      setMensaje(null); // limpia el mensaje si hay cupo
    }
  }
}}
          disabled={qrVisible}
        />
        {m.value}
      </label>
    ))}
  </div>
  {!modalidad && (
    <p style={{ color: "red", fontSize: "0.85rem", marginTop: "0.3rem" }}>
      Seleccione una opción
    </p>
  )}
</fieldset>

{/* TIPO DE PARTICIPANTE */}
<fieldset style={{ border: "none", margin: 0, padding: 0 }}>
  <legend style={{ marginBottom: "4px", fontWeight: 700, color: "#004d40" }}>
    Tipo de participante <span style={{ color: "red" }}>*</span>
  </legend>
  <div
    style={{
      padding: "0.7rem",
      borderRadius: 6,
      border: "2px solid #004d40",
      backgroundColor: "#fff",
      display: "flex",
      flexDirection: "column",
      gap: "6px",
    }}
  >
    {["Interno", "Externo"].map((tipo, i) => (
      <label key={tipo} style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 600, color: "#004d40" }}>
        <input
          type="radio"
          name="tipoParticipacion"
          value={tipo}
          required={i === 0}
          checked={tipoParticipacion === tipo}
          onChange={(e) => setTipoParticipacion(e.target.value)}
          disabled={qrVisible}
        />
        {tipo === "Interno" ? "Interno a la universidad" : "Externo a la universidad"}
      </label>
    ))}
  </div>
  {!tipoParticipacion && (
    <p style={{ color: "red", fontSize: "0.85rem", marginTop: "0.3rem" }}>
      Seleccione una opción
    </p>
  )}
</fieldset>

{/* ENTIDAD (solo si es EXTERNO) */}
{tipoParticipacion === "Externo" && (
  <fieldset style={{ border: "none", margin: 0, padding: 0 }}>
    <legend style={{ marginBottom: "4px", fontWeight: 700, color: "#004d40" }}>
      Entidad <span style={{ color: "red" }}>*</span>
    </legend>
    <div
      style={{
        padding: "0.7rem",
        borderRadius: 6,
        border: "2px solid #004d40",
        backgroundColor: "#fff",
        display: "flex",
        flexDirection: "column",
        gap: "6px",
      }}
    >
      {["CEP", "PROGREZANDO", "Otra"].map((ent, i) => (
        <label key={ent} style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 600, color: "#004d40" }}>
          <input
            type="radio"
            name="entidad"
            value={ent}
            required={i === 0}
            checked={entidad === ent}
            onChange={(e) => setEntidad(e.target.value)}
            disabled={qrVisible}
          />
          {ent === "CEP"
            ? "Colegio de Economista de Panamá (CEP)"
            : ent === "PROGREZANDO"
            ? "PROGREZANDO"
            : "Otra"}
        </label>
      ))}
    </div>
    {!entidad && (
      <p style={{ color: "red", fontSize: "0.85rem", marginTop: "0.3rem" }}>
        Seleccione una opción
      </p>
    )}
    {entidad === "Otra" && (
      <input
        type="text"
        placeholder="Indique la entidad"
        value={otraEntidad}
        onChange={(e) => setOtraEntidad(e.target.value)}
        disabled={qrVisible}
        required
        style={{
          padding: "0.7rem",
          fontSize: 16,
          borderRadius: 6,
          border: "2px solid #004d40",
          outlineColor: "#1565c0",
          fontWeight: 600,
          backgroundColor: "#f5f5f5",
          color: "#004d40",
          marginTop: "0.5rem",
        }}
      />
    )}
  </fieldset>
)}


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
         📨 ¡Correo de confirmación enviado!<br /><br />
         ⚠️ Si no lo ves, revisa también el <u>correo no deseado o SPAM</u>.
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