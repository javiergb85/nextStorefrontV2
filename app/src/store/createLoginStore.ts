import CookieManager from '@react-native-cookies/cookies';
import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { GetUserAddressesUseCase } from '../domain/use-cases/get-user-addresses.use-case';
import { GetUserProfileUseCase } from '../domain/use-cases/get-user-profile.use-case';
import { LoginUseCase } from '../domain/use-cases/login.use-case';
import { RemoveAllCartItemsUseCase } from '../domain/use-cases/remove-all-cart-items.use-case';
import {
  clearAllAuthTokens,
  getAuthToken,
  getVtexCredentials,
  getVtexOrderFormId,
  saveVtexCredentials,
  saveVtexOrderFormId,
} from '../shared/utils/auth-storage.util';

// 💡 NEW TYPE: Define the possible provider names
export type ProviderName = 'Shopify' | 'Vtex';

interface LoginState {
  accessToken: string | null;
  userProfile: any | null;
  userAddresses: any[] | null;
  isLoading: boolean;
  error: string | null;
  isGuest: boolean;
  initializeAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>; 
  loginAsGuest: () => Promise<void>;
  logout: () => Promise<void>; // Updated return type
  revalidateAuth: () => Promise<boolean>; 
  fetchProfile: (email: string) => Promise<void>;
  fetchAddresses: (email: string) => Promise<void>;
}

// ✨ MODIFIED FACTORY: Accepts the active provider name
export const createLoginStore = (
    loginUseCase: LoginUseCase,
    getUserProfileUseCase: GetUserProfileUseCase,
    getUserAddressesUseCase: GetUserAddressesUseCase,
    removeAllCartItemsUseCase: RemoveAllCartItemsUseCase, // 👈 Inject the use case
    activeProviderName: ProviderName, // 👈 Inject the active provider name
    provider: any // 👈 Inject the provider
) => {
  return create<LoginState>()(
    persist(
      (set, get) => ({ 
        accessToken: null,
        userProfile: null,
        userAddresses: null,
        isLoading: true,
        error: null,
        isGuest: false,
      
        initializeAuth: async () => {
            try {
                const token = await getAuthToken();
                if (!token) {
                    // If no token, ensure profile is cleared
                    set({ accessToken: null, userProfile: null, userAddresses: null, isLoading: false });
                } else {
                    set({ accessToken: token, isLoading: false });
                }
            } catch (e) {
                set({ error: 'Failed to load session.', isLoading: false });
            }
        },
      
        // 💡 LOGIN MODIFIED: Uses the injected activeProviderName
        login: async (email, password) => {
          set({ isLoading: true, error: null });
          try {
             console.log("ENTRANDO STORE LOGIN", email, password)
            const token = await loginUseCase.execute(email, password);
      
            // 💡 LÓGICA VTEX: Usa el nombre del proveedor inyectado
            if (activeProviderName === 'Vtex') {
              console.log("guardando credenciales vtex")
                await saveVtexCredentials(email, password);
            }
            
            // 💡 Fetch user profile immediately
            await get().fetchProfile(email);
            await get().fetchAddresses(email);
            
            // 💡 VTEX: Set profile on OrderForm
            if (activeProviderName === 'Vtex') {
                const userProfile = get().userProfile;
                if (userProfile && provider.setOrderFormUserProfile) {
                    const orderFormId = await import('../shared/utils/auth-storage.util').then(m => m.getVtexOrderFormId());
                    if (orderFormId) {
                        await provider.setOrderFormUserProfile(orderFormId, userProfile);
                    }
                }
            }
    
            set({ accessToken: token, isLoading: false, isGuest: false });
          } catch (e: any) {
            set({ error: e.message, isLoading: false, accessToken: null });
          }
        },

        loginAsGuest: async () => {
          set({ isLoading: true });
          try {
            if (activeProviderName === 'Vtex') {
                let orderFormId = await getVtexOrderFormId();
                if (!orderFormId && provider.getOrderForm) {
                    console.log("[LoginStore] No OrderForm found for guest. Creating one...");
                    const orderForm = await provider.getOrderForm();
                    if (orderForm?.orderFormId) {
                        await saveVtexOrderFormId(orderForm.orderFormId);
                        console.log("[LoginStore] Guest OrderForm created:", orderForm.orderFormId);
                    }
                }
            }
            set({ isGuest: true, accessToken: null, userProfile: null, userAddresses: null, isLoading: false });
          } catch (e) {
            console.error("[LoginStore] Failed to prepare guest session:", e);
            set({ isGuest: true, accessToken: null, userProfile: null, userAddresses: null, isLoading: false });
          }
        },
      
        // 💡 revalidateAuth MODIFIED: Now uses the injected activeProviderName
        revalidateAuth: async (): Promise<boolean> => {
            // We no longer rely on getActiveProvider() from storage, 
            // we use the current active configuration.
            const providerName = activeProviderName; 
            
            if (providerName !== 'Vtex') {
                // Only attempt re-login if the configured provider is VTEX
                return false;
            }
    
            const { email, password } = await getVtexCredentials();
    
            if (!email || !password) {
                console.log("VTEX token expired, but no credentials stored. Logging out.");
                await get().logout(); 
                return false;
            }
    
            set({ isLoading: true, error: "Token expirado. Revalidando sesión..." });
            
            try {
                // Reutilizamos el caso de uso de login
                const newToken = await loginUseCase.execute(email, password);
                
                // 💡 Fetch user profile after successful re-login
                await get().fetchProfile(email);
                await get().fetchAddresses(email);
                
                // 💡 VTEX: Set profile on OrderForm
                const userProfile = get().userProfile;
                if (userProfile && provider.setOrderFormUserProfile) {
                    const orderFormId = await import('../shared/utils/auth-storage.util').then(m => m.getVtexOrderFormId());
                    if (orderFormId) {
                        await provider.setOrderFormUserProfile(orderFormId, userProfile);
                    }
                }
    
                set({ accessToken: newToken, isLoading: false, error: null });
                console.log("VTEX re-login exitoso.");
                return true;
                
            } catch (e) {
                const errorWithStatus = e as any;
            
            if (errorWithStatus.authStatus === "WrongCredentials") {
                 console.error("VTEX re-login fallido. Credenciales incorrectas. Forzando logout.");
            } else {
                 // Esto manejará errores de red u otros errores que no sean el objeto personalizado.
                 console.error("VTEX re-login fallido por error desconocido/red.", e);
            }
                await get().logout(); 
                return false;
            } finally {
                set({ isLoading: false }); 
            }
        },
        
        logout:  async () => {
          try {
              console.log("Logging out... clearing backend cart.");
              // 💡 Clear cart items on backend before destroying session
              await removeAllCartItemsUseCase.execute();
          } catch (e) {
              console.warn("Failed to clear backend cart on logout:", e);
          }

          set({ accessToken: null, error: null, userProfile: null, userAddresses: null, isGuest: false });
          await clearAllAuthTokens(); 
          
          // 💡 Clear all native cookies
          try {
              console.log("Clearing all native cookies...");
              await CookieManager.clearAll(true);
              
              
              console.log("Native cookies cleared (including explicit clear).");
          } catch (e) {
              console.error("Failed to clear native cookies:", e);
          }
        },
    
        fetchProfile: async (email: string) => {
            try {
                 const profile = await getUserProfileUseCase.execute(email);
                 set({ userProfile: profile });
            } catch (e) {
                console.error("Failed to fetch user profile", e);
            }
        },

        fetchAddresses: async (email: string) => {
            try {
                const userProfile = get().userProfile;
                  console.log(`Fetching addresses for ${userProfile}`);
                const userId = userProfile?.id;
                console.log(`Fetching addresses for ${email}, with cached UserId: ${userId}`);
                
                const addresses = await getUserAddressesUseCase.execute(email, userId);
                set({ userAddresses: addresses });
            } catch (e) {
                console.error("Failed to fetch user addresses", e);
                // Propagamos el error para que ProfileScreen pueda mostrar el modal de relogin
                throw e; 
            }
        }
      }),
      {
        name: 'login-storage',
        storage: createJSONStorage(() => ({
          getItem: async (name: string): Promise<string | null> => {
            console.log('[LoginStore] Loading from SecureStore:', name);
            const value = await SecureStore.getItemAsync(name);
            console.log('[LoginStore] Loaded value:', value ? 'FOUND' : 'NULL');
            return value;
          },
          setItem: async (name: string, value: string): Promise<void> => {
            console.log('[LoginStore] Saving to SecureStore:', name);
            await SecureStore.setItemAsync(name, value);
          },
          removeItem: async (name: string): Promise<void> => {
            console.log('[LoginStore] Removing from SecureStore:', name);
            await SecureStore.deleteItemAsync(name);
          },
        })),
        partialize: (state) => ({ 
            userProfile: state.userProfile, 
            userAddresses: state.userAddresses,
            isGuest: state.isGuest 
        }),
        onRehydrateStorage: (state) => {
          console.log('[LoginStore] Hydration starting...');
          return (state, error) => {
            if (error) {
              console.error('[LoginStore] Hydration failed:', error);
            } else {
              console.log('[LoginStore] Hydration finished. UserProfile:', state?.userProfile ? 'PRESENT' : 'NULL');
            }
          };
        },
      }
    )
  );
};