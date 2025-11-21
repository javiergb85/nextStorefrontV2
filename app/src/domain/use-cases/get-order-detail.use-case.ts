import { Either } from "@/app/src/shared/utils/either";
import { EcommerceRepository } from "../repositories/ecommerce.repository";

export class GetOrderDetailUseCase {
  constructor(private ecommerceRepository: EcommerceRepository) {}

  async execute(orderId: string): Promise<Either<Error, any>> {
    return this.ecommerceRepository.getOrder(orderId);
  }
}
