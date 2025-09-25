// src/pages/gestor/ActasPage.tsx
import { ActasList, Acta } from "../../components/gestor/ActaList";

const mockActas: Acta[] = [
  { id: 1, nombre: "Juan Pérez", cedula: "123456789", sede: "Medellín", procedencia: "Producción", area: "Planta A", centroCostos: "CC-1001", categoria: "Reciclable", residuo: "Papel", motivo: "Documentos obsoletos", fecha: "2025-01-05" },
  { id: 2, nombre: "Ana Gómez", cedula: "987654321", sede: "Bogotá", procedencia: "Logística", area: "Planta B", centroCostos: "CC-2001", categoria: "Orgánico", residuo: "Cartón", motivo: "Embalajes dañados", fecha: "2025-01-12" },
];

export default function ActasPageGestor() {
  return <ActasList initialActas={mockActas} createLink="/gestor/actas/nueva" />;
}
