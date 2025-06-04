
import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../services/firebaseConfig";
import { getDoc, doc, getFirestore } from "firebase/firestore";

const API = import.meta.env.VITE_API_URL;

export default function GestionSolicitudes() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [editandoFolio, setEditandoFolio] = useState(null);
  const [retroEditada, setRetroEditada] = useState("");
  const [filtroEstatus, setFiltroEstatus] = useState("Todos");
  const [filtroPrioridad, setFiltroPrioridad] = useState("Todas");
  const [rol, setRol] = useState("");
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [user] = useAuthState(auth);

  const db = getFirestore();

  useEffect(() => {
    const obtenerDatosUsuario = async () => {
      if (user) {
        const ref = doc(db, "usuarios", user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setRol(data.rol.toLowerCase());
          setNombreUsuario(data.nombre);
        }
      }
    };
    obtenerDatosUsuario();
  }, [user]);

  const fetchSolicitudes = async () => {
    try {
      const res = await fetch(`${API}/solicitudes/listar`);
      const data = await res.json();
      setSolicitudes(data);
    } catch (err) {
      console.error(err);
      setMensaje("Error al cargar solicitudes");
    }
  };

  const actualizarEstatus = async (folio, nuevoEstatus) => {
    try {
      const body = { estatus: nuevoEstatus };

      if (nuevoEstatus === "Aprobado") {
        body.aprobado_por = nombreUsuario;
        body.fecha_aprobacion = new Date().toISOString();
      }

      const res = await fetch(`${API}/solicitudes/${folio}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      setMensaje(data.mensaje || "Solicitud actualizada");
      fetchSolicitudes();
    } catch (err) {
      console.error(err);
      setMensaje("Error al actualizar solicitud");
    }
  };

  const guardarRetro = async (folio) => {
    try {
      const res = await fetch(`${API}/solicitudes/${folio}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ retroalimentacion: retroEditada }),
      });
      const data = await res.json();
      setMensaje(data.mensaje || "Retroalimentación guardada");
      setEditandoFolio(null);
      fetchSolicitudes();
    } catch (err) {
      console.error(err);
      setMensaje("Error al guardar retroalimentación");
    }
  };

  useEffect(() => {
    fetchSolicitudes();
  }, []);

  const solicitudesFiltradas = solicitudes.filter((s) => {
    const coincideEstatus = filtroEstatus === "Todos" || s.estatus === filtroEstatus;
    const coincidePrioridad = filtroPrioridad === "Todas" || s.prioridad === filtroPrioridad;
    return coincideEstatus && coincidePrioridad;
  });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Gestión de Solicitudes</h2>
      {mensaje && <p className="mb-4 text-green-600">{mensaje}</p>}

      <div className="mb-4">
        <label className="mr-2 font-semibold">Filtrar por estatus:</label>
        <select className="border p-2" value={filtroEstatus} onChange={(e) => setFiltroEstatus(e.target.value)}>
          <option value="Todos">Todos</option>
          <option value="Pendiente">Pendiente</option>
          <option value="Pendiente Evaluación">Pendiente Evaluación</option>
          <option value="Aprobado">Aprobado</option>
          <option value="Rechazado">Rechazado</option>
          <option value="Finalizado">Finalizado</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="mr-2 font-semibold">Filtrar por prioridad:</label>
        <select className="border p-2" value={filtroPrioridad} onChange={(e) => setFiltroPrioridad(e.target.value)}>
          <option value="Todas">Todas</option>
          <option value="Alta">Alta</option>
          <option value="Media">Media</option>
          <option value="Baja">Baja</option>
        </select>
      </div>

      <table className="w-full table-auto border-collapse bg-white shadow">
        <thead>
          <tr className="bg-gray-200 text-left">
            <th className="p-2 border">Folio</th>
            <th className="p-2 border">Tipo</th>
            <th className="p-2 border">Responsable</th>
            <th className="p-2 border">Descripción</th>
            <th className="p-2 border">Prioridad</th>
            <th className="p-2 border">Estatus</th>
            <th className="p-2 border">Aprobado por</th>
            <th className="p-2 border">Fecha de aprobación</th>
            <th className="p-2 border">Documentos</th>
            <th className="p-2 border">Retroalimentación</th>
            <th className="p-2 border">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {solicitudesFiltradas.map((s) => (
            <tr key={s.folio} className="border-t">
              <td className="p-2 border">{s.folio}</td>
              <td className="p-2 border">{s.tipo_area}</td>
              <td className="p-2 border">{s.responsable_seguimiento}</td>
              <td className="p-2 border">{s.descripcion}</td>
              <td className={`p-2 border font-semibold ${
                s.prioridad === "Alta" ? "text-red-600" :
                s.prioridad === "Media" ? "text-yellow-600" :
                "text-green-600"
              }`}>
                {s.prioridad || "Sin clasificar"}
              </td>
              <td className="p-2 border">{s.estatus}</td>
              <td className="p-2 border">{s.aprobado_por || <span className="italic text-gray-500">N/A</span>}</td>
              <td className="p-2 border">
                {s.fecha_aprobacion ? new Date(s.fecha_aprobacion).toLocaleString("es-MX") : <span className="italic text-gray-500">N/A</span>}
              </td>
              <td className="p-2 border space-y-1">
                {s.documentos_url && s.documentos_url.length > 0 ? (
                  s.documentos_url.map((url, index) => (
                    <div key={index}>
                      <button onClick={async () => {
                        try {
                          const response = await fetch(url);
                          const blob = await response.blob();
                          const link = document.createElement("a");
                          link.href = window.URL.createObjectURL(blob);
                          link.download = `archivo-${s.folio}-${index + 1}`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        } catch (err) {
                          console.error("Error al descargar:", err);
                          alert("No se pudo descargar el archivo.");
                        }
                      }} className="text-blue-600 underline hover:text-blue-800">
                        Descargar Archivo {index + 1}
                      </button>
                    </div>
                  ))
                ) : <span className="text-gray-500 italic">Sin archivos</span>}
              </td>
              <td className="p-2 border">
                {editandoFolio === s.folio ? (
                  <>
                    <textarea className="w-full p-1 border" rows={2} value={retroEditada} onChange={(e) => setRetroEditada(e.target.value)} />
                    <div className="flex gap-2 mt-1">
                      <button onClick={() => guardarRetro(s.folio)} className="bg-green-600 text-white px-2 py-1 rounded text-sm">Guardar</button>
                      <button onClick={() => setEditandoFolio(null)} className="bg-gray-500 text-white px-2 py-1 rounded text-sm">Cancelar</button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-sm italic text-gray-700 mb-1">{s.retroalimentacion || "Sin retroalimentación"}</p>
                    {rol !== "empleado" && (
                      <button onClick={() => {
                        setEditandoFolio(s.folio);
                        setRetroEditada(s.retroalimentacion || "");
                      }} className="bg-yellow-500 text-white px-2 py-1 rounded text-sm">Editar Feedback</button>
                    )}
                  </>
                )}
              </td>
              <td className="p-2 border space-y-1">
                {rol !== "empleado" && (
                  <>
                    <button className="bg-green-500 text-white px-2 py-1 rounded text-sm mr-1" onClick={() => actualizarEstatus(s.folio, "Aprobado")}>Aprobar</button>
                    <button className="bg-red-500 text-white px-2 py-1 rounded text-sm mr-1" onClick={() => actualizarEstatus(s.folio, "Rechazado")}>Rechazar</button>
                    <button className="bg-blue-500 text-white px-2 py-1 rounded text-sm" onClick={() => actualizarEstatus(s.folio, "Finalizado")}>Finalizar</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
