import { Outlet, Link } from "react-router-dom";

export default function LayoutAdmin() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-100 dark:bg-[#202020] p-4 hidden md:block">
        <h2 className="text-xl font-bold mb-6">Admin Panel</h2>
        <nav className="flex flex-col gap-2">
          <Link to="dashboard">Dashboard</Link>
          <Link to="actas">Actas</Link>
          <Link to="reportes">Reportes</Link>
        </nav>
      </aside>

      {/* Contenido */}
      <div className="flex-1 p-6 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}
