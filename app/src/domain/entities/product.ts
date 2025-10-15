export interface Product {
  id: string; // productId para VTEX, id para Shopify
  name: string; // productName para VTEX, title para Shopify
  description: string; // description para VTEX, descriptionHtml para Shopify
  images: string[]; // URLs de las imágenes
  price: number; // Precio base
  listPrice?: number; // Precio de lista, si existe
  available: boolean; // Si el producto está disponible
  slug?: string;
}