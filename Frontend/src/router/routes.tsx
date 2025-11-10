// src/router/Routes.tsx
import { createBrowserRouter, Navigate } from "react-router-dom";
import Layout from "../Layout";
import { LayoutOperario } from "../components/LayoutOperario";
import { LayoutGestor } from "../components/LayoutGestor";
import { LayoutAdmin } from "../components/LayoutAdmin";


// 🔹 Operario Punto Verde
import { ActasOperarioPuntoVerde } from "../pages/puntoVerde/ActasOperarioPuntoVerde";
import { ConciliarActa } from "../pages/puntoVerde/ConciliarActa";
import { ActasConciliadas } from "../pages/puntoVerde/ActasConciliadas";

// 🔹 Gestor Normal
import { Dashboard } from "../pages/gestor/Dashboard";
import ActasPageGestor from "../pages/gestor/ActasPage";
import { NuevaActa } from "../pages/gestor/NuevaActa";
import { EditarActa } from "../pages/gestor/EditarActa";
import { Reportes } from "../pages/gestor/Reportes";

// 🔹 Gestor Punto Verde
import { DashboardPuntoVerde } from "../pages/gestorPuntoVerde/DashboardPuntoVerde";
import ActasPageGestorPV from "../pages/gestorPuntoVerde/ActasPage";
import { NuevaActaPV } from "../pages/gestorPuntoVerde/NuevaActa";
import { EditarActaPV } from "../pages/gestorPuntoVerde/EditarActa";
import { ActasConciliadasGestorPuntoVerde } from "../pages/gestorPuntoVerde/ActasConciliadasGestorPuntoVerde";

// 🔹 Admin
//import { LayoutAdmin } from "../components/LayoutAdmin";
import { Usuarios } from "../pages/admin/Usuarios";
import { NuevoUsuario } from "../pages/admin/NuevoUsuario";
import { EditarUsuario } from "../pages/admin/EditarUsuario";
import { Configuraciones } from "../pages/admin/Configuraciones";
import { GestionarSedes } from "../pages/admin/configuraciones/GestionarSedes";


import { LoginPage } from "../pages/LoginPage";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },

  {
    path: "/",
    element: <Layout />,
    children: [
     

      // Operario Punto Verde
      {
        path: "operario-punto-verde",
        element: <LayoutOperario />,
        children: [
          { path: "actas", element: <ActasOperarioPuntoVerde /> },
          { path: "conciliar/:id", element: <ConciliarActa /> },
          { path: "conciliadas", element: <ActasConciliadas /> },
        ],
      },

      // Gestor normal
      {
        path: "gestor",
        element: <LayoutGestor />,
        children: [
          { path: "dashboard", element: <Dashboard /> },
          { path: "actas", element: <ActasPageGestor /> },
          { path: "actas/nueva", element: <NuevaActa /> },
          { path: "actas/editar/:id", element: <EditarActa /> },
          { path: "reportes", element: <Reportes /> },
        ],
      },

      // Gestor Punto Verde
      {
        path: "gestor-punto-verde",
        element: <LayoutGestor />,
        children: [
          { path: "dashboard", element: <DashboardPuntoVerde /> },
          { path: "actas", element: <ActasPageGestorPV /> },
          { path: "actas/nueva", element: <NuevaActaPV /> },
          { path: "actas/editar/:id", element: <EditarActaPV /> },
          { path: "actas-conciliadas", element: <ActasConciliadasGestorPuntoVerde /> },
          { path: "reportes", element: <Reportes /> },
        ],
      },

      // Admin
      {
        path: "admin",
        element: <LayoutAdmin />,
        children: [
          { path: "usuarios", element: <Usuarios /> },
          { path: "usuarios/nuevo", element: <NuevoUsuario /> },
          { path: "usuarios/editar/:id", element: <EditarUsuario /> },
          { path: "configuraciones", element: <Configuraciones /> },
          { path: "configuraciones/sedes", element: <GestionarSedes /> },
      
          
        ],
      },
    ],
  },

  // Redirigir rutas desconocidas
  { path: "*", element: <Navigate to="/login" replace /> },
]);
