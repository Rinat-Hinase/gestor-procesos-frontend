import React, { useState } from "react";
const API = import.meta.env.VITE_API_URL;

export default function RegistroSolicitud() {
  const [descripcion, setDescripcion] = useState("");
  const [tipoArea, setTipoArea] = useState("");
  const [responsable, setResponsable] = useState("");
  const [fechaEstimacion, setFechaEstimacion] = useState("");
  const [documentos, setDocumentos] = useState([]); // Archivos múltiples
  const [mensaje, setMensaje] = useState("");

  const handleSubmit = async (e) => {
  e.preventDefault();
  setMensaje("");

  try {
    // Paso 1: Crear la solicitud sin archivos
    const payloadInicial = {
      descripcion,
      tipo_area: tipoArea,
      responsable_seguimiento: responsable,
      fecha_estimacion: fechaEstimacion,
    };

    const resCrear = await fetch(`${API}/solicitudes/crear`, {

      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payloadInicial),
    });

    const resultado = await resCrear.json();
    const folio = resultado.folio;

    if (!folio) {
      setMensaje("❌ Error al generar el folio.");
      return;
    }

    const urls = await Promise.all(
  documentos.map(async (archivo) => {
    const formData = new FormData();
    formData.append("file", archivo);
    formData.append("folio", folio);

    const resUpload = await fetch(`${API}/solicitudes/subir-documento/`, {
      method: "POST",
      body: formData,
    });

    const data = await resUpload.json();
    return data.url || null;
  })
);

// Elimina URLs nulas
const urlsFiltradas = urls.filter(Boolean);


    await fetch(`${API}/solicitudes/${folio}`, {
  method: "PATCH",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ documentos_url: urlsFiltradas }),
});


    setMensaje(`✅ Solicitud creada exitosamente. Folio: ${folio}`);
    setDescripcion("");
    setTipoArea("");
    setResponsable("");
    setFechaEstimacion("");
    setDocumentos([]);
  } catch (err) {
    console.error(err);
    setMensaje("❌ Error al enviar la solicitud.");
  }
};


  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Registro de Solicitud</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="border w-full p-2"
          type="text"
          placeholder="Descripción"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          required
        />
        <input
          className="border w-full p-2"
          type="text"
          placeholder="Tipo de área"
          value={tipoArea}
          onChange={(e) => setTipoArea(e.target.value)}
          required
        />
        <input
          className="border w-full p-2"
          type="text"
          placeholder="Responsable"
          value={responsable}
          onChange={(e) => setResponsable(e.target.value)}
          required
        />
        <input
          className="border w-full p-2"
          type="date"
          value={fechaEstimacion}
          onChange={(e) => setFechaEstimacion(e.target.value)}
          required
        />
        <input
          type="file"
          multiple
          onChange={(e) => setDocumentos(Array.from(e.target.files))}
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          type="submit"
        >
          Enviar Solicitud
        </button>
      </form>

      {mensaje && <p className="mt-4 text-green-700">{mensaje}</p>}
    </div>
  );
}
