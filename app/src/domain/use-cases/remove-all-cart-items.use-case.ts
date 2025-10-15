import { Either } from '../../shared/utils/either';
import { EcommerceRepository } from '../repositories/ecommerce.repository';

export class RemoveAllCartItemsUseCase {
  constructor(private readonly ecommerceRepository: EcommerceRepository) {}

  async execute(): Promise<Either<Error, any>> {
    // Este caso de uso simplemente delega la llamada al repositorio.
    // La lógica compleja está encapsulada en el VtexProvider.
    return this.ecommerceRepository.removeAllCartItems();
  }
}