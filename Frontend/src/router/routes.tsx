import { RouteObject } from "react-router-dom";
import App from "../App";
import Layout from "../Layout";

export const routes: RouteObject[] = [
  {
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <App />,
      },
    ],
  },
];
