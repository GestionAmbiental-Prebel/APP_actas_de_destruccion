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
  disabled = false
}: SeccionResiduosProps) {

  const obtenerResiduo = (id: number | null) =>
    residuosDisponibles.find(r => r.id === id);

  const esResiduoOtro = (residuoId: number | null): boolean => {
    const residuo = obtenerResiduo(residuoId);
    return residuo?.nombre?.toLowerCase() === 'otro';
  };

  const residuoRequiereMotivo = (residuoId: number | null): boolean => {
    // Solo requiere motivo si estamos en área de almacenamiento
    if (!esAlmacenamiento) return false;
    
    const residuo = obtenerResiduo(residuoId);
    if (!residuo) return false;

    return GRUPOS_RESIDUOS_CON_MOTIVO.some(grupo =>
      residuo.nombre.toLowerCase().includes(grupo.toLowerCase())
    );
  };

  const handleChange = (index: number, field: keyof Residuo, value: any) => {
    const nuevos = [...residuos];

    if (field === 'residuo_id') {
      const residuoId = Number(value);
      const residuo = obtenerResiduo(residuoId);

      nuevos[index] = {
        ...nuevos[index],
        residuo_id: residuoId,
        categoria_id: residuo?.categoria_id ?? null,
        motivo: '',
        motivo_otro: ''
      };
      
      // Llamar al callback del padre si existe
      onResiduoChange?.(index, residuoId);
    } else {
      nuevos[index] = { ...nuevos[index], [field]: value };
    }

    setResiduos(nuevos);
    onResiduoCampoChange?.(index, field, value);
  };

  const agregarResiduo = () => {
    setResiduos([
      ...residuos,
      { residuo_id: null, categoria_id: null, motivo: '', motivo_otro: '', peso: '' }
    ]);
  };

  const eliminarResiduo = (index: number) => {
    setResiduos(residuos.filter((_, i) => i !== index));
  };

  const residuosOptions = residuosDisponibles.map(r => ({
    value: String(r.id),
    label: r.nombre
  }));

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
            placeholder="Ingrese el consecutivo"
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
            placeholder="Ingrese el número de inventario"
          />
        </div>
      )}

      {residuos.map((item, index) => {
        const residuo = obtenerResiduo(item.residuo_id);
        const requiereMotivo = residuoRequiereMotivo(item.residuo_id);
        const esOtro = esResiduoOtro(item.residuo_id);

        return (
          <div key={index} className="border p-4 rounded-lg mb-4 bg-white/10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <Select
                label="Residuo"
                value={item.residuo_id ? String(item.residuo_id) : ''}
                options={residuosOptions}
                onChange={(v) => handleChange(index, 'residuo_id', Number(v))}
                disabled={disabled}
                required
              />

              {esOtro && (
                <Input
                  label="Especifique el residuo"
                  value={item.residuo_otro || ''}
                  onChange={(v) => handleChange(index, 'residuo_otro', v)}
                  disabled={disabled}
                  required
                />
              )}

              {requiereMotivo && (
                <Select
                  label="Motivo"
                  value={item.motivo}
                  options={motivos.map(m => ({ value: m, label: m }))}
                  onChange={(v) => handleChange(index, 'motivo', v)}
                  disabled={disabled}
                  required
                />
              )}

              {requiereMotivo && item.motivo === 'Otro' && (
                <Input
                  label="Especifique motivo"
                  value={item.motivo_otro || ''}
                  onChange={(v) => handleChange(index, 'motivo_otro', v)}
                  disabled={disabled}
                  required
                />
              )}

              <Input
                label="Peso (kg)"
                type="number"
                value={item.peso}
                onChange={(v) => handleChange(index, 'peso', v)}
                min={0}
                step={0.01}
                disabled={disabled}
                required
              />
            </div>

            {!disabled && residuos.length > 1 && (
              <div className="flex justify-end mt-3">
                <Button 
                  variant="danger" 
                  onClick={() => eliminarResiduo(index)}
                  type="button"
                >
                  Eliminar
                </Button>
              </div>
            )}
          </div>
        );
      })}

      {!disabled && (
        <Button onClick={agregarResiduo} type="button">
          ➕ Agregar residuo
        </Button>
      )}
    </div>
  );
}