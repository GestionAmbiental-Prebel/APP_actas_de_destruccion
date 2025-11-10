// src/components/PrivateRoute.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Role } from "../components/header/navConfig";

interface PrivateRouteProps {
  allowedRoles: Role[];
  children: React.ReactNode; // <- usamos React.ReactNode
}

export const PrivateRoute = ({ allowedRoles, children }: PrivateRouteProps) => {
  const { usuario } = useAuth();

  if (!usuario) {
    // Usuario no autenticado → redirige al login
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(usuario.rol)) {
    // Usuario sin permisos → redirige a su dashboard según rol
    switch (usuario.rol) {
      case "subarea":
        return <Navigate to="/subarea" replace />;
      case "punto-verde":
        return <Navigate to="/punto-verde" replace />;
      case "gestor-ambiental":
        return <Navigate to="/gestor-ambiental" replace />;
      case "gestor-punto-verde":
        return <Navigate to="/gestor-punto-verde" replace />;
      case "administrador":
        return <Navigate to="/administrador" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>; // renderizamos los hijos
};
