//import { fetch, prefetch } from 'react-native-nitro-fetch'; // 💡 Añadimos 'prefetch'
import { getAuthToken, getVtexOrderFormId } from "../../shared/utils/auth-storage.util";

interface FetcherConfig {
  baseUrl: string;
  provider: "Shopify" | "Vtex";
  headers?: Record<string, string>;
  accessToken: string;
}

interface FetchOptions extends RequestInit {
    prefetchKey?: string; 
    isPrefetchAction?: boolean; 
}

// 💡 Interfaz para la API del store que necesitamos
interface LoginStoreApi {
    getState: () => {
        logout: () => void;
        revalidateAuth: () => Promise<boolean>;
    };
}

// 💡 MODIFICACIÓN: createFetcher ahora acepta loginStoreApi como parámetro OPCIONAL.
export const createFetcher = (config: FetcherConfig, loginStoreApi?: LoginStoreApi) => {
 
  const getState = loginStoreApi ? loginStoreApi.getState : undefined;
  
  // 💡 Definición de la función fetcher (ahora recursiva)
  const fetcher = async (path?: string, options?: FetchOptions, isRetry = false): Promise<any> => {
   
    const url = path ? `${config.baseUrl}${path}` : config.baseUrl;
    // Creamos una nueva instancia de Headers a partir de la configuración base
    const allHeaders = new Headers(config.headers);

    if (options?.headers) {
      for (const [key, value] of Object.entries(options.headers)) {
        allHeaders.set(key, value);
      }
    }

    const authToken = await getAuthToken();
    const orderFormId = await getVtexOrderFormId(); 

    const cookies: string[] = [];
    
    // --- LÓGICA DE AUTHENTICACIÓN ---
    if (config.provider === "Shopify") {
      allHeaders.set("X-Shopify-Storefront-Access-Token", config?.accessToken);
    }
    if (authToken) {
      if (config.provider === "Shopify") {
        allHeaders.set("Authorization", `Bearer ${authToken}`);
      } else if (config.provider === "Vtex") {
        allHeaders.set("VtexIdclientAutCookie", authToken);
      } else {
        allHeaders.set("Authorization", `Bearer ${authToken}`);
      }
    }
    
    // --- LÓGICA DE COOKIES ---
    if (config.provider === "Vtex" && orderFormId) {
        cookies.push(`checkout.vtex.com=__ofid=${orderFormId}`);
    }

    if (cookies.length > 0) {
        const existingCookie = allHeaders.get("Cookie") || '';
        const newCookie = cookies.join('; ');
        allHeaders.set("Cookie", existingCookie ? `${existingCookie}; ${newCookie}` : newCookie);
    }
    
    // ------------------------------------------------------------------
    // 🚨 LÓGICA DE PREFETCH/FETCH 🚨
    // ------------------------------------------------------------------
    
    // Opciones base para la solicitud, usando las headers ya construidas
    const requestOptions: RequestInit = {
        ...options,
        headers: allHeaders,
    };
    
    let response: Response;
    
    // 💡 SI ES UNA ACCIÓN DE PRECARGA EXPLÍCITA
    if (options?.isPrefetchAction && options?.prefetchKey) {
        
        try {
            console.log(`[Fetcher] Ejecutando PREFETCH para URL: ${url} con clave: ${options.prefetchKey}`);

            // Usamos prefetch de nitro-fetch
            await prefetch(url, {
                ...requestOptions,
                headers: {
                    ...allHeaders,
                    'prefetchKey': options.prefetchKey // Clave para nitro-fetch
                },
            });
            
            // Devolvemos un objeto vacío para indicar al Provider que el trabajo
            // de red terminó y no debe procesar datos.
            return {}; 
            
        } catch (e) {
            console.warn(`[Fetcher] NitroFetch Prefetch fallido para ${url}:`, e);
            throw new Error(`NitroFetch Prefetch failed: ${e.message || 'Unknown error'}`);
        }
    } else if (options?.prefetchKey) {
        
        // Creamos requestOptions incluyendo la prefetchKey en el header
        const fetchOptionsWithKey: RequestInit = {
            ...options,
            headers: {
                ...allHeaders,
                'prefetchKey': options.prefetchKey // Clave para buscar en caché de nitro-fetch
            },
        };
        
        // Ejecutamos el fetch normal (que usa el caché de nitro-fetch)
        response = await fetch(url, fetchOptionsWithKey);

    // 💡 3. SI ES UN FETCH NORMAL SIN CLAVE DE CACHÉ
    } else {
        // Ejecutamos el fetch normal sin ninguna clave especial
        const standardFetchOptions: RequestInit = {
            ...options,
            headers: allHeaders,
        };
        response = await fetch(url, standardFetchOptions);
    };
    
    console.log("response.ok ", response);

    // ------------------------------------------------------------------
    // 🚨 LÓGICA DE REVALIDACIÓN Y GESTIÓN DE ERRORES 🚨
    // ------------------------------------------------------------------
 
    // 1. Manejo del token expirado (Status 401)
    if (response.status === 401) {
        
        if (!loginStoreApi) {
             console.log("401 detectado, pero Login API no inyectada. No se puede revalidar.");
             throw new Error("Authentication required. Login API not available.");
        }
        
        const loginState = loginStoreApi.getState();
        
        if (isRetry) {
             console.log("Token revalidado falló en el reintento. Forzando logout.");
             getState?.().logout(); 
             throw new Error("Authentication failed after revalidation attempt.");
        }

        if (config.provider === "Vtex" && getState) {
            console.log("401 detectado en VTEX. Intentando revalidación...");
           const revalidateAuth = getState().revalidateAuth;
            
            try {
                const revalidated = await revalidateAuth();
                
                if (revalidated) {
                    console.log("Revalidación exitosa. Reintentando llamada original.");
                    return fetcher(path, options, true); 
                }
            } catch (e) {
                console.error("Revalidación fallida:", e);
                throw new Error("Authentication revalidation failed.");
            }
        }
        
        console.log("401 detectado. Forzando logout.");
        loginState.logout(); 
        throw new Error("Authentication required.");
    }
    
    // 2. Manejo de errores genéricos (No 401)
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: `Unknown error, status ${response.status}. Could not parse JSON.` };
      }
      throw new Error(
        `API error! Status: ${response.status}. Message: ${JSON.stringify(
          errorData
        )}`
      );
    }

    return response.json();
  };

  return { fetcher };
};