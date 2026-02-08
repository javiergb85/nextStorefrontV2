
import { ProductFetchInput } from '../../data/providers/vtex/vtex.types/vtex.products.types';
import { Either } from '../../shared/utils/either';
import { SearchResult } from '../entities/search-result';
import { EcommerceRepository } from '../repositories/ecommerce.repository';

export class GetProductsUseCase {
  constructor(private repository: EcommerceRepository) {}

  async execute(input: ProductFetchInput | any = {}): Promise<Either<Error, SearchResult>> {
    // Este caso de uso es simple, solo llama al repositorio.
    // Lógica adicional podría incluir paginación, caché, etc.
    return this.repository.getProducts(input);
  }
}