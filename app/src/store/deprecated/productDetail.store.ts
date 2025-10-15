import { create } from 'zustand';
import { getProductDetailUseCase } from '../../di';
import { Product } from '../../domain/entities/product';


interface ProductDetailState {
  product: Product | null;
  isLoading: boolean;
  error: string | null;
  fetchProductDetail: (productId: string) => Promise<void>;
  clearProductDetail: () => void;
}

export const useProductDetailStore = create<ProductDetailState>((set) => ({
  product: null,
  isLoading: false,
  error: null,
  
  fetchProductDetail: async (productId: string) => {
    set({ isLoading: true, error: null });

    const result = await getProductDetailUseCase.execute(productId);
   
    result.fold(
      (err) => {
         console.log(err)
        set({
          product: null,
          isLoading: false,
          error: `Failed to load product detail: ${err.message}`,
        });
      },
      (data) => {
         console.log(result)
        set({
          product: data,
          isLoading: false,
          error: null,
        });
      }
    );
  },
  
  clearProductDetail: () => {
    set({ product: null, isLoading: false, error: null });
  },
}));