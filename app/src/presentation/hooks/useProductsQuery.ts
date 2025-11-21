import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useStorefront } from '../../context/storefront.context';
import { ProductFetchInput } from '../../data/providers/vtex/vtex.types/vtex.products.types';

export const useProductsQuery = (input: ProductFetchInput = {}) => {
  const { services } = useStorefront();
  const getProductsUseCase = services.getProductsUseCase;

  return useQuery({
    queryKey: ['products', input],
    queryFn: async () => {
      const result = await getProductsUseCase.execute(input);
      return result.fold(
        (error: Error) => { throw error; },
        (data: any) => data
      );
    },
  });
};

export const usePrefetchProducts = () => {
    const queryClient = useQueryClient();
    const { services } = useStorefront();
    const getProductsUseCase = services.getProductsUseCase;

    return (input: ProductFetchInput = {}) => {
        queryClient.prefetchQuery({
            queryKey: ['products', input],
            queryFn: async () => {
                const result = await getProductsUseCase.execute(input);
                return result.fold(
                    (error: Error) => { throw error; },
                    (data: any) => data
                );
            },
        });
    };
};
