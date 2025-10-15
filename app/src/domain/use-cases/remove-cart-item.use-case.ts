import { Either } from '../../shared/utils/either';
import { EcommerceRepository } from '../repositories/ecommerce.repository';

interface RemoveItemInput {
  itemIndex: number;
}

export class RemoveCartItemUseCase {
  constructor(private readonly ecommerceRepository: EcommerceRepository) {}

  async execute(input: RemoveItemInput): Promise<Either<Error, any>> {
    // Para eliminar, llamamos al repositorio con el índice y una cantidad de 0.
    return this.ecommerceRepository.updateCartItems([{ itemIndex: input.itemIndex, quantity: 0 }]);
  }
}