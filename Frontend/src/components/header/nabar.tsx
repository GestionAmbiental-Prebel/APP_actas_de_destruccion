import ToggleTheme from "../theme/toggleTheme";
import HomeIcon from "../../icons/homeIcon";
import { Link } from "react-router-dom";

interface NavbarProps {
  role: "admin" | "operario";
  variant?: "normal" | "punto-verde"; // 🔹 Nuevo
}

export const Navbar = ({ role, variant = "normal" }: NavbarProps) => {
  return (
    <section className="flex items-center w-full">
      <nav className="w-full">
        <ul className="flex gap-4 justify-center">
          {/* Inicio */}
          <li>
            <Link to="/" className="border-b-4 hover:border-current border-transparent flex gap-1 items-center">
              Inicio <HomeIcon className="w-6 h-6 fill-cyan dark:fill-bone" />
            </Link>
          </li>

          {/* Links para operario normal */}
          {role === "operario" && variant === "normal" && (
            <>
              <li>
                <Link to="/operario/formulario" className="border-b-4 hover:border-current border-transparent">
                  Formulario
                </Link>
              </li>
              <li>
                <Link to="/operario/actas" className="border-b-4 hover:border-current border-transparent">
                  Mis Actas
                </Link>
              </li>
            </>
          )}

          {/* Links para operario punto verde */}
          {role === "operario" && variant === "punto-verde" && (
            <>
              <li>
                <Link to="/operario-punto-verde/actas" className="border-b-4 hover:border-current border-transparent">
                  Todas las Actas
                </Link>
              </li>
              <li>
                <Link to="/operario-punto-verde/actas" className="border-b-4 hover:border-current border-transparent">
                  Actas Conciliadas
                </Link>
              </li>
            </>
          )}

          {/* Links para admin */}
          {role === "admin" && (
            <>
              <li>
                <Link to="/admin/dashboard" className="border-b-4 hover:border-current border-transparent">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/admin/usuarios" className="border-b-4 hover:border-current border-transparent">
                  Usuarios
                </Link>
              </li>
              <li>
                <Link to="/admin/actas" className="border-b-4 hover:border-current border-transparent">
                  Todas las Actas
                </Link>
              </li>
              
            </>
          )}

          {/* Toggle de tema */}
          <li>
            <ToggleTheme />
          </li>
        </ul>
      </nav>
    </section>
  );
};