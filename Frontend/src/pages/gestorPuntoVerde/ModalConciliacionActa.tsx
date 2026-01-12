// components/ModalConciliacionActa.tsx - VERSIÓN SIN BOTÓN ELIMINAR
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
  novedad_residuo?: string | null;
};

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
  [key: string]: any;
};

type ModalEdicionActaProps = {
  actaEditando: ActaEditandoType;
  residuosEditables: ResiduoEditable[];
  residuosFiltrados: any[];
  motivosFiltrados: { id: number; nombre: string }[];
  
  subareas?: any[];
  centrosCosto?: any[];
  operarios?: any[];
  operariosPuntoVerde?: any[];
  
  guardando: boolean;
  onClose: () => void;
  onGuardar: () => void;
  onCambioPesoConciliado: (index: number, valor: string) => void;
  onCambioResiduo: (index: number, residuoId: number) => void;
  onCambioMotivo: (index: number, motivo: string) => void;
  
  onCambioSubarea?: (subareaId: number | null) => void;
  onCambioCentroCosto?: (centroCostoId: number | null) => void;
  onCambioOperario?: (operarioId: number | null, operarioDocumento?: string) => void;
  onCambioConciliador?: (conciliadorId: number | null, conciliadorDocumento?: string) => void;
  
  onCambioConsecutivo: (valor: string | null) => void;
  onCambioNumeroInventario: (valor: string | null) => void;
  onCambioOperarioDocumento: (valor: string) => void;
  onCambioConciliadorDocumento: (valor: string) => void;
  
  onAgregarResiduo?: () => void;
  onEliminarResiduo?: (index: number) => void;
  onCambioPesoReportado?: (index: number, valor: string) => void;
  onCambioDescripcionResiduoOtro?: (index: number, valor: string) => void;
  onCambioDescripcionMotivoOtro?: (index: number, valor: string) => void;
  
  validarSoloNumeros: (valor: string | number | null | undefined) => boolean;
  validarMaximoDigitos: (valor: string | number | null | undefined, maxDigitos: number) => boolean;
  
  modo?: "conciliacion" | "edicion_completa";
  esNovedad?: boolean;
  permiteEditarTodo?: boolean;
};

// CONSTANTES PARA LOS TIPOS ESPECIALES DE RESIDUOS
const OPCIONES_OTRO_PELIGROSO = [
  'Biosanitario',
  'Carbon Activado',
  'Comburente',
  'Pintura',
  'Biologico',
  'Tintura',
  'Solventes',
  'Liquido mezclado con etanol',
  'Recipientes contaminados con pintura',
  'Tiner'
];

const OPCIONES_OTRO_ME_CON_MARCA = [
  'Chatarra',
  'Archivo - PM',
  'Cartón - PM',
  'Laminado',
  'Sachet',
  'Pasta - PM',
  'Plegable - PM',
  'Etiquetas',
  'Muebles',
  'Carton - AP',
  'Vidrio - PM'
];

const OPCIONES_OTRO_ME_SIN_MARCA = [
  'Carton - AP',
  'Plastico sucio',
  'Valvula de pasta',
  'Laminado',
  'Etiquetas',
  'Chatarra',
  'Pasta AP'
];

export default function ModalEdicionActa({
  actaEditando,
  residuosEditables,
  residuosFiltrados,
  motivosFiltrados,
  
  subareas = [],
  centrosCosto = [],
  operarios = [],
  operariosPuntoVerde = [],
  
  guardando,
  onClose,
  onGuardar,
  onCambioPesoConciliado,
  onCambioResiduo,
  onCambioMotivo,
  onCambioSubarea,
  onCambioCentroCosto,
  onCambioOperario,
  onCambioConciliador,
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
  
  const [subareaId, setSubareaId] = useState<number | null>(actaEditando.subarea_id || null);
  const [centroCostoId, setCentroCostoId] = useState<number | null>(actaEditando.centro_costo_id || null);
  const [operarioId, setOperarioId] = useState<number | null>(null);
  const [conciliadorId, setConciliadorId] = useState<number | null>(null);
  
  const [nombreOperarioAutocompletado, setNombreOperarioAutocompletado] = useState<string>("");
  const [nombreConciliadorAutocompletado, setNombreConciliadorAutocompletado] = useState<string>("");
  
  const [mostrarCamposAvanzados, setMostrarCamposAvanzados] = useState(false);
  const [vistaTablaResiduos, setVistaTablaResiduos] = useState<'tabla' | 'tarjetas'>('tabla');

  const esEdicionCompleta = modo === "edicion_completa";
  const puedeEditarTodo = esEdicionCompleta || permiteEditarTodo || mostrarCamposAvanzados;

  // FUNCIONES PARA DETECTAR TIPOS ESPECIALES DE RESIDUOS (copiadas del componente de referencia)
  const esOtroResiduo = (residuoNombre: string | undefined): boolean => {
    if (!residuoNombre) return false;
    const nombreLower = residuoNombre.toLowerCase().trim();
    return (nombreLower === 'otro residuo' || 
            nombreLower === 'otro residuo -' ||
            nombreLower === 'otro residuo-') && 
           !nombreLower.includes('peligroso');
  };

  const esOtroResiduoPeligroso = (residuoNombre: string | undefined): boolean => {
    if (!residuoNombre) return false;
    const nombreLower = residuoNombre.toLowerCase().trim();
    return nombreLower === 'otro residuo peligroso' || 
           nombreLower === 'otro residuo - peligroso' ||
           nombreLower === 'otro residuo -peligroso' ||
           nombreLower === 'otro residuo-peligroso';
  };

  const esResiduoOtroGenerico = (residuoNombre: string | undefined): boolean => {
    if (!residuoNombre) return false;
    const nombreLower = residuoNombre.toLowerCase();
    return nombreLower === 'otro' && !nombreLower.includes('peligroso') && !nombreLower.includes('residuo');
  };

  const esOtroMEConMarca = (residuoNombre: string | undefined): boolean => {
    if (!residuoNombre) return false;
    const nombreLower = residuoNombre.toLowerCase();
    return (
      nombreLower.includes('me con marca') || 
      nombreLower.includes('me - con marca') ||
      nombreLower.includes('me_con_marca') ||
      nombreLower === 'otro me - con marca'
    );
  };

  const esOtroMESinMarca = (residuoNombre: string | undefined): boolean => {
    if (!residuoNombre) return false;
    const nombreLower = residuoNombre.toLowerCase();
    return (
      nombreLower.includes('me sin marca') || 
      nombreLower.includes('me - sin marca') ||
      nombreLower.includes('me_sin_marca') ||
      nombreLower === 'otro me - sin marca'
    );
  };

  // Obtener el nombre del residuo desde residuosFiltrados
  const obtenerNombreResiduo = (residuoId: number): string => {
    const residuo = residuosFiltrados.find(r => r.id === residuoId);
    return residuo?.nombre || '';
  };

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

  const handleSubareaChange = (valor: string) => {
    const id = valor ? parseInt(valor) : null;
    setSubareaId(id);
    onCambioSubarea?.(id);
  };

  const handleCentroCostoChange = (valor: string) => {
    const id = valor ? parseInt(valor) : null;
    setCentroCostoId(id);
    onCambioCentroCosto?.(id);
    
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

  const handleConciliadorChange = (valor: string) => {
    const id = valor ? parseInt(valor) : null;
    setConciliadorId(id);
    
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

  const handleCambioDescripcionResiduoOtro = (index: number, valor: string) => {
    if (onCambioDescripcionResiduoOtro) {
      onCambioDescripcionResiduoOtro(index, valor);
    } else {
      const nuevosResiduos = [...residuosEditables];
      nuevosResiduos[index].descripcion_residuo_otro = valor;
      nuevosResiduos[index].residuo_otro = valor;
    }
  };

  const handleCambioDescripcionMotivoOtro = (index: number, valor: string) => {
    if (onCambioDescripcionMotivoOtro) {
      onCambioDescripcionMotivoOtro(index, valor);
    } else {
      const nuevosResiduos = [...residuosEditables];
      nuevosResiduos[index].descripcion_motivo_otro = valor;
      nuevosResiduos[index].motivo_otro = valor;
    }
  };

  // Función para manejar el cambio en select especial de residuos peligrosos
  const handleCambioSelectResiduoEspecial = (index: number, valor: string) => {
    // Esto actualiza tanto descripcion_residuo_otro como residuo_otro
    handleCambioDescripcionResiduoOtro(index, valor);
  };

  const residuosConNovedad = residuosEditables.filter(r => r.novedad_residuo);
  const pesoTotalReportado = residuosEditables.reduce((sum, r) => sum + parseFloat(r.peso_reportado || "0"), 0);
  const pesoTotalConciliado = residuosEditables.reduce((sum, r) => sum + parseFloat(r.peso_conciliado || "0"), 0);

  // Función para renderizar el campo de descripción específico según el tipo de residuo
  const renderCampoDescripcionResiduo = (residuo: ResiduoEditable, index: number) => {
    const nombreResiduo = residuo.residuo_nombre;
    
    if (esOtroResiduoPeligroso(nombreResiduo)) {
      return (
        <div className="mt-1">
          <label className="block text-xs text-gray-500 mb-1">Tipo de residuo peligroso *</label>
          <select
            value={residuo.descripcion_residuo_otro || residuo.residuo_otro || ""}
            onChange={(e) => handleCambioSelectResiduoEspecial(index, e.target.value)}
            className="w-full px-2 py-1 border rounded dark:bg-gray-700 text-xs"
            disabled={!puedeEditarTodo || guardando}
            required
          >
            <option value="">Seleccione un tipo</option>
            {OPCIONES_OTRO_PELIGROSO.map((opcion) => (
              <option key={opcion} value={opcion}>
                {opcion}
              </option>
            ))}
          </select>
        </div>
      );
    }
    
    if (esOtroMEConMarca(nombreResiduo)) {
      return (
        <div className="mt-1">
          <label className="block text-xs text-gray-500 mb-1">Tipo de residuo ME - Con marca *</label>
          <select
            value={residuo.descripcion_residuo_otro || residuo.residuo_otro || ""}
            onChange={(e) => handleCambioSelectResiduoEspecial(index, e.target.value)}
            className="w-full px-2 py-1 border rounded dark:bg-gray-700 text-xs"
            disabled={!puedeEditarTodo || guardando}
            required
          >
            <option value="">Seleccione un tipo</option>
            {OPCIONES_OTRO_ME_CON_MARCA.map((opcion) => (
              <option key={opcion} value={opcion}>
                {opcion}
              </option>
            ))}
          </select>
        </div>
      );
    }
    
    if (esOtroMESinMarca(nombreResiduo)) {
      return (
        <div className="mt-1">
          <label className="block text-xs text-gray-500 mb-1">Tipo de residuo ME - Sin marca *</label>
          <select
            value={residuo.descripcion_residuo_otro || residuo.residuo_otro || ""}
            onChange={(e) => handleCambioSelectResiduoEspecial(index, e.target.value)}
            className="w-full px-2 py-1 border rounded dark:bg-gray-700 text-xs"
            disabled={!puedeEditarTodo || guardando}
            required
          >
            <option value="">Seleccione un tipo</option>
            {OPCIONES_OTRO_ME_SIN_MARCA.map((opcion) => (
              <option key={opcion} value={opcion}>
                {opcion}
              </option>
            ))}
          </select>
        </div>
      );
    }
    
    if (esResiduoOtroGenerico(nombreResiduo) || esOtroResiduo(nombreResiduo)) {
      return (
        <div className="mt-1">
          <label className="block text-xs text-gray-500 mb-1">
            {esResiduoOtroGenerico(nombreResiduo) 
              ? "Especifique el residuo *" 
              : "Especifique el residuo *"}
          </label>
          <input
            type="text"
            value={residuo.descripcion_residuo_otro || residuo.residuo_otro || ""}
            onChange={(e) => handleCambioDescripcionResiduoOtro(index, e.target.value)}
            placeholder={
              esResiduoOtroGenerico(nombreResiduo)
                ? "Ej: Papel archivo, plástico limpio, etc."
                : "Ej: Papel archivo, plástico limpio, etc."
            }
            className="w-full px-2 py-1 border rounded dark:bg-gray-700 text-xs"
            disabled={!puedeEditarTodo || guardando}
            required
          />
        </div>
      );
    }
    
    return null;
  };

  // Función para obtener el texto del residuo para mostrar
  const getTextoResiduo = (residuo: ResiduoEditable) => {
    const nombreResiduo = residuo.residuo_nombre;
    
    if (esOtroResiduoPeligroso(nombreResiduo) || 
        esOtroMEConMarca(nombreResiduo) || 
        esOtroMESinMarca(nombreResiduo) ||
        esResiduoOtroGenerico(nombreResiduo) ||
        esOtroResiduo(nombreResiduo)) {
      
      const descripcion = residuo.descripcion_residuo_otro || residuo.residuo_otro;
      if (descripcion) {
        return `${nombreResiduo}: ${descripcion}`;
      }
    }
    
    return nombreResiduo;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-[98vw] h-[95vh] flex flex-col">
        {/* HEADER */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-4 sm:p-6 z-10">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl font-bold text-skyBlue dark:text-lightBlue">
                {getTitulo()}
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                {getSubtitulo()}
              </p>
              <div className="flex flex-wrap gap-1 sm:gap-2 mt-2">
                {esNovedad && (
                  <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-full text-xs font-semibold">
                    ⚠️ Con Novedad
                  </span>
                )}
                {puedeEditarTodo && (
                  <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-xs font-semibold">
                    ✏️ Modo Edición Completa
                  </span>
                )}
                {residuosConNovedad.length > 0 && (
                  <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 rounded-full text-xs font-semibold">
                    ♻️ {residuosConNovedad.length} Residuo(s) con Novedad
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl ml-2"
              disabled={guardando}
            >
              ×
            </button>
          </div>
        </div>

        {/* CONTENIDO PRINCIPAL CON SCROLL */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
          {!esEdicionCompleta && !permiteEditarTodo && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setMostrarCamposAvanzados(!mostrarCamposAvanzados)}
                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                disabled={guardando}
              >
                {mostrarCamposAvanzados ? (
                  <>
                    <span>↑</span>
                    Ocultar campos avanzados
                  </>
                ) : (
                  <>
                    <span>✏️</span>
                    Editar más campos
                  </>
                )}
              </button>
            </div>
          )}

          {/* ALERTAS DE NOVEDAD - MANTENIENDO LA ESTRUCTURA ORIGINAL */}
          {esNovedad && (actaEditando.novedad || residuosConNovedad.length > 0) && (
            <div className="space-y-3 sm:space-y-4">
              {actaEditando.novedad && (
                <div className="bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-yellow-500 p-3 sm:p-4 rounded">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <span className="text-yellow-500">📄</span>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
                        Novedad General del Acta
                      </h3>
                      <div className="mt-1 text-xs sm:text-sm text-yellow-700 dark:text-yellow-300">
                        <p className="break-words">{actaEditando.novedad}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {residuosConNovedad.length > 0 && (
                <div className="bg-orange-100 dark:bg-orange-900/30 border-l-4 border-orange-500 p-3 sm:p-4 rounded">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <span className="text-orange-500">♻️</span>
                    </div>
                    <div className="ml-3 flex-1">
                      <h3 className="text-sm font-semibold text-orange-800 dark:text-orange-200 mb-2">
                        Novedades Específicas por Residuo
                      </h3>
                      <div className="space-y-3">
                        {residuosConNovedad.map((residuo, index) => (
                          <div key={index} className="text-xs sm:text-sm bg-orange-50 dark:bg-orange-900/20 p-3 rounded">
                            <div className="font-medium text-orange-800 dark:text-orange-200 mb-1">
                              {getTextoResiduo(residuo)}
                            </div>
                            <div className="text-orange-700 dark:text-orange-300 ml-2">
                              {residuo.novedad_residuo}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* INFORMACIÓN BÁSICA DEL ACTA */}
          <div className="bg-gray-50 dark:bg-gray-900/50 p-3 sm:p-4 rounded-lg">
            <h3 className="text-base sm:text-lg font-bold mb-3 flex items-center gap-2">
              <span>📋</span> Información del Acta
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1">Número Acta *</label>
                <input
                  type="text"
                  value={actaEditando.numero_acta}
                  className="w-full px-2 py-1.5 sm:px-3 sm:py-2 border rounded bg-gray-100 dark:bg-gray-800 cursor-not-allowed text-sm"
                  readOnly
                />
                <p className="text-xs text-gray-500 mt-0.5">No editable</p>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1">Fecha Acta *</label>
                <input
                  type="datetime-local"
                  value={new Date(actaEditando.fecha_acta).toISOString().slice(0, 16)}
                  className="w-full px-2 py-1.5 sm:px-3 sm:py-2 border rounded bg-gray-100 dark:bg-gray-800 cursor-not-allowed text-sm"
                  readOnly
                />
                <p className="text-xs text-gray-500 mt-0.5">No editable</p>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1">Consecutivo</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={consecutivo}
                  onChange={(e) => handleConsecutivoChange(e.target.value)}
                  className="w-full px-2 py-1.5 sm:px-3 sm:py-2 border rounded dark:bg-gray-700 text-sm"
                  placeholder="Máx 6 dígitos"
                  maxLength={6}
                  disabled={guardando}
                />
                <p className="text-xs text-gray-500 mt-0.5">Solo números</p>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1">N° Inventario</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={numeroInventario}
                  onChange={(e) => handleNumeroInventarioChange(e.target.value)}
                  className="w-full px-2 py-1.5 sm:px-3 sm:py-2 border rounded dark:bg-gray-700 text-sm"
                  placeholder="Máx 11 dígitos"
                  maxLength={11}
                  disabled={guardando}
                />
                <p className="text-xs text-gray-500 mt-0.5">Solo números</p>
              </div>
            </div>

            {/* CAMPOS AVANZADOS */}
            {mostrarCamposAvanzados && (
              <div className="mt-4 pt-4 border-t dark:border-gray-700">
                <h4 className="text-sm font-semibold mb-3">Campos Avanzados</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-1">Subárea</label>
                    {centroCostoId ? (
                      <div>
                        <input
                          type="text"
                          value={subareas.find(s => s.id === subareaId)?.nombre || actaEditando.subarea_nombre || "Seleccionando..."}
                          className="w-full px-2 py-1.5 sm:px-3 sm:py-2 border rounded bg-gray-100 dark:bg-gray-800 cursor-not-allowed text-sm"
                          readOnly
                        />
                        <p className="text-xs text-gray-500 mt-0.5">
                          Se autocompleta al seleccionar centro de costo
                        </p>
                      </div>
                    ) : (
                      <select
                        value={subareaId || ""}
                        onChange={(e) => handleSubareaChange(e.target.value)}
                        className="w-full px-2 py-1.5 sm:px-3 sm:py-2 border rounded dark:bg-gray-700 text-sm"
                        disabled={guardando}
                      >
                        <option value="">Seleccionar subárea</option>
                        {subareas.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.nombre}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-1">Centro de Costo</label>
                    <select
                      value={centroCostoId || ""}
                      onChange={(e) => handleCentroCostoChange(e.target.value)}
                      className="w-full px-2 py-1.5 sm:px-3 sm:py-2 border rounded dark:bg-gray-700 text-sm"
                      disabled={guardando}
                    >
                      <option value="">Seleccionar centro de costo</option>
                      {centrosCosto.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.codigo} - {c.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* OPERARIO Y CONCILIADOR - LADO A LADO */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-900/50 p-3 sm:p-4 rounded-lg">
              <h3 className="text-base sm:text-lg font-bold mb-3 flex items-center gap-2">
                <span>👤</span> Operario (Entrega)
              </h3>
              
              {puedeEditarTodo && operarios.length > 0 && (
                <div className="mb-3">
                  <label className="block text-xs sm:text-sm font-medium mb-1">Seleccionar Operario</label>
                  <select
                    value={operarioId || ""}
                    onChange={(e) => handleOperarioChange(e.target.value)}
                    className="w-full px-2 py-1.5 sm:px-3 sm:py-2 border rounded dark:bg-gray-700 text-sm"
                    disabled={guardando}
                  >
                    <option value="">Seleccionar operario</option>
                    {operarios.map((op) => (
                      <option key={op.id} value={op.id}>
                        {op.documento} - {op.nombre} {op.apellido || ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1">
                  Documento del Operario *
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={operarioDoc}
                  onChange={(e) => handleOperarioDocChange(e.target.value)}
                  className="w-full px-2 py-1.5 sm:px-3 sm:py-2 border rounded dark:bg-gray-700 text-sm"
                  placeholder="Ej: 1234567890"
                  maxLength={10}
                  required
                  disabled={guardando}
                />
                
                {nombreOperarioAutocompletado && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    Operario: {nombreOperarioAutocompletado}
                  </p>
                )}
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 p-3 sm:p-4 rounded-lg">
              <h3 className="text-base sm:text-lg font-bold mb-3 flex items-center gap-2">
                <span>👤</span> Conciliador (Punto Verde) *
              </h3>
              
              {puedeEditarTodo && operariosPuntoVerde.length > 0 && (
                <div className="mb-3">
                  <label className="block text-xs sm:text-sm font-medium mb-1">Seleccionar Conciliador</label>
                  <select
                    value={conciliadorId || ""}
                    onChange={(e) => handleConciliadorChange(e.target.value)}
                    className="w-full px-2 py-1.5 sm:px-3 sm:py-2 border rounded dark:bg-gray-700 text-sm"
                    disabled={guardando}
                  >
                    <option value="">Seleccionar conciliador</option>
                    {operariosPuntoVerde.map((op) => (
                      <option key={op.id} value={op.id}>
                        {op.documento} - {op.nombre} {op.apellido || ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1">
                  Documento del Conciliador *
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={conciliadorDoc}
                  onChange={(e) => handleConciliadorDocChange(e.target.value)}
                  className="w-full px-2 py-1.5 sm:px-3 sm:py-2 border rounded dark:bg-gray-700 text-sm"
                  placeholder="Ej: 1234567890"
                  maxLength={10}
                  required
                  disabled={guardando}
                />
                
                {nombreConciliadorAutocompletado && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    Conciliador: {nombreConciliadorAutocompletado}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* RESIDUOS - VERSIÓN SIN BOTÓN ELIMINAR */}
          <div className="bg-gray-50 dark:bg-gray-900/50 p-3 sm:p-4 rounded-lg">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
              <h3 className="text-base sm:text-lg font-bold flex items-center gap-2">
                <span>♻️</span> Residuos ({residuosEditables.length})
              </h3>
              
              <div className="flex gap-2">
                {puedeEditarTodo && onAgregarResiduo && (
                  <button
                    type="button"
                    onClick={onAgregarResiduo}
                    disabled={guardando}
                    className="px-3 py-1.5 sm:px-4 sm:py-2 bg-green-500 text-white rounded hover:bg-green-600 transition flex items-center gap-2 text-xs sm:text-sm disabled:opacity-50"
                  >
                    <span>+</span>
                    Agregar Residuo
                  </button>
                )}
                
                {residuosEditables.length > 2 && (
                  <button
                    type="button"
                    onClick={() => setVistaTablaResiduos(vistaTablaResiduos === 'tabla' ? 'tarjetas' : 'tabla')}
                    disabled={guardando}
                    className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition flex items-center gap-2 text-xs sm:text-sm disabled:opacity-50"
                  >
                    {vistaTablaResiduos === 'tabla' ? '📱 Ver tarjetas' : '📊 Ver tabla'}
                  </button>
                )}
              </div>
            </div>

            {residuosEditables.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No hay residuos registrados. {puedeEditarTodo && 'Agrega al menos uno para continuar.'}
              </div>
            ) : vistaTablaResiduos === 'tabla' ? (
              /* TABLA RESPONSIVA SIN COLUMNA ACCIÓN */
              <div className="overflow-x-auto -mx-2 sm:mx-0">
                <table className="min-w-full border dark:border-gray-700 text-xs sm:text-sm">
                  <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr>
                      <th className="px-2 py-2 text-left font-semibold w-1/5">Residuo</th>
                      <th className="px-2 py-2 text-left font-semibold w-1/6">Descripción Específica</th>
                      <th className="px-2 py-2 text-left font-semibold w-1/6">Motivo</th>
                      {esNovedad && (
                        <th className="px-2 py-2 text-left font-semibold w-1/5">Novedad</th>
                      )}
                      <th className="px-2 py-2 text-right font-semibold w-20">Reportado (kg)</th>
                      <th className="px-2 py-2 text-right font-semibold w-24">Conciliado (kg) *</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-gray-700">
                    {residuosEditables.map((residuo, index) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-2 py-3">
                          <div className="space-y-1">
                            <div className={`px-2 py-1 border rounded dark:bg-gray-700/50 ${
                              residuo.novedad_residuo ? 'border-yellow-300 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-900/20' : ''
                            }`}>
                              <div className="font-medium">
                                {getTextoResiduo(residuo)}
                              </div>
                            </div>
                            {puedeEditarTodo && residuosFiltrados.length > 0 && (
                              <select
                                value={residuo.residuo_id}
                                onChange={(e) => onCambioResiduo(index, parseInt(e.target.value))}
                                className="w-full px-2 py-1 border rounded dark:bg-gray-700 text-xs"
                                disabled={guardando}
                              >
                                <option value="">Cambiar residuo...</option>
                                {residuosFiltrados.map((r) => (
                                  <option key={r.id} value={r.id}>
                                    {r.nombre}
                                  </option>
                                ))}
                              </select>
                            )}
                          </div>
                        </td>
                        
                        <td className="px-2 py-3">
                          {/* RENDERIZAR CAMPO ESPECIAL SEGÚN TIPO DE RESIDUO */}
                          {renderCampoDescripcionResiduo(residuo, index)}
                        </td>
                        
                        <td className="px-2 py-3">
                          <div className="space-y-1">
                            <select
                              value={residuo.motivo}
                              onChange={(e) => onCambioMotivo(index, e.target.value)}
                              className="w-full px-2 py-1 border rounded dark:bg-gray-700 text-xs"
                              disabled={!puedeEditarTodo || guardando}
                            >
                              <option value="">Seleccionar</option>
                              {motivosFiltrados.map((m) => (
                                <option key={m.id} value={m.nombre}>
                                  {m.nombre}
                                </option>
                              ))}
                            </select>
                            
                            {residuo.motivo === 'Otro' && (
                              <input
                                type="text"
                                value={residuo.descripcion_motivo_otro || residuo.motivo_otro || ""}
                                onChange={(e) => handleCambioDescripcionMotivoOtro(index, e.target.value)}
                                placeholder="Especifique motivo..."
                                className="w-full px-2 py-1 border rounded dark:bg-gray-700 text-xs mt-1"
                                disabled={!puedeEditarTodo || guardando}
                              />
                            )}
                          </div>
                        </td>
                        
                        {/* COLUMNA DE NOVEDAD */}
                        {esNovedad && (
                          <td className="px-2 py-3">
                            {residuo.novedad_residuo ? (
                              <div className="text-xs">
                                <div className="text-yellow-600 dark:text-yellow-400 font-medium mb-1">
                                  ⚠️ Novedad:
                                </div>
                                <div className="text-xs bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded max-h-20 overflow-y-auto">
                                  {residuo.novedad_residuo}
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-400 text-xs">-</span>
                            )}
                          </td>
                        )}
                        
                        <td className="px-2 py-3 text-right align-middle">
                          {puedeEditarTodo && onCambioPesoReportado ? (
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={residuo.peso_reportado}
                              onChange={(e) => onCambioPesoReportado && onCambioPesoReportado(index, e.target.value)}
                              className="w-full px-2 py-1 border rounded text-right dark:bg-gray-700 text-xs sm:text-sm"
                              disabled={guardando}
                            />
                          ) : (
                            <span className="font-medium">
                              {parseFloat(residuo.peso_reportado || "0").toFixed(2)}
                            </span>
                          )}
                        </td>
                        
                        <td className="px-2 py-3 text-right align-middle">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={residuo.peso_conciliado}
                            onChange={(e) => onCambioPesoConciliado(index, e.target.value)}
                            className="w-full px-2 py-1 border rounded text-right dark:bg-gray-700 font-bold text-xs sm:text-sm"
                            required
                            disabled={guardando}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-100 dark:bg-gray-800 font-bold">
                    <tr>
                      <td 
                        colSpan={
                          2 + 
                          (esNovedad ? 1 : 0)
                        } 
                        className="px-2 py-3 text-right"
                      >
                        TOTAL:
                      </td>
                      <td className="px-2 py-3 text-right">
                        {pesoTotalReportado.toFixed(2)} kg
                      </td>
                      <td className="px-2 py-3 text-right">
                        {pesoTotalConciliado.toFixed(2)} kg
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              /* VISTA TARJETAS SIN BOTÓN ELIMINAR */
              <div className="grid grid-cols-1 gap-3">
                {residuosEditables.map((residuo, index) => (
                  <div key={index} className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-4">
                    <div className="mb-3">
                      <div className="font-bold">
                        {getTextoResiduo(residuo)}
                      </div>
                      {residuo.novedad_residuo && (
                        <div className="mt-2">
                          <div className="text-xs text-yellow-600 dark:text-yellow-400 font-medium mb-1">
                            ⚠️ Novedad:
                          </div>
                          <div className="text-xs bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded">
                            {residuo.novedad_residuo}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 gap-3">
                      {/* CAMPO DE DESCRIPCIÓN ESPECIAL */}
                      {renderCampoDescripcionResiduo(residuo, index)}
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Peso Reportado</label>
                          {puedeEditarTodo && onCambioPesoReportado ? (
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={residuo.peso_reportado}
                              onChange={(e) => onCambioPesoReportado && onCambioPesoReportado(index, e.target.value)}
                              className="w-full px-2 py-1 border rounded dark:bg-gray-700"
                              disabled={guardando}
                            />
                          ) : (
                            <div className="font-medium">{parseFloat(residuo.peso_reportado || "0").toFixed(2)} kg</div>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Peso Conciliado *</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={residuo.peso_conciliado}
                            onChange={(e) => onCambioPesoConciliado(index, e.target.value)}
                            className="w-full px-2 py-1 border rounded dark:bg-gray-700 font-bold"
                            required
                            disabled={guardando}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Motivo</label>
                        <div className="space-y-1">
                          <select
                            value={residuo.motivo}
                            onChange={(e) => onCambioMotivo(index, e.target.value)}
                            className="w-full px-2 py-1 border rounded dark:bg-gray-700"
                            disabled={guardando}
                          >
                            <option value="">Seleccionar motivo</option>
                            {motivosFiltrados.map((m) => (
                              <option key={m.id} value={m.nombre}>
                                {m.nombre}
                              </option>
                            ))}
                          </select>
                          
                          {residuo.motivo === 'Otro' && (
                            <input
                              type="text"
                              value={residuo.descripcion_motivo_otro || residuo.motivo_otro || ""}
                              onChange={(e) => handleCambioDescripcionMotivoOtro(index, e.target.value)}
                              placeholder="Especifique motivo..."
                              className="w-full px-2 py-1 border rounded dark:bg-gray-700 mt-1"
                              disabled={!puedeEditarTodo || guardando}
                            />
                          )}
                        </div>
                      </div>
                      
                      {puedeEditarTodo && residuosFiltrados.length > 0 && (
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Cambiar Residuo</label>
                          <select
                            value={residuo.residuo_id}
                            onChange={(e) => onCambioResiduo(index, parseInt(e.target.value))}
                            className="w-full px-2 py-1 border rounded dark:bg-gray-700"
                            disabled={guardando}
                          >
                            <option value="">Cambiar residuo...</option>
                            {residuosFiltrados.map((r) => (
                              <option key={r.id} value={r.id}>
                                {r.nombre}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* FOOTER FIJADO */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t dark:border-gray-700 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              {esNovedad ? (
                <div>
                  <p><strong>⚠️ Resolución de novedad:</strong> Corrige los errores y concilia el acta.</p>
                  {residuosConNovedad.length > 0 && (
                    <p className="text-xs mt-1">
                      <strong>Nota:</strong> Hay {residuosConNovedad.length} residuo(s) con novedades específicas que deben ser resueltas.
                    </p>
                  )}
                </div>
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
              {residuosEditables.length === 0 && (
                <p className="text-red-500 font-semibold mt-1">
                  ⚠️ Debes tener al menos un residuo para continuar.
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={guardando}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition disabled:opacity-50 text-sm flex-1 sm:flex-none"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={onGuardar}
                disabled={guardando || residuosEditables.length === 0}
                className={`px-6 py-2 text-white rounded hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm flex-1 sm:flex-none ${
                  esNovedad ? "bg-yellow-500 hover:bg-yellow-600" :
                  "bg-green-500 hover:bg-green-600"
                } ${residuosEditables.length === 0 ? "cursor-not-allowed" : ""}`}
              >
                {guardando ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Guardando...
                  </>
                ) : esNovedad ? (
                  "✅ Resolver y Conciliar"
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