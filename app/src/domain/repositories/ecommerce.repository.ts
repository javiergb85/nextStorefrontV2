import { ProductFetchInput } from '../../data/providers/vtex/vtex.types/vtex.products.types';
import { Either } from '../../shared/utils/either';
import { Cart } from '../entities/cart';
import { Product } from '../entities/product';
import { SearchResult } from '../entities/search-result';

export interface CartItemInput {
  uniqueId?: string;
  id: string;
  quantity: number;
  seller: string;
}

export interface EcommerceRepository {
  getProducts(input: ProductFetchInput | any): Promise<Either<Error, SearchResult>>;
  getProductDetail(productId: string,prefetchKey?: string, isPrefetchAction?:boolean ): Promise<Either<Error, Product>>; 
  addToCart(productId: string, quantity: number): Promise<Either<Error, any>>;
  syncCart(items: CartItemInput[]): Promise<any>;
  updateCartItems(items: { itemIndex: number; quantity: number; id: string; uniqueId: string; seller: string; }[]): Promise<Either<Error, any>>;
  removeAllCartItems(): Promise<Either<Error, any>>;
  placeOrder(): Promise<Either<Error, boolean>>; 
  listOrders(email: string): Promise<Either<Error, any>>;
  getOrder(orderId: string): Promise<Either<Error, any>>;
  getCart(): Promise<Either<Error, Cart>>;
}