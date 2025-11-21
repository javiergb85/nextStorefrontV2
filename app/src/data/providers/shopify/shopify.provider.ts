// src/data/providers/shopify.provider.ts

import { AuthRepository } from "@/app/src/domain/repositories/auth.repository";
import { saveShopifyAccessToken } from "@/app/src/shared/utils/auth-storage.util";
import { Product as DomainProduct } from "../../../domain/entities/product";
import { createFetcher } from "../../http/fetcher"; // Importa tu fetcher centralizado
import { LOGIN_MUTATION, PRODUCT_DETAIL_HANDLE_QUERY, SEARCH_QUERY } from "../queries/queriesShopify";
import { mapShopifyProductDetailToDomain, mapShopifySearchToDomain } from "./shopify.mapper";
import { ShopifyLogin } from "./shopify.types/shopify.login.type";
import { Search as ShopifySearchResponse } from "./shopify.types/shopify.search.types";



export interface SearchVariables {
  query?: string;
  first?: number;
  after?: string | null;
}

export class ShopifyProvider implements AuthRepository {
//  private readonly accessToken: string;
  private storeUrl: string;
  private apiCall: (path?: string, options?: RequestInit) => Promise<any>;

  constructor(storeUrl: string, accessToken: string) {
   
    this.storeUrl = storeUrl;
     
    console.log("accessToken", accessToken)
    // ✨ El fetcher ahora se inicializa con el tipo de proveedor.
    const { fetcher } = createFetcher({ 
      baseUrl: this.storeUrl,
      provider: "Shopify", // Se añade el tipo de proveedor.
      headers: {
        "Content-Type": "application/json",
      },
      accessToken: accessToken
    });
    this.apiCall = fetcher;
  }
  

  async fetchProducts(variables?: SearchVariables): Promise<DomainProduct[]> {
       console.log("entre")
    try {
    
      // Realiza la llamada usando el apiCall.
      // El fetcher ya se encarga de los headers y la URL base.
      const rawData: ShopifySearchResponse = await this.apiCall(undefined, {
        method: "POST",
        body: JSON.stringify({
          query: SEARCH_QUERY,
          variables: {
            query: "jackets",
            first: 10,
            after: null,
          }, // Pasa las variables dinámicamente
        }),
      });

      // El manejo de errores `response.ok` y la conversión a JSON ya están dentro de tu `fetcher`.

      const rawProducts = rawData.data.search.edges.map((edge) => edge.node);

      return rawProducts.map(mapShopifySearchToDomain);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch Shopify products: ${error.message}`);
      }

      throw new Error(
        `Failed to fetch Shopify products: An unknown error occurred.`
      );
    }
  }

    async fetchProduct(slug: string): Promise<DomainProduct | null> {
    try {
      const response: any = await this.apiCall(undefined, {
        method: 'POST',
        body: JSON.stringify({
          query: PRODUCT_DETAIL_HANDLE_QUERY,
          variables: { handle:slug },
        }),
      });
       
      const rawProduct = response.data.productByHandle;

     
      if (!rawProduct) {
        return null; // Si no se encuentra el producto
      }
 
      return mapShopifyProductDetailToDomain(rawProduct);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch Shopify product by handle: ${error.message}`);
      }
      throw new Error(`Failed to fetch Shopify product by handle: An unknown error occurred.`);
    }
  }


   async login(email: string, password: string): Promise<string> {
    try {

      const response: ShopifyLogin = await this.apiCall(undefined, {
        method: "POST",
        body: JSON.stringify({
          query: LOGIN_MUTATION,
          variables: {
            input: {
              email,
              password,
            },
          },
        }),
      });
      console.log("entrando provider ")
      const { customerAccessTokenCreate } = response.data;
 console.log("entrando provider2 ", customerAccessTokenCreate)
      if (customerAccessTokenCreate.customerUserErrors.length > 0) {
        const error = customerAccessTokenCreate.customerUserErrors[0];
        throw new Error(error.message || "Invalid credentials.");
      }

      if (!customerAccessTokenCreate.customerAccessToken) {
        throw new Error("Login failed. No access token received.");
      }

      const accessToken = customerAccessTokenCreate.customerAccessToken.accessToken;

      
      await saveShopifyAccessToken(accessToken); 

      return accessToken;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Login failed: ${error.message}`);
      }
      throw new Error(`Login failed: An unknown error occurred.`);
    }
  }

  async addToCart(productId: string, quantity: number): Promise<boolean> {
    console.log(
      `Adding product ${productId} with quantity ${quantity} to Shopify cart.`
    );
    return true;
  }
 

   async syncCart(items: { id: string; quantity: number; seller: string }[]): Promise<any> { 
    console.log("SyncCart implementation Shopify")
   }

  async placeOrder(): Promise<boolean> {
    console.log("Placing order on Shopify.");
    return true;
  }

  async getUserProfile(email: string): Promise<any> {
    console.warn("getUserProfile not implemented for Shopify");
    return null;
  }

  async updateCartItems(items: { itemIndex: number; quantity: number }[]): Promise<any> {
    console.log("UpdateCartItems implementation Shopify")
  }

  async removeAllCartItems(): Promise<any> {
      console.log("removeAllCartItems implementation Shopify")
      return null;
  }
  async listOrders(email: string): Promise<any> {
    console.warn("listOrders not implemented for Shopify");
    return null;
  }

  async getOrder(orderId: string): Promise<any> {
    console.warn("getOrder not implemented for Shopify");
    return null;
  }
}
