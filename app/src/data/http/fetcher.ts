import { getAuthToken, getVtexOrderFormId } from "../../shared/utils/auth-storage.util";

interface FetcherConfig {
  baseUrl: string;
  provider: "Shopify" | "Vtex";
  headers?: Record<string, string>;
  accessToken: string;
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
  const fetcher = async (path?: string, options?: RequestInit, isRetry = false): Promise<any> => {
   
    const url = path ? path : config.baseUrl;
    const allHeaders = new Headers(config.headers);

    if (options?.headers) {
      for (const [key, value] of Object.entries(options.headers)) {
        allHeaders.set(key, value);
      }
    }

    const authToken = await getAuthToken();
    const orderFormId = await getVtexOrderFormId(); 

    const cookies: string[] = [];
    // Lógica de configuración de encabezados (permanece igual)
    if (config.provider === "Shopify") {
      allHeaders.set("X-Shopify-Storefront-Access-Token", config?.accessToken);
    }

    if (authToken) {
      if (config.provider === "Shopify") {
        allHeaders.set("Authorization", `Bearer ${authToken}`);
      } else if (config.provider === "Vtex") {
        // VTEX expects the token in the Cookie header for many APIs (like OMS)
        allHeaders.set("VtexIdclientAutCookie", authToken);
      } else {
        allHeaders.set("Authorization", `Bearer ${authToken}`);
      }
    }

    if (config.provider === "Vtex" && orderFormId) {
      cookies.push(`checkout.vtex.com=__ofid=${orderFormId}`);
    }

      if (cookies.length > 0) {
        // Si ya hay una cookie en options, la mantenemos y añadimos la nueva
        const existingCookie = allHeaders.get("Cookie") || '';
        const newCookie = cookies.join('; ');

        allHeaders.set("Cookie", existingCookie ? `${existingCookie}; ${newCookie}` : newCookie);
    }
 
 console.log("fetcher", url, {
      ...options,
      headers: allHeaders,
    })
    const response = await fetch(url, {
      ...options,
      headers: allHeaders,
    });
    
    console.log("response.ok ", response);

    // 🚨 LÓGICA DE REVALIDACIÓN Y GESTIÓN DE ERRORES 🚨
 
    // 1. Manejo del token expirado (Status 401)
    if (response.status === 401) {
        
        // 🚨 CRÍTICO: Si no se inyectó la API, no podemos hacer nada.
        if (!loginStoreApi) {
             console.log("401 detectado, pero Login API no inyectada. No se puede revalidar.");
             throw new Error("Authentication required. Login API not available.");
        }
        
        const loginState = loginStoreApi.getState(); // Acceso al estado inyectado
        
        // Evitar bucles infinitos de reintento
        if (isRetry) {
             console.log("Token revalidado falló en el reintento. Forzando logout.");
             getState?.().logout(); 
             throw new Error("Authentication failed after revalidation attempt.");
        }

        // 💡 Solo intentamos revalidar si el proveedor es VTEX
        if (config.provider === "Vtex" && getState) {
            console.log("401 detectado en VTEX. Intentando revalidación...");
            
            // Llama a la acción revalidateAuth del store inyectado
           const revalidateAuth = getState().revalidateAuth;
            
            try {
                const revalidated = await revalidateAuth();
                
                if (revalidated) {
                    console.log("Revalidación exitosa. Reintentando llamada original.");
                    // Reintenta la llamada original con el nuevo token (isRetry = true)
                    return fetcher(path, options, true); 
                }
            } catch (e) {
                // revalidateAuth maneja el error de relogin fallido forzando el logout
                console.error("Revalidación fallida:", e);
                throw new Error("Authentication revalidation failed.");
            }
        }
        
        // Si no es VTEX, o si es VTEX pero no se pudo revalidar:
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