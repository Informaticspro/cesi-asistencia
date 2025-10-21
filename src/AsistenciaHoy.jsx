import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import * as XLSX from "xlsx";

function AsistenciaHoy({ onDataChange }) {
  const [asistencias, setAsistencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🕓 Función para ajustar la fecha al huso de Panamá
function ajustarFechaPanama(fecha) {
  if (!fecha) return "";
  // Evita la conversión errónea a UTC restando el desfase manualmente
  const partes = fecha.split("-"); // ejemplo: "2025-10-21"
  const fechaLocal = new Date(
    parseInt(partes[0]), // año
    parseInt(partes[1]) - 1, // mes (base 0)
    parseInt(partes[2]) // día
  );
  return fechaLocal.toLocaleDateString("es-PA", {
    timeZone: "America/Panama",
  });
}


    // 📤 Exportar exactamente lo que ves (sin modificar formato)
  function exportarAsistenciasExcel() {
    // Crear hoja con los datos ya cargados de Supabase
    const hoja = XLSX.utils.json_to_sheet(
      asistencias.map((a) => ({
        Cédula: a.cedula,
        Nombre: a.participantes?.nombre || "",
        Apellido: a.participantes?.apellido || "",
        Correo: a.participantes?.correo || "",
        Hora: a.hora,
        Fecha: a.fecha, // se usa tal cual viene de Supabase
      }))
    );

    // Crear libro y añadir la hoja
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "Asistencias");

    // Nombrar el archivo según la fecha de Panamá
    const fechaArchivo = new Date().toLocaleDateString("sv-SE", {
      timeZone: "America/Panama",
    });

    // Guardar el archivo Excel
    XLSX.writeFile(libro, `Asistencias_${fechaArchivo}.xlsx`);
  }

  useEffect(() => {
    async function fetchAsistenciasHoy() {
      setLoading(true);
      setError(null);

      // 📅 Obtener fecha de hoy según hora de Panamá (formato YYYY-MM-DD)
      const fechaHoy = new Date().toLocaleDateString("sv-SE", {
        timeZone: "America/Panama",
      });

      const { data, error } = await supabase
        .from("asistencias")
        .select("cedula, fecha, hora, participantes(nombre, apellido, correo)")
        .eq("fecha", fechaHoy)
        .order("hora", { ascending: true });

      if (error) {
        setError("Error al cargar asistencias: " + error.message);
        setAsistencias([]);
      } else {
        setAsistencias(data);
        if (onDataChange) onDataChange(data); // <- envía los datos al padre (App.jsx)
      }

      setLoading(false);
    }

    fetchAsistenciasHoy();

    // 🔁 Actualiza la lista cada minuto
    const interval = setInterval(fetchAsistenciasHoy, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <p>Cargando asistencias...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ color: "#fff" }}>
      <h2>Asistencias del día ({new Date().toLocaleDateString("es-PA")})</h2>
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
              <th style={{ padding: "8px", textAlign: "left" }}>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {asistencias.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "12px" }}>
                  No hay registros de asistencia para hoy.
                </td>
              </tr>
            )}
            {asistencias.map(({ cedula, fecha, hora, participantes }) => (
              <tr
                key={`${cedula}-${fecha}-${hora}`}
                style={{ borderBottom: "1px solid #444" }}
              >
                <td style={{ padding: "8px" }}>{cedula}</td>
                <td style={{ padding: "8px" }}>
                  {participantes?.nombre || "Sin nombre"}
                </td>
                <td style={{ padding: "8px" }}>
                  {participantes?.apellido || ""}
                </td>
                <td style={{ padding: "8px" }}>
                  {participantes?.correo || "Sin correo"}
                </td>
                <td style={{ padding: "8px" }}>{hora || "Hora no disponible"}</td>
                <td style={{ padding: "8px" }}>{ajustarFechaPanama(fecha)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AsistenciaHoy;
