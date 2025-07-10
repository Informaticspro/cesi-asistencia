import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { Link } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";

function AdminParticipantes() {
  const [participantes, setParticipantes] = useState([]);
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState({ nombre: "", apellido: "", cedula: "", correo: "" });
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [busqueda, setBusqueda] = useState("");

  const cargarParticipantes = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("participantes").select("*");
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
    });
    setMensaje(null);
  };

  const cancelarEdicion = () => {
    setEditando(null);
    setMensaje(null);
  };

  const guardarCambios = async () => {
    if (!formData.nombre.trim()) return setMensaje({ tipo: "error", texto: "El nombre no puede estar vacío" });
    if (!formData.apellido.trim()) return setMensaje({ tipo: "error", texto: "El apellido no puede estar vacío" });
    if (!formData.cedula.trim()) return setMensaje({ tipo: "error", texto: "La cédula no puede estar vacía" });
    if (!formData.correo.trim()) return setMensaje({ tipo: "error", texto: "El correo no puede estar vacío" });
    if (!validarEmail(formData.correo)) return setMensaje({ tipo: "error", texto: "El correo no tiene un formato válido" });

    setLoading(true);
    const { error } = await supabase
      .from("participantes")
      .update({
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        cedula: formData.cedula.trim(),
        correo: formData.correo.trim(),
        qr_code: formData.cedula.trim(), // Guardamos solo la cédula para QR dinámico
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
      p.correo?.toLowerCase().includes(termino)
    );
  });

  return (
    <div style={{ maxWidth: 700, margin: "auto", padding: "1rem" }}>
      <h2>Administrar Participantes</h2>
      <Link to="/">← Volver al inicio</Link>

      <input
        type="text"
        placeholder="Buscar por nombre, apellido, cédula o correo..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        style={{
          width: "100%",
          padding: "0.5rem",
          margin: "1rem 0",
          fontSize: "16px",
          borderRadius: "6px",
          border: "1px solid #ccc",
        }}
      />

      {mensaje && (
        <div
          style={{
            margin: "1rem 0",
            padding: "0.5rem 1rem",
            color: mensaje.tipo === "error" ? "white" : "green",
            backgroundColor: mensaje.tipo === "error" ? "#d9534f" : "#5cb85c",
            borderRadius: 4,
          }}
        >
          {mensaje.texto}
        </div>
      )}

      {loading && <p>Cargando...</p>}

      <table border="1" cellPadding="8" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#004d40", color: "white" }}>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Cédula</th>
            <th>Correo</th>
            <th>QR Code</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {participantesFiltrados.map((p) => (
            <tr key={p.cedula}>
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
                      backgroundColor: "#eee",
                      userSelect: "none",
                      color: "#555",
                      padding: "2px 4px",
                      display: "inline-block",
                      borderRadius: 2,
                    }}
                  >
                    {p.cedula}
                  </span>
                )}
              </td>
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
              <td style={{ textAlign: "center" }}>
                {/* Generar QR dinámicamente con valor de p.qr_code (que es la cédula) */}
                {p.qr_code ? (
                  <QRCodeCanvas
                    value={p.qr_code}
                    size={64}
                    bgColor="#fff"
                    fgColor="#004d40"
                    level="H"
                    includeMargin={false}
                  />
                ) : (
                  "No disponible"
                )}
              </td>
              <td>
                {editando === p.cedula ? (
                  <>
                    <button onClick={guardarCambios} disabled={loading}>
                      Guardar
                    </button>
                    <button onClick={cancelarEdicion} disabled={loading} style={{ marginLeft: "0.5rem" }}>
                      Cancelar
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => comenzarEdicion(p)} disabled={loading}>
                      Editar
                    </button>
                    <button onClick={() => eliminarParticipante(p.cedula)} disabled={loading} style={{ marginLeft: "0.5rem" }}>
                      Eliminar
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
          {participantesFiltrados.length === 0 && !loading && (
            <tr>
              <td colSpan="6" style={{ textAlign: "center", padding: "1rem" }}>
                No se encontraron participantes.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default AdminParticipantes;