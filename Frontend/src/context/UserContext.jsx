import { createContext, useContext, useState } from "react";

// Crear el contexto
const UserContext = createContext();

// Provider que envolverá toda la app
export function UserProvider({ children }) {
  // Estado del usuario (por ahora mock)
  const [user, setUser] = useState({
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
}

// Hook para usar el contexto fácilmente
export function useUser() {
  return useContext(UserContext);
}
