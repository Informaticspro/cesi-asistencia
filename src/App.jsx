import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";

import Bienvenida from "./Bienvenida";
import EscanerQR from "./EscanerQR";
import RegistrarParticipante from "./RegistrarParticipante";
import AdminParticipantes from "./AdminParticipantes";
import MiFooter from "./MiFooter";

function App() {
  const [autorizado, setAutorizado] = useState(false);

  return (
    <Router>
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1 }}>
          <Routes>
            {/* Página de inicio: bienvenida o panel principal */}
            <Route
              path="/"
              element={
                autorizado ? (
                  <div style={{ padding: "1rem" }}>
                    <h1>Registro de Asistencia CESI 2025</h1>

                    <Link to="/registrar">
                      <button style={{ marginRight: "10px" }}>Registrar Participante</button>
                    </Link>

                    <Link to="/admin-participantes">
                      <button style={{ marginRight: "10px" }}>Administrar Participantes</button>
                    </Link>

                    <EscanerQR />
                  </div>
                ) : (
                  <Bienvenida onLogin={setAutorizado} />
                )
              }
            />

            {/* Ruta pública para registrar participantes */}
            <Route path="/registrar" element={<RegistrarParticipante />} />

            {/* Ruta protegida: solo si está autorizado */}
            <Route
              path="/admin-participantes"
              element={autorizado ? <AdminParticipantes /> : <Navigate to="/" />}
            />
          </Routes>
        </div>
        <MiFooter />
      </div>
    </Router>
  );
}

export default App;