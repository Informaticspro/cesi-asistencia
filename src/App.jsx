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
}

export default App;