import { create } from "zustand";
import { ProductFetchInput } from "../data/providers/vtex/vtex.types/vtex.products.types";
import { Product } from "../domain/entities/product";
import { GetProductsUseCase } from "../domain/use-cases/get-products.use-case";

interface ProductState {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  fetchProducts: (input?: ProductFetchInput | any) => Promise<void>;
  isFetchingMore: boolean;
}

// ✨ Creamos una función "fábrica" que devuelve el store, aceptando los casos de uso como argumentos.
export const createProductStore = (getProductsUseCase: GetProductsUseCase) => {
  return create<ProductState>((set) => ({
    products: [],
    isLoading: false,
    isFetchingMore: false,
    error: null,

    fetchProducts: async (input: ProductFetchInput = {}) => {
      // set({ isLoading: true, error: null });

      const isInitialLoad = input.from === 0 || input.from === undefined;

      if (isInitialLoad) {
        set({ isLoading: true, error: null });
      } else {
        set({ isFetchingMore: true, error: null });
      }

      const result = await getProductsUseCase.execute(input);

      result.fold(
        (err) => {
          // En caso de error, actualiza el estado de error
          set({
            products: [],
            isFetchingMore: false,
            isLoading: false,
            error: `Failed to load products: ${err.message}`,
          });
        },
        (data) => {
          set((state) => {
            const newProducts = data;

            // 💡 Paso 1: Crear un Set de IDs existentes (para búsqueda rápida)
            // Si es carga inicial, no necesitamos los IDs viejos.
            const existingIds = isInitialLoad
              ? new Set()
              : new Set(state.products.map((p) => p.id));

            // 💡 Paso 2: Filtrar los nuevos productos para eliminar duplicados
            const uniqueNewProducts = newProducts.filter(
              (p) => !existingIds.has(p.id)
            );

            // 💡 Paso 3: Aplicar la lógica de reemplazo/concatenación
            if (isInitialLoad) {
              return {
                products: uniqueNewProducts, // Solo los nuevos y únicos
                isLoading: false,
                isFetchingMore: false,
                error: null,
              };
            }

            // Concatenamos (solo los productos únicos recién filtrados)
            return {
              products: [...state.products, ...uniqueNewProducts], // 👈 ¡La clave de la solución!
              isLoading: false,
              isFetchingMore: false,
              error: null,
            };
          });
        }
      );
    },
  }));
};
