import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

function ActualizacionesEvento() {
  const [actualizaciones, setActualizaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchActualizaciones() {
      setLoading(true);
      const { data, error } = await supabase
        .from("actualizaciones")
        .select("*")
        .order("fecha", { ascending: false });

      if (error) {
        setError("Error al cargar actualizaciones");
      } else {
        setActualizaciones(data);
      }
      setLoading(false);
    }

    fetchActualizaciones();
  }, []);

  if (loading) return <p>Cargando actualizaciones...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (actualizaciones.length === 0) return <p>No hay actualizaciones disponibles.</p>;

  return (
    <div
      style={{
        backgroundColor: "#e0f7fa",
        borderRadius: 8,
        padding: "1rem",
        marginTop: "1.5rem",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        color: "#00796b",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        textAlign: "left",
      }}
    >
      {actualizaciones.map(({ id, titulo, contenido, imagen_url, fecha }) => (
        <div key={id} style={{ marginBottom: "1.5rem" }}>
          <h3 style={{ marginBottom: "0.5rem" }}>
            🗓️ {titulo}{" "}
            <small style={{ fontSize: "0.75rem", color: "#004d40" }}>
              ({new Date(fecha).toLocaleDateString()})
            </small>
          </h3>
          {imagen_url && (
            <img
              src={imagen_url}
              alt={titulo}
              style={{ maxWidth: "100%", borderRadius: 8, marginBottom: "0.5rem" }}
            />
          )}
          <p style={{ fontSize: "0.95rem", lineHeight: "1.5" }}>{contenido}</p>
        </div>
      ))}
    </div>
  );
}

export default ActualizacionesEvento;