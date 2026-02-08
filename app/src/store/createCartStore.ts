import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
    Cart, CartItem
} from "../domain/entities/cart";
import { RemoveAllCartItemsUseCase } from "../domain/use-cases/remove-all-cart-items.use-case";
import { RemoveCartItemUseCase } from "../domain/use-cases/remove-cart-item.use-case";
import { SyncCartUseCase } from "../domain/use-cases/sync-cart.use-case";
import { UpdateCartItemUseCase } from "../domain/use-cases/update-cart-item.use-case";

import { GetCartUseCase } from "../domain/use-cases/get-cart.use-case";

export interface CartState {
  cart: Cart | null;
  address: any | null;
  paymentInfo: any | null;
  isSyncing: boolean;
  syncError: string | null;
  lastKnownGoodState: { cart: Cart | null };

  hydrate: () => Promise<void>; 

  addItem: (id: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  updateItemQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setAddress: (address: any) => void;
  setPaymentInfo: (paymentInfo: any) => void;

  _setSyncing: (isSyncing: boolean) => void;
  _setSyncError: (error: string | null) => void;
  _revertToLastKnownState: () => void;
  syncCart: (items: { id: string; quantity: number }[]) => void;
  reset: () => void;
}

function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<F>): void => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), waitFor);
  };
}

export const createCartStore = (
  syncCartUseCase: SyncCartUseCase,
  updateCartItemUseCase: UpdateCartItemUseCase,
  removeCartItemUseCase: RemoveCartItemUseCase,
  removeAllCartItemsUseCase: RemoveAllCartItemsUseCase,
  getCartUseCase: GetCartUseCase 
) => {
  return create(
    persist<CartState>(
      (set, get) => ({
        cart: null,
        address: null,
        paymentInfo: null,
        isSyncing: false,
        syncError: null,
        lastKnownGoodState: { cart: null },

        hydrate: async () => {
             console.log("Hydrating cart from server...");
             set({ isSyncing: true });
             const result = await getCartUseCase.execute();
             
             result.fold(
                 (error) => {
                      console.warn("Failed to hydrate cart:", error);
                      set({ isSyncing: false }); // Don't set error to avoid blocking UI
                 },
                 (cart) => {
                      console.log("Cart hydrated successfully:", cart.items.length, "items.");
                      set({ 
                          cart: cart, 
                          lastKnownGoodState: { cart: cart },
                          isSyncing: false 
                      });
                 }
             );
        },

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
              const newItem: CartItem = {
                id: `temp-${Date.now()}`,
                index: -1,
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



          // ✅ Fix: Pass uniqueId if available, otherwise fallback to SKU id
          const itemsToSync = get().cart?.items.map((i) => ({ 
              id: i.product.id, 
              uniqueId: i.id, // Assuming i.id holds the uniqueId/lineId
              quantity: i.quantity 
          })) || [];
          console.log("itemsToSync", itemsToSync)
          get().syncCart(itemsToSync);
        },

        removeItem: (idOrProductId) => {
          set(state => {
            if (!state.cart) return state;
            
            // Try matching by uniqueId/item.id first (Cart Screen)
            let newItems = state.cart.items.filter(item => item.id !== idOrProductId);
            
            // If length is same, it might be a productId (PLP/PDP)
            if (newItems.length === state.cart.items.length) {
                 newItems = state.cart.items.filter(item => item.product.id !== idOrProductId);
            }

            const newSubtotal = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
            return { cart: { ...state.cart, items: newItems, subtotal: newSubtotal } };
          });

          const itemsToSync = get().cart?.items.map((i) => ({ 
              id: i.product.id, 
              uniqueId: i.id, 
              quantity: i.quantity 
          })) || [];
          get().syncCart(itemsToSync);
        },

        updateItemQuantity: (idOrProductId, quantity) => {
          if (quantity <= 0) {
            get().removeItem(idOrProductId);
            return;
          }

          set(state => {
            if (!state.cart) return state;
            
            let itemFound = false;
            
            // 1. Try to find by uniqueId (Specific line item)
            let newItems = state.cart.items.map(item => {
                if (item.id === idOrProductId) {
                    itemFound = true;
                    return { ...item, quantity };
                }
                return item;
            });

            // 2. If not found by uniqueId, try to find by productId (SKU)
            // This is the fallback for PLP/PDP which only knows SKU ID.
            // We verify if there is an item with this product.id
            if (!itemFound) {
                 // Optimization: Update the first one found? 
                 // Or we could implement the "Update Total" logic if we were sure.
                 // Since the user rejected the complex logic, we revert to finding the first matching item.
                 newItems = state.cart.items.map(item => {
                    if (!itemFound && item.product.id === idOrProductId) {
                        itemFound = true;
                        return { ...item, quantity };
                    }
                    return item;
                });
            }

            const newSubtotal = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
            return { cart: { ...state.cart, items: newItems, subtotal: newSubtotal } };
          });
          
          const itemsToSync = get().cart?.items.map((i) => ({ 
              id: i.product.id, 
              uniqueId: i.id,
              quantity: i.quantity 
          })) || [];
          get().syncCart(itemsToSync);
        },

        clearCart: async () => {
          set(state => ({
            cart: state.cart
              ? { ...state.cart, items: [], subtotal: 0 }
              : { id: '', items: [], subtotal: 0 },
          }));

          const result = await removeAllCartItemsUseCase.execute();

          result.fold(
            get()._revertToLastKnownState,
            (updatedCart: Cart) => {
              console.log('Cart cleared successfully. Server confirmed state.');
              set({ cart: updatedCart, lastKnownGoodState: { cart: updatedCart } });
            }
          );
        },

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
          async (itemsToSync: { id: string; uniqueId?: string; quantity: number }[]) => {
            console.log("CartStore: syncCart triggered. Items:", JSON.stringify(itemsToSync));
            const { _setSyncing, _revertToLastKnownState } = get();
            _setSyncing(true);

            const itemsWithSeller = itemsToSync.map((item) => ({
              ...item,
              seller: "1",
            }));
            
            console.log("CartStore: Calling syncCartUseCase with:", JSON.stringify(itemsWithSeller));
            const result = await syncCartUseCase.execute(itemsWithSeller); 
            console.log("CartStore: syncCartUseCase returned.");

            result.fold(
              (error) => {
                console.error("CartStore: Sync failed:", error);
              },
              (updatedCart: Cart) => {
                console.log("CartStore: Sync successful. New subtotal:", updatedCart.subtotal);
                set(() => ({
                  cart: updatedCart,
                  lastKnownGoodState: { cart: updatedCart },
                  isSyncing: false,
                }));
              }
            );
          },
          1500
        ),

        setAddress: (address) => set({ address }),
        setPaymentInfo: (paymentInfo) => set({ paymentInfo }),
      }),
      {
        name: "cart-storage",
        storage: createJSONStorage(() => AsyncStorage),
      }
    )
  );
};
