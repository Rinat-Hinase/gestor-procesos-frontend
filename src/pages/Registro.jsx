// src/pages/Registro.jsx
import React, { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../services/firebaseConfig";
import { useNavigate } from "react-router-dom";
import { setDoc, doc, getFirestore } from "firebase/firestore";
import { Link } from "react-router-dom";


const db = getFirestore();

export default function Registro() {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const [rol, setRol] = useState("cliente"); // Valor por defecto
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegistro = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const credenciales = await createUserWithEmailAndPassword(auth, correo, clave);
      await updateProfile(credenciales.user, { displayName: nombre });

      // Guardar rol en Firestore
      await setDoc(doc(db, "usuarios", credenciales.user.uid), {
        nombre,
        correo,
        rol,
      });

      console.log("✅ Registro exitoso:", credenciales.user.email);
      navigate("/");  // ✔ Carga RegistroSolicitud

    } catch (err) {
      console.error(err);
      setError("Error al registrar usuario");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleRegistro} className="bg-white p-8 rounded shadow-md w-96 space-y-4">
        <h2 className="text-2xl font-bold text-center">Registro</h2>

        <input
          type="text"
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="w-full border p-2"
          required
        />

        <input
          type="email"
          placeholder="Correo"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          className="w-full border p-2"
          required
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={clave}
          onChange={(e) => setClave(e.target.value)}
          className="w-full border p-2"
          required
        />

        <select
  value={rol}
  onChange={(e) => setRol(e.target.value)}
  className="w-full border p-2"
  required
>
  <option value="">Selecciona un rol...</option>
  <option value="empleado">Empleado</option>
  <option value="evaluador">Evaluador</option>
  <option value="aprobador">Aprobador</option>
  <option value="administrador">Administrador</option>
</select>



        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          Registrarse
        </button>
        <p className="text-center text-sm">
  ¿Ya tienes una cuenta?{" "}
  <Link to="/login" className="text-blue-600 underline hover:text-blue-800">
  Inicia sesión
</Link>

</p>

      </form>
    </div>
  );
}
