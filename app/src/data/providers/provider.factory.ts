import { ShopifyProvider } from './shopify/shopify.provider';
import { VtexProvider } from './vtex/vtex.provider';
// La interfaz del proveedor base, que tanto ShopifyProvider como VtexProvider implementan.
// Esto garantiza que ambos tienen un método de login.
import { Product } from '../../domain/entities/product';
import { AuthRepository } from '../../domain/repositories/auth.repository';
import { CartItemInput, EcommerceRepository } from '../../domain/repositories/ecommerce.repository';
import { Cart } from './vtex/vtex.types/vtex.cart.types';
import { ProductFetchInput } from './vtex/vtex.types/vtex.products.types';


export interface Provider extends AuthRepository {
  fetchProducts(input: ProductFetchInput | any): Promise<Product[]>;
  fetchProduct(slug: string): Promise<Product | null>;
  addToCart(productId: string, quantity: number): Promise<boolean>;
  placeOrder(): Promise<boolean>;
  syncCart(items: CartItemInput[]): Promise<Cart>;
  updateCartItems(items: { itemIndex: number; quantity: number; id: string; uniqueId: string; seller: string; }[]): Promise<{ success: boolean; quantity: number; }>;
  updateCartItems(items: { itemIndex: number; quantity: number; id: string; uniqueId: string; seller: string; }[]): Promise<{ success: boolean; quantity: number; }>;
  removeAllCartItems(): Promise<Cart>;
  getUserProfile(email: string): Promise<any>;
  listOrders(email: string): Promise<any>;
  getOrder(orderId: string): Promise<any>;
}

// Define el tipo de la configuración
export interface ProviderConfig {
  provider: 'Shopify' | 'Vtex';
  credentials: {
    Shopify?: {
      storeUrl: string;
      accessToken: string;
    };
    Vtex?: {
      storeUrl: string;
      workspace: string;
    };
  };
}

interface LoginStoreApi {
    getState: () => {
        logout: () => void;
        revalidateAuth: () => Promise<boolean>;
    };
}

/**
 * Retorna la instancia del proveedor de eCommerce basándose en la configuración.
 * @param providerConfig La configuración del proveedor, inyectada desde el proyecto.
 * @returns {EcommerceRepository} La instancia del proveedor.
 */
export function getEcommerceProvider(providerConfig: ProviderConfig, loginStoreApi: LoginStoreApi ): Provider & AuthRepository {
  switch (providerConfig.provider) {
    case 'Shopify': {
      const { storeUrl, accessToken } = providerConfig.credentials.Shopify!;
      return new ShopifyProvider(storeUrl, accessToken);
    }
    case 'Vtex': {
      const { storeUrl, workspace } = providerConfig.credentials.Vtex!;
       return new VtexProvider(storeUrl, workspace, undefined, loginStoreApi); 
    
    }
    default:
      throw new Error(`Proveedor de eCommerce no válido: ${providerConfig.provider}`);
  }
}
