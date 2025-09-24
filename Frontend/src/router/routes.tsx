// src/router/Routes.tsx
import { createBrowserRouter, Navigate } from "react-router-dom";
import Layout from "../Layout";
import { LayoutOperario } from "../components/LayoutOperario";
import { LayoutGestor } from "../components/LayoutGestor";

// 🔹 Operario
import  FormularioActa  from "../pages/operario/FormularioActa";
import ActasOperario from "../pages/operario/ActasOperario";

// 🔹 Operario Punto Verde
import { ActasOperarioPuntoVerde } from "../pages/puntoVerde/ActasOperarioPuntoVerde";
import { ConciliarActa } from "../pages/puntoVerde/ConciliarActa";
import { ActasConciliadas } from "../pages/puntoVerde/ActasConciliadas";

// 🔹 Gestor
import { Dashboard } from "../pages/gestor/Dashboard";
import { ActasList } from "../pages/gestor/ActasList";
import { Reportes } from "../pages/gestor/Reportes";
import { NuevaActa } from "../pages/gestor/NuevaActa";
import { EditarActa } from "../pages/gestor/EditarActa";

// 🔹 Admin
import { LayoutAdmin } from "../components/LayoutAdmin";
import { Usuarios } from "../pages/admin/Usuarios";
import { Configuraciones } from "../pages/admin/Configuraciones";
import { NuevoUsuario } from "../pages/admin/NuevoUsuario";
import { EditarUsuario } from "../pages/admin/EditarUsuario";

// 🔹 Admin Configuraciones
import { GestionarSedes } from "../pages/admin/configuraciones/GestionarSedes";

// 🔹 Gestor Punto Verde
import { ActasConciliadasGestorPuntoVerde } from "../pages/gestorPuntoVerde/ActasConciliadasGestorPuntoVerde";

import { LoginPage } from "../pages/LoginPage";
import { DashboardPuntoVerde } from "../pages/gestorPuntoVerde/DashboardPuntoVerde";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },

  {
    path: "/",
    element: <Layout />,
    children: [
      // Rutas de operario general
      {
        path: "operario",
        element: <LayoutOperario />,
        children: [
          { path: "formulario", element: <FormularioActa /> },
          { path: "actas", element: <ActasOperario /> },
        ],
      },

      // Rutas de operario Punto Verde
      {
        path: "operario-punto-verde",
        element: <LayoutOperario />,
        children: [
          { path: "actas", element: <ActasOperarioPuntoVerde /> },
          { path: "conciliar/:id", element: <ConciliarActa /> },
          { path: "conciliadas", element: <ActasConciliadas /> },
        ],
      },

      // Rutas de Gestor
      {
        path: "gestor",
        element: <LayoutGestor />,
        children: [
          { path: "dashboard", element: <Dashboard /> },
          { path: "actas", element: <ActasList /> },
          { path: "reportes", element: <Reportes /> },
          { path: "actas/nueva", element: <NuevaActa /> },
          { path: "actas/editar/:id", element: <EditarActa /> },
        ],
      },

      // Rutas de Gestor Punto Verde
      {
        path: "gestor-punto-verde",
        element: <LayoutGestor />,
        children: [
          { path: "dashboard", element: <DashboardPuntoVerde /> },
          { path: "actas", element: <ActasList /> },
          { path: "reportes", element: <Reportes /> },
          { path: "actas-conciliadas", element: <ActasConciliadasGestorPuntoVerde /> },
        ],
      },

      // Rutas de Admin
      {
        path: "admin",
        element: <LayoutAdmin />,
        children: [
          { path: "usuarios", element: <Usuarios /> },
          { path: "usuarios/nuevo", element: <NuevoUsuario /> },
          { path: "usuarios/editar/:id", element: <EditarUsuario /> },
          { path: "configuraciones", element: <Configuraciones /> },

          // 🔹 Subrutas de configuraciones
          { path: "configuraciones/sedes", element: <GestionarSedes /> },
        ],
      },
    ],
  },

  // Redirigir rutas desconocidas
  { path: "*", element: <Navigate to="/login" replace /> },
]);
