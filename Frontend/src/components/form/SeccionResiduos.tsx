import Select from '../common/Select';
import Input from '../common/Input';
import SectionTitle from '../common/SectionTitle';
import Button from '../common/Button';
import type { ResiduoEspecifico, CategoriaResiduo } from '../../services/catalogo.service';

type Residuo = { 
  residuo_id: number | null;
  categoria_id: number | null;
  motivo: string;
  peso: string;
};

type SeccionResiduosProps = {
  residuos: Residuo[];
  setResiduos: (r: Residuo[]) => void;
  
  // Catálogos filtrados desde el backend
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
      { residuo_id: null, categoria_id: null, motivo: '', peso: '' }
    ]);
  };

  const eliminarResiduo = (index: number) => {
    setResiduos(residuos.filter((_, idx) => idx !== index));
  };

  // Preparar opciones
  const residuosOptions = residuosDisponibles.map(r => ({
    value: String(r.id),
    label: r.nombre
  }));

  const categoriasOptions = categoriasDisponibles.map(c => ({
    value: String(c.id),
    label: c.nombre
  }));

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

            {/* Motivo */}
            <div className="md:col-span-2">
              <Select
                label="Motivo"
                value={item.motivo}
                onChange={(value) => handleChange(index, 'motivo', value)}
                options={motivos}
                required
                disabled={disabled}
                placeholder="Seleccione motivo"
              />
            </div>

            {/* Peso */}
            <div className="md:col-span-2">
              <Input
                label="Peso (kg)"
                value={item.peso}
                onChange={(value) => handleChange(index, 'peso', value)}
                type="number"
                required
                disabled={disabled}
              />
            </div>
          </div>

          {/* Botón eliminar (solo si hay más de 1 residuo) */}
          {residuos.length > 1 && !disabled && (
            <div className="flex justify-end mt-4">
              <Button
                variant="danger"
                onClick={() => eliminarResiduo(index)}
              >
                Eliminar residuo
              </Button>
            </div>
          )}
        </div>
      ))}

      {/* Botón agregar residuo */}
      {!disabled && (
        <Button onClick={agregarResiduo}>
          ➕ Agregar residuo
        </Button>
      )}
    </div>
  );
}