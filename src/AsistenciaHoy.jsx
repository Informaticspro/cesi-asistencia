import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

function AsistenciaHoy() {
  const [asistencias, setAsistencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchAsistenciasHoy() {
      setLoading(true);
      setError(null);

      const inicioDia = new Date();
      inicioDia.setHours(0, 0, 0, 0);
      const finDia = new Date();
      finDia.setHours(23, 59, 59, 999);

      const inicioIso = inicioDia.toISOString();
      const finIso = finDia.toISOString();

      const { data, error } = await supabase
        .from("asistencias")
        .select("cedula, fecha, hora, participantes(nombre, apellido, correo)")
       
        .order("fecha", { ascending: true });

      if (error) {
        setError("Error al cargar asistencias: " + error.message);
        setAsistencias([]);
      } else {
        setAsistencias(data);
      }
      setLoading(false);
    }

    fetchAsistenciasHoy();

    const interval = setInterval(fetchAsistenciasHoy, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <p>Cargando asistencias...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ color: "#fff" }}>
      <h2>Asistencias del día</h2>
      <p>Total asistentes: {asistencias.length}</p>
      <div
        style={{
          maxHeight: 200,
          overflowY: "auto",
          backgroundColor: "#222",
          borderRadius: "8px",
          padding: "0.5rem",
          boxShadow: "0 0 8px rgba(0, 255, 255, 0.3)",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #00ffff" }}>
              <th style={{ padding: "8px", textAlign: "left" }}>Cédula</th>
              <th style={{ padding: "8px", textAlign: "left" }}>Nombre</th>
              <th style={{ padding: "8px", textAlign: "left" }}>Apellido</th>
              <th style={{ padding: "8px", textAlign: "left" }}>Correo</th>
              <th style={{ padding: "8px", textAlign: "left" }}>Hora</th>
            </tr>
          </thead>
          <tbody>
            {asistencias.length === 0 && (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", padding: "12px" }}>
                  No hay registros de asistencia para hoy.
                </td>
              </tr>
            )}
            {asistencias.map(({ cedula, fecha, hora, participantes }) => (
              <tr key={`${cedula}-${fecha}-${hora}`} style={{ borderBottom: "1px solid #444" }}>
                <td style={{ padding: "8px" }}>{cedula}</td>
                <td style={{ padding: "8px" }}>{participantes?.nombre || "Sin nombre"}</td>
                <td style={{ padding: "8px" }}>{participantes?.apellido || ""}</td>
                <td style={{ padding: "8px" }}>{participantes?.correo || "Sin correo"}</td>
                <td style={{ padding: "8px" }}>{hora || "Hora no disponible"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AsistenciaHoy;