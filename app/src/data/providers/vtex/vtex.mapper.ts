import { Product as DomainProduct } from '../../../domain/entities/product'; // Importa la entidad de dominio
import { Cart } from './vtex.types/vtex.cart.types';
import { VtexOrderForm } from './vtex.types/vtex.orderform.types';
import { VTEXProductClass } from './vtex.types/vtex.product.types';
import { Product as VtexProduct } from './vtex.types/vtex.products.types'; // Importa las interfaces de VTEX

export const mapVtexProductToDomain = (vtexProduct: VtexProduct): DomainProduct => {
  const images = vtexProduct.items[0]?.images.map(img => img.imageUrl) || [];
  const sellers = vtexProduct.items[0]?.sellers || [];
  const mainSeller = sellers.find(seller => seller.sellerDefault) || sellers[0];
  const commercialOffer = mainSeller?.commertialOffer;
  const price = commercialOffer?.Price || 0;
  const listPrice = commercialOffer?.ListPrice || price;
  const available = (commercialOffer?.AvailableQuantity || 0) > 0;

  return {
    id: vtexProduct.items[0].itemId,
    name: vtexProduct.productName,
    description: vtexProduct.description,
    images: images,
    price: price,
    listPrice: listPrice,
    available: available,
    slug: vtexProduct.link, 
  };
};

export const mapVtexProductDetailToDomain = (vtexProduct: VTEXProductClass): DomainProduct => {
  

  const productData = vtexProduct;

  const images = productData.items[0]?.images.map(img => img.imageUrl) || [];
  const sellers = productData.items[0]?.sellers || [];
  const mainSeller = sellers.find(seller => seller.sellerDefault) || sellers[0];
  const commercialOffer = mainSeller?.commertialOffer;

  const price = commercialOffer?.Price || 0;
  const listPrice = commercialOffer?.ListPrice || price;
  const available = (commercialOffer?.AvailableQuantity || 0) > 0;

  return {
    id: productData.items[0].itemId,
    name: productData.productName,
    description: productData.description,
    images: images,
    price: price,
    listPrice: listPrice,
    available: available,
  };
};





/**
 * Convierte la respuesta del OrderForm de VTEX a la entidad de dominio `Cart`.
 * @param orderForm El objeto orderForm de la API de VTEX.
 * @returns Un objeto `Cart` normalizado.
 */
export function mapVtexOrderFormToCart(orderForm: VtexOrderForm): Cart {
  return {
    id: orderForm.orderFormId,
    subtotal: orderForm.value / 100, // VTEX usa centavos
    items: orderForm.items.map(item => ({
      id: item.uniqueId,
      quantity: item.quantity,
      price: item.sellingPrice / 100,
      product: {
        id: item.id,
        name: item.name,
        image: item.imageUrl,
      }
    })),
    // Opcional: Si VTEX proporciona una URL de checkout directa, la mapeas aquí.
    // checkoutUrl: orderForm.checkoutUrl, 
  };
}

// Aquí puedes mover también tus otros mappers como mapVtexProductToDomain para centralizarlos.


