import Input from '../common/Input';
import SectionTitle from '../common/SectionTitle';
import { normalizarNombre } from '../../utils/normalizarNombre';


type SeccionIdentificacionProps = {
  cedula: string;
  setCedula: (v: string) => void;
  nombre: string;
  setNombre: (v: string) => void;
  apellido: string;
  setApellido: (v: string) => void;
  onCedulaBlur: () => void;
};

// Funciones de validación reutilizables
const validarCedula = (value: string) => value.replace(/[^0-9]/g, '');
const validarNombre = (value: string) => value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ ]/g, '');

export default function SeccionIdentificacion({
  cedula,
  setCedula,
  nombre,
  setNombre,
  apellido,
  setApellido,
  onCedulaBlur

}: SeccionIdentificacionProps) {
  return (
    <div>
      <SectionTitle>Identificación</SectionTitle>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Input
          label="Cédula"
          value={cedula}
          onChange={setCedula}
          type="text"
          inputMode="numeric"
          validation={validarCedula}
          maxLength={10}
          onBlur={onCedulaBlur}
          required
        />

        <Input
          label="Nombre"
          value={nombre}
          onChange={setNombre}
          validation={validarNombre}
          onBlur={() => setNombre(normalizarNombre(nombre))}
          maxLength={50}
          required
        />

        <Input
          label="Apellido"
          value={apellido}
          onChange={setApellido}
          validation={validarNombre}
          onBlur={() => setApellido(normalizarNombre(apellido))}
          maxLength={50}
          required
        />
      </div>
    </div>
  );
}