// src/router/routes.tsx
import { createBrowserRouter, Navigate } from "react-router-dom";
import Layout from "../Layout";

// Layouts
import { LayoutOperario } from "../components/LayoutOperario";
import { LayoutGestor } from "../components/LayoutGestor";
import { LayoutAdmin } from "../components/LayoutAdmin";

// Auth
import { LoginPage } from "../pages/LoginPage";

// Subárea
import NuevaActa from "../pages/subarea/NuevaActa";
import MisActas from "../pages/subarea/MisActas";

// Operario Punto Verde
import ActasOperarioPuntoVerde from "../pages/puntoVerde/ActasOperarioPuntoVerde";
import ConciliarActa from "../pages/puntoVerde/ConciliarActa";
import ActasConciliadas from "../pages/puntoVerde/ActasConciliadas";

// Gestor
//import Dashboard from "../pages/gestor/Dashboard";
//import EditarActa from "../pages/gestor/EditarActa";
//import NuevaActaGestor from "../pages/gestor/NuevaActa";

// Gestor Punto Verde
import ActasPageGestorPV from "../pages/gestorPuntoVerde/ActasPage";
import {NuevaActaPV} from "../pages/gestorPuntoVerde/NuevaActa";
import EditActaPage from "../pages/gestorPuntoVerde/EditActaPage";
import ActasConciliadasGestorPuntoVerde from "../pages/gestorPuntoVerde/ActasConciliadasGestorPuntoVerde";
import GestionOperariosPuntoVerde from "../pages/gestorPuntoVerde/GestionOperariosPuntoVerde";

// Admin
import {Usuarios} from "../pages/admin/Usuarios";
import {NuevoUsuario} from "../pages/admin/NuevoUsuario";
import {EditarUsuario} from "../pages/admin/EditarUsuario";
import {Configuraciones} from "../pages/admin/Configuraciones";
import {GestionarSedes} from "../pages/admin/configuraciones/GestionarSedes";

export const router = createBrowserRouter([
  // 🔓 Público
  { path: "/login", element: <LoginPage /> },

  // 🌐 App
  {
    path: "/",
    element: <Layout />,
    children: [
      // 🟡 Subárea
      {
        path: "subarea",
        element: <LayoutOperario />,
        children: [
          { index: true, element: <NuevaActa /> },           // /subarea
          { path: "mis-actas", element: <MisActas /> },      // /subarea/mis-actas
        ],
      },

      // 🟢 Operario Punto Verde
      {
        path: "punto-verde",
        element: <LayoutOperario />,
        children: [
          { index: true, element: <ActasOperarioPuntoVerde /> }, // /punto-verde
          { path: "conciliar/:id", element: <ConciliarActa /> }, // /punto-verde/conciliar/1
          { path: "conciliadas", element: <ActasConciliadas /> },// /punto-verde/conciliadas
        ],
      },

        /*
      // 🔵 Gestor Ambiental
      {
        path: "gestor",
        element: <LayoutGestor />,
        children: [
          { index: true, element: <Dashboard /> },            // /gestor
          { path: "nueva-acta", element: <NuevaActaGestor /> }, // /gestor/nueva-acta
          { path: "editar-acta/:id", element: <EditarActa /> }, // /gestor/editar-acta/1
        ],
      },
      */

      // 🟣 Gestor Punto Verde
      {
        path: "gestor-punto-verde",
        element: <LayoutGestor />,
        children: [
          { index: true, element: <ActasPageGestorPV /> },        // /gestor-punto-verde
          { path: "nueva-acta", element: <NuevaActaPV /> },       // /gestor-punto-verde/nueva-acta
          { path: "editar-acta/:id", element: <EditActaPage /> },// /gestor-punto-verde/editar-acta/1
          { path: "conciliadas", element: <ActasConciliadasGestorPuntoVerde /> },
          { path: "operarios", element: <GestionOperariosPuntoVerde /> },
        ],
      },

      // 🔴 Admin
      {
        path: "admin",
        element: <LayoutAdmin />,
        children: [
          { index: true, element: <Usuarios /> },              // /admin
          { path: "usuarios", element: <Usuarios /> },
          { path: "usuarios/nuevo", element: <NuevoUsuario /> },
          { path: "usuarios/editar/:id", element: <EditarUsuario /> },
          { path: "configuraciones", element: <Configuraciones /> },
          { path: "configuraciones/sedes", element: <GestionarSedes /> },
        ],
      },
    ],
  },

  // ❌ 404
  { path: "*", element: <Navigate to="/login" replace /> },
]);
