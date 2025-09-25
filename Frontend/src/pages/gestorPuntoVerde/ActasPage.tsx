// src/pages/gestorPuntoVerde/ActasPage.tsx
import { ActasList, Acta } from "../../components/gestor/ActaList";

// Datos de ejemplo para gestor punto verde
const mockActasPV: Acta[] = [
  { id: 1, nombre: "Carlos López", cedula: "1122334455", sede: "Medellín", procedencia: "Producción", area: "Planta Verde", centroCostos: "CC-3001", categoria: "Reciclable", residuo: "Vidrio", motivo: "Exceso de inventario", fecha: "2025-02-10" },
  { id: 2, nombre: "Laura Martínez", cedula: "9988776655", sede: "Bogotá", procedencia: "Logística", area: "Planta Verde B", centroCostos: "CC-4001", categoria: "Reciclable", residuo: "Cartón", motivo: "Documentos obsoletos", fecha: "2025-02-12" },
];

export default function ActasPageGestorPV() {
  return (
    <ActasList 
      initialActas={mockActasPV} 
      createLink="/gestor-pv/actas/nueva" 
      excelFileName="Actas_PuntoVerde"
    />
  );
}
