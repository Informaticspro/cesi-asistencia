import ActualizacionesEvento from "./ActualizacionesEvento";
import { Link } from "react-router-dom";

function Noticias() {
  return (
    <div style={{ backgroundColor: "#1c1c1c", minHeight: "100vh", color: "#fff", padding: "1rem" }}>
      <header style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", color: "#28a745" }}>Todas las Noticias</h1>
        <p style={{ color: "#ccc" }}>Aquí puedes ver todas las actualizaciones del evento CESI 2025</p>
      </header>

      <ActualizacionesEvento mostrarTodas={true} />

      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <Link to="/">
          <button
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#6c757d",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              fontWeight: "bold",
              fontSize: "1rem",
              cursor: "pointer",
            }}
          >
            Volver a inicio
          </button>
        </Link>
      </div>
    </div>
  );
}

export default Noticias;