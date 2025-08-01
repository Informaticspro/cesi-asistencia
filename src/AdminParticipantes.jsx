import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { Link } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";

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
    // Ordenamos por nombre ASC directamente desde Supabase
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
      p.categoria?.toLowerCase().includes(termino)
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
  <h2 style={{ textAlign: "center", marginBottom: "0.5rem" }}>Administrar Participantes</h2>

  <Link to="/" style={{ marginBottom: "1rem", color: "#00bcd4", textDecoration: "none" }}>
    ← Volver al inicio
  </Link>

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

  {mensaje && (
    <div
      style={{
        margin: "1rem 0",
        padding: "0.7rem 1rem",
        color: mensaje.tipo === "error" ? "#fff" : "#fff",
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

  <div
    style={{
      maxHeight: 480,
      overflowY: "auto",
      border: "1px solid #444",
       overflowX: "auto",  // <- Agregado scroll horizontal
      borderRadius: 6,
      boxShadow: "0 0 5px rgba(0,0,0,0.3)",
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
        <tr style={{ backgroundColor: "#004d40" }}>
          <th>Nombre</th>
          <th>Apellido</th>
          <th>Cédula</th>
          <th>Correo</th>
          <th>Sexo</th>
          <th>Categoría</th>
          <th>QR Code</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {participantesFiltrados.map((p) => (
          <tr key={p.cedula}>
            {/* Nombre */}
            <td>
              {editando === p.cedula ? (
                <input
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  disabled={loading}
                />
              ) : (
                p.nombre
              )}
            </td>

            {/* Apellido */}
            <td>
              {editando === p.cedula ? (
                <input
                  value={formData.apellido}
                  onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                  disabled={loading}
                />
              ) : (
                p.apellido || ""
              )}
            </td>

            {/* Cédula */}
            <td>
              {editando === p.cedula ? (
                <input
                  value={formData.cedula}
                  onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
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
            <td>
              {editando === p.cedula ? (
                <input
                  value={formData.correo}
                  onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                  disabled={loading}
                />
              ) : (
                p.correo
              )}
            </td>

            {/* Sexo */}
            <td>
              {editando === p.cedula ? (
                <select
                  value={formData.sexo}
                  onChange={(e) => setFormData({ ...formData, sexo: e.target.value })}
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
            <td>
              {editando === p.cedula ? (
                <select
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
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

            {/* QR */}
            <td style={{ textAlign: "center", backgroundColor: "#fff" }}>
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
            <td>
              {editando === p.cedula ? (
                <>
                  <button
                    onClick={guardarCambios}
                    disabled={loading}
                    style={boton("green")}
                  >
                    Guardar
                  </button>
                  <button
                    onClick={cancelarEdicion}
                    disabled={loading}
                    style={boton("gray")}
                  >
                    Cancelar
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => comenzarEdicion(p)}
                    disabled={loading}
                    style={boton("blue")}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => eliminarParticipante(p.cedula)}
                    disabled={loading}
                    style={boton("red")}
                  >
                    Eliminar
                  </button>
                </>
              )}
            </td>
          </tr>
        ))}
        {participantesFiltrados.length === 0 && !loading && (
          <tr>
            <td colSpan="8" style={{ textAlign: "center", padding: "1rem" }}>
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