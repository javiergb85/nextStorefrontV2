import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
    Cart, CartItem
} from "../domain/entities/cart";
import { RemoveAllCartItemsUseCase } from "../domain/use-cases/remove-all-cart-items.use-case";
import { RemoveCartItemUseCase } from "../domain/use-cases/remove-cart-item.use-case";
import { SyncCartUseCase } from "../domain/use-cases/sync-cart.use-case";
import { UpdateCartItemUseCase } from "../domain/use-cases/update-cart-item.use-case";
import { secureStorage } from "../shared/utils/secure-storage.adapter";
// Normaliza el OrderForm para que sea consistente, sin importar el proveedor.
export interface CartState {
  cart: Cart | null; // El estado principal ahora es un objeto Cart
  address: any | null;
  paymentInfo: any | null;
  isSyncing: boolean;
  syncError: string | null;
  lastKnownGoodState: { cart: Cart | null };

  // Acciones para modificar el estado
  addItem: (id: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  updateItemQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setAddress: (address: any) => void;
  setPaymentInfo: (paymentInfo: any) => void;

  // Acciones internas para la sincronización
  _setSyncing: (isSyncing: boolean) => void;
  _setSyncError: (error: string | null) => void;
  _revertToLastKnownState: () => void;
  syncCart: (items: { id: string; quantity: number }[]) => void;
  reset: () => void; // 👈 New reset action
}

// Función helper para "debouncing"
function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<F>): void => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), waitFor);
  };
}
// ✨ La fábrica ahora acepta el SyncCartUseCase
export const createCartStore = (
  syncCartUseCase: SyncCartUseCase,
  updateCartItemUseCase: UpdateCartItemUseCase,
  removeCartItemUseCase: RemoveCartItemUseCase, // 👈 Esta dependencia es para removeItem
  removeAllCartItemsUseCase: RemoveAllCartItemsUseCase // 👈 Esta es para clearCart
) => {
  return create(
    persist<CartState>(
      (set, get) => ({
        // Estado inicial
        cart: null,
        address: null,
        paymentInfo: null,
        isSyncing: false,
        syncError: null,
        lastKnownGoodState: { cart: null },

        // --- ACCIONES OPTIMISTAS ---
        
        reset: () => {
            console.log("Resetting CartStore state...");
            set({
                cart: null,
                address: null,
                paymentInfo: null,
                isSyncing: false,
                syncError: null,
                lastKnownGoodState: { cart: null },
            });
        },

        addItem: (id, quantity) => {
          set((state) => {
            const currentItems = state.cart?.items || [];
            const existingItem = currentItems.find(
              (item: CartItem) => item.product.id === id
            );

            let newItems: CartItem[];

            if (existingItem) {
              newItems = currentItems.map((item: CartItem) =>
                item.product.id === id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              );
            } else {
              // Para una UI optimista, creamos un item temporal. La sincronización lo reemplazará con datos reales.
              const newItem: CartItem = {
                id: `temp-${Date.now()}`,
                index: -1, // El índice real vendrá del servidor
                quantity,
                product: { id, name: "Cargando...", image: "" },
                price: 0,
              };
              newItems = [...currentItems, newItem];
            }

            return {
              cart: {
                ...(state.cart || { id: '', subtotal: 0 }),
                items: newItems,
              },
            };
          });

          const itemsToSync = get().cart?.items.map((i) => ({ id: i.product.id, quantity: i.quantity })) || [];
          get().syncCart(itemsToSync);
        },

        removeItem: (productId) => {
          // UI Optimista
          set(state => {
            if (!state.cart) return state; // Si no hay carrito, no hacemos nada.
            const newItems = state.cart.items.filter(item => item.product.id !== productId);
            const newSubtotal = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
            return { cart: { ...state.cart, items: newItems, subtotal: newSubtotal } };
          });

          // Disparamos la sincronización
          const itemsToSync = get().cart?.items.map((i) => ({ id: i.product.id, quantity: i.quantity })) || [];
          get().syncCart(itemsToSync);
        },

        updateItemQuantity: (productId, quantity) => {
          // Si la cantidad es 0 o menos, usamos la lógica de `removeItem`.
          if (quantity <= 0) {
            get().removeItem(productId);
            return;
          }

          // UI Optimista: Actualiza la cantidad localmente
          set(state => {
            if (!state.cart) return state; // Si no hay carrito, no hacemos nada.
            const newItems = state.cart.items.map(item =>
              item.product.id === productId ? { ...item, quantity } : item
            );
            const newSubtotal = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
            return { cart: { ...state.cart, items: newItems, subtotal: newSubtotal } };
          });

          // Disparamos la sincronización
          const itemsToSync = get().cart?.items.map((i) => ({ id: i.product.id, quantity: i.quantity })) || [];
          get().syncCart(itemsToSync);
        },

        clearCart: async () => {
          // UI Optimista: vacía el carrito en la UI inmediatamente
          set(state => ({
            cart: state.cart
              ? { ...state.cart, items: [], subtotal: 0 }
              : { id: '', items: [], subtotal: 0 },
          }));

          // Llama al caso de uso para vaciar el carrito en el backend
          const result = await removeAllCartItemsUseCase.execute();

          result.fold(
            get()._revertToLastKnownState, // Si falla, revierte al estado anterior
            (updatedCart: Cart) => {
              console.log('Cart cleared successfully. Server confirmed state.');
              set({ cart: updatedCart, lastKnownGoodState: { cart: updatedCart } });
            }
          );
        },

        // --- LÓGICA DE SINCRONIZACIÓN Y REVERSIÓN ---

        _setSyncing: (isSyncing) => set({ isSyncing, syncError: null }),
        _setSyncError: (error) => set({ isSyncing: false, syncError: error }),
        _revertToLastKnownState: () => {
          const { lastKnownGoodState } = get();
          set({
            cart: lastKnownGoodState.cart,
            isSyncing: false,
            syncError: "Error al sincronizar. Se revirtieron los cambios.",
          });
          console.warn("Optimistic UI failed. Reverting cart state.");
        },

        syncCart: debounce(
          async (itemsToSync: { id: string; quantity: number }[]) => {
         
            const { _setSyncing, _revertToLastKnownState } = get();
            _setSyncing(true);

            const itemsWithSeller = itemsToSync.map((item) => ({
              ...item,
              seller: "1",
            }));
            const result = await syncCartUseCase.execute(itemsWithSeller); 

            result.fold(
              (error) => {
                console.error("Sync failed:", error);
              },
              (updatedCart: Cart) => {
                // El caso de uso ahora devuelve la entidad Cart
                console.log("Sync successful");
                set(() => ({
                  cart: updatedCart,
                  lastKnownGoodState: { cart: updatedCart }, // Actualiza el "punto de guardado"
                  isSyncing: false,
                }));
              }
            );
          },
          1500
        ), // Espera 1.5 segundos después del último cambio para sincronizar

        // --- Otras acciones (no necesitan sincronización) ---

        setAddress: (address) => set({ address }),
        setPaymentInfo: (paymentInfo) => set({ paymentInfo }),
      }),
      {
        name: "cart-storage", // Nombre de la clave en el almacenamiento
        storage: secureStorage, // Usamos nuestro adaptador de SecureStore
      }
    )
  );
};
