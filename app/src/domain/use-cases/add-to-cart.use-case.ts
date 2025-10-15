import { Either } from '../../shared/utils/either';
import { Product } from '../entities/product';
import { EcommerceRepository } from '../repositories/ecommerce.repository';

export class AddToCartUseCase {
  constructor(private repository: EcommerceRepository) {}

  async execute(product: Product): Promise<Either<Error, boolean>> {
    // Aquí podrías agregar lógica de negocio adicional antes de llamar al repositorio.
    return this.repository.addToCart(product.id, 1);
  }
}