export const validarSoloNumeros = (valor: string | number | null | undefined): boolean => {
  if (valor === null || valor === undefined || valor === "") return true;
  const strValor = valor.toString();
  return /^\d*$/.test(strValor);
};

export const validarMaximoDigitos = (
  valor: string | number | null | undefined,
  maxDigitos: number
): boolean => {
  if (valor === null || valor === undefined || valor === "") return true;
  const strValor = valor.toString();
  return strValor.length <= maxDigitos;
};

export const calcularPesoTotal = (residuos: any[]) =>
  residuos.reduce((sum, r) => sum + Number(r.peso_conciliado ?? 0), 0);

export const obtenerResiduosFiltrados = (
  subAreaId: number | null | undefined,
  categoriasResiduos: any[],
  residuosEspecificos: any[]
) => {
  if (!subAreaId) return [];

  const categoriasDeSubArea = categoriasResiduos.filter((cat) => cat.subarea_id === subAreaId);
  const categoriaIds = categoriasDeSubArea.map((cat) => cat.id);

  return residuosEspecificos.filter((res) => categoriaIds.includes(res.categoria_id));
};
