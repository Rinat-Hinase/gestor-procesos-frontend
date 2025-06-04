import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import RegistroSolicitud from "./screens/RegistroSolicitud";
import GestionSolicitudes from "./screens/GestionSolicitudes";
import GestionProcesos from "./screens/GestionProcesos";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./services/firebaseConfig";

export default function App() {
  const [user, loading] = useAuthState(auth);

  if (loading) return <div className="p-10">Cargando...</div>;

  return (
    <Router>
      <div className="flex">
        {user && <Sidebar />}
        <div className={`${user ? "ml-64" : ""} p-6 w-full bg-gray-100 min-h-screen`}>
          <Routes>
            {!user ? (
              <>
                <Route path="/login" element={<Login />} />
                <Route path="/registro" element={<Registro />} />
                <Route path="*" element={<Navigate to="/login" />} />
              </>
            ) : (
              <>
                <Route path="/" element={<RegistroSolicitud />} />
                <Route path="/gestion" element={<GestionSolicitudes />} />
                <Route path="/procesos" element={<GestionProcesos />} />
                <Route path="*" element={<Navigate to="/" />} />
              </>
            )}
          </Routes>
        </div>
      </div>
    </Router>
  );
}
