import { Product } from '../../domain/entities/product';
import { CartItemInput, EcommerceRepository } from '../../domain/repositories/ecommerce.repository';
import { Either, left, right } from '../../shared/utils/either';
import { Provider } from '../providers/provider.factory';
import { ProductFetchInput } from '../providers/vtex/vtex.types/vtex.products.types';

export class EcommerceRepositoryImpl implements EcommerceRepository {
  constructor(private provider: Provider) {}

  async getProducts(input: ProductFetchInput | any): Promise<Either<Error, Product[]>> {
    try {
      const products = await this.provider.fetchProducts(input);
      return right(products); 
    } catch (error: any) {
      return left(new Error(`Failed to fetch products: ${error.message}`));
    }
  }

 
  async getProductDetail(slug: string, prefetchKey?: string, isPrefetchAction?: boolean): Promise<Either<Error, Product>> {
    try {
        const product = await this.provider.fetchProduct(slug, prefetchKey, isPrefetchAction);
        if (!product) {
            return left(new Error("Product not found."));
        }
        return right(product);
    } catch (error: any) {
        return left(new Error(`Failed to fetch product detail: ${error.message}`));
    }
  }

  async addToCart(productId: string, quantity: number): Promise<Either<Error, boolean>> {
    try {
      const success = await this.provider.addToCart(productId, quantity);
      return right(success);
    } catch (error: any) {
      return left(new Error(`Failed to add item to cart: ${error.message}`));
    }
  }

  async updateCartItems(items: { itemIndex: number; quantity: number; id: string; uniqueId: string; seller: string; }[]): Promise<Either<Error, any>> {
    try {
      const updatedCart = await this.provider.updateCartItems(items);
      return right(updatedCart);
    } catch (error: any) {
      return left(new Error(`Failed to update cart items: ${error.message}`));
    }
  }

  async removeAllCartItems(): Promise<Either<Error, any>> {
    try {
      const updatedCart = await this.provider.removeAllCartItems();
      return right(updatedCart);
    } catch (error: any) {
      return left(new Error(`Failed to remove all cart items: ${error.message}`));
    }
  }

  async syncCart(items: CartItemInput[]): Promise<Either<Error, any>> {
    try {
      const updatedCart = await this.provider.syncCart(items);
      return right(updatedCart);
    } catch (error: any) {
      return left(new Error(`Failed to sync cart: ${error.message}`));
    }
  }

  async placeOrder(): Promise<Either<Error, boolean>> {
    try {
      const success = await this.provider.placeOrder();
      return right(success);
    } catch (error: any) {
      return left(new Error(`Failed to place order: ${error.message}`));
    }
  }
  async listOrders(email: string): Promise<Either<Error, any>> {
    try {
      const orders = await this.provider.listOrders(email);
      return right(orders);
    } catch (error: any) {
      return left(new Error(`Failed to list orders: ${error.message}`));
    }
  }

  async getOrder(orderId: string): Promise<Either<Error, any>> {
    try {
      const order = await this.provider.getOrder(orderId);
      return right(order);
    } catch (error: any) {
      return left(new Error(`Failed to get order: ${error.message}`));
    }
  }
}