import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { Link } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

/* ========== Exportar a Excel ========== */
export async function exportarParticipantesExcel() {
  const { data, error } = await supabase.from("participantes").select("*");

  if (error) {
    alert("Error al obtener los datos.");
    return;
  }

  const datos = data.map((p) => ({
    Cédula: p.cedula,
    Nombre: p.nombre,
    Apellido: p.apellido || "",
    Correo: p.correo,
    "Correo P.": p.correop || "",
    Sexo: p.sexo,
    Categoría: p.categoria,
    Nacionalidad: p.nacionalidad || "",
    "Otra Nacionalidad": p.otra_nacionalidad || "",
    Modalidad: p.modalidad || "",
    "Tipo Participación": p.tipo_participacion || "",
    Entidad: p.entidad || "",
    "Otra Entidad": p.otra_entidad || "",
    "Código QR": p.qr_code || "",
  }));

  const hoja = XLSX.utils.json_to_sheet(datos);

  // Ancho automático de columnas
  const anchos = Object.keys(datos[0] || {}).map((key) => {
    const maxLongitud = Math.max(
      key.length,
      ...datos.map((fila) => (fila[key] ? fila[key].toString().length : 0))
    );
    return { wch: maxLongitud + 2 };
  });
  hoja["!cols"] = anchos;

  // Estilo de encabezados
  const encabezados = Object.keys(datos[0] || {});
  encabezados.forEach((_, i) => {
    const celda = hoja[XLSX.utils.encode_cell({ r: 0, c: i })];
    if (celda && typeof celda === "object") {
      celda.s = {
        fill: { fgColor: { rgb: "FFD966" } },
        font: { bold: true, color: { rgb: "000000" } },
        alignment: { horizontal: "center", vertical: "center" },
      };
    }
  });

  const libro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libro, hoja, "Participantes");

  const arrayBuffer = XLSX.write(libro, {
    bookType: "xlsx",
    type: "array",
    cellStyles: true,
  });
  const blob = new Blob([arrayBuffer], { type: "application/octet-stream" });

  saveAs(blob, "participantes.xlsx");
}

/* ========== Componente ========== */
function AdminParticipantes() {
  const [participantes, setParticipantes] = useState([]);
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    cedula: "",
    correo: "",
    sexo: "Hombre",
    categoria: "Estudiante",
    correop: "",
    nacionalidad: "",
    otraNacionalidad: "",
    modalidad: "",
    tipoParticipacion: "",
    entidad: "",
    otraEntidad: "",
  });
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [busqueda, setBusqueda] = useState("");

  const boton = (color) => ({
    marginRight: "4px",
    padding: "6px 12px",
    backgroundColor:
      color === "green"
        ? "#28a745"
        : color === "red"
        ? "#dc3545"
        : color === "gray"
        ? "#6c757d"
        : "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "0.85rem",
  });

  const cargarParticipantes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("participantes")
      .select("*")
      .order("nombre", { ascending: true });
    setLoading(false);
    if (error) {
      setMensaje({ tipo: "error", texto: "Error cargando participantes" });
    } else {
      setParticipantes(data);
      setMensaje(null);
    }
  };

  useEffect(() => {
    cargarParticipantes();
  }, []);

  const validarEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const eliminarParticipante = async (cedula) => {
    if (!confirm("¿Seguro que deseas eliminar este participante?")) return;
    setLoading(true);
    const { error } = await supabase.from("participantes").delete().eq("cedula", cedula);
    setLoading(false);
    if (error) {
      setMensaje({ tipo: "error", texto: "❌ Error al eliminar participante" });
    } else {
      setMensaje({ tipo: "success", texto: "Participante eliminado correctamente" });
      cargarParticipantes();
    }
  };

  const comenzarEdicion = (p) => {
    setEditando(p.cedula);
    setFormData({
      nombre: p.nombre,
      apellido: p.apellido || "",
      cedula: p.cedula,
      correo: p.correo,
      sexo: p.sexo || "Hombre",
      categoria: p.categoria || "Estudiante",
      correop: p.correop || "",
      nacionalidad: p.nacionalidad || "",
      otraNacionalidad: p.otra_nacionalidad || "",
      modalidad: p.modalidad || "",
      tipoParticipacion: p.tipo_participacion || "",
      entidad: p.entidad || "",
      otraEntidad: p.otra_entidad || "",
    });
    setMensaje(null);
  };

  const cancelarEdicion = () => {
    setEditando(null);
    setMensaje(null);
  };

  const guardarCambios = async () => {
    if (!formData.nombre.trim())
      return setMensaje({ tipo: "error", texto: "El nombre no puede estar vacío" });
    if (!formData.apellido.trim())
      return setMensaje({ tipo: "error", texto: "El apellido no puede estar vacío" });
    if (!formData.cedula.trim())
      return setMensaje({ tipo: "error", texto: "La cédula no puede estar vacía" });
    if (!formData.correo.trim())
      return setMensaje({ tipo: "error", texto: "El correo no puede estar vacío" });
    if (!validarEmail(formData.correo))
      return setMensaje({ tipo: "error", texto: "El correo no tiene un formato válido" });
    if (!["Hombre", "Mujer"].includes(formData.sexo))
      return setMensaje({ tipo: "error", texto: "Sexo inválido" });
    if (
      !["Estudiante", "Docente", "Funcionario", "Invitado", "Egresado"].includes(
        formData.categoria
      )
    )
      return setMensaje({ tipo: "error", texto: "Categoría inválida" });

    setLoading(true);
    const { error } = await supabase
      .from("participantes")
      .update({
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        cedula: formData.cedula.trim(),
        correo: formData.correo.trim(),
        sexo: formData.sexo,
        categoria: formData.categoria,
        correop: formData.correop.trim(),
        nacionalidad: formData.nacionalidad.trim(),
        otra_nacionalidad: formData.otraNacionalidad.trim(),
        modalidad: formData.modalidad.trim(),
        tipo_participacion: formData.tipoParticipacion.trim(),
        entidad: formData.entidad.trim(),
        otra_entidad: formData.otraEntidad.trim(),
        qr_code: formData.cedula.trim(),
      })
      .eq("cedula", editando);

    setLoading(false);

    if (error) {
      setMensaje({ tipo: "error", texto: "❌ Error al actualizar participante" });
    } else {
      setMensaje({ tipo: "success", texto: "Participante actualizado correctamente" });
      setEditando(null);
      cargarParticipantes();
    }
  };

  const participantesFiltrados = participantes.filter((p) => {
    const termino = busqueda.toLowerCase();
    return (
      p.nombre?.toLowerCase().includes(termino) ||
      p.apellido?.toLowerCase().includes(termino) ||
      p.cedula?.toLowerCase().includes(termino) ||
      p.correo?.toLowerCase().includes(termino) ||
      p.sexo?.toLowerCase().includes(termino) ||
      p.correop?.toLowerCase().includes(termino) ||
      p.nacionalidad?.toLowerCase().includes(termino) ||
      p.otra_nacionalidad?.toLowerCase().includes(termino) ||
      p.modalidad?.toLowerCase().includes(termino) ||
      p.tipo_participacion?.toLowerCase().includes(termino) ||
      p.entidad?.toLowerCase().includes(termino) ||
      p.otra_entidad?.toLowerCase().includes(termino)
    );
  });

  return (
    <div
      style={{
        maxWidth: 900,
        width: "95vw",
        margin: "2rem auto",
        padding: "1rem",
        backgroundColor: "#1f1f1f",
        color: "#fff",
        borderRadius: "10px",
        boxShadow: "0 0 10px rgba(0,0,0,0.5)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "0.5rem" }}>
        Administrar Participantes
      </h2>

      <button
        onClick={exportarParticipantesExcel}
        style={{
          marginTop: "1rem",
          padding: "0.8rem 1.2rem",
          background: "#00c6ff",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          fontWeight: "bold",
          cursor: "pointer",
          boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
        }}
      >
        Descargar Excel de Participantes
      </button>

      <Link
        to="/"
        style={{ marginBottom: "1rem", color: "#00bcd4", textDecoration: "none" }}
      >
        ← Volver al inicio
      </Link>

      {/* Búsqueda */}
      <input
        type="text"
        placeholder="Buscar por nombre, apellido, cédula, correo, sexo o categoría..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        style={{
          width: "100%",
          padding: "0.7rem",
          fontSize: "16px",
          borderRadius: "6px",
          border: "1px solid #ccc",
          marginBottom: "1rem",
        }}
      />

    {/* 🔢 Contador (siempre visible) */}
<div
  style={{
    marginBottom: "1rem",
    color: "#fff",
    fontWeight: "bold",
    textAlign: "left",
    width: "100%",
  }}
>
  Mostrando {participantesFiltrados.length} de {participantes.length} registros &nbsp; | &nbsp;
  <span style={{ color: "#4caf50" }}>
    Estudiantes: {participantesFiltrados.filter(p => p.categoria === "Estudiante").length}
  </span>{" "}
  |{" "}
  <span style={{ color: "#2196f3" }}>
    Docentes: {participantesFiltrados.filter(p => p.categoria === "Docente").length}
  </span>{" "}
  |{" "}
  <span style={{ color: "#ff9800" }}>
    Funcionarios: {participantesFiltrados.filter(p => p.categoria === "Funcionario").length}
  </span>{" "}
  |{" "}
  <span style={{ color: "#9c27b0" }}>
    Invitados: {participantesFiltrados.filter(p => p.categoria === "Invitado").length}
  </span>
</div>

{mensaje && (
  <div
    style={{
      margin: "1rem 0",
      padding: "0.7rem 1rem",
      color: "#fff",
      backgroundColor: mensaje.tipo === "error" ? "#c0392b" : "#27ae60",
      borderRadius: 4,
      width: "100%",
      textAlign: "center",
    }}
  >
    {mensaje.texto}
  </div>
)}
      {loading && <p style={{ color: "#aaa" }}>Cargando...</p>}

      {/* Tabla */}
      <div
        style={{
          maxHeight: 480,
          overflowY: "auto",
          border: "1px solid #444",
          overflowX: "auto",
          borderRadius: 6,
          boxShadow: "0 0 5px rgba(0,0,0,0.3)",
          border: "1px solid #19af21ff", // borde externo
          width: "100%",
        }}
      >
        <table
          cellPadding="8"
          style={{
            width: "100%",
            borderCollapse: "collapse",
            backgroundColor: "#2b2b2b",
            color: "#fff",
            fontSize: "14px",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#004d40", borderBottom: "1px solid  #19af21ff",
               position: "sticky",  top: 0, zIndex: 2
             }}> 
              <th>Nombre</th>
              <th>Apellido</th>
              <th>Cédula</th>
              <th>Correo</th>
              <th>Sexo</th>
              <th>Categoría</th>
              <th>Correo P.</th>
              <th>Nacionalidad</th>
              <th>Otra Nacionalidad</th>
              <th>Modalidad</th>
              <th>Tipo Participación</th>
              <th>Entidad</th>
              <th>Otra Entidad</th>
              <th>QR Code</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {participantesFiltrados.map((p) => (
              <tr key={p.cedula}>
                {/* Nombre */}
                <td style={{
    borderBottom: "1px solid #0cbe39ff",
    padding: "8px",
  }}>
                  {editando === p.cedula ? (
                    <input
                      value={formData.nombre}
                      onChange={(e) =>
                        setFormData({ ...formData, nombre: e.target.value })
                      }
                      disabled={loading}
                    />
                  ) : (
                    p.nombre
                  )}
                </td>

                {/* Apellido */}
                <td style={{
    borderBottom: "1px solid #0cbe39ff",
    padding: "8px",
  }}>
                  {editando === p.cedula ? (
                    <input
                      value={formData.apellido}
                      onChange={(e) =>
                        setFormData({ ...formData, apellido: e.target.value })
                      }
                      disabled={loading}
                    />
                  ) : (
                    p.apellido || ""
                  )}
                </td>

                {/* Cédula */}
                <td style={{
    borderBottom: "1px solid #0cbe39ff",
    padding: "8px",
  }}>
                  {editando === p.cedula ? (
                    <input
                      value={formData.cedula}
                      onChange={(e) =>
                        setFormData({ ...formData, cedula: e.target.value })
                      }
                      disabled={loading}
                    />
                  ) : (
                    <span
                      style={{
                        fontWeight: "bold",
                        backgroundColor: "#444",
                        padding: "3px 6px",
                        borderRadius: 4,
                        display: "inline-block",
                      }}
                    >
                      {p.cedula}
                    </span>
                  )}
                </td>

                {/* Correo */}
                <td style={{
    borderBottom: "1px solid #0cbe39ff",
    padding: "8px",
  }}>
                  {editando === p.cedula ? (
                    <input
                      value={formData.correo}
                      onChange={(e) =>
                        setFormData({ ...formData, correo: e.target.value })
                      }
                      disabled={loading}
                    />
                  ) : (
                    p.correo
                  )}
                </td>

                {/* Sexo */}
                <td style={{
    borderBottom: "1px solid #0cbe39ff",
    padding: "8px",
  }}>
                  {editando === p.cedula ? (
                    <select
                      value={formData.sexo}
                      onChange={(e) =>
                        setFormData({ ...formData, sexo: e.target.value })
                      }
                      disabled={loading}
                    >
                      <option value="Hombre">Hombre</option>
                      <option value="Mujer">Mujer</option>
                    </select>
                  ) : (
                    p.sexo
                  )}
                </td>

                {/* Categoría */}
                <td style={{
    borderBottom: "1px solid #0cbe39ff",
    padding: "8px",
  }}>
                  {editando === p.cedula ? (
                    <select
                      value={formData.categoria}
                      onChange={(e) =>
                        setFormData({ ...formData, categoria: e.target.value })
                      }
                      disabled={loading}
                    >
                      <option value="Estudiante">Estudiante</option>
                      <option value="Docente">Docente</option>
                      <option value="Funcionario">Funcionario</option>
                      <option value="Invitado">Invitado</option>
                      <option value="Egresado">Egresado</option>
                    </select>
                  ) : (
                    p.categoria
                  )}
                </td>

                {/* Correo P. */}
                <td style={{
    borderBottom: "1px solid #0cbe39ff",
    padding: "8px",
  }}>
                  {editando === p.cedula ? (
                    <input
                      value={formData.correop}
                      onChange={(e) =>
                        setFormData({ ...formData, correop: e.target.value })
                      }
                      disabled={loading}
                    />
                  ) : (
                    p.correop || ""
                  )}
                </td>

                {/* Nacionalidad */}
                <td style={{
    borderBottom: "1px solid #0cbe39ff",
    padding: "8px",
  }}>
                  {editando === p.cedula ? (
                    <input
                      value={formData.nacionalidad}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          nacionalidad: e.target.value,
                        })
                      }
                      disabled={loading}
                    />
                  ) : (
                    p.nacionalidad || ""
                  )}
                </td>

                {/* Otra Nacionalidad */}
                <td style={{
    borderBottom: "1px solid #0cbe39ff",
    padding: "8px",
  }}>
                  {editando === p.cedula ? (
                    <input
                      value={formData.otraNacionalidad}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          otraNacionalidad: e.target.value,
                        })
                      }
                      disabled={loading}
                    />
                  ) : (
                    p.otra_nacionalidad || ""
                  )}
                </td>

                {/* Modalidad */}
                <td style={{
    borderBottom: "1px solid #0cbe39ff",
    padding: "8px",
  }}>
                  {editando === p.cedula ? (
                    <input
                      value={formData.modalidad}
                      onChange={(e) =>
                        setFormData({ ...formData, modalidad: e.target.value })
                      }
                      disabled={loading}
                    />
                  ) : (
                    p.modalidad || ""
                  )}
                </td>

                {/* Tipo Participación */}
                <td style={{
    borderBottom: "1px solid #0cbe39ff",
    padding: "8px",
  }}>
                  {editando === p.cedula ? (
                    <input
                      value={formData.tipoParticipacion}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          tipoParticipacion: e.target.value,
                        })
                      }
                      disabled={loading}
                    />
                  ) : (
                    p.tipo_participacion || ""
                  )}
                </td>

                {/* Entidad */}
                <td style={{
    borderBottom: "1px solid #0cbe39ff",
    padding: "8px",
  }}>
                  {editando === p.cedula ? (
                    <input
                      value={formData.entidad}
                      onChange={(e) =>
                        setFormData({ ...formData, entidad: e.target.value })
                      }
                      disabled={loading}
                    />
                  ) : (
                    p.entidad || ""
                  )}
                </td>

                {/* Otra Entidad */}
                <td style={{
    borderBottom: "1px solid #0cbe39ff",
    padding: "8px",
  }}>
                  {editando === p.cedula ? (
                    <input
                      value={formData.otraEntidad}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          otraEntidad: e.target.value,
                        })
                      }
                      disabled={loading}
                    />
                  ) : (
                    p.otra_entidad || ""
                  )}
                </td>

                {/* QR */}
                <td style={{ textAlign: "center", backgroundColor: "#fff", borderBottom: "1px solid #333",
    padding: "8px" }}>
                  {p.qr_code ? (
                    <QRCodeCanvas
                      value={p.qr_code}
                      size={64}
                      bgColor="#fff"
                      fgColor="#000"
                      level="H"
                      includeMargin={true}
                      style={{ borderRadius: 6 }}
                    />
                  ) : (
                    "No disponible"
                  )}
                </td>

                {/* Acciones */}
<td
  style={{
    position: "sticky",
    right: 0,
    backgroundColor: "#1c1c1c",
    textAlign: "center",
    zIndex: 1,
  }}
>
  {editando === p.cedula ? (
    <>
      <button onClick={guardarCambios} disabled={loading} style={boton("green")}>
        Guardar
      </button>
      <button onClick={cancelarEdicion} disabled={loading} style={boton("gray")}>
        Cancelar
      </button>
    </>
  ) : (
    <>
      <button onClick={() => comenzarEdicion(p)} disabled={loading} style={boton("blue")}>
        Editar
      </button>
      <button onClick={() => eliminarParticipante(p.cedula)} disabled={loading} style={boton("red")}>
        Eliminar
      </button>
    </>
  )}
</td>
              </tr>
            ))}

            {participantesFiltrados.length === 0 && !loading && (
              <tr>
                <td colSpan="15" style={{ textAlign: "center", padding: "1rem" }}>
                  No se encontraron participantes.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminParticipantes;
