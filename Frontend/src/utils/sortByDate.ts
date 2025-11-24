// utils/sortByDate.ts

/**
 * Ordena un arreglo por fecha (más reciente → más antigua).
 * @param arr Arreglo original
 * @param key Nombre del campo fecha (string)
 * @returns Un nuevo arreglo ordenado descendentemente
 */
export const sortByDateDesc = <T>(arr: T[], key: keyof T) => {
  return [...arr].sort((a, b) => {
    const fechaA = new Date(a[key] as any).getTime();
    const fechaB = new Date(b[key] as any).getTime();
    return fechaB - fechaA; // DESC
  });
};
