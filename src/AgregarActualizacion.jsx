import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";


function AdminActualizaciones() {
  const navigate = useNavigate();

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

 const subirImagen = async (file) => {
  if (!file) return null;
  
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = fileName;

    setLoading(true);

    const { error: uploadError } = await supabase.storage
      .from("imagenes")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    setLoading(false);

    if (uploadError) {
      setError("Error al subir la imagen");
      return null;
    }

    const { data } = supabase.storage.from("imagenes").getPublicUrl(filePath);

    return data.publicUrl;
  };

  // Cargar todas las actualizaciones
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

  // Comenzar a editar una actualización existente
  const comenzarEdicion = (actualizacion) => {
    setEditandoId(actualizacion.id);
    setFormData({
      titulo: actualizacion.titulo,
      contenido: actualizacion.contenido || "",
      imagen_url: actualizacion.imagen_url || "",
      fecha: actualizacion.fecha.slice(0, 10),
    });
    setError(null);
  };

  // Cancelar edición y limpiar formulario
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

  // Manejar cambio de archivo e iniciar subida
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const url = await subirImagen(file);
    if (url) {
      setFormData((prev) => ({ ...prev, imagen_url: url }));
      setError(null);
    }
  };

  // Guardar o actualizar la actualización
  const guardarActualizacion = async () => {
    if (!formData.titulo.trim()) return setError("El título es obligatorio");
    if (!formData.contenido.trim()) return setError("El contenido es obligatorio");
    if (!formData.fecha) return setError("La fecha es obligatoria");

    setLoading(true);
    setError(null);

    const datosAGuardar = {
      titulo: formData.titulo.trim(),
      contenido: formData.contenido.trim(),
      imagen_url: formData.imagen_url.trim(),
      fecha: formData.fecha,
    };

    let error;

    if (editandoId) {
      const { error: err } = await supabase
        .from("actualizaciones")
        .update(datosAGuardar)
        .eq("id", editandoId);
      error = err;
    } else {
      const { error: err } = await supabase.from("actualizaciones").insert([datosAGuardar]);
      error = err;
    }

    setLoading(false);

    if (error) setError("Error guardando actualización");
    else {
      cancelarEdicion();
      cargarActualizaciones();
    }
  };

  // Eliminar actualización
  const eliminarActualizacion = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta actualización?")) return;
    setLoading(true);
    const { error } = await supabase.from("actualizaciones").delete().eq("id", id);
    setLoading(false);
    if (error) setError("Error eliminando actualización");
    else cargarActualizaciones();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#121212",
        color: "#fff",
        padding: "2rem",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: 800, margin: "auto" }}>
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
          <div
            style={{
              backgroundColor: "#ffcccc",
              color: "#a30000",
              padding: "1rem",
              borderRadius: "8px",
              marginBottom: "1rem",
            }}
          >
            {error}
          </div>
        )}

        <div
          style={{
            backgroundColor: "#1e1e1e",
            padding: "1.5rem",
            borderRadius: "10px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            marginBottom: "2rem",
          }}
        >
          <label>
            Título:<br />
            <input
              type="text"
              value={formData.titulo}
              onChange={(e) => {
                setFormData({ ...formData, titulo: e.target.value });
                setError(null);
              }}
              style={inputStyle}
              disabled={loading}
            />
          </label>

          <label>
            Contenido:<br />
            <textarea
              value={formData.contenido}
              onChange={(e) => {
                setFormData({ ...formData, contenido: e.target.value });
                setError(null);
              }}
              rows={4}
              style={inputStyle}
              disabled={loading}
            />
          </label>

          <label>
            Imagen (opcional):<br />
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={loading}
              style={{ marginBottom: "0.5rem" }}
            />
            {formData.imagen_url && (
              <img
                src={formData.imagen_url}
                alt="Previsualización"
                style={{ maxWidth: "150px", borderRadius: "8px", display: "block" }}
              />
            )}
          </label>

          <label>
          <br/> Fecha:<br/>
            <input
              type="date"
              value={formData.fecha}
              onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
              style={inputStyle}
              disabled={loading}
            />
          </label>

          <div style={{ marginTop: "1rem" }}>
            <button onClick={guardarActualizacion} disabled={loading} style={buttonGreen}>
              {editandoId ? "Actualizar" : "Crear"} Actualización
            </button>
            {editandoId && (
              <button onClick={cancelarEdicion} disabled={loading} style={buttonGray}>
                Cancelar
              </button>
            )}
          </div>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#00796b", color: "white" }}>
              <th style={thStyle}>Título</th>
              <th style={thStyle}>Fecha</th>
              <th style={thStyle}>Imagen</th>
              <th style={thStyle}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {actualizaciones.map(({ id, titulo, fecha, imagen_url }) => (
              <tr key={id} style={{ borderBottom: "1px solid #444" }}>
                <td style={tdStyle}>{titulo}</td>
                <td style={tdStyle}>{new Date(fecha).toLocaleDateString()}</td>
                <td style={tdStyle}>
                  {imagen_url ? (
                    <a href={imagen_url} target="_blank" rel="noopener noreferrer">
                      <img
                        src={imagen_url}
                        alt="miniatura"
                        style={{ width: "80px", height: "auto", borderRadius: "4px" }}
                      />
                    </a>
                  ) : (
                    <span style={{ color: "#aaa" }}>Sin imagen</span>
                  )}
                </td>
                <td style={tdStyle}>
                  <button
                    onClick={() =>
                      comenzarEdicion(actualizaciones.find((a) => a.id === id))
                    }
                    style={buttonGreenSmall}
                    disabled={loading}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => eliminarActualizacion(id)}
                    style={buttonRedSmall}
                    disabled={loading}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {actualizaciones.length === 0 && !loading && (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", padding: "1rem", color: "#aaa" }}>
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
  fontWeight: "bold",
};

const tdStyle = {
  padding: "0.8rem",
  color: "#eee",
};

const buttonGreen = {
  backgroundColor: "#00bfa5",
  color: "#fff",
  padding: "0.6rem 1.2rem",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  marginRight: "1rem",
  fontWeight: "bold",
};

const buttonGray = {
  backgroundColor: "#888",
  color: "#fff",
  padding: "0.6rem 1.2rem",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "bold",
};

const buttonGreenSmall = {
  backgroundColor: "#28a745",
  color: "#fff",
  padding: "0.4rem 0.8rem",
  border: "none",
  borderRadius: "4px",
  marginRight: "0.5rem",
  cursor: "pointer",
};

const buttonRedSmall = {
  backgroundColor: "#d9534f",
  color: "#fff",
  padding: "0.4rem 0.8rem",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};

export default AdminActualizaciones;
