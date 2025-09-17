import { Header } from "./components/header/header";
import { Outlet, Link } from "react-router-dom";

export default function Layout() {
  return (
    <main className="font-acidGrotesk text-[#202020] dark:text-bone bg-radial from-bone via-bone to-white dark:from-skyBlue dark:via-none dark:to-[#202020] min-h-screen flex">
      
      {/* Sidebar */}
      <aside className="w-64 bg-gray-100 dark:bg-[#202020] p-4 hidden md:block">
        <h2 className="text-xl font-bold mb-6">Mi App</h2>
        <nav className="flex flex-col gap-2">
          <Link to="/">Home</Link>
          <Link to="/profile">Perfil</Link>
          <Link to="/actas">Lista de Actas</Link>
        </nav>
      </aside>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col">
        <Header />
        <div className="p-6 flex-1 overflow-auto">
          <Outlet />
        </div>
      </div>
    </main>
  );
}