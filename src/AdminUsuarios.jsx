import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { useNavigate } from "react-router-dom";

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [nuevoUsuario, setNuevoUsuario] = useState({ usuario: "", contraseña: "" });
  const [editandoId, setEditandoId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsuarios();
  }, []);

  async function fetchUsuarios() {
    const { data, error } = await supabase.from("usuarios").select("*");
    if (error) {
      alert("Error cargando usuarios: " + error.message);
    } else {
      setUsuarios(data);
    }
  }

  async function agregarUsuario() {
    if (!nuevoUsuario.usuario || !nuevoUsuario.contraseña) {
      alert("Completa todos los campos");
      return;
    }
    const { error } = await supabase.from("usuarios").insert([nuevoUsuario]);
    if (error) {
      alert("Error agregando usuario: " + error.message);
    } else {
      setNuevoUsuario({ usuario: "", contraseña: "" });
      fetchUsuarios();
    }
  }

  async function borrarUsuario(id) {
    if (!confirm("¿Eliminar este usuario?")) return;
    const { error } = await supabase.from("usuarios").delete().eq("id", id);
    if (error) {
      alert("Error borrando usuario: " + error.message);
    } else {
      fetchUsuarios();
    }
  }

  async function actualizarUsuario() {
    if (!nuevoUsuario.usuario || !nuevoUsuario.contraseña) {
      alert("Completa todos los campos");
      return;
    }
    const { error } = await supabase
      .from("usuarios")
      .update(nuevoUsuario)
      .eq("id", editandoId);
    if (error) {
      alert("Error actualizando usuario: " + error.message);
    } else {
      setEditandoId(null);
      setNuevoUsuario({ usuario: "", contraseña: "" });
      fetchUsuarios();
    }
  }

  function comenzarEdicion(usuario) {
    setEditandoId(usuario.id);
    setNuevoUsuario({ usuario: usuario.usuario, contraseña: usuario.contraseña });
  }

  return (
    <div style={{ padding: "1.5rem", backgroundColor: "#1e1e1e", minHeight: "100vh", color: "#fff" }}>
      <h2 style={{ textAlign: "center", marginBottom: "1rem", color: "#00bcd4" }}>Administrar Usuarios</h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "1.5rem" }}>
        <input
          type="text"
          placeholder="Usuario"
          value={nuevoUsuario.usuario}
          onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, usuario: e.target.value })}
          style={{
            padding: "0.6rem",
            borderRadius: "6px",
            border: "1px solid #555",
            backgroundColor: "#2e2e2e",
            color: "#fff",
          }}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={nuevoUsuario.contraseña}
          onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, contraseña: e.target.value })}
          style={{
            padding: "0.6rem",
            borderRadius: "6px",
            border: "1px solid #555",
            backgroundColor: "#2e2e2e",
            color: "#fff",
          }}
        />
        {editandoId ? (
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={actualizarUsuario}
              style={{
                padding: "0.6rem",
                borderRadius: "6px",
                backgroundColor: "#2196f3",
                color: "#fff",
                border: "none",
                flex: 1,
              }}
            >
              Actualizar
            </button>
            <button
              onClick={() => {
                setEditandoId(null);
                setNuevoUsuario({ usuario: "", contraseña: "" });
              }}
              style={{
                padding: "0.6rem",
                borderRadius: "6px",
                backgroundColor: "#757575",
                color: "#fff",
                border: "none",
                flex: 1,
              }}
            >
              Cancelar
            </button>
          </div>
        ) : (
          <button
            onClick={agregarUsuario}
            style={{
              padding: "0.6rem",
              borderRadius: "6px",
              backgroundColor: "#4caf50",
              color: "#fff",
              border: "none",
            }}
          >
            Agregar
          </button>
        )}
      </div>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {usuarios.map((u) => (
          <li
            key={u.id}
            style={{
              backgroundColor: "#2c2c2c",
              padding: "0.8rem",
              borderRadius: "6px",
              marginBottom: "10px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <strong style={{ color: "#ffffffcc" }}>{u.usuario}</strong>
            <div>
              <button
                onClick={() => comenzarEdicion(u)}
                style={{
                  marginRight: "8px",
                  padding: "4px 10px",
                  fontSize: "0.8rem",
                  backgroundColor: "#2196f3",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                }}
              >
                Editar
              </button>
              <button
                onClick={() => borrarUsuario(u.id)}
                style={{
                  padding: "4px 10px",
                  fontSize: "0.8rem",
                  backgroundColor: "#f44336",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                }}
              >
                Eliminar
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <button
          onClick={() => navigate("/")}
          style={{
            padding: "0.7rem 1.2rem",
            fontSize: "14px",
            backgroundColor: "#607d8b",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            boxShadow: "0 3px 6px rgba(0,0,0,0.3)",
          }}
        >
          ⬅ Volver
        </button>
      </div>
    </div>
  );
}