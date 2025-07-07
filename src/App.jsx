import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Bienvenida from "./Bienvenida";
import EscanerQR from "./EscanerQR";
import RegistrarParticipante from "./RegistrarParticipante";
import AdminParticipantes from "./AdminParticipantes";
import MiFooter from "./MiFooter";

function Home() {
  return (
    <div style={{ padding: "1rem" }}>
      <h1>Registro de Asistencia CESI 2025</h1>

      <EscanerQR />
    </div>
  );
}

function App() {
  const [autorizado, setAutorizado] = useState(false);

  return (
    <Router>
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Bienvenida onLogin={setAutorizado} />} />
            <Route
              path="/registrar"
              element={<RegistrarParticipante />}
            />
            <Route
              path="/admin-participantes"
              element={autorizado ? <AdminParticipantes /> : <Navigate to="/" />}
            />
            <Route
              path="/escaner"
              element={autorizado ? <Home /> : <Navigate to="/" />}
            />
          </Routes>
        </div>
        <MiFooter />
      </div>
    </Router>
  );
}

export default App;