export interface CartItem {
  id: string;       // ID de la línea del item (ej. 'línea_123')
  index: number;    // El índice del item en el array de items del orderForm
  quantity: number;
  product: {
    id: string;     // ID del producto
    name: string;
    image: string;
  };
  price: number;    // Precio unitario
}

export interface Cart {
  id: string;         // ID del carrito/checkout/orderForm
  items: CartItem[];
  subtotal: number;
  checkoutUrl?: string; // Útil para Shopify
}