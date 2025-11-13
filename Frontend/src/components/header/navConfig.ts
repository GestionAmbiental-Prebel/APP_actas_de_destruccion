// navConfig.ts
export const navItems: Record<
  string,
  Record<string, { label: string; path: string }[]>
> = {
  operario: {
    normal: [
      { label: "Nuevo Acta", path: "/sub-area/formulario" },
      { label: "Mis Actas", path: "/sub-area/mis-actas" },
    ],
    "punto-verde": [
      { label: "Actas", path: "/operario-punto-verde/actas" },
      { label: "Conciliadas", path: "/operario-punto-verde/conciliadas" },
    ],
  },
  gestor: {
    normal: [
      { label: "Dashboard", path: "/gestor/dashboard" },
      { label: "Actas", path: "/gestor/actas" },
      { label: "Reportes", path: "/gestor/reportes" },
    ],
    "punto-verde": [
      { label: "Dashboard", path: "/gestor-punto-verde/dashboard" },
      { label: "Actas", path: "/gestor-punto-verde/actas" },
      { label: "Conciliadas", path: "/gestor-punto-verde/actas-conciliadas" },
    ],
  },
  admin: {
    normal: [
      { label: "Usuarios", path: "/admin/usuarios" },
      { label: "Configuración", path: "/admin/configuraciones" },
    ],
  },
};

export type Role =
  | "operario"
  | "punto-verde"
