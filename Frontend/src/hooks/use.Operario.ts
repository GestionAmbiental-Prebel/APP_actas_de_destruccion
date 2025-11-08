import { useState } from 'react';
import { buscarOperarioPorCedula, type Operario } from '../services/operarios.service';

type UseOperarioReturn = {
  operario: Operario | null;
  buscando: boolean;
  buscarPorCedula: (cedula: string) => Promise<void>;
  limpiar: () => void;
};

/**
 * Hook personalizado para buscar operario por cédula
 */
export default function useOperario(): UseOperarioReturn {
  const [operario, setOperario] = useState<Operario | null>(null);
  const [buscando, setBuscando] = useState(false);

  const buscarPorCedula = async (cedula: string) => {
    if (!cedula || cedula.length < 6) {
      setOperario(null);
      return;
    }

    try {
      setBuscando(true);
      const resultado = await buscarOperarioPorCedula(cedula);
      setOperario(resultado);
    } catch (error) {
      console.error('Error al buscar operario:', error);
      setOperario(null);
    } finally {
      setBuscando(false);
    }
  };

  const limpiar = () => {
    setOperario(null);
  };

  return {
    operario,
    buscando,
    buscarPorCedula,
    limpiar
  };
}