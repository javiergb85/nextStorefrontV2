import { create } from 'zustand';

// Normaliza el OrderForm para que sea consistente, sin importar el proveedor.
interface OrderFormState {
  items: { id: string; quantity: number }[];
  address: any | null;
  paymentInfo: any | null;
  
  // Acciones para modificar el estado
  addItem: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  updateItemQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  setAddress: (address: any) => void;
  setPaymentInfo: (paymentInfo: any) => void;
}

export const useOrderFormStore = create<OrderFormState>((set) => ({
  // Estado inicial
  items: [],
  address: null,
  paymentInfo: null,
  
  // Implementación de las acciones
  addItem: (id, quantity) =>
    set((state) => {
      const existingItem = state.items.find((item) => item.id === id);
      if (existingItem) {
        // Si el ítem ya existe, actualiza la cantidad
        return {
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity: item.quantity + quantity } : item
          ),
        };
      }
      // Si no existe, añade un nuevo ítem
      return {
        items: [...state.items, { id, quantity }],
      };
    }),

  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    })),

  updateItemQuantity: (id, quantity) =>
    set((state) => {
      // Evita cantidades negativas
      if (quantity <= 0) {
        return {
          items: state.items.filter((item) => item.id !== id),
        };
      }
      return {
        items: state.items.map((item) =>
          item.id === id ? { ...item, quantity } : item
        ),
      };
    }),

  clearCart: () =>
    set(() => ({
      items: [],
      address: null,
      paymentInfo: null,
    })),

  setAddress: (address) =>
    set(() => ({
      address,
    })),

  setPaymentInfo: (paymentInfo) =>
    set(() => ({
      paymentInfo,
    })),

    resetCart: () =>
    set(() => ({
      items: [],
      address: null,
      paymentInfo: null,
    })),
}));