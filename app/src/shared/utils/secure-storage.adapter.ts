import * as SecureStore from 'expo-secure-store';
import { PersistStorage } from 'zustand/middleware';
import { CartState } from '../../store/createCartStore';

/**
 * Un adaptador de almacenamiento que utiliza expo-secure-store para persistir
 * el estado de Zustand de forma segura. Cumple con la interfaz StateStorage.
 *
 * Se encarga de la serialización (JSON.stringify) y deserialización (JSON.parse).
 */
export const secureStorage: PersistStorage<CartState> = {
  getItem: async (name: string): Promise<{ state: CartState; version?: number } | null> => {
    try {
      const str = await SecureStore.getItemAsync(name);
      if (!str) {
        return null;
      }
      return JSON.parse(str);
    } catch (error) {
      console.error(`Failed to get item "${name}" from secure storage`, error);
      return null;
    }
  },
  setItem: async (name: string, value: { state: CartState; version?: number }): Promise<void> => {
    try {
      // Serializamos el objeto de estado a una cadena JSON antes de guardarlo.
      const str = JSON.stringify(value);
      await SecureStore.setItemAsync(name, str);
    } catch (error) {
      console.error(`Failed to set item "${name}" in secure storage`, error);
    }
  },
  removeItem: async (name:string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(name);
    } catch (error) {
      console.error(`Failed to remove item "${name}" from secure storage`, error);
    }
  },
};