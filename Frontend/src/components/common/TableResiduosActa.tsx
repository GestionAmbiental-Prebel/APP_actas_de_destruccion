// TableResiduosActa.tsx
import React from "react";

// ---------------- TIPOS ----------------
export type ResiduoItem = {
  residuo_nombre: string;
  motivo: string;
  descripcion_residuo_otro?: string;
  descripcion_motivo_otro?: string;
  peso_reportado: string | number;
  peso_conciliado?: string | number | null;
};

type Props = {
  residuos: ResiduoItem[];
};

// ---------------- COMPONENTE ----------------
export default function TableResiduosActa({ residuos }: Props) {
  if (!residuos || residuos.length === 0) {
    return (
      <p className="text-center text-gray-400 py-4">
        No hay residuos registrados.
      </p>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-gray-300">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Residuo</th>
            <th className="p-2 border">Motivo</th>
            <th className="p-2 border">Peso reportado</th>
            <th className="p-2 border">Peso conciliado</th>
          </tr>
        </thead>

        <tbody>
          {residuos.map((r, index) => (
            <tr key={index} className="border-b">
              {/* RESIDUO */}
              <td className="p-2 border">
                {r.residuo_nombre === "Otro"
                  ? `Otro – ${r.descripcion_residuo_otro ?? ""}`
                  : r.residuo_nombre}
              </td>

              {/* MOTIVO */}
              <td className="p-2 border">
                {r.motivo === "Otro"
                  ? `Otro – ${r.descripcion_motivo_otro ?? ""}`
                  : r.motivo}
              </td>

              {/* PESO REPORTADO */}
              <td className="p-2 border">{r.peso_reportado}</td>

              {/* PESO CONCILIADO */}
              <td className="p-2 border">
                {r.peso_conciliado ?? "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
