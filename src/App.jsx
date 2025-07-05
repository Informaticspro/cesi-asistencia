import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import EscanerQR from "./EscanerQR";
import RegistrarParticipante from "./RegistrarParticipante";
import AdminParticipantes from "./AdminParticipantes";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

function Home() {
  const [participantes, setParticipantes] = useState([]);

  useEffect(() => {
    const fetchParticipantes = async () => {
      const { data, error } = await supabase.from("participantes").select("*");

      if (error) {
        console.error("❌ Error al cargar participantes:", error);
      } else {
        console.log("✅ Participantes recibidos:", data);
        setParticipantes(data);
      }
    };

    fetchParticipantes();
  }, []);

  return (
    <div>
      <h1>Lista de Participantes</h1>

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

      <ul>
        {participantes.map((p) => (
          <li key={p.cedula}>
            {p.nombre} - {p.cedula}
          </li>
        ))}
      </ul>
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