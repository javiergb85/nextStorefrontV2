import { Either } from '../../shared/utils/either';
import { Cart } from '../entities/cart';
import { EcommerceRepository } from '../repositories/ecommerce.repository';

export class GetCartUseCase {
    constructor(private ecommerceRepository: EcommerceRepository) {}

    async execute(): Promise<Either<Error, Cart>> {
        return this.ecommerceRepository.getCart();
    }
}
