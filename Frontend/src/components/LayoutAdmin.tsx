// src/components/LayoutAdmin.tsx
import { Outlet } from "react-router-dom";

export const LayoutAdmin = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};



