// components/ModalEdicionActa.tsx
import { useState, useEffect } from "react";

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

// Tipo para acta editando
type ActaEditandoType = {
  id: number;
  acta_id?: number;
  numero_acta: string;
  fecha_acta: string;
  consecutivo?: string | number | null;
  numero_inventario?: string | number | null;
  operario_documento?: string;
  operario_nombre?: string;
  conciliador_documento?: string;
  conciliador_nombre?: string;
  novedad?: string;
  tipo?: string;
  estado_conciliacion?: string;
  subarea_id?: number | null;
  subarea_nombre?: string;
  centro_costo_id?: number | null;
  centro_costo_codigo?: string;
  centro_costo_nombre?: string;
  // Otros campos que puedan ser necesarios
  [key: string]: any;
};

type ModalEdicionActaProps = {
  actaEditando: ActaEditandoType;
  residuosEditables: ResiduoEditable[];
  residuosFiltrados: any[];
  motivosFiltrados: { id: number; nombre: string }[];
  
  // Catálogos para editar todo
  subareas?: any[];
  centrosCosto?: any[];
  operarios?: any[];
  operariosPuntoVerde?: any[]; // NUEVO: Operarios de punto verde (conciliadores)
  
  guardando: boolean;
  onClose: () => void;
  onGuardar: () => void;
  onCambioPesoConciliado: (index: number, valor: string) => void;
  onCambioResiduo: (index: number, residuoId: number) => void;
  onCambioMotivo: (index: number, motivo: string) => void;
  
  // Callbacks para cambios adicionales
  onCambioSubarea?: (subareaId: number | null) => void;
  onCambioCentroCosto?: (centroCostoId: number | null) => void;
  onCambioOperario?: (operarioId: number | null, operarioDocumento?: string) => void;
  onCambioConciliador?: (conciliadorId: number | null, conciliadorDocumento?: string) => void; // NUEVO
  
  // Callbacks existentes
  onCambioConsecutivo: (valor: string | null) => void;
  onCambioNumeroInventario: (valor: string | null) => void;
  onCambioOperarioDocumento: (valor: string) => void;
  onCambioConciliadorDocumento: (valor: string) => void;
  
  // Callbacks para manejo de residuos en edición
  onAgregarResiduo?: () => void;
  onEliminarResiduo?: (index: number) => void;
  onCambioPesoReportado?: (index: number, valor: string) => void;
  onCambioDescripcionResiduoOtro?: (index: number, valor: string) => void;
  onCambioDescripcionMotivoOtro?: (index: number, valor: string) => void;
  
  validarSoloNumeros: (valor: string | number | null | undefined) => boolean;
  validarMaximoDigitos: (valor: string | number | null | undefined, maxDigitos: number) => boolean;
  
  // Configuración del modal
  modo?: "conciliacion" | "edicion_completa";
  esNovedad?: boolean;
  permiteEditarTodo?: boolean;
};

export default function ModalEdicionActa({
  actaEditando,
  residuosEditables,
  residuosFiltrados,
  motivosFiltrados,
  
  // Nuevas props
  subareas = [],
  centrosCosto = [],
  operarios = [],
  operariosPuntoVerde = [], // NUEVO
  
  guardando,
  onClose,
  onGuardar,
  onCambioPesoConciliado,
  onCambioResiduo,
  onCambioMotivo,
  onCambioSubarea,
  onCambioCentroCosto,
  onCambioOperario,
  onCambioConciliador, // NUEVO
  onCambioConsecutivo,
  onCambioNumeroInventario,
  onCambioOperarioDocumento,
  onCambioConciliadorDocumento,
  onAgregarResiduo,
  onEliminarResiduo,
  onCambioPesoReportado,
  onCambioDescripcionResiduoOtro,
  onCambioDescripcionMotivoOtro,
  validarSoloNumeros,
  validarMaximoDigitos,
  modo = "conciliacion",
  esNovedad = false,
  permiteEditarTodo = false,
}: ModalEdicionActaProps) {
  const [consecutivo, setConsecutivo] = useState(actaEditando.consecutivo?.toString() || "");
  const [numeroInventario, setNumeroInventario] = useState(actaEditando.numero_inventario?.toString() || "");
  const [operarioDoc, setOperarioDoc] = useState(actaEditando.operario_documento || "");
  const [conciliadorDoc, setConciliadorDoc] = useState(actaEditando.conciliador_documento || "");
  
  // Estados para campos editables
  const [subareaId, setSubareaId] = useState<number | null>(actaEditando.subarea_id || null);
  const [centroCostoId, setCentroCostoId] = useState<number | null>(actaEditando.centro_costo_id || null);
  const [operarioId, setOperarioId] = useState<number | null>(null);
  const [conciliadorId, setConciliadorId] = useState<number | null>(null); // NUEVO
  
  // Estados para nombres autocompletados
  const [nombreOperarioAutocompletado, setNombreOperarioAutocompletado] = useState<string>("");
  const [nombreConciliadorAutocompletado, setNombreConciliadorAutocompletado] = useState<string>("");
  
  // Estado para mostrar/ocultar campos avanzados
  const [mostrarCamposAvanzados, setMostrarCamposAvanzados] = useState(false);

  // Determinar qué podemos editar
  const esEdicionCompleta = modo === "edicion_completa";
  const puedeEditarTodo = esEdicionCompleta || permiteEditarTodo || mostrarCamposAvanzados;

  // Efecto para autocompletar nombre del operario cuando cambia el documento
  useEffect(() => {
    if (operarioDoc && operarios.length > 0) {
      const operario = operarios.find(op => op.documento === operarioDoc);
      if (operario) {
        setNombreOperarioAutocompletado(`${operario.nombre} ${operario.apellido || ""}`.trim());
      } else {
        setNombreOperarioAutocompletado("");
      }
    } else {
      setNombreOperarioAutocompletado("");
    }
  }, [operarioDoc, operarios]);

  // Efecto para autocompletar nombre del conciliador cuando cambia el documento
  useEffect(() => {
    if (conciliadorDoc && operariosPuntoVerde.length > 0) {
      const conciliador = operariosPuntoVerde.find(op => op.documento === conciliadorDoc);
      if (conciliador) {
        setNombreConciliadorAutocompletado(`${conciliador.nombre} ${conciliador.apellido || ""}`.trim());
      } else {
        setNombreConciliadorAutocompletado("");
      }
    } else {
      setNombreConciliadorAutocompletado("");
    }
  }, [conciliadorDoc, operariosPuntoVerde]);

  // Títulos según el modo
  const getTitulo = () => {
    if (esEdicionCompleta) return `Editar Acta #${actaEditando.numero_acta}`;
    if (esNovedad) return `Resolver Novedad - Acta #${actaEditando.numero_acta}`;
    return `Conciliar Acta #${actaEditando.numero_acta}`;
  };

  const getSubtitulo = () => {
    if (puedeEditarTodo) {
      return "Puedes editar todos los campos del acta. Corrige los errores y completa la conciliación.";
    }
    if (esNovedad) {
      return "Resuelve la novedad ajustando los pesos conciliados y completando los datos faltantes.";
    }
    return "Completa los datos de conciliación para finalizar el proceso.";
  };

  // Handlers para campos básicos
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

  // Handlers para nuevos campos
  const handleSubareaChange = (valor: string) => {
    const id = valor ? parseInt(valor) : null;
    setSubareaId(id);
    onCambioSubarea?.(id);
  };

  const handleCentroCostoChange = (valor: string) => {
    const id = valor ? parseInt(valor) : null;
    setCentroCostoId(id);
    onCambioCentroCosto?.(id);
    
    // Autocompletar subárea si el centro de costo tiene una
    if (id) {
      const centro = centrosCosto.find(cc => cc.id === id);
      if (centro && centro.subarea_id) {
        setSubareaId(centro.subarea_id);
        onCambioSubarea?.(centro.subarea_id);
      }
    }
  };

  const handleOperarioChange = (valor: string) => {
    const id = valor ? parseInt(valor) : null;
    setOperarioId(id);
    
    // Autocompletar documento del operario
    if (id) {
      const operario = operarios.find(op => op.id === id);
      if (operario) {
        setOperarioDoc(operario.documento);
        onCambioOperario?.(id, operario.documento);
        onCambioOperarioDocumento(operario.documento);
      }
    } else {
      onCambioOperario?.(null);
    }
  };

  // NUEVO: Handler para cambio de conciliador
  const handleConciliadorChange = (valor: string) => {
    const id = valor ? parseInt(valor) : null;
    setConciliadorId(id);
    
    // Autocompletar documento del conciliador
    if (id) {
      const conciliador = operariosPuntoVerde.find(op => op.id === id);
      if (conciliador) {
        setConciliadorDoc(conciliador.documento);
        onCambioConciliador?.(id, conciliador.documento);
        onCambioConciliadorDocumento(conciliador.documento);
      }
    } else {
      onCambioConciliador?.(null);
    }
  };

  // Función para manejar cambio de descripción residuo "Otro"
  const handleCambioDescripcionResiduoOtro = (index: number, valor: string) => {
    if (onCambioDescripcionResiduoOtro) {
      onCambioDescripcionResiduoOtro(index, valor);
    } else {
      // Actualizar localmente si no hay callback
      const nuevosResiduos = [...residuosEditables];
      nuevosResiduos[index].descripcion_residuo_otro = valor;
      nuevosResiduos[index].residuo_otro = valor;
    }
  };

  // Función para manejar cambio de descripción motivo "Otro"
  const handleCambioDescripcionMotivoOtro = (index: number, valor: string) => {
    if (onCambioDescripcionMotivoOtro) {
      onCambioDescripcionMotivoOtro(index, valor);
    } else {
      // Actualizar localmente si no hay callback
      const nuevosResiduos = [...residuosEditables];
      nuevosResiduos[index].descripcion_motivo_otro = valor;
      nuevosResiduos[index].motivo_otro = valor;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-skyBlue dark:text-lightBlue">
                {getTitulo()}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {getSubtitulo()}
              </p>
              {/* Badge de estado */}
              <div className="flex gap-2 mt-2">
                {esNovedad && (
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-full text-xs font-semibold">
                    ⚠️ Con Novedad
                  </span>
                )}
                {puedeEditarTodo && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-xs font-semibold">
                    ✏️ Modo Edición Completa
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
              disabled={guardando}
            >
              ×
            </button>
          </div>
        </div>

        {/* Contenido del modal */}
        <div className="p-6 space-y-6">
          {/* Botón para expandir/contraer campos avanzados */}
          {!esEdicionCompleta && !permiteEditarTodo && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setMostrarCamposAvanzados(!mostrarCamposAvanzados)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition flex items-center gap-2 text-sm"
              >
                {mostrarCamposAvanzados ? (
                  <>
                    <span>↑</span>
                    Ocultar campos avanzados
                  </>
                ) : (
                  <>
                    <span>✏️</span>
                    Editar más campos (subárea, centro de costo, etc.)
                  </>
                )}
              </button>
            </div>
          )}

          {/* Información del Acta */}
          <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
            <h3 className="text-lg font-bold mb-4">📋 Información del Acta</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Número de Acta (no editable) */}
              <div>
                <label className="block text-sm font-medium mb-1">Número Acta *</label>
                <input
                  type="text"
                  value={actaEditando.numero_acta}
                  className="w-full px-3 py-2 border rounded bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                  readOnly
                />
                <p className="text-xs text-gray-500 mt-1">No editable</p>
              </div>

              {/* Fecha (no editable) */}
              <div>
                <label className="block text-sm font-medium mb-1">Fecha Acta *</label>
                <input
                  type="datetime-local"
                  value={new Date(actaEditando.fecha_acta).toISOString().slice(0, 16)}
                  className="w-full px-3 py-2 border rounded bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                  readOnly
                />
                <p className="text-xs text-gray-500 mt-1">No editable</p>
              </div>

              {/* Subárea (editable solo si no hay centro de costo seleccionado) */}
              {puedeEditarTodo && (
                <div>
                  <label className="block text-sm font-medium mb-1">Subárea</label>
                  {centroCostoId ? (
                    // Si hay centro de costo seleccionado, mostrar como solo lectura
                    <div>
                      <input
                        type="text"
                        value={subareas.find(s => s.id === subareaId)?.nombre || actaEditando.subarea_nombre || "Seleccionando..."}
                        className="w-full px-3 py-2 border rounded bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                        readOnly
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Se autocompleta al seleccionar un centro de costo
                      </p>
                    </div>
                  ) : (
                    // Si no hay centro de costo, permitir seleccionar
                    <select
                      value={subareaId || ""}
                      onChange={(e) => handleSubareaChange(e.target.value)}
                      className="w-full px-3 py-2 border rounded dark:bg-gray-700"
                    >
                      <option value="">Seleccionar subárea</option>
                      {subareas.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.nombre}
                        </option>
                      ))}
                    </select>
                  )}
                  {actaEditando.subarea_nombre && !subareaId && !centroCostoId && (
                    <p className="text-xs text-gray-500 mt-1">
                      Actual: {actaEditando.subarea_nombre}
                    </p>
                  )}
                </div>
              )}

              {/* Centro de Costo (editable si puedeEditarTodo) */}
              {puedeEditarTodo && (
                <div>
                  <label className="block text-sm font-medium mb-1">Centro de Costo</label>
                  <select
                    value={centroCostoId || ""}
                    onChange={(e) => handleCentroCostoChange(e.target.value)}
                    className="w-full px-3 py-2 border rounded dark:bg-gray-700"
                  >
                    <option value="">Seleccionar centro de costo</option>
                    {centrosCosto.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.codigo} - {c.nombre}
                      </option>
                    ))}
                  </select>
                  {actaEditando.centro_costo_codigo && !centroCostoId && (
                    <p className="text-xs text-gray-500 mt-1">
                      Actual: {actaEditando.centro_costo_codigo} - {actaEditando.centro_costo_nombre}
                    </p>
                  )}
                </div>
              )}

              {/* Consecutivo */}
              <div>
                <label className="block text-sm font-medium mb-1">Consecutivo (opcional)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={consecutivo}
                  onChange={(e) => handleConsecutivoChange(e.target.value)}
                  className="w-full px-3 py-2 border rounded dark:bg-gray-700"
                  placeholder="Máx 6 dígitos"
                  maxLength={6}
                />
                <p className="text-xs text-gray-500 mt-1">Solo números, máximo 6 dígitos</p>
              </div>

              {/* Número Inventario */}
              <div>
                <label className="block text-sm font-medium mb-1">N° Inventario (opcional)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={numeroInventario}
                  onChange={(e) => handleNumeroInventarioChange(e.target.value)}
                  className="w-full px-3 py-2 border rounded dark:bg-gray-700"
                  placeholder="Máx 11 dígitos"
                  maxLength={11}
                />
                <p className="text-xs text-gray-500 mt-1">Solo números, máximo 11 dígitos</p>
              </div>
            </div>
          </div>

          {/* Información de Personas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Operario */}
            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
              <h3 className="text-lg font-bold mb-4">👤 Operario (Entrega)</h3>
              
              {/* Si puede editar todo y hay operarios, mostrar select */}
              {puedeEditarTodo && operarios.length > 0 ? (
                <div>
                  <label className="block text-sm font-medium mb-2">Seleccionar Operario</label>
                  <select
                    value={operarioId || ""}
                    onChange={(e) => handleOperarioChange(e.target.value)}
                    className="w-full px-3 py-2 border rounded dark:bg-gray-700 mb-3"
                  >
                    <option value="">Seleccionar operario</option>
                    {operarios.map((op) => (
                      <option key={op.id} value={op.id}>
                        {op.documento} - {op.nombre} {op.apellido || ""}
                      </option>
                    ))}
                  </select>
                  <div className="text-xs text-gray-500">
                    O ingresa manualmente el documento:
                  </div>
                </div>
              ) : null}
              
              {/* Documento del operario (siempre editable) */}
              <div>
                <label className="block text-sm font-medium mb-2">Documento del Operario *</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={operarioDoc}
                  onChange={(e) => handleOperarioDocChange(e.target.value)}
                  className="w-full px-3 py-2 border rounded dark:bg-gray-700"
                  placeholder="Ej: 1234567890"
                  maxLength={10}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Solo números, máximo 10 dígitos</p>
                
                {/* Nombre autocompletado del operario */}
                {nombreOperarioAutocompletado && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    Operario: {nombreOperarioAutocompletado}
                  </p>
                )}
                {actaEditando.operario_nombre && !nombreOperarioAutocompletado && (
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    Actual: {actaEditando.operario_nombre}
                  </p>
                )}
              </div>
            </div>

            {/* Conciliador (Operario Punto Verde) */}
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <h3 className="text-lg font-bold mb-4">👤 Conciliador (Punto Verde) *</h3>
              
              {/* Si puede editar todo y hay operarios de punto verde, mostrar select */}
              {puedeEditarTodo && operariosPuntoVerde.length > 0 ? (
                <div>
                  <label className="block text-sm font-medium mb-2">Seleccionar Conciliador</label>
                  <select
                    value={conciliadorId || ""}
                    onChange={(e) => handleConciliadorChange(e.target.value)}
                    className="w-full px-3 py-2 border rounded dark:bg-gray-700 mb-3"
                  >
                    <option value="">Seleccionar conciliador</option>
                    {operariosPuntoVerde.map((op) => (
                      <option key={op.id} value={op.id}>
                        {op.documento} - {op.nombre} {op.apellido || ""}
                      </option>
                    ))}
                  </select>
                  <div className="text-xs text-gray-500">
                    O ingresa manualmente el documento:
                  </div>
                </div>
              ) : null}
              
              {/* Documento del conciliador (siempre editable) */}
              <div>
                <label className="block text-sm font-medium mb-2">Documento del Conciliador *</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={conciliadorDoc}
                  onChange={(e) => handleConciliadorDocChange(e.target.value)}
                  className="w-full px-3 py-2 border rounded dark:bg-gray-700"
                  placeholder="Ej: 1234567890"
                  maxLength={10}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Solo números, máximo 10 dígitos</p>
                
                {/* Nombre autocompletado del conciliador */}
                {nombreConciliadorAutocompletado && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    Conciliador: {nombreConciliadorAutocompletado}
                  </p>
                )}
                {actaEditando.conciliador_nombre && !nombreConciliadorAutocompletado && (
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    Actual: {actaEditando.conciliador_nombre}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* NOVEDAD (si existe) */}
          {esNovedad && actaEditando.novedad && (
            <div className="bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-yellow-500 p-4 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-yellow-500">⚠️</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
                    Novedad a resolver
                  </h3>
                  <div className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                    <p>{actaEditando.novedad}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Residuos */}
          <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">♻️ Residuos</h3>
              {/* Botón para agregar residuo (solo si puede editar todo) */}
              {puedeEditarTodo && onAgregarResiduo && (
                <button
                  type="button"
                  onClick={onAgregarResiduo}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition flex items-center gap-2 text-sm"
                >
                  <span>+</span>
                  Agregar Residuo
                </button>
              )}
            </div>

            {residuosEditables.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No hay residuos registrados.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border dark:border-gray-700">
                  <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr>
                      {/* Columna de acciones si puede eliminar */}
                      {puedeEditarTodo && onEliminarResiduo && (
                        <th className="px-4 py-3 text-left text-sm font-semibold w-20">Acciones</th>
                      )}
                      <th className="px-4 py-3 text-left text-sm font-semibold">Residuo</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Descripción (si es "Otro")</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Motivo</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold">Peso Reportado (kg)</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold">Peso Conciliado (kg) *</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-gray-700">
                    {residuosEditables.map((residuo, index) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        {/* Botón de eliminar */}
                        {puedeEditarTodo && onEliminarResiduo && (
                          <td className="px-4 py-3">
                            <button
                              type="button"
                              onClick={() => onEliminarResiduo(index)}
                              className="text-red-500 hover:text-red-700 text-lg font-bold w-8 h-8 flex items-center justify-center"
                              title="Eliminar residuo"
                            >
                              ×
                            </button>
                          </td>
                        )}
                        
                        {/* Residuo */}
                        <td className="px-4 py-3">
                          <select
                            value={residuo.residuo_id}
                            onChange={(e) => onCambioResiduo(index, parseInt(e.target.value))}
                            className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600"
                            disabled={!puedeEditarTodo}
                          >
                            <option value="">Seleccionar residuo</option>
                            {residuosFiltrados.map((r) => (
                              <option key={r.id} value={r.id}>
                                {r.nombre}
                              </option>
                            ))}
                          </select>
                          {residuosFiltrados.length === 0 && (
                            <p className="text-xs text-yellow-600 mt-1">
                              No hay residuos disponibles
                            </p>
                          )}
                        </td>
                        
                        {/* Descripción si es "Otro" */}
                        <td className="px-4 py-3">
                          {residuosEditables[index].residuo_nombre === "Otro" ? (
                            <input
                              type="text"
                              value={residuo.descripcion_residuo_otro || ""}
                              onChange={(e) => handleCambioDescripcionResiduoOtro(index, e.target.value)}
                              placeholder="Descripción del residuo..."
                              className="w-full px-2 py-1 border rounded dark:bg-gray-700"
                              disabled={!puedeEditarTodo}
                            />
                          ) : (
                            <span className="text-gray-500 text-sm">-</span>
                          )}
                        </td>
                        
                        {/* Motivo */}
                        <td className="px-4 py-3">
                          <select
                            value={residuo.motivo}
                            onChange={(e) => onCambioMotivo(index, e.target.value)}
                            className="w-full px-2 py-1 border rounded dark:bg-gray-700"
                            disabled={!puedeEditarTodo}
                          >
                            <option value="">Seleccionar motivo</option>
                            {motivosFiltrados.map((m) => (
                              <option key={m.id} value={m.nombre}>
                                {m.nombre}
                              </option>
                            ))}
                          </select>
                        </td>
                        
                        {/* Peso Reportado */}
                        <td className="px-4 py-3 text-right">
                          {puedeEditarTodo && onCambioPesoReportado ? (
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={residuo.peso_reportado}
                              onChange={(e) => onCambioPesoReportado(index, e.target.value)}
                              className="w-24 px-2 py-1 border rounded text-right dark:bg-gray-700"
                            />
                          ) : (
                            <span className="font-medium">
                              {parseFloat(residuo.peso_reportado).toFixed(2)}
                            </span>
                          )}
                        </td>
                        
                        {/* Peso Conciliado (SIEMPRE editable en conciliación) */}
                        <td className="px-4 py-3 text-right">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={residuo.peso_conciliado}
                            onChange={(e) => onCambioPesoConciliado(index, e.target.value)}
                            className="w-24 px-2 py-1 border rounded text-right dark:bg-gray-700 font-bold"
                            required
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-100 dark:bg-gray-800">
                    <tr>
                      <td 
                        colSpan={puedeEditarTodo && onEliminarResiduo ? 4 : 3} 
                        className="px-4 py-3 text-sm font-bold text-right"
                      >
                        TOTAL:
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-right">
                        {residuosEditables
                          .reduce((sum, r) => sum + parseFloat(r.peso_reportado || "0"), 0)
                          .toFixed(2)} kg
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-right">
                        {residuosEditables
                          .reduce((sum, r) => sum + parseFloat(r.peso_conciliado || "0"), 0)
                          .toFixed(2)} kg
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t dark:border-gray-700 p-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {esNovedad ? (
                <p><strong>⚠️ Resolución de novedad:</strong> Corrige los errores y concilia el acta.</p>
              ) : puedeEditarTodo ? (
                <p><strong>✏️ Modo edición completa:</strong> Todos los cambios se guardarán al conciliar.</p>
              ) : (
                <p><strong>✅ Conciliación:</strong> Completa los datos para finalizar.</p>
              )}
              {mostrarCamposAvanzados && !permiteEditarTodo && !esEdicionCompleta && (
                <p className="text-xs mt-1">
                  Los campos avanzados se guardarán junto con la conciliación.
                </p>
              )}
            </div>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={onClose}
                disabled={guardando}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={onGuardar}
                disabled={guardando}
                className={`px-6 py-2 text-white rounded hover:opacity-90 transition disabled:opacity-50 flex items-center gap-2 ${
                  esNovedad ? "bg-yellow-500 hover:bg-yellow-600" :
                  "bg-green-500 hover:bg-green-600"
                }`}
              >
                {guardando ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Guardando...
                  </>
                ) : esNovedad ? (
                  "✅ Resolver Novedad y Conciliar"
                ) : (
                  "✅ Guardar y Conciliar"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}