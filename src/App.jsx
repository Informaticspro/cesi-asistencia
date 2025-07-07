import EscanerQR from "./EscanerQR";
import RegistrarParticipante from "./RegistrarParticipante";
import AdminParticipantes from "./AdminParticipantes";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

function Home() {
  return (
    <div>
      <h1>Registro de Asistencia CESI 2025</h1>

      {/* Botón para registrar participantes */}
      <Link to="/registrar">
        <button style={{ marginRight: "10px" }}>Registrar Participante</button>
      </Link>

      {/* Botón para administrar participantes */}
      <Link to="/admin-participantes">
        <button style={{ marginRight: "10px" }}>Administrar Participantes</button>
      </Link>

      {/* Escáner QR */}
      <EscanerQR />
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Página principal */}
        <Route path="/" element={<Home />} />

        {/* Página para registrar participantes */}
        <Route path="/registrar" element={<RegistrarParticipante />} />

        {/* Página para administrar participantes */}
        <Route path="/admin-participantes" element={<AdminParticipantes />} />
      </Routes>
    </Router>
  );
  function Footer() {
  return (
    <footer style={{
      marginTop: "2rem",
      padding: "1rem",
      textAlign: "center",
      fontSize: "14px",
      color: "#666",
      borderTop: "1px solid #ddd"
    }}>
      © 2025 Informatics ProServices J.A. Todos los derechos reservados. Desarrollado por Informatics ProServices J.A.
    </footer>
  );
}

function Footer() {
  return (
    <footer
      style={{
        marginTop: "2rem",
        padding: "1rem",
        textAlign: "center",
        fontSize: "14px",
        color: "#666",
        borderTop: "1px solid #ddd",
        backgroundColor: "#f9f9f9",
      }}
    >
      © 2025 Informatics ProServices J.A. Todos los derechos reservados. Desarrollado por{" "}
      <a
        href="https://tuweb.com"
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: "#666", textDecoration: "underline" }}
      >
        Informatics ProServices J.A.
      </a>
    </footer>
  );
}

function App() {
  return (
    <Router>
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1 }}>
          <Routes>
            {/* Página principal */}
            <Route path="/" element={<Home />} />
            {/* Registrar participantes */}
            <Route path="/registrar" element={<RegistrarParticipante />} />
            {/* Administrar participantes */}
            <Route path="/admin-participantes" element={<AdminParticipantes />} />
          </Routes>
        </div>

        <Footer />
      </div>
    </Router>
  );
}
}

export default App;