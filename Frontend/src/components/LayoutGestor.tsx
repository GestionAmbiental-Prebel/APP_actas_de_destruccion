// src/components/LayoutGestor.tsx
import { Outlet } from "react-router-dom";

export const LayoutGestor = () => {
  return (
    <div className="flex flex-col h-screen bg-gray-100 p-6 font-acidGrotesk">
      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};
