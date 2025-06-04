// src/components/Sidebar.jsx
import { Link } from "react-router-dom";
import { FaPlusCircle, FaListAlt, FaCogs, FaSignOutAlt } from "react-icons/fa";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../services/firebaseConfig";
import { signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import { doc, getDoc, getFirestore } from "firebase/firestore";

const db = getFirestore();

export default function Sidebar() {
  const [user] = useAuthState(auth);
  const [rol, setRol] = useState("");

  useEffect(() => {
  const obtenerRol = async () => {
    if (user) {
      console.log("🔎 Buscando rol para UID:", user.uid);
      try {
        const ref = doc(db, "usuarios", user.uid);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data();
          console.log("✅ Documento Firestore encontrado:", data);
          setRol(data.rol?.toLowerCase() || "sin rol");
        } else {
          console.warn("❌ Documento no encontrado en /usuarios");
          setRol("desconocido");
        }
      } catch (err) {
        console.error("🔥 Error accediendo a Firestore:", err.message);
        setRol("error");
      }
    }
  };

  obtenerRol();
}, [user]);


  if (!user) return null;

  return (
    <div className="h-screen w-64 bg-gray-800 text-white fixed flex flex-col justify-between">
      <div>
        <div className="text-2xl font-bold p-4 border-b border-gray-700">
          Gestor de Procesos
        </div>
        <div className="px-4 py-2 text-sm text-gray-300 italic">
          Rol: {rol || "Cargando..."}
        </div>
        <nav className="flex flex-col p-4 space-y-2">
          <Link
            to="/"
            className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded"
          >
            <FaPlusCircle className="text-lg" />
            Registrar Solicitud
          </Link>

          <Link
            to="/gestion"
            className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded"
          >
            <FaListAlt className="text-lg" />
            Gestión de Solicitudes
          </Link>

          <Link
            to="/procesos"
            className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded"
          >
            <FaCogs className="text-lg" />
            Gestión de Procesos
          </Link>
        </nav>
      </div>

      <button
        onClick={() => signOut(auth)}
        className="flex items-center gap-2 hover:bg-red-700 p-4 border-t border-gray-700 text-left w-full"
      >
        <FaSignOutAlt className="text-lg" />
        Cerrar sesión
      </button>
    </div>
  );
}
