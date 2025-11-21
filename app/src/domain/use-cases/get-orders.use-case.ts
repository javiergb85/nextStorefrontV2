import { Either } from "@/app/src/shared/utils/either";
import { EcommerceRepository } from "../repositories/ecommerce.repository";

export class GetOrdersUseCase {
  constructor(private ecommerceRepository: EcommerceRepository) {}

  async execute(email: string): Promise<Either<Error, any>> {
    return this.ecommerceRepository.listOrders(email);
  }
}
