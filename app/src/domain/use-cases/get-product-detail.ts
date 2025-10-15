import { Either } from "../../shared/utils/either";
import { Product as DomainProduct } from "../entities/product";
import { EcommerceRepository } from "../repositories/ecommerce.repository";

export interface GetProductDetailUseCase {
  execute(productId: string): Promise<Either<Error, DomainProduct>>;
}

export class GetProductDetailUseCase implements GetProductDetailUseCase {
  constructor(private repository: EcommerceRepository) {}

  async execute(productId: string, prefetchKey?: string,isPrefetchAction:boolean = false ): Promise<Either<Error, DomainProduct>> {
    return this.repository.getProductDetail(productId, prefetchKey, isPrefetchAction);
  }
}