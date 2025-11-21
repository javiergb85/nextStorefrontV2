import {
    getEcommerceProvider,
    ProviderConfig,
} from "./data/providers/provider.factory";
import { EcommerceRepositoryImpl } from "./data/repositories/ecommerce.repository.impl";
import { GetOrderDetailUseCase } from "./domain/use-cases/get-order-detail.use-case";
import { GetOrdersUseCase } from "./domain/use-cases/get-orders.use-case";
import { GetProductDetailUseCase } from "./domain/use-cases/get-product-detail";
import { GetProductsUseCase } from "./domain/use-cases/get-products.use-case";
import { GetUserProfileUseCase } from "./domain/use-cases/get-user-profile.use-case";
import { LoginUseCase } from "./domain/use-cases/login.use-case";
import { RemoveAllCartItemsUseCase } from "./domain/use-cases/remove-all-cart-items.use-case";
import { RemoveCartItemUseCase } from "./domain/use-cases/remove-cart-item.use-case";
import { SyncCartUseCase } from "./domain/use-cases/sync-cart.use-case";
import { UpdateCartItemUseCase } from "./domain/use-cases/update-cart-item.use-case";


// 💡 Interfaz necesaria para la inyección (la misma que en el fetcher/context)
interface LoginStoreApi {
    getState: () => {
        logout: () => void;
        revalidateAuth: () => Promise<boolean>;
    };
}

// 💡 MODIFICACIÓN: La función ahora acepta loginStoreApi como parámetro
export function initializeServices(config: any, loginStoreApi: LoginStoreApi) {

  const providerConfig = config as ProviderConfig;
 
  // 💡 CAMBIO CLAVE: Pasamos el loginStoreApi al factory
  const ecommerceProvider = getEcommerceProvider(providerConfig, loginStoreApi);
  
  const ecommerceRepository = new EcommerceRepositoryImpl(ecommerceProvider);

  const getProductsUseCase = new GetProductsUseCase(ecommerceRepository);
  const getProductDetailUseCase = new GetProductDetailUseCase(ecommerceRepository);

  const loginUseCase = new LoginUseCase(ecommerceProvider);
  const syncCartUseCase = new SyncCartUseCase(ecommerceRepository);
  const updateCartItemUseCase = new UpdateCartItemUseCase(ecommerceRepository);
  const removeCartItemUseCase = new RemoveCartItemUseCase(ecommerceRepository);
  const removeAllCartItemsUseCase = new RemoveAllCartItemsUseCase(ecommerceRepository);
  const getUserProfileUseCase = new GetUserProfileUseCase(ecommerceProvider);
  const getOrdersUseCase = new GetOrdersUseCase(ecommerceRepository);
  const getOrderDetailUseCase = new GetOrderDetailUseCase(ecommerceRepository);

  // Devolvemos todas las dependencias en un solo objeto.
  return {
    getProductsUseCase,
    getProductDetailUseCase,
    loginUseCase,
    syncCartUseCase,
    updateCartItemUseCase,
    removeCartItemUseCase,
    removeAllCartItemsUseCase,
    getUserProfileUseCase,
    getOrdersUseCase,
    getOrderDetailUseCase,
    provider: ecommerceProvider, // 💡 Exponemos el proveedor para casos especiales (como categorías)
  };
}