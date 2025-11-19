import Select from '../common/Select';
import Input from '../common/Input';
import SectionTitle from '../common/SectionTitle';
import Button from '../common/Button';
import type { ResiduoEspecifico, CategoriaResiduo } from '../../services/catalogo.service';

type Residuo = { 
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
  
  disabled?: boolean;
};

export default function SeccionResiduos({
  residuos,
  setResiduos,
  residuosDisponibles,
  categoriasDisponibles,
  motivos,
  disabled = false
}: SeccionResiduosProps) {
  
  const handleChange = (index: number, field: keyof Residuo, value: string | number) => {
    const nuevosResiduos = [...residuos];
    nuevosResiduos[index] = { ...nuevosResiduos[index], [field]: value };
    setResiduos(nuevosResiduos);
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

  // Función auxiliar para verificar si un residuo es "Otro"
 const esResiduoOtro = (residuoId: number | null): boolean => {
  if (!residuoId) return false;
  const residuo = residuosDisponibles.find(r => r.id === residuoId);
  return residuo?.nombre === 'Otro' ||
         residuo?.nombre === 'Otro ME - Sin marca' ||
         residuo?.nombre === 'Otro ME - Con marca';
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

  const categoriasOptions = categoriasDisponibles.map(c => ({
    value: String(c.id),
    label: c.nombre
  }));

  const motivosOptions = motivos.map(m => ({ value: m, label: m }));

  return (
    <div>
      <SectionTitle>Residuos</SectionTitle>

      {residuos.map((item, index) => (
        <div key={index} className="border p-4 rounded-lg mb-4 bg-white/10 dark:bg-gray-800/30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Residuo Específico */}
            <Select
              label="Residuo"
              value={item.residuo_id ? String(item.residuo_id) : ''}
              onChange={(value) => handleChange(index, 'residuo_id', parseInt(value))}
              options={residuosOptions}
              required
              disabled={disabled || residuosDisponibles.length === 0}
              placeholder={residuosDisponibles.length === 0 ? 'Seleccione centro de costo primero' : 'Seleccione residuo'}
            />

            {/* Categoría */}
            <Select
              label="Categoría"
              value={item.categoria_id ? String(item.categoria_id) : ''}
              onChange={(value) => handleChange(index, 'categoria_id', parseInt(value))}
              options={categoriasOptions}
              required
              disabled={disabled || categoriasDisponibles.length === 0}
              placeholder="Seleccione categoría"
            />

            {/* Campo adicional cuando el residuo es "Otro" */}
            {esResiduoOtro(item.residuo_id) && (
              <div className="md:col-span-2">
                <Input
                  label="Especifique el residuo (máx. 150 caracteres)"
                  value={item.residuo_otro || ''}
                  onChange={(value) => {
                    if (value.length <= 150) {
                      handleChange(index, 'residuo_otro', value);
                    }
                  }}
                  type="text"
                  required
                  disabled={disabled}
                  maxLength={150}
                  placeholder="Escriba el nombre del residuo"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
                  {item.residuo_otro?.length || 0}/150
                </p>
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

            {/* Campo adicional cuando el motivo es "Otro" */}
            {item.motivo === 'Otro' && (
              <div className="md:col-span-2">
                <Input
                  label="Especifique el motivo (máx. 150 caracteres)"
                  value={item.motivo_otro || ''}
                  onChange={(value) => {
                    if (value.length <= 150) {
                      handleChange(index, 'motivo_otro', value);
                    }
                  }}
                  type="text"
                  required
                  disabled={disabled}
                  maxLength={150}
                  placeholder="Escriba el motivo"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
                  {item.motivo_otro?.length || 0}/150
                </p>
              </div>
            )}

            {/* Peso */}
            <div className="md:col-span-2">
              <Input
                label="Peso (kg)"
                value={item.peso}
                onChange={(value) => handleChange(index, 'peso', value)}
                type="number"
                required
                disabled={disabled}
                placeholder="0.00"
                min={0.01}
                max={17000}
                step={0.01}
              />
            </div>
          </div>

          {/* Botón eliminar */}
          {residuos.length > 1 && !disabled && (
            <div className="flex justify-end mt-4">
              <Button variant="danger" onClick={() => eliminarResiduo(index)}>
                Eliminar residuo
              </Button>
            </div>
          )}
        </div>
      ))}

      {/* Botón agregar */}
      {!disabled && (
        <Button onClick={agregarResiduo}>
          ➕ Agregar residuo
        </Button>
      )}
    </div>
  );
}