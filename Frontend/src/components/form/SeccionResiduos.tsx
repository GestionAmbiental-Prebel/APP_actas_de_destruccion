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

  // Nuevas props para datos a nivel de acta
  consecutivo?: string;
  numeroInventario?: string;
  onConsecutivoChange?: (value: string) => void;
  onNumeroInventarioChange?: (value: string) => void;

  onResiduoCampoChange?: (index: number, campo: keyof Residuo, valor: string) => void;

  disabled?: boolean;
};

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
  disabled = false
}: SeccionResiduosProps) {
  
  const handleChange = (index: number, field: keyof Residuo, value: string | number) => {
    const nuevosResiduos = [...residuos];
    nuevosResiduos[index] = { ...nuevosResiduos[index], [field]: value };
    setResiduos(nuevosResiduos);

    onResiduoCampoChange?.(index, field, String(value));
  };

  const agregarResiduo = () => {
    setResiduos([
      ...residuos,
      { residuo_id: null, categoria_id: null, motivo: '', motivo_otro: '', residuo_otro: '', peso: '' }
    ]);
  };

  const eliminarResiduo = (index: number) => {
    setResiduos(residuos.filter((_, idx) => idx !== index));
  };

  const esResiduoOtro = (residuoId: number | null): boolean => {
    if (!residuoId) return false;
    const residuo = residuosDisponibles.find(r => r.id === residuoId);
    return residuo?.nombre?.startsWith("Otro") ?? false;
  };

  const residuosOptions = residuosDisponibles.map(r => {
    const categoria = categoriasDisponibles.find(c => c.id === r.categoria_id);
    return {
      value: String(r.id),
      label: r.nombre === "Otro" 
        ? `Otro (${categoria?.nombre})`
        : r.nombre
    };
  });

  const motivosOptions = motivos.map(m => ({ value: m, label: m }));

  return (
    <div>
      <SectionTitle>Residuos</SectionTitle>

     {/* Campos a nivel de acta - se muestran una sola vez al inicio */}
<div className="border p-4 rounded-lg mb-6 bg-blue-50/50 dark:bg-blue-900/20">
  <h3 className="text-sm font-semibold mb-4 text-gray-700 dark:text-gray-300">
    Datos Generales del Acta
  </h3>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <Input
      label="Consecutivo"
      value={consecutivo}
      onChange={(value) => {
        // Elimina cualquier carácter que no sea número
        const numericValue = value.replace(/\D/g, "");
        // Limita a 6 dígitos
        onConsecutivoChange?.(numericValue.slice(0, 6));
      }}
      type="text" // Cambiar a text para poder usar replace
      disabled={disabled}
      placeholder="Ingrese consecutivo (opcional)"
    />

    <Input
      label="Número de Inventario"
      value={numeroInventario}
      onChange={(value) => {
        const numericValue = value.replace(/\D/g, "");
        // Limita a 11 dígitos
        onNumeroInventarioChange?.(numericValue.slice(0, 11));
      }}
      type="text"
      disabled={disabled}
      placeholder="Ingrese número de inventario (opcional)"
    />
  </div>
</div>

      {/* Lista de residuos */}
      {residuos.map((item, index) => (
        <div key={index} className="border p-4 rounded-lg mb-4 bg-white/10 dark:bg-gray-800/30">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Residuo {index + 1}
            </h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Residuo Específico */}
            <Select
              label="Residuo"
              value={item.residuo_id ? String(item.residuo_id) : ''}
              onChange={(value) => {
                const residuoId = parseInt(value);
                handleChange(index, 'residuo_id', residuoId);
                onResiduoChange(index, residuoId); 
              }}
              options={residuosOptions}
              required
              disabled={disabled || residuosDisponibles.length === 0}
              placeholder={residuosDisponibles.length === 0 ? 'Seleccione centro de costo primero' : 'Seleccione residuo'}
            />

            {/* Campo cuando residuo = Otro */}
            {esResiduoOtro(item.residuo_id) && (
              <div className="md:col-span-2">
                <Input
                  label="Especifique el residuo (máx. 150 caracteres)"
                  value={item.residuo_otro || ''}
                  onChange={(value) => handleChange(index, 'residuo_otro', value)}
                  type="text"
                  required
                  disabled={disabled}
                  placeholder="Escriba el nombre del residuo"
                  maxLength={150}
                />
              </div>
            )}

            {/* Motivo */}
            <div className="md:col-span-2">
              <Select
                label="Motivo"
                value={item.motivo}
                onChange={(value) => handleChange(index, 'motivo', value)}
                options={motivosOptions}
                required
                disabled={disabled}
                placeholder="Seleccione motivo"
              />
            </div>

            {/* Motivo Otro */}
            {item.motivo === 'Otro' && (
              <div className="md:col-span-2">
                <Input
                  label="Especifique el motivo"
                  value={item.motivo_otro || ''}
                  onChange={(value) => handleChange(index, 'motivo_otro', value)}
                  required
                  disabled={disabled}
                  maxLength={150}
                />
                {/* Contador de caracteres */}
                <p className="text-xs text-gray-500 dark:text-gray-400 text-right mt-1">
                  {`${(item.motivo_otro || '').length}/150`}
                </p>
              </div>
            )}

            {/* Peso */}
            <div className="md:col-span-2">
              <Input
                label="Peso (kg)"
                type="number"
                value={item.peso}
                onChange={(value) => handleChange(index, 'peso', value)}
                required
                disabled={disabled}
                min={0.01}
                max={17000}
                step={0.01}
              />
            </div>

          </div>

          {residuos.length > 1 && !disabled && (
            <div className="flex justify-end mt-4">
              <Button variant="danger" onClick={() => eliminarResiduo(index)}>
                Eliminar residuo
              </Button>
            </div>
          )}
        </div>
      ))}

      {!disabled && (
        <Button onClick={agregarResiduo}>
          ➕ Agregar residuo
        </Button>
      )}
    </div>
  );
}