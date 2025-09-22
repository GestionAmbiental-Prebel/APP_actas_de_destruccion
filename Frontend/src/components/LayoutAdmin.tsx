// src/components/LayoutAdmin.tsx
import { Link, Outlet, useLocation } from "react-router-dom";
import { useState } from "react";

export const LayoutAdmin = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
    { name: "Dashboard", path: "/admin/dashboard" },
    { name: "Actas", path: "/admin/actas" },
    { name: "Reportes", path: "/admin/reportes" },
  ];

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className={`bg-gray-800 text-white p-4 ${sidebarOpen ? "w-64" : "w-20"} transition-all`}>
        <button
          className="mb-4"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? "Cerrara" : "Abrir"}
        </button>

        <nav className="flex flex-col gap-2">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`p-2 rounded hover:bg-gray-700 ${
                location.pathname === item.path ? "bg-gray-700" : ""
              }`}
            >
              {sidebarOpen ? item.name : item.name[0]}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 bg-gray-100 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};
