import React from "react";

// ---------------- TIPOS ----------------
type ResiduoItem = {
  residuo_nombre: string;
  motivo: string;
  descripcion_residuo_otro?: string;
  descripcion_motivo_otro?: string;
  peso_reportado: string | number;
  peso_conciliado?: string | number | null;
  residuo_otro?: string | null; // Para residuos peligrosos
  motivo_otro?: string | null;  // NUEVO: añadido para compatibilidad
};

type Props = {
  residuos: ResiduoItem[];
};

// ---------------- FUNCIONES AUXILIARES ----------------
const obtenerInfoResiduo = (residuo: ResiduoItem) => {
  const nombreResiduo = residuo.residuo_nombre?.toLowerCase() || '';
  const esPeligroso = nombreResiduo.includes('peligroso');
  const esOtroResiduo = nombreResiduo.includes('otro residuo') && !nombreResiduo.includes('peligroso');
  const esOtroGenerico = nombreResiduo === 'otro';
  
  // CORRECCIÓN: Buscar primero en residuo_otro, luego en descripcion_residuo_otro
  const especificacion = residuo.residuo_otro || residuo.descripcion_residuo_otro || '';
  
  return {
    nombreBase: residuo.residuo_nombre,
    especificacion,
    esPeligroso,
    esOtroResiduo,
    esOtroGenerico,
    tieneEspecificacion: !!especificacion.trim()
  };
};

const formatearNombreResiduo = (residuo: ResiduoItem) => {
  const info = obtenerInfoResiduo(residuo);
  return info.nombreBase;
};

const formatearDetalleResiduo = (residuo: ResiduoItem) => {
  const info = obtenerInfoResiduo(residuo);
  
  if (info.tieneEspecificacion) {
    return info.especificacion;
  }
  
  return '';
};

// ---------------- COMPONENTE ----------------
export default function TableResiduosActa({ residuos }: Props) {
  console.log("TableResiduosActa recibió:", residuos); 
  console.log("Primer residuo completo:", residuos[0]); // Para ver todos los campos
  
  if (!residuos || residuos.length === 0) {
    return (
      <p className="text-center text-gray-400 py-4">
        No hay residuos registrados.
      </p>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-gray-300 dark:border-gray-600">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-100 dark:bg-gray-700">
          <tr>
            <th className="p-3 border">Residuo</th>
            <th className="p-3 border">Detalle</th>
            <th className="p-3 border">Motivo</th>
            <th className="p-3 border text-right">Peso reportado (kg)</th>
            <th className="p-3 border text-right">Peso conciliado (kg)</th>
          </tr>
        </thead>

        <tbody>
          {residuos.map((r, index) => {
            console.log(`Residuo ${index}:`, r); // Depuración por cada residuo
            
            const info = obtenerInfoResiduo(r);
            const detalle = formatearDetalleResiduo(r);
            const pesoReportado = parseFloat(String(r.peso_reportado || 0)).toFixed(2);
            const pesoConciliado = r.peso_conciliado 
              ? parseFloat(String(r.peso_conciliado)).toFixed(2)
              : null;
            
            // CORRECCIÓN: Para el motivo, usar motivo_otro si está disponible
            const motivoDetalle = r.motivo_otro || r.descripcion_motivo_otro || '';
            const mostrarMotivo = r.motivo === "Otro" && motivoDetalle
              ? `Otro: ${motivoDetalle}`
              : r.motivo;
            
            return (
              <tr key={index} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700/50">
                {/* RESIDUO */}
                <td className="p-3 border">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {formatearNombreResiduo(r)}
                  </div>
                  {info.esPeligroso && (
                    <div className="mt-1">
                      <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                        ⚠️ Residuo peligroso
                      </span>
                    </div>
                  )}
                
                </td>

                {/* DETALLE */}
                <td className="p-3 border">
                  {detalle ? (
                    <div className="font-medium text-gray-900 dark:text-white">
                      {detalle}
                    </div>
                  ) : (
                    <div className="text-gray-400 dark:text-gray-500 italic text-sm">
                      —
                    </div>
                  )}
                </td>

                {/* MOTIVO */}
                <td className="p-3 border">
                  {mostrarMotivo}
                </td>

                {/* PESO REPORTADO */}
                <td className="p-3 border text-right">
                  <div className="font-bold text-lg text-blue-600 dark:text-blue-400">
                    {pesoReportado}
                  </div>
                </td>

                {/* PESO CONCILIADO */}
                <td className="p-3 border text-right">
                  {pesoConciliado ? (
                    <div className="font-bold text-lg text-green-600 dark:text-green-400">
                      {pesoConciliado}
                    </div>
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}