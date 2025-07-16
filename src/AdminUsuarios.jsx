// src/AdminUsuarios.jsx
import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [nuevoUsuario, setNuevoUsuario] = useState({ usuario: "", contraseña: "" });
  const [editandoId, setEditandoId] = useState(null);

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
    <div style={{ padding: 20 }}>
      <h2>Administrar Usuarios</h2>

      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Usuario"
          value={nuevoUsuario.usuario}
          onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, usuario: e.target.value })}
          style={{ marginRight: 10 }}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={nuevoUsuario.contraseña}
          onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, contraseña: e.target.value })}
          style={{ marginRight: 10 }}
        />
        {editandoId ? (
          <>
            <button onClick={actualizarUsuario} style={{ marginRight: 5 }}>
              Actualizar
            </button>
            <button
              onClick={() => {
                setEditandoId(null);
                setNuevoUsuario({ usuario: "", contraseña: "" });
              }}
            >
              Cancelar
            </button>
          </>
        ) : (
          <button onClick={agregarUsuario}>Agregar</button>
        )}
      </div>

      <ul>
        {usuarios.map((u) => (
          <li key={u.id} style={{ marginBottom: 10 }}>
            <strong>{u.usuario}</strong>
            <button onClick={() => comenzarEdicion(u)} style={{ marginLeft: 10, marginRight: 5 }}>
              Editar
            </button>
            <button onClick={() => borrarUsuario(u.id)}>Eliminar</button>
          </li>
        ))}
      </ul>
    </div>
  );
}