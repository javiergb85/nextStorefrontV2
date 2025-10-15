import { useEffect, useState } from 'react';

/**
 * Hook personalizado para "rebotar" (debounce) un valor.
 * Retrasa la actualización del valor hasta que haya pasado un tiempo `delay` sin cambios.
 * @param value El valor a rebotar.
 * @param delay El tiempo de espera en milisegundos.
 * @returns El valor rebotado.
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}
