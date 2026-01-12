// SeccionResiduos.tsx - VERSIÓN CORREGIDA SIN MOSTRAR IDS
import Select from '../common/Select';
import Input from '../common/Input';
import SectionTitle from '../common/SectionTitle';
import Button from '../common/Button';
import type { ResiduoEspecifico, CategoriaResiduo } from '../../services/catalogo.service';

export type Residuo = { 
  residuo_id: number | null;
  categoria_id: number | null;
  motivo: string;
  motivo_otro?: string;
  residuo_otro?: string;
  peso: string;
};

type SeccionResiduosProps = {
  residuos: Residuo[];
  setResiduos: (r: Residuo[]) => void;
  residuosDisponibles: ResiduoEspecifico[];
  categoriasDisponibles: CategoriaResiduo[];
  motivos: string[];
  onResiduoChange: (index: number, residuoId: number) => void;

  consecutivo?: string;
  numeroInventario?: string;
  onConsecutivoChange?: (value: string) => void;
  onNumeroInventarioChange?: (value: string) => void;
  onResiduoCampoChange?: (index: number, campo: keyof Residuo, valor: string) => void;

  areaId?: number | null;
  areaNombre?: string;
  esAlmacenamiento?: boolean;
  disabled?: boolean;
  ocultarBotonAgregar?: boolean;
};

const GRUPOS_RESIDUOS_CON_MOTIVO = [
  'Granel',
  'Materia Prima',
  'Esmaltes',
  'Aerosoles',
  'Fragancias',
  'Vidrio',
  'Plega',
  'Pasta',
  'Metalico',
  'Producto Terminado',
  'Otro'
];

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

// Nuevos arrays para los tipos ME
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

export default function SeccionResiduos({
  residuos,
  setResiduos,
  residuosDisponibles,
  categoriasDisponibles,
  motivos,
  onResiduoChange,
  consecutivo = '',
  numeroInventario = '',
  onConsecutivoChange,
  onNumeroInventarioChange,
  onResiduoCampoChange,
  areaId = null,
  areaNombre = '',
  esAlmacenamiento = false,
  disabled = false,
  ocultarBotonAgregar = false
}: SeccionResiduosProps) {

  const obtenerResiduo = (id: number | null) =>
    residuosDisponibles.find(r => r.id === id);

  // Función mejorada para obtener el residuo incluso si no está en residuosDisponibles
  // CORREGIDA: Nunca devolver "Residuo ID: X"
  const obtenerResiduoConFallback = (id: number | null) => {
    if (!id) return null;
    
    // Buscar en residuosDisponibles
    const encontrado = residuosDisponibles.find(r => r.id === id);
    
    if (encontrado) {
      return encontrado;
    }
    
    // Si no se encuentra, buscar en los residuos actuales para obtener su nombre
    const residuoActual = residuos.find(r => r.residuo_id === id);
    if (residuoActual?.residuo_otro) {
      return {
        id: id,
        nombre: residuoActual.residuo_otro,
        categoria_id: residuoActual.categoria_id
      };
    }
    
    // CORRECCIÓN: Nunca devolver "Residuo ID: X"
    // En su lugar, devolver un nombre genérico
    return {
      id: id,
      nombre: "Otro residuo",
      categoria_id: null
    };
  };

  // Obtener opciones de residuos, incluyendo el actual si no está en la lista
  // CORREGIDA: Nunca mostrar "Residuo ID: X" como label
  const obtenerOpcionesResiduos = () => {
    const opciones = residuosDisponibles.map(r => ({
      value: String(r.id),
      label: r.nombre
    }));
    
    // Agregar el residuo actual si no está en la lista
    const residuoActual = residuos[0];
    if (residuoActual?.residuo_id && 
        !opciones.some(op => op.value === String(residuoActual.residuo_id))) {
      
      const residuoInfo = obtenerResiduoConFallback(residuoActual.residuo_id);
      // CORRECCIÓN: Nunca usar el ID como label
      opciones.unshift({
        value: String(residuoActual.residuo_id),
        label: residuoInfo?.nombre || "Otro residuo"
      });
    }
    
    return opciones;
  };

  const esOtroResiduo = (residuoId: number | null): boolean => {
    const residuo = obtenerResiduoConFallback(residuoId);
    if (!residuo?.nombre) return false;
    
    const nombreLower = residuo.nombre.toLowerCase().trim();
    
    return (nombreLower === 'otro residuo' || 
            nombreLower === 'otro residuo -' ||
            nombreLower === 'otro residuo-') && 
           !nombreLower.includes('peligroso');
  };

  const esOtroResiduoPeligroso = (residuoId: number | null): boolean => {
    const residuo = obtenerResiduoConFallback(residuoId);
    if (!residuo?.nombre) return false;
    
    const nombreLower = residuo.nombre.toLowerCase().trim();
    
    return nombreLower === 'otro residuo peligroso' || 
           nombreLower === 'otro residuo - peligroso' ||
           nombreLower === 'otro residuo -peligroso' ||
           nombreLower === 'otro residuo-peligroso';
  };

  const esResiduoOtroGenerico = (residuoId: number | null): boolean => {
    const residuo = obtenerResiduoConFallback(residuoId);
    if (!residuo?.nombre) return false;
    
    const nombreLower = residuo.nombre.toLowerCase();
    return nombreLower === 'otro' && !nombreLower.includes('peligroso') && !nombreLower.includes('residuo');
  };

  const esOtroMEConMarca = (residuoId: number | null): boolean => {
    const residuo = obtenerResiduoConFallback(residuoId);
    if (!residuo?.nombre) return false;
    
    const nombreLower = residuo.nombre.toLowerCase();
    return (
      nombreLower.includes('me con marca') || 
      nombreLower.includes('me - con marca') ||
      nombreLower.includes('me_con_marca') ||
      nombreLower === 'otro me - con marca'
    );
  };

  const esOtroMESinMarca = (residuoId: number | null): boolean => {
    const residuo = obtenerResiduoConFallback(residuoId);
    if (!residuo?.nombre) return false;
    
    const nombreLower = residuo.nombre.toLowerCase();
    return (
      nombreLower.includes('me sin marca') || 
      nombreLower.includes('me - sin marca') ||
      nombreLower.includes('me_sin_marca') ||
      nombreLower === 'otro me - sin marca'
    );
  };

  const residuoRequiereMotivo = (residuoId: number | null): boolean => {
    if (!esAlmacenamiento) return false;

    const residuo = obtenerResiduoConFallback(residuoId);
    if (!residuo) return false;

    return GRUPOS_RESIDUOS_CON_MOTIVO.some(grupo =>
      residuo.nombre.toLowerCase().includes(grupo.toLowerCase())
    );
  };

  const handleChange = (index: number, field: keyof Residuo, value: any) => {
    console.log('🔄 handleChange:', { index, field, value, residuo_id: residuos[index].residuo_id });
    
    // Bloquear cambio si no hay área seleccionada
    if (field === 'residuo_id' && !areaId && !disabled) {
      return;
    }
    
    const nuevos = [...residuos];

    if (field === 'residuo_id') {
      const residuoId = Number(value);
      const residuo = obtenerResiduoConFallback(residuoId);
      
      console.log('📝 Residuo seleccionado:', {
        id: residuoId,
        nombre: residuo?.nombre,
        esOtroResiduo: esOtroResiduo(residuoId),
        esOtroResiduoPeligroso: esOtroResiduoPeligroso(residuoId),
        esResiduoOtroGenerico: esResiduoOtroGenerico(residuoId),
        esOtroMEConMarca: esOtroMEConMarca(residuoId),
        esOtroMESinMarca: esOtroMESinMarca(residuoId)
      });

      nuevos[index] = {
        ...nuevos[index],
        residuo_id: residuoId,
        categoria_id: residuo?.categoria_id ?? null,
        motivo: '',
        motivo_otro: '',
        residuo_otro: '' // Resetear cuando cambia el tipo de residuo
      };

      onResiduoChange?.(index, residuoId);
    } else {
      nuevos[index] = { ...nuevos[index], [field]: value };
    }

    setResiduos(nuevos);
    onResiduoCampoChange?.(index, field, value);
  };

  const agregarResiduo = () => {
    // Bloquear agregar residuo si no hay área seleccionada
    if (!areaId && !disabled) {
      return;
    }
    
    setResiduos([
      ...residuos,
      { residuo_id: null, categoria_id: null, motivo: '', motivo_otro: '', residuo_otro: '', peso: '' }
    ]);
  };

  const eliminarResiduo = (index: number) => {
    setResiduos(residuos.filter((_, i) => i !== index));
  };

  const residuosOptions = obtenerOpcionesResiduos();

  // Determinar si el campo residuo debe estar deshabilitado
  const residuoDisabled = disabled || !areaId;

  return (
    <div>
      <SectionTitle>Residuos</SectionTitle>

      {consecutivo && onConsecutivoChange && (
        <div className="mb-6">
          <Input
            label="Consecutivo"
            value={consecutivo}
            onChange={onConsecutivoChange}
            disabled={disabled}
          />
        </div>
      )}

      {numeroInventario && onNumeroInventarioChange && (
        <div className="mb-6">
          <Input
            label="Número de Inventario"
            value={numeroInventario}
            onChange={onNumeroInventarioChange}
            disabled={disabled}
          />
        </div>
      )}

      {residuos.map((item, index) => {
        const requiereMotivo = residuoRequiereMotivo(item.residuo_id);
        const esPeligroso = esOtroResiduoPeligroso(item.residuo_id);
        const esOtroGenerico = esResiduoOtroGenerico(item.residuo_id);
        const esOtroNormal = esOtroResiduo(item.residuo_id);
        const esMEConMarca = esOtroMEConMarca(item.residuo_id);
        const esMESinMarca = esOtroMESinMarca(item.residuo_id);

        console.log(`🔍 Residuo ${index}:`, {
          residuo_id: item.residuo_id,
          esPeligroso,
          esOtroGenerico,
          esOtroNormal,
          esMEConMarca,
          esMESinMarca,
          residuo_otro: item.residuo_otro
        });

        return (
          <div key={index} className="border p-4 rounded-lg mb-4 bg-white/10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <div>
                <Select
                  label="Residuo"
                  value={item.residuo_id ? String(item.residuo_id) : ''}
                  options={residuosOptions}
                  onChange={(v) => handleChange(index, 'residuo_id', Number(v))}
                  disabled={residuoDisabled}
                  required
                />
                {/* Mensaje pequeño en rojo solo cuando no hay área seleccionada */}
                {!areaId && !disabled && (
                  <p className="text-sm text-red-500 mt-1">
                    Seleccione una Área primero
                  </p>
                )}
              </div>

              {/* Campo para "Otro" genérico */}
              {esOtroGenerico && (
                <Input
                  label="Especifique el residuo"
                  value={item.residuo_otro || ''}
                  onChange={(v) => handleChange(index, 'residuo_otro', v)}
                  disabled={disabled || !areaId}
                  required
                  placeholder="Ej: Papel archivo, plástico limpio, etc."
                />
              )}

              {/* Campo para "Otro residuo" (no peligroso) */}
              {esOtroNormal && !esPeligroso && !esMEConMarca && !esMESinMarca && (
                <Input
                  label="Especifique el residuo"
                  value={item.residuo_otro || ''}
                  onChange={(v) => handleChange(index, 'residuo_otro', v)}
                  disabled={disabled || !areaId}
                  required
                  placeholder="Ej: Papel archivo, plástico limpio, etc."
                />
              )}

              {/* Select para "Otro residuo peligroso" - SOLO cuando es específicamente "otro residuo peligroso" */}
              {esPeligroso && !esMEConMarca && !esMESinMarca && (
                <Select
                  label="Tipo de residuo peligroso"
                  value={item.residuo_otro || ''}
                  options={OPCIONES_OTRO_PELIGROSO.map(op => ({
                    value: op,
                    label: op
                  }))}
                  onChange={(v) => handleChange(index, 'residuo_otro', v)}
                  disabled={disabled || !areaId}
                  required
                  placeholder="Seleccione un tipo"
                />
              )}

              {/* Select para "Otro ME - Con marca" */}
              {esMEConMarca && (
                <Select
                  label="Tipo de residuo ME - Con marca"
                  value={item.residuo_otro || ''}
                  options={OPCIONES_OTRO_ME_CON_MARCA.map(op => ({
                    value: op,
                    label: op
                  }))}
                  onChange={(v) => handleChange(index, 'residuo_otro', v)}
                  disabled={disabled || !areaId}
                  required
                  placeholder="Seleccione un tipo"
                />
              )}

              {/* Select para "Otro ME - Sin marca" */}
              {esMESinMarca && (
                <Select
                  label="Tipo de residuo ME - Sin marca"
                  value={item.residuo_otro || ''}
                  options={OPCIONES_OTRO_ME_SIN_MARCA.map(op => ({
                    value: op,
                    label: op
                  }))}
                  onChange={(v) => handleChange(index, 'residuo_otro', v)}
                  disabled={disabled || !areaId}
                  required
                  placeholder="Seleccione un tipo"
                />
              )}

              {requiereMotivo && (
                <Select
                  label="Motivo"
                  value={item.motivo}
                  options={motivos.map(m => ({ value: m, label: m }))}
                  onChange={(v) => handleChange(index, 'motivo', v)}
                  disabled={disabled || !areaId}
                  required
                />
              )}

              {requiereMotivo && item.motivo === 'Otro' && (
                <Input
                  label="Especifique motivo"
                  value={item.motivo_otro || ''}
                  onChange={(v) => handleChange(index, 'motivo_otro', v)}
                  disabled={disabled || !areaId}
                  required
                />
              )}

              <Input
                label="Peso (kg)"
                type="number"
                value={item.peso}
                onChange={(v) => handleChange(index, 'peso', v)}
                min={0}
                max={20000}
                step={0.01}
                disabled={disabled || !areaId}
                required
              />
            </div>

            {!disabled && residuos.length > 1 && (
              <div className="flex justify-end mt-3">
                <Button 
                  variant="danger" 
                  onClick={() => eliminarResiduo(index)}
                  disabled={!areaId}
                >
                  Eliminar
                </Button>
              </div>
            )}
          </div>
        );
      })}

      {!disabled && !ocultarBotonAgregar && (
        <Button 
          onClick={agregarResiduo} 
          type="button"
          disabled={!areaId}
        >
          ➕ Agregar residuo
        </Button>
      )}
    </div>
  );
}