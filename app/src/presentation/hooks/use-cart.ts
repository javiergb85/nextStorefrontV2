

import { useStorefront } from '../../context/storefront.context';
import { AddToCartUseCase } from '../../domain/use-cases/add-to-cart.use-case';



export const useCart = (addToCartUseCase: AddToCartUseCase) => {
  const addItemToLocalCart = useStorefront().useOrderFormStore((state) => state.addItem);

  const addItemToCart = async (product) => {
    // 1. Optimistic UI: Actualiza la UI de inmediato.
    addItemToLocalCart(product.id, 1);

    // 2. Llama al caso de uso para la operación asíncrona.
    const result = await addToCartUseCase.execute(product);

    // 3. Maneja el resultado con Either y fold.
    return result.fold(
      (error) => {
        // En caso de fallo, revierte la UI o muestra un mensaje de error.
        console.error('Failed to add to cart:', error.message);
        // Aquí podrías revertir la adición o mostrar un toast de error.
      },
      (success) => {
        // La operación fue exitosa. La UI ya está actualizada. No se necesita hacer nada.
        console.log('Successfully added to cart:', success);
      }
    );
   
  };

  return { addItemToCart };
};