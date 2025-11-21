import { create } from 'zustand';
import { LoginUseCase } from '../domain/use-cases/login.use-case';
import {
  clearAllAuthTokens,
  getAuthToken,
  getVtexCredentials,
  saveVtexCredentials,
} from '../shared/utils/auth-storage.util';

import { GetUserProfileUseCase } from '../domain/use-cases/get-user-profile.use-case';

// 💡 NEW TYPE: Define the possible provider names
export type ProviderName = 'Shopify' | 'Vtex';

interface LoginState {
  accessToken: string | null;
  userProfile: any | null;
  isLoading: boolean;
  error: string | null;
  initializeAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>; 
  logout: () => void;
  revalidateAuth: () => Promise<boolean>; 
  fetchProfile: (email: string) => Promise<void>;
}

// ✨ MODIFIED FACTORY: Accepts the active provider name
export const createLoginStore = (
    loginUseCase: LoginUseCase,
    getUserProfileUseCase: GetUserProfileUseCase,
    activeProviderName: ProviderName // 👈 Inject the active provider name
) => {
  return create<LoginState>((set, get) => ({ 
    accessToken: null,
    userProfile: null,
    isLoading: true,
    error: null,
  
    initializeAuth: async () => {
        try {
            const token = await getAuthToken();
            set({ accessToken: token, isLoading: false });
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
        
        set({ accessToken: token, isLoading: false });
      } catch (e: any) {
        set({ error: e.message, isLoading: false, accessToken: null });
      }
    },
  
    // 💡 revalidateAuth MODIFIED: Now uses the injected activeProviderName
    revalidateAuth: async (): Promise<boolean> => {
        // We no longer rely on getActiveProvider() from storage, 
        // we use the current active configuration.
        const provider = activeProviderName; 
        
        if (provider !== 'Vtex') {
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
      set({ accessToken: null, error: null, userProfile: null });
      await clearAllAuthTokens(); 
    },

    fetchProfile: async (email: string) => {
        try {
             const profile = await getUserProfileUseCase.execute(email);
             set({ userProfile: profile });
        } catch (e) {
            console.error("Failed to fetch user profile", e);
        }
    }
  }));
};