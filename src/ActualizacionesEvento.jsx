import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { useNavigate } from "react-router-dom";

function ActualizacionesEvento({ mostrarTodas = false }) {
  const [actualizaciones, setActualizaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchActualizaciones() {
      setLoading(true);

      let query = supabase.from("actualizaciones").select("*");

      if (mostrarTodas) {
        // 🔹 Muestra todas las noticias ordenadas por fecha
        query = query.order("fecha", { ascending: false });
      } else {
        // 🔹 Solo las que tengan posición definida (1 o 2)
        query = query
          .in("posicion", [1, 2])
          .order("posicion", { ascending: true });
      }

      const { data, error } = await query;

      if (error) {
        setError("Error al cargar actualizaciones");
        console.error("Error Supabase:", error);
      } else {
        setActualizaciones(data || []);
      }
      setLoading(false);
    }

    fetchActualizaciones();
  }, [mostrarTodas]);

  if (loading)
    return (
      <p style={{ color: "#aaa", textAlign: "center", marginTop: "1rem" }}>
        Cargando actualizaciones...
      </p>
    );

  if (error)
    return (
      <p style={{ color: "red", textAlign: "center", marginTop: "1rem" }}>
        {error}
      </p>
    );

  if (actualizaciones.length === 0)
    return (
      <p style={{ color: "#ccc", textAlign: "center", marginTop: "1rem" }}>
        No hay actualizaciones disponibles.
      </p>
    );

  return (
    <div style={{ padding: "1rem" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "1rem",
        }}
      >
        {actualizaciones.map(({ id, titulo, contenido, imagen_url, fecha }, index) => (
          <div
            key={id}
            style={{
              backgroundColor: "#2e2e2e",
              borderRadius: "10px",
              padding: "1rem",
              boxShadow: "0 4px 10px rgba(0,0,0,0.5)",
              color: "#f1f1f1",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              animation: "fadeInUp 0.5s ease forwards",
              opacity: 0,
              animationDelay: `${index * 0.2}s`,
            }}
          >
            <div>
              <h3 style={{ marginBottom: "0.25rem", color: "#28a745" }}>
                {titulo}
              </h3>
              <small style={{ color: "#999" }}>
                {new Date(fecha).toLocaleDateString()}
              </small>

              {imagen_url && (
                <img
                  src={imagen_url}
                  alt={titulo}
                  style={{
                    width: "100%",
                    height: "auto",
                    marginTop: "0.75rem",
                    borderRadius: "8px",
                  }}
                />
              )}

              <p
                style={{
                  marginTop: "0.75rem",
                  fontSize: "0.95rem",
                  lineHeight: "1.6",
                  color: "#ddd",
                }}
              >
                {contenido}
              </p>
            </div>
          </div>
        ))}
      </div>



      <style>{`
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default ActualizacionesEvento;
