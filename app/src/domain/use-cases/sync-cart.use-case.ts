import { Either } from '../../shared/utils/either';
import { EcommerceRepository } from '../repositories/ecommerce.repository';

interface CartItemInput {
  uniqueId?: string;
  id: string;
  quantity: number;
  seller: string;
}

export class SyncCartUseCase {
  constructor(private readonly ecommerceRepository: EcommerceRepository) {}

  async execute(items: CartItemInput[]): Promise<Either<Error, any>> {
    // El repositorio ya devuelve un `Either`, así que simplemente lo retornamos.
    return this.ecommerceRepository.syncCart(items);
  }
}