// src/components/header/navConfig.ts

export type Role = "operario" | "gestor" | "admin";
export type Variant = "normal" | "punto-verde";

export interface NavItem {
  label: string;
  path: string;
}

export const navItems: Record<
  Role,
  Partial<Record<Variant, NavItem[]>>
> = {
  operario: {
    normal: [
      { label: "Nuevo Acta", path: "/subarea" },
      { label: "Mis Actas", path: "/subarea/mis-actas" },
    ],
    "punto-verde": [
      { label: "Actas", path: "/punto-verde" },
      { label: "Conciliadas", path: "/punto-verde/conciliadas" },
    ],
  },

  gestor: {
    normal: [
      { label: "Dashboard", path: "/gestor/dashboard" },
      { label: "Nueva Acta", path: "/gestor/actas/nueva" },
    ],
    "punto-verde": [
      { label: "Actas", path: "/gestor-punto-verde/actas" },
      { label: "Estado Actas", path: "/gestor-punto-verde/conciliadas" },
      { label: "Gestionar Operarios", path: "/gestor-punto-verde/operarios" },
    ],
  },

  admin: {
    normal: [
      { label: "Usuarios", path: "/admin/usuarios" },
      { label: "Configuraciones", path: "/admin/configuraciones" },
    ],
  },
};
