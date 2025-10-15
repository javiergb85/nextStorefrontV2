// src/store/product.store.ts

import { create } from 'zustand';
import { getProductsUseCase } from '../../di';
import { Product } from '../../domain/entities/product';

interface ProductState {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
}
 
export const useProductStore = create<ProductState>((set) => ({
  products: [],
  isLoading: false,
  error: null,
  
  fetchProducts: async () => {
    set({ isLoading: true, error: null });

    const result = await getProductsUseCase.execute();
      
    result.fold(
      (err) => {
        // En caso de error, actualiza el estado de error
        set({
          products: [],
          isLoading: false,
          error: `Failed to load products: ${err.message}`,
        });
      },
      (data) => {
        // En caso de éxito, actualiza el estado de los productos
        set({
          products: data,
          isLoading: false,
          error: null,
        });
      }
    );
  },
}));


