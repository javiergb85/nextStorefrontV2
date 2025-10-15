import { Product as DomainProduct } from '../../../domain/entities/product'; // Importa la entidad de dominio
import { ShopifyProductClass } from './shopify.types/shopify.product.type';
import { PurpleNode as ShopifyProduct } from './shopify.types/shopify.products.types'; // Importa las interfaces de Shopify
import { PurpleNode as ShopifySearchProduct } from "./shopify.types/shopify.search.types";


export const mapShopifyProductToDomain = (shopifyProduct: ShopifyProduct): DomainProduct => {
  const images = shopifyProduct.images.edges.map(edge => edge.node.url);
  const firstVariant = shopifyProduct.variants.edges[0]?.node;

  // Los precios de Shopify vienen como strings. Debemos convertirlos a number.
  const price = firstVariant?.price.amount ? parseFloat(firstVariant.price.amount) : 0;
  const listPrice = firstVariant?.compareAtPrice?.amount ? parseFloat(firstVariant.compareAtPrice.amount) : price;

  return {
    id: shopifyProduct.id,
    name: shopifyProduct.title,
    description: shopifyProduct.descriptionHtml,
    images: images,
    price: price,
    listPrice: listPrice,
    available: shopifyProduct.availableForSale,
  };
};


export const mapShopifySearchToDomain = (
  shopifyProduct: ShopifySearchProduct
): DomainProduct => {
  // En la respuesta de la API de búsqueda, las imágenes se devuelven como un único objeto `featuredImage`
  const images = shopifyProduct.featuredImage ? [shopifyProduct.featuredImage.url] : [];
  
  // Obtenemos el precio del primer variante disponible, si existe.
  const firstVariant = shopifyProduct.variants.edges[0]?.node;
  const price = firstVariant?.price?.amount
    ? parseFloat(firstVariant.price.amount)
    : 0;

  return {
    id: shopifyProduct.id,
    name: shopifyProduct.title,
    // La consulta de búsqueda no devuelve la descripción, por lo que la establecemos como un string vacío.
    description: "", 
    images: images,
    price: price,
    // La consulta de búsqueda no incluye un "listPrice" o "compareAtPrice". Lo dejamos igual que el precio.
    listPrice: price, 
    // La consulta de búsqueda no devuelve el estado de disponibilidad. Lo establecemos en true como valor por defecto.
    available: true, 
    slug: shopifyProduct.handle,
  };
};


export const mapShopifyProductDetailToDomain = (shopifyProduct: ShopifyProductClass): DomainProduct => {

   
  // Correctly access the nested ProductClass object
  const productData = shopifyProduct;
 
  const images = productData.images.edges.map(edge => edge.node.url);
  const firstVariant = productData.variants.edges[0]?.node;

  // Shopify prices come as strings. We must convert them to numbers.
  const price = firstVariant?.price.amount ? parseFloat(firstVariant.price.amount) : 0;
  // The `compareAtPrice` field is null in your type definition, so it will fall back to `price`.


  const listPrice = firstVariant?.compareAtPrice?.amount ? parseFloat(firstVariant.compareAtPrice.amount) : price;
   
  return {
    id: productData.id,
    name: productData.title,
    description: productData.descriptionHtml,
    images: images,
    price: price,
    listPrice: listPrice,
    available: productData.availableForSale,
  };
};