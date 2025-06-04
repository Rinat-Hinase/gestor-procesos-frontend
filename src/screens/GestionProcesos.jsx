
import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../services/firebaseConfig";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const db = getFirestore();
const API = import.meta.env.VITE_API_URL;

export default function GestionProcesos() {
  const [user] = useAuthState(auth);
  const [rol, setRol] = useState(null);
  const [procesos, setProcesos] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [editandoId, setEditandoId] = useState(null);
  const [procesoEditado, setProcesoEditado] = useState({
    descripcion: "",
    responsables: [],
    fecha_inicio: "",
    fecha_fin: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const obtenerRol = async () => {
      const ref = doc(db, "usuarios", user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const rolUsuario = snap.data().rol;
        setRol(rolUsuario);

        if (!["evaluador", "aprobador", "administrador"].includes(rolUsuario)) {
          navigate("/");
        }
      } else {
        navigate("/login");
      }
    };

    obtenerRol();
  }, [user, navigate]);

  const fetchProcesos = async () => {
    try {
      const res = await fetch(`${API}/procesos/listar`);
      const data = await res.json();
      setProcesos(data);
    } catch (err) {
      console.error(err);
      setMensaje("Error al cargar procesos");
    }
  };

  const eliminarProceso = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este proceso?")) return;
    try {
      const res = await fetch(`${API}/procesos/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      setMensaje(data.mensaje || "Proceso eliminado");
      fetchProcesos();
    } catch (err) {
      console.error(err);
      setMensaje("Error al eliminar proceso");
    }
  };

  const guardarCambios = async (id) => {
    try {
      const payload = {
        ...procesoEditado,
        responsables: procesoEditado.responsables.split(",").map(r => r.trim()),
      };
      const res = await fetch(`${API}/procesos/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setMensaje(data.mensaje || "Proceso actualizado");
      setEditandoId(null);
      fetchProcesos();
    } catch (err) {
      console.error(err);
      setMensaje("Error al actualizar proceso");
    }
  };

  useEffect(() => {
    if (rol) fetchProcesos();
  }, [rol]);

  if (!user || !rol) return null;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Gestión de Procesos</h2>
      {mensaje && <p className="mb-4 text-green-600">{mensaje}</p>}
      <table className="w-full table-auto border-collapse bg-white shadow">
        <thead>
          <tr className="bg-gray-200 text-left">
            <th className="p-2 border">ID</th>
            <th className="p-2 border">Folio Solicitud</th>
            <th className="p-2 border">Descripción</th>
            <th className="p-2 border">Responsables</th>
            <th className="p-2 border">Fecha Inicio</th>
            <th className="p-2 border">Fecha Fin</th>
            <th className="p-2 border">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {procesos.map((p) => (
            <tr key={p._id} className="border-t">
              <td className="p-2 border">{p._id}</td>
              <td className="p-2 border">{p.solicitud_folio}</td>
              {editandoId === p._id ? (
                <>
                  <td className="p-2 border">
                    <input
                      className="w-full border p-1"
                      value={procesoEditado.descripcion}
                      onChange={(e) =>
                        setProcesoEditado({ ...procesoEditado, descripcion: e.target.value })
                      }
                    />
                  </td>
                  <td className="p-2 border">
                    <input
                      className="w-full border p-1"
                      value={procesoEditado.responsables}
                      onChange={(e) =>
                        setProcesoEditado({ ...procesoEditado, responsables: e.target.value })
                      }
                      placeholder="Separar con comas"
                    />
                  </td>
                  <td className="p-2 border">
                    <input
                      type="date"
                      className="w-full border p-1"
                      value={procesoEditado.fecha_inicio}
                      onChange={(e) =>
                        setProcesoEditado({ ...procesoEditado, fecha_inicio: e.target.value })
                      }
                    />
                  </td>
                  <td className="p-2 border">
                    <input
                      type="date"
                      className="w-full border p-1"
                      value={procesoEditado.fecha_fin}
                      onChange={(e) =>
                        setProcesoEditado({ ...procesoEditado, fecha_fin: e.target.value })
                      }
                    />
                  </td>
                  <td className="p-2 border space-y-1">
                    <button
                      className="bg-green-600 text-white px-2 py-1 rounded text-sm"
                      onClick={() => guardarCambios(p._id)}
                    >
                      Guardar
                    </button>
                    <button
                      className="bg-gray-500 text-white px-2 py-1 rounded text-sm ml-1"
                      onClick={() => setEditandoId(null)}
                    >
                      Cancelar
                    </button>
                  </td>
                </>
              ) : (
                <>
                  <td className="p-2 border">{p.descripcion}</td>
                  <td className="p-2 border">{p.responsables?.join(", ")}</td>
                  <td className="p-2 border">{p.fecha_inicio?.substring(0, 10)}</td>
                  <td className="p-2 border">{p.fecha_fin?.substring(0, 10)}</td>
                  <td className="p-2 border space-y-1">
                    <button
                      className="bg-yellow-500 text-white px-2 py-1 rounded text-sm"
                      onClick={() => {
                        setEditandoId(p._id);
                        setProcesoEditado({
                          descripcion: p.descripcion || "",
                          responsables: p.responsables?.join(", ") || "",
                          fecha_inicio: p.fecha_inicio?.substring(0, 10) || "",
                          fecha_fin: p.fecha_fin?.substring(0, 10) || "",
                        });
                      }}
                    >
                      Editar
                    </button>
                    <button
                      className="bg-red-600 text-white px-2 py-1 rounded text-sm ml-2"
                      onClick={() => eliminarProceso(p._id)}
                    >
                      Eliminar
                    </button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
