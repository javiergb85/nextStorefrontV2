import React, { createContext, ReactNode, useContext, useMemo } from "react";
import { initializeServices } from "../di";
import * as vtexSearchUtils from '../shared/utils/vtex-search.utils';
import { createCartStore } from "../store/createCartStore";
import { createLoginStore } from "../store/createLoginStore";
import { createProductDetailStore } from "../store/createProductDetailStore";
import { createProductStore } from "../store/createProductStore";
// 💡 Interfaz necesaria para la API del store (debe estar disponible globalmente)
interface LoginStoreApi {
    getState: () => {
        logout: () => void;
        revalidateAuth: () => Promise<boolean>;
    };
}

// Define la interfaz para el contenedor de inyección de dependencias.
interface Services {
  getProductsUseCase: ReturnType<
    typeof initializeServices
  >["getProductsUseCase"];
  getProductDetailUseCase: ReturnType<
    typeof initializeServices
  >["getProductDetailUseCase"];
  loginUseCase: ReturnType<typeof initializeServices>["loginUseCase"];
  syncCartUseCase: ReturnType<typeof initializeServices>["syncCartUseCase"];
  updateCartItemUseCase: ReturnType<
    typeof initializeServices
  >["updateCartItemUseCase"];
  removeCartItemUseCase: ReturnType<
    typeof initializeServices
  >["removeCartItemUseCase"];
  removeAllCartItemsUseCase: ReturnType<
    typeof initializeServices
  >["removeAllCartItemsUseCase"];
}

interface StorefrontHooks {
  useProductStore: ReturnType<typeof createProductStore>;
  useLoginStore: ReturnType<typeof createLoginStore>;
  useProductDetailStore: ReturnType<typeof createProductDetailStore>;
  useCartStore: ReturnType<typeof createCartStore>; 
  utils: {
    vtexSearch: typeof vtexSearchUtils;
    // Aquí puedes añadir otras utilidades generales
    // formatters: typeof formatters;
  };
}

const StorefrontContext = createContext<StorefrontHooks | undefined>(undefined);

interface StorefrontProviderProps {
  children: ReactNode;
  config: any; // El tipo de config depende de tu providers.json
}

export const StorefrontProvider: React.FC<StorefrontProviderProps> = ({
  children,
  config,
}) => {
  const activeProviderName = config.provider;

  // 1. Inicialización Preliminar para obtener el LoginUseCase (temporal)
  // 🚨 Nota: Solo llamamos a initializeServices para obtener la dependencia inicial
  // del loginUseCase. Esta llamada NO debe crear el proveedor final aún.
  const tempServices = useMemo(() => initializeServices(config, undefined as any), [config]);

  // 2. Crear la instancia del Login Store (Hook/Zustand API)
  const useLoginStore = useMemo(
    () => createLoginStore(
        tempServices.loginUseCase, 
        activeProviderName
    ),
    [tempServices, activeProviderName]
  );

  // 3. Obtener la API del store para inyección
  const loginStoreApi: LoginStoreApi = useLoginStore as LoginStoreApi;

  // 4. Inicializar los Servicios FINALES, inyectando la API del Login Store.
  // 💡 Esta llamada DEBE crear el proveedor final (VtexProvider/ShopifyProvider).
  const services = useMemo(() => {
    // initializeServices(config, loginStoreApi) es la llamada con el cambio.
    return initializeServices(config, loginStoreApi); 
  }, [config, loginStoreApi]); 

  // 5. Crear los hooks finales usando los servicios
  const hooks = useMemo(
    () => ({
      useProductStore: createProductStore(services.getProductsUseCase),
      useLoginStore: useLoginStore, // 💡 Usamos la instancia de useLoginStore ya creada
      useProductDetailStore: createProductDetailStore(
        services.getProductDetailUseCase
      ),
      // 💡 Pasamos el caso de uso requerido a la fábrica del store
      useCartStore: createCartStore(
        services.syncCartUseCase,
        services.updateCartItemUseCase,
        services.removeCartItemUseCase,
        services.removeAllCartItemsUseCase
      ),
        utils: {
        vtexSearch: vtexSearchUtils,
      },
    }),
    [services, useLoginStore]
  );

  return (
    <StorefrontContext.Provider value={hooks}>
      {children}
    </StorefrontContext.Provider>
  );
};

// Hook personalizado para usar los servicios fácilmente en cualquier componente
export const useStorefront = () => {
  const context = useContext(StorefrontContext);
  if (!context) {
    throw new Error("useStorefront must be used within a StorefrontProvider");
  }
  return context;
};