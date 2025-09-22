// src/router/Routes.tsx
import { createBrowserRouter, Navigate } from "react-router-dom";
import Layout from "../Layout";
import { LayoutOperario } from "../components/LayoutOperario";
import { LayoutAdmin } from "../components/LayoutAdmin";

import { FormularioActa } from "../pages/operario/FormularioActa";
import { ActasOperario } from "../pages/operario/ActasOperario";

// 🔹 Nuevas pantallas para operario Punto Verde
import { ActasOperarioPuntoVerde } from "../pages/puntoVerde/ActasOperarioPuntoVerde";
import { ConciliarActa } from "../pages/puntoVerde/ConciliarActa";

import { Dashboard } from "../pages/admin/Dashboard";
import { ActasList } from "../pages/admin/ActasList";
import { Reportes } from "../pages/admin/Reportes";
import { NuevaActa } from "../pages/admin/NuevaActa";
import { EditarActa } from "../pages/admin/EditarActa";

import { LoginPage } from "../pages/LoginPage";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },

  {
    path: "/",
    element: <Layout />,
    children: [
      // Rutas de operario
      {
        path: "operario",
        element: <LayoutOperario />,
        children: [
          { path: "formulario", element: <FormularioActa /> },
          { path: "actas", element: <ActasOperario /> },
        ],
      },

      // 🔹 Rutas separadas de operario punto verde
      {
        path: "operario-punto-verde",
        element: <LayoutOperario />, // puedes usar el mismo layout
        children: [
          { path: "actas", element: <ActasOperarioPuntoVerde /> },
          { path: "conciliar/:id", element: <ConciliarActa /> },
        ],
      },

      // Rutas de administrador
      {
        path: "admin",
        element: <LayoutAdmin />,
        children: [
          { path: "dashboard", element: <Dashboard /> },
          { path: "actas", element: <ActasList /> },
          { path: "reportes", element: <Reportes /> },
          { path: "actas/nueva", element: <NuevaActa /> },
          { path: "actas/editar/:id", element: <EditarActa /> },
        ],
      },
    ],
  },

  { path: "*", element: <Navigate to="/login" replace /> },
]);
