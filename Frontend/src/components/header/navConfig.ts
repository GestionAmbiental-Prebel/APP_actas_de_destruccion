// src/components/header/navConfig.ts

export type Role = "operario" | "gestor" | "gestor-ambiental" | "admin"; // Añadido "gestor-ambiental"
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

  gestor: { // Gestor Punto Verde
    normal: [
      { label: "Actas", path: "/gestor-punto-verde/actas" },
      { label: "Nueva Acta", path: "/gestor-punto-verde/nueva-acta" },
    ],
    "punto-verde": [
      { label: "Estado Actas", path: "/gestor-punto-verde/conciliadas" },
      { label: "Gestionar Operarios", path: "/gestor-punto-verde/operarios" },
    ],
  },

  "gestor-ambiental": { // Nuevo: Gestor Ambiental
    normal: [
      { label: "Actas", path: "/gestor-ambiental" },
      // { label: "Nueva Acta", path: "/gestor-ambiental/nueva-acta" }, // Si existe
      // { label: "Dashboard", path: "/gestor-ambiental/dashboard" }, // Si existe
    ],
    // No tiene variante "punto-verde" ya que es solo para gestor ambiental
  },

  admin: {
    normal: [
      { label: "Usuarios", path: "/admin/usuarios" },
      { label: "Configuraciones", path: "/admin/configuraciones" },
    ],
  },
};