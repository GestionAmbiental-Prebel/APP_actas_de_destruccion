// components/ModalEdicionActa.tsx
import { useState } from "react";
import { ConciliacionExtendida } from "../../services/actasConciliadas.service";

type ResiduoEditable = {
  acta_generacion_residuo_id: number;
  residuo_nombre: string;
  residuo_id: number;
  motivo: string;
  descripcion_residuo_otro?: string;
  descripcion_motivo_otro?: string;
  peso_reportado: string;
  peso_conciliado: string;
  motivo_otro?: string | null;
  residuo_otro?: string | null;
  categoria_id?: number | null;
  generacion_residuo_id?: number;
};

type ModalEdicionActaProps = {
  actaEditando: ConciliacionExtendida;
  residuosEditables: ResiduoEditable[];
  residuosFiltrados: any[];
  motivosFiltrados: { id: number; nombre: string }[];
  guardando: boolean;
  onClose: () => void;
  onGuardar: () => void;
  onCambioPesoConciliado: (index: number, valor: string) => void;
  onCambioResiduo: (index: number, residuoId: number) => void;
  onCambioMotivo: (index: number, motivo: string) => void;
  onCambioConsecutivo: (valor: string | null) => void;
  onCambioNumeroInventario: (valor: string | null) => void;
  onCambioOperarioDocumento: (valor: string) => void;
  onCambioConciliadorDocumento: (valor: string) => void;
  validarSoloNumeros: (valor: string | number | null | undefined) => boolean;
  validarMaximoDigitos: (valor: string | number | null | undefined, maxDigitos: number) => boolean;
};

export default function ModalEdicionActa({
  actaEditando,
  residuosEditables,
  residuosFiltrados,
  motivosFiltrados,
  guardando,
  onClose,
  onGuardar,
  onCambioPesoConciliado,
  onCambioResiduo,
  onCambioMotivo,
  onCambioConsecutivo,
  onCambioNumeroInventario,
  onCambioOperarioDocumento,
  onCambioConciliadorDocumento,
  validarSoloNumeros,
  validarMaximoDigitos,
}: ModalEdicionActaProps) {
  const [consecutivo, setConsecutivo] = useState(actaEditando.consecutivo?.toString() || "");
  const [numeroInventario, setNumeroInventario] = useState(actaEditando.numero_inventario?.toString() || "");
  const [operarioDoc, setOperarioDoc] = useState(actaEditando.operario_documento || "");
  const [conciliadorDoc, setConciliadorDoc] = useState(actaEditando.conciliador_documento || "");

  const handleConsecutivoChange = (valor: string) => {
    if (validarSoloNumeros(valor) && validarMaximoDigitos(valor, 6)) {
      setConsecutivo(valor);
      onCambioConsecutivo(valor === "" ? null : valor);
    }
  };

  const handleNumeroInventarioChange = (valor: string) => {
    if (validarSoloNumeros(valor) && validarMaximoDigitos(valor, 11)) {
      setNumeroInventario(valor);
      onCambioNumeroInventario(valor === "" ? null : valor);
    }
  };

  const handleOperarioDocChange = (valor: string) => {
    if (validarSoloNumeros(valor) && validarMaximoDigitos(valor, 10)) {
      setOperarioDoc(valor);
      onCambioOperarioDocumento(valor);
    }
  };

  const handleConciliadorDocChange = (valor: string) => {
    if (validarSoloNumeros(valor) && validarMaximoDigitos(valor, 10)) {
      setConciliadorDoc(valor);
      onCambioConciliadorDocumento(valor);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header del modal */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-skyBlue dark:text-lightBlue">
                Editar Acta #{actaEditando.numero_acta} - Resolver Novedad
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Edita todos los campos y ajusta los pesos conciliados. Al guardar, el acta será marcada como conciliada.
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Contenido del modal */}
        <div className="p-6 space-y-6">
          {/* Información general del acta */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Número Acta *</label>
              <input
                type="text"
                value={actaEditando.numero_acta}
                className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 bg-gray-100 dark:bg-gray-800"
                readOnly
                title="El número de acta no se puede modificar"
              />
              <p className="text-xs text-gray-500 mt-1">No editable</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Consecutivo (opcional)</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={consecutivo}
                onChange={(e) => handleConsecutivoChange(e.target.value)}
                className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                placeholder="Máx 6 dígitos"
                maxLength={6}
              />
              <p className="text-xs text-gray-500 mt-1">Solo números, máximo 6 dígitos</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">N° Inventario (opcional)</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={numeroInventario}
                onChange={(e) => handleNumeroInventarioChange(e.target.value)}
                className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                placeholder="Máx 11 dígitos"
                maxLength={11}
              />
              <p className="text-xs text-gray-500 mt-1">Solo números, máximo 11 dígitos</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Fecha Acta *</label>
              <input
                type="datetime-local"
                value={new Date(actaEditando.fecha_acta).toISOString().slice(0, 16)}
                className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                readOnly
              />
              <p className="text-xs text-gray-500 mt-1">No editable</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Documento Operario (Entrega) *</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={operarioDoc}
                onChange={(e) => handleOperarioDocChange(e.target.value)}
                className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                maxLength={10}
              />
              <p className="text-xs text-gray-500 mt-1">Solo números, máximo 10 dígitos</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Documento Conciliador (Recepción) *</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={conciliadorDoc}
                onChange={(e) => handleConciliadorDocChange(e.target.value)}
                className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                maxLength={10}
              />
              <p className="text-xs text-gray-500 mt-1">Solo números, máximo 10 dígitos</p>
            </div>
          </div>

          {/* Mostrar novedad */}
          {actaEditando.novedad && (
            <div className="bg-yellow-100 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-100 p-4 rounded-lg">
              <h3 className="font-bold mb-2">⚠️ Descripción de la novedad original:</h3>
              <p>{actaEditando.novedad}</p>
            </div>
          )}

          {/* Tabla de residuos editable */}
          <div className="overflow-x-auto">
            <table className="min-w-full border dark:border-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Residuo</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Descripción (si es "Otro")</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Motivo</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Descripción Motivo (si es "Otro")</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">Peso Reportado (kg)</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">Peso Conciliado (kg)</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-gray-700">
                {residuosEditables.map((residuo, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3">
                      <select
                        value={residuo.residuo_id}
                        onChange={(e) => onCambioResiduo(index, parseInt(e.target.value))}
                        className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600"
                      >
                        <option value="">Seleccione un residuo</option>
                        {residuosFiltrados.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.nombre}
                          </option>
                        ))}
                      </select>
                      {residuosFiltrados.length === 0 && (
                        <p className="text-xs text-yellow-600 mt-1">
                          No hay residuos disponibles para esta subárea
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {residuosEditables[index].residuo_nombre === "Otro" ? (
                        <input
                          type="text"
                          value={residuo.descripcion_residuo_otro || ""}
                          onChange={(e) => {
                            const nuevosResiduos = [...residuosEditables];
                            nuevosResiduos[index].descripcion_residuo_otro = e.target.value;
                            nuevosResiduos[index].residuo_otro = e.target.value;
                          }}
                          placeholder="Descripción del residuo..."
                          className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600"
                        />
                      ) : (
                        <span className="text-gray-500 text-sm">No aplica</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={residuo.motivo}
                        onChange={(e) => onCambioMotivo(index, e.target.value)}
                        className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600"
                      >
                        <option value="">Seleccione un motivo</option>
                        {motivosFiltrados.map((m) => (
                          <option key={m.id} value={m.nombre}>
                            {m.nombre}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      {residuosEditables[index].motivo === "Otro" ? (
                        <input
                          type="text"
                          value={residuo.descripcion_motivo_otro || ""}
                          onChange={(e) => {
                            const nuevosResiduos = [...residuosEditables];
                            nuevosResiduos[index].descripcion_motivo_otro = e.target.value;
                            nuevosResiduos[index].motivo_otro = e.target.value;
                          }}
                          placeholder="Descripción del motivo..."
                          className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600"
                        />
                      ) : (
                        <span className="text-gray-500 text-sm">No aplica</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {parseFloat(residuo.peso_reportado).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={residuo.peso_conciliado}
                        onChange={(e) =>
                          onCambioPesoConciliado(index, e.target.value)
                        }
                        className="w-32 px-2 py-1 border rounded text-right dark:bg-gray-700 dark:border-gray-600"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <td colSpan={4} className="px-4 py-3 text-sm font-bold">
                    TOTAL
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-right">
                    {residuosEditables
                      .reduce((sum, r) => sum + parseFloat(r.peso_reportado), 0)
                      .toFixed(2)}{" "}
                    kg
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-right">
                    {residuosEditables
                      .reduce(
                        (sum, r) => sum + parseFloat(r.peso_conciliado || "0"),
                        0
                      )
                      .toFixed(2)}{" "}
                    kg
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Footer del modal */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t dark:border-gray-700 p-6 flex justify-between items-center">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            ⓘ Al guardar, la novedad será eliminada y el acta quedará como <span className="font-bold text-green-600">CONCILIADA</span>
          </div>
          <div className="flex gap-4">
            <button
              onClick={onClose}
              disabled={guardando}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={onGuardar}
              disabled={guardando}
              className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition disabled:opacity-50 flex items-center gap-2"
            >
              {guardando ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Guardando...
                </>
              ) : (
                "✓ Guardar Cambios y Conciliar Acta"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}