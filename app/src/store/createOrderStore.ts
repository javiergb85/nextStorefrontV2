import { create } from 'zustand';
import { GetOrderDetailUseCase } from '../domain/use-cases/get-order-detail.use-case';
import { GetOrdersUseCase } from '../domain/use-cases/get-orders.use-case';

interface OrderState {
  orders: any[];
  selectedOrder: any | null;
  isLoading: boolean;
  error: string | null;
  fetchOrders: (email: string) => Promise<void>;
  fetchOrderDetail: (orderId: string) => Promise<void>;
  clearSelectedOrder: () => void;
}

export const createOrderStore = (
  getOrdersUseCase: GetOrdersUseCase,
  getOrderDetailUseCase: GetOrderDetailUseCase
) =>
  create<OrderState>((set) => ({
    orders: [],
    selectedOrder: null,
    isLoading: false,
    error: null,

    fetchOrders: async (email: string) => {
      console.log("createOrderStore: fetchOrders called with", email);
      set({ isLoading: true, error: null });
      const result = await getOrdersUseCase.execute(email);
      
      result.fold(
        (error) => set({ error: error.message, isLoading: false }),
        (data) => {
            // VTEX returns { list: [], paging: {}, ... }
            // We want to store the list.
            const orderList = data.list || [];
            set({ orders: orderList, isLoading: false });
        }
      );
    },

    fetchOrderDetail: async (orderId: string) => {
      set({ isLoading: true, error: null });
      const result = await getOrderDetailUseCase.execute(orderId);

      result.fold(
        (error) => set({ error: error.message, isLoading: false }),
        (order) => set({ selectedOrder: order, isLoading: false })
      );
    },

    clearSelectedOrder: () => set({ selectedOrder: null }),
  }));
