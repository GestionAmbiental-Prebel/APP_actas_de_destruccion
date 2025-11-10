import { createBrowserRouter } from "react-router-dom";
import Layout from "../Layout";
import { LoginPage } from "../pages/LoginPage";
import { SubareaPage } from "../pages/subarea/SubareaPage";
import { ActasListPage } from "../pages/subarea/ActasListPage";
import { PrivateRoute } from "../components/PrivateRoute";
import { Navigate } from "react-router-dom";


export const newRouter = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: (
      <PrivateRoute allowedRoles={["subarea","punto-verde","gestor-ambiental","gestor-punto-verde","administrador"]}>
        <Layout />
      </PrivateRoute>
    ),
    children: [
      // Subárea
      {
        path: "subarea",
        children: [
          { index: true, element: <SubareaPage /> }, // Al entrar a /subarea, va directo al formulario
          { path: "actas", element: <ActasListPage /> }, // Mis actas
        ],
      },

      // Aquí puedes agregar otras rutas según roles
      // Ejemplo:
      // {
      //   path: "punto-verde",
      //   element: <PrivateRoute allowedRoles={["punto-verde"]}><PuntoVerdePage /></PrivateRoute>,
      // },

    {
    path: "/",
    element: <Navigate to="/login" replace />
    }
    ],
  },
]);
