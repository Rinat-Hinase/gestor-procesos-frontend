// src/components/ProtectedRoute.jsx
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../services/firebaseConfig";
import { doc, getDoc, getFirestore } from "firebase/firestore";

const db = getFirestore();

export default function ProtectedRoute({ children, rolRequerido }) {
  const [user, loading] = useAuthState(auth);
  const [rolUsuario, setRolUsuario] = useState(null);
  const [cargandoRol, setCargandoRol] = useState(true);

  useEffect(() => {
    const obtenerRol = async () => {
      if (user) {
        const ref = doc(db, "usuarios", user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setRolUsuario(snap.data().rol);
        }
      }
      setCargandoRol(false);
    };

    if (user) obtenerRol();
  }, [user]);

  if (loading || cargandoRol) return <div className="p-6">Cargando...</div>;
  if (!user) return <Navigate to="/login" />;
  if (rolRequerido && rolUsuario !== rolRequerido) return <Navigate to="/" />;

  return children;
}
