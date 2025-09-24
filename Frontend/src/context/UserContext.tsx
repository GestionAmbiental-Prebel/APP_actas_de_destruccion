// src/context/UserContext.tsx
import { createContext, useContext, useState, ReactNode } from "react";

// 🔹 Tipos de usuario
interface User {
  id: string;
  nombre: string;
  area: string;
  sede: string;
}

interface UserContextProps {
  user: User;
  setUser: (user: User) => void;
}

// 🔹 Crear contexto con tipo
const UserContext = createContext<UserContextProps | undefined>(undefined);

// 🔹 Provider que envolverá la app
export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>({
    id: "123",
    nombre: "Carlos Ramírez",
    area: "Planta A",
    sede: "Medellín",
  });

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

// 🔹 Hook para usar el contexto
export const useUser = (): UserContextProps => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser debe usarse dentro de UserProvider");
  }
  return context;
};
