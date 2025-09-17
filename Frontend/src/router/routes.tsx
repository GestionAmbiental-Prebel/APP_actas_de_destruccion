// src/router/Routes.tsx
import { createBrowserRouter, Navigate } from "react-router-dom";
import Layout from "../Layout";
import { LayoutOperario } from "../components/layoutOperario";
import { FormularioActa } from "../pages/operario/formularioActa";
import { ActasOperario } from "../pages/operario/ActasOperario";
import { LoginPage } from "../pages/LoginPage";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "operario",
        element: <LayoutOperario />,
        children: [
          { path: "formulario", element: <FormularioActa /> },
          { path: "actas", element: <ActasOperario /> },
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/login" replace /> },
]);
