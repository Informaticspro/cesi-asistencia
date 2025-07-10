import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";

function AdminActualizaciones() {
  const navigate = useNavigate(); // ✅ Esto debe ir dentro de la función del componente

  const [actualizaciones, setActualizaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editandoId, setEditandoId] = useState(null);

  const [formData, setFormData] = useState({
    titulo: "",
    contenido: "",
    imagen_url: "",
    fecha: new Date().toISOString().slice(0, 10),
  });

  const cargarActualizaciones = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("actualizaciones")
      .select("*")
      .order("fecha", { ascending: false });
    setLoading(false);

    if (error) setError("Error cargando actualizaciones");
    else {
      setError(null);
      setActualizaciones(data);
    }
  };

  useEffect(() => {
    cargarActualizaciones();
  }, []);

  const comenzarEdicion = (actualizacion) => {
    setEditandoId(actualizacion.id);
    setFormData({
      titulo: actualizacion.titulo,
      contenido: actualizacion.contenido,
      imagen_url: actualizacion.imagen_url || "",
      fecha: actualizacion.fecha.slice(0, 10),
    });
    setError(null);
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setFormData({
      titulo: "",
      contenido: "",
      imagen_url: "",
      fecha: new Date().toISOString().slice(0, 10),
    });
    setError(null);
  };

  const guardarActualizacion = async () => {
    if (!formData.titulo.trim()) return setError("El título es obligatorio");
    if (!formData.contenido.trim()) return setError("El contenido es obligatorio");
    if (!formData.fecha) return setError("La fecha es obligatoria");

    setLoading(true);
    let error;

    if (editandoId) {
      const { error: err } = await supabase
        .from("actualizaciones")
        .update(formData)
        .eq("id", editandoId);
      error = err;
    } else {
      const { error: err } = await supabase.from("actualizaciones").insert([formData]);
      error = err;
    }

    setLoading(false);

    if (error) setError("Error guardando actualización");
    else {
      cancelarEdicion();
      cargarActualizaciones();
    }
  };

  const eliminarActualizacion = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta actualización?")) return;
    setLoading(true);
    const { error } = await supabase.from("actualizaciones").delete().eq("id", id);
    setLoading(false);
    if (error) setError("Error eliminando actualización");
    else cargarActualizaciones();
  };

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#121212",
      color: "#fff",
      padding: "2rem",
      fontFamily: "Arial, sans-serif"
    }}>
      <div style={{ maxWidth: 800, margin: "auto" }}>
        {/* ✅ Botón Volver */}
        <button
          onClick={() => navigate("/")}
          style={{
            marginBottom: "1.5rem",
            backgroundColor: "#00796b",
            color: "#fff",
            padding: "0.5rem 1rem",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          ← Volver al inicio
        </button>

        <h2 style={{ marginBottom: "1.5rem", color: "#00bfa5" }}>
          Administrar Actualizaciones del Evento
        </h2>

        {error && (
          <div style={{
            backgroundColor: "#ffcccc",
            color: "#a30000",
            padding: "1rem",
            borderRadius: "8px",
            marginBottom: "1rem"
          }}>
            {error}
          </div>
        )}

        {/* Formulario */}
        <div style={{
          backgroundColor: "#1e1e1e",
          padding: "1.5rem",
          borderRadius: "10px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          marginBottom: "2rem"
        }}>
          <label>
            Título:<br />
            <input
              type="text"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              style={inputStyle}
              disabled={loading}
            />
          </label>

          <label>
            Contenido:<br />
            <textarea
              value={formData.contenido}
              onChange={(e) => setFormData({ ...formData, contenido: e.target.value })}
              rows={4}
              style={inputStyle}
              disabled={loading}
            />
          </label>

          <label>
            Imagen URL (opcional):<br />
            <input
              type="text"
              value={formData.imagen_url}
              onChange={(e) => setFormData({ ...formData, imagen_url: e.target.value })}
              style={inputStyle}
              placeholder="https://..."
              disabled={loading}
            />
          </label>

          <label>
            Fecha:<br />
            <input
              type="date"
              value={formData.fecha}
              onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
              style={inputStyle}
              disabled={loading}
            />
          </label>

          <div style={{ marginTop: "1rem" }}>
            <button
              onClick={guardarActualizacion}
              disabled={loading}
              style={buttonGreen}
            >
              {editandoId ? "Actualizar" : "Crear"} Actualización
            </button>
            {editandoId && (
              <button
                onClick={cancelarEdicion}
                disabled={loading}
                style={buttonGray}
              >
                Cancelar
              </button>
            )}
          </div>
        </div>

        {/* Tabla de actualizaciones */}
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#00796b", color: "white" }}>
              <th style={thStyle}>Título</th>
              <th style={thStyle}>Fecha</th>
              <th style={thStyle}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {actualizaciones.map(({ id, titulo, fecha }) => (
              <tr key={id} style={{ borderBottom: "1px solid #444" }}>
                <td style={tdStyle}>{titulo}</td>
                <td style={tdStyle}>{new Date(fecha).toLocaleDateString()}</td>
                <td style={tdStyle}>
                  <button
                    onClick={() => comenzarEdicion({ id, titulo, fecha })}
                    style={buttonGreenSmall}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => eliminarActualizacion(id)}
                    style={buttonRedSmall}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {actualizaciones.length === 0 && !loading && (
              <tr>
                <td colSpan={3} style={{ textAlign: "center", padding: "1rem", color: "#aaa" }}>
                  No hay actualizaciones registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "0.6rem",
  marginBottom: "1rem",
  borderRadius: "6px",
  border: "1px solid #555",
  backgroundColor: "#222",
  color: "#fff",
};

const thStyle = {
  padding: "0.8rem",
  textAlign: "left",
  fontWeight: "bold"
};

const tdStyle = {
  padding: "0.8rem",
  color: "#eee"
};

const buttonGreen = {
  backgroundColor: "#00bfa5",
  color: "#fff",
  padding: "0.6rem 1.2rem",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  marginRight: "1rem",
  fontWeight: "bold"
};

const buttonGray = {
  backgroundColor: "#888",
  color: "#fff",
  padding: "0.6rem 1.2rem",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "bold"
};

const buttonGreenSmall = {
  backgroundColor: "#28a745",
  color: "#fff",
  padding: "0.4rem 0.8rem",
  border: "none",
  borderRadius: "4px",
  marginRight: "0.5rem",
  cursor: "pointer"
};

const buttonRedSmall = {
  backgroundColor: "#d9534f",
  color: "#fff",
  padding: "0.4rem 0.8rem",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer"
};

export default AdminActualizaciones;