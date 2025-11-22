// src/shared/utils/auth-storage.util.ts

import * as SecureStore from 'expo-secure-store';

const SHOPIFY_TOKEN_KEY = 'shopifyAccessToken';
const VTEX_COOKIES_KEY = 'vtexAuthCookies';
const VTEX_USER_EMAIL_KEY = 'vtexUserEmail';
const VTEX_USER_PASSWORD_KEY = 'vtexUserPassword';
const ACTIVE_PROVIDER_KEY = 'activeProvider';
const VTEX_ORDER_FORM_ID_KEY = 'vtexOrderFormId'; 

// Esta función es el nuevo punto de entrada para obtener un token de autenticación
export const getAuthToken = async (): Promise<string | null> => {
  try {
    const shopifyToken = await SecureStore.getItemAsync(SHOPIFY_TOKEN_KEY);
    if (shopifyToken) {
      return shopifyToken;
    }
    
    const vtexCookies = await SecureStore.getItemAsync(VTEX_COOKIES_KEY);
    if (vtexCookies) {
      return vtexCookies;
    }
    
    return null; // Devuelve null si no se encuentra ningún token
  } catch (e) {
    console.error('Failed to get token from SecureStore.', e);
    return null;
  }
};

// Puedes mantener las funciones específicas para guardar, ya que el caso de uso
// de login de cada proveedor es responsable de guardarlo.
export const saveShopifyAccessToken = async (token: string | null) => {
  if (token) {
    await SecureStore.setItemAsync(SHOPIFY_TOKEN_KEY, token);
  } else {
    await SecureStore.deleteItemAsync(SHOPIFY_TOKEN_KEY);
  }
};

// 💡 FUNCIÓN DE AYUDA: Para saber el proveedor activo
export const getActiveProvider = async (): Promise<string | null> => {
    return SecureStore.getItemAsync(ACTIVE_PROVIDER_KEY);
};

// 💡 ACTUALIZACIÓN: saveVtexAuthCookies debe guardar el proveedor.
// (Opcional, pero bueno si usas getAuthToken/getActiveProvider)
export const saveVtexAuthCookies = async (cookies: string | null) => {
  if (cookies) {
    await SecureStore.setItemAsync(VTEX_COOKIES_KEY, cookies);
    await SecureStore.setItemAsync(ACTIVE_PROVIDER_KEY, 'Vtex'); 
  } else {
    await SecureStore.deleteItemAsync(VTEX_COOKIES_KEY);
    await SecureStore.deleteItemAsync(ACTIVE_PROVIDER_KEY);
  }
};


export const clearAllAuthTokens = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(SHOPIFY_TOKEN_KEY);
    await SecureStore.deleteItemAsync(VTEX_COOKIES_KEY);
    await SecureStore.deleteItemAsync(VTEX_ORDER_FORM_ID_KEY);
    await SecureStore.deleteItemAsync(VTEX_SESSION_KEY);
    await SecureStore.deleteItemAsync(VTEX_SEGMENT_KEY);
    await clearVtexCredentials(); // Borra las credenciales guardadas
  } catch (e) {
    console.warn('Failed to clear auth storage.', e);
  }
};


export const saveVtexCredentials = async (email: string, password: string): Promise<void> => {
    // Es crucial usar SecureStore para la contraseña
    await SecureStore.setItemAsync(VTEX_USER_EMAIL_KEY, email);
    await SecureStore.setItemAsync(VTEX_USER_PASSWORD_KEY, password);
    await SecureStore.setItemAsync(ACTIVE_PROVIDER_KEY, 'Vtex');
};

export const getVtexCredentials = async (): Promise<{ email: string | null; password: string | null }> => {
    const email = await SecureStore.getItemAsync(VTEX_USER_EMAIL_KEY);
    const password = await SecureStore.getItemAsync(VTEX_USER_PASSWORD_KEY);
    return { email, password };
};

export const clearVtexCredentials = async (): Promise<void> => {
    await SecureStore.deleteItemAsync(VTEX_USER_EMAIL_KEY);
    await SecureStore.deleteItemAsync(VTEX_USER_PASSWORD_KEY);
    await SecureStore.deleteItemAsync(ACTIVE_PROVIDER_KEY);
    
};



export const saveVtexOrderFormId = async (orderFormId: string | null): Promise<void> => {
    if (orderFormId) {
        // Almacena solo el ID. La lógica de formar la cookie '__ofid={ID}' se hace en el Provider.
        await SecureStore.setItemAsync(VTEX_ORDER_FORM_ID_KEY, orderFormId);
    } else {
        await SecureStore.deleteItemAsync(VTEX_ORDER_FORM_ID_KEY);
    }
};

// 💡 FUNCIÓN NUEVA: Obtener el OrderFormId
export const getVtexOrderFormId = async (): Promise<string | null> => {
    return SecureStore.getItemAsync(VTEX_ORDER_FORM_ID_KEY);
};

const VTEX_SESSION_KEY = 'vtexSession';
const VTEX_SEGMENT_KEY = 'vtexSegment';

export const saveVtexSessionCookies = async (session: string | null, segment: string | null) => {
    if (session) {
        await SecureStore.setItemAsync(VTEX_SESSION_KEY, session);
    } else {
        await SecureStore.deleteItemAsync(VTEX_SESSION_KEY);
    }

    if (segment) {
        await SecureStore.setItemAsync(VTEX_SEGMENT_KEY, segment);
    } else {
        await SecureStore.deleteItemAsync(VTEX_SEGMENT_KEY);
    }
};

export const getVtexSessionCookies = async () => {
    const session = await SecureStore.getItemAsync(VTEX_SESSION_KEY);
    const segment = await SecureStore.getItemAsync(VTEX_SEGMENT_KEY);
    return { session, segment };
};