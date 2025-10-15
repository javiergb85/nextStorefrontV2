import { create } from 'zustand';
import { loginUseCase } from '../../di';
import { getAuthToken } from '../../shared/utils/auth-storage.util';

interface LoginState {
  accessToken: string | null;
  isLoading: boolean;
  error: string | null;
  initializeAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useLoginStore = create<LoginState>((set) => ({
  accessToken: null,
  isLoading: true, // Inicia en 'true' para mostrar la pantalla de carga
  error: null,

  initializeAuth: async () => {
    try {
      const token = await getAuthToken();

   
      // Si no hay token, el accessToken sigue siendo null,
      // pero el isLoading se desactiva.
      set({ accessToken: token, isLoading: false });
    } catch (e) {
      // En caso de error, el isLoading también se desactiva.
      set({ error: 'Failed to load session.', isLoading: false });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      console.log('ebtre')
      const token = await loginUseCase.execute(email, password);

         console.log("token", token)
      set({ accessToken: token, isLoading: false });
    } catch (e: any) {
      set({ error: e.message, isLoading: false, accessToken: null });
    }
  },

  logout: () => {
    set({ accessToken: null, error: null });
    // TODO: Llamar a una función de utilidad para eliminar todos los tokens
  },
}));
