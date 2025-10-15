import { Either } from '../../shared/utils/either';
import { EcommerceRepository } from '../repositories/ecommerce.repository';

export interface UpdateItemInput {
  itemIndex: number;
  quantity: number;
  id: string; // SKU ID
  uniqueId: string; // Line Item ID
  seller: string;
}

export class UpdateCartItemUseCase {
  constructor(private readonly ecommerceRepository: EcommerceRepository) {}

  async execute(input: UpdateItemInput): Promise<Either<Error, any>> {
    // Para actualizar, simplemente llamamos al repositorio con el índice y la nueva cantidad.
    return this.ecommerceRepository.updateCartItems([input]); // Pasamos el objeto completo
  }
}