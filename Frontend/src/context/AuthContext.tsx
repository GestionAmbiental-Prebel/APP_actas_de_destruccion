import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

type RolUsuario =
  | "subarea"
  | "punto-verde"
  | "gestor-ambiental"
  | "gestor-punto-verde"
  | "administrador";

interface Usuario {
  id: string;
  nombre: string;
  rol: RolUsuario;
  subarea?: string;
}

interface AuthContextType {
  usuario: Usuario | null;
  iniciarSesion: (usuario: Usuario) => void;
  cerrarSesion: () => void;
  estaAutenticado: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  // 🔹 Restaurar sesión si existe (desde localStorage)
  useEffect(() => {
    const storedUser = localStorage.getItem("usuario");
    if (storedUser) {
      setUsuario(JSON.parse(storedUser));
    }
  }, []);

  // 🔹 Iniciar sesión
  const iniciarSesion = (usuario: Usuario) => {
    setUsuario(usuario);
    localStorage.setItem("usuario", JSON.stringify(usuario));
  };

  // 🔹 Cerrar sesión
  const cerrarSesion = () => {
    setUsuario(null);
    localStorage.removeItem("usuario");
  };

  const estaAutenticado = !!usuario;

  return (
    <AuthContext.Provider value={{ usuario, iniciarSesion, cerrarSesion, estaAutenticado }}>
      {children}
    </AuthContext.Provider>
  );
};

// 🔹 Hook para usar el contexto fácilmente
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
};
