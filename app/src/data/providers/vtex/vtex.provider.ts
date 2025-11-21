// src/data/providers/vtex.provider.ts

import { AuthRepository } from "@/app/src/domain/repositories/auth.repository";
import { getVtexOrderFormId, saveVtexAuthCookies, saveVtexOrderFormId } from "@/app/src/shared/utils/auth-storage.util";
import { Product as DomainProduct } from "../../../domain/entities/product";
import { createFetcher } from "../../http/fetcher";
import {
    PRODUCT_DETAIL_QUERY,
    PRODUCT_SEARCH_QUERY,
    UPDATE_ITEMS_MUTATION,
} from "../queries/queriesVtex";
import {
    mapVtexOrderFormToCart,
    mapVtexProductDetailToDomain,
    mapVtexProductToDomain,
} from "./vtex.mapper";
import { Cart } from "./vtex.types/vtex.cart.types";
import { VtexOrderForm } from "./vtex.types/vtex.orderform.types";
import { VTEXProductClass } from "./vtex.types/vtex.product.types";
import { ProductFetchInput, Products as VtexProducts } from "./vtex.types/vtex.products.types";

// 💡 Definición de la interfaz que necesitamos pasar
interface LoginStoreApi {
  getState: () => {
    logout: () => void;
    revalidateAuth: () => Promise<boolean>;
  };
}

export class VtexProvider implements AuthRepository {
  private readonly apiCall;
  private readonly accountName: string;
  private readonly storeUrl: string;
  private readonly workspace: string;


  // 💡 MODIFICACIÓN: Aceptamos loginStoreApi como el cuarto parámetro
  constructor(
    storeUrl: string,
    workspace: string,
    authCookies?: string,
    loginStoreApi?: LoginStoreApi
  ) {
    this.storeUrl = storeUrl;
    this.workspace = workspace;

    // ... Lógica para extraer el nombre de la cuenta (permanece igual)
    const matches = storeUrl.match(/https?:\/\/([^.]+)\.myvtex\.com/i);
    let fullAccountName = matches ? matches[1] : "";

    const workspaceSeparator = "--";
    if (fullAccountName.includes(workspaceSeparator)) {
      const parts = fullAccountName.split(workspaceSeparator);
      this.accountName = parts[parts.length - 1];
    } else {
      this.accountName = fullAccountName;
    }

    const { fetcher } = createFetcher(
      {
        baseUrl: `${storeUrl}/_v/private/graphql/v1?workspace=${workspace}`,
        provider: "Vtex",
        headers: {
          "Content-Type": "application/json",
        },
        accessToken: "",
      },
      // 💡 CAMBIO CLAVE: Pasamos el loginStoreApi al fetcher
      loginStoreApi
    );

    this.apiCall = fetcher;
  }
  // ... (El resto de la clase permanece igual)

  // fetchProducts, fetchProduct, login, addToCart, placeOrder...
  // (El código de login, fetchProducts, etc. no necesita cambios
  // porque usa this.apiCall, y el manejo del 401 está ahora en el fetcher.)

  async fetchProducts(input: ProductFetchInput = {}): Promise<DomainProduct[]> {
    // ... (Tu implementación de fetchProducts)
    // ...

     const defaultVariables = {
          query: input.query,
          queryFacets: input.query,
          fullText: input.fullText,
          map: input.map,
          selectedFacets: input.selectedFacets || [],
          orderBy: input.orderBy,
          // Rango de precio por defecto (de 0 al máximo, si no se proporciona)
          priceRange: input.priceRange || '0 TO 100000000000', 
          from: input.from,
          to: input.to,
          // Parámetros fijos que VTEX requiere para el comportamiento de e-commerce:
          hideUnavailableItems: true,
          skusFilter: 'ALL_AVAILABLE',
          installmentCriteria: 'MAX_WITHOUT_INTEREST',
          collection: input.collection,
      };
    const response: VtexProducts = await this.apiCall(undefined, {
      method: "POST",
      body: JSON.stringify({
        query: PRODUCT_SEARCH_QUERY,
        variables: defaultVariables,
      }),
    });

    const rawProducts = response.data.productSearch.products;

    return rawProducts.map(mapVtexProductToDomain);
    // ...
  }

  async fetchProduct(slug: string,  
    prefetchKey?: string,
    isPrefetchAction: boolean = false): Promise<DomainProduct | null> {
    // ... (Tu implementación de fetchProduct)
    // ...
    let parsedSlug = slug.startsWith("/") ? slug.substring(1) : slug;

    parsedSlug = parsedSlug.endsWith("/p")
      ? parsedSlug.slice(0, -2)
      : parsedSlug;

    try {
      const response: { data: { product: VTEXProductClass } } =
        await this.apiCall(undefined, {
          method: "POST",
          body: JSON.stringify({
            query: PRODUCT_DETAIL_QUERY,
            variables: { slug: parsedSlug },
          }),
        });

      const rawProduct = response.data.product;

      if (!rawProduct) {
        return null;
      }

      return mapVtexProductDetailToDomain(rawProduct);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch VTEX product: ${error.message}`);
      }
      throw new Error(
        `Failed to fetch VTEX product: An unknown error occurred.`
      );
    }
  }

  async login(email: string, password: string): Promise<string> {
    const ACCOUNT = this.accountName;

    console.log("ACCOUNT", ACCOUNT, email, password);
    if (!ACCOUNT) {
      throw new Error(
        "VTEX Account name could not be determined from store URL."
      );
    }

    const encodeFormBody = (data: Record<string, string>): string => {
      const formBody: string[] = [];
      for (const property in data) {
        const encodedKey = encodeURIComponent(property);
        const encodedValue = encodeURIComponent(data[property]);
        formBody.push(encodedKey + "=" + encodedValue);
      }
      return formBody.join("&");
    };

    // --- PASO 1: Obtener el authenticationToken (Cookie _vss) ---
    const dataAuth = { scope: ACCOUNT };
    const formBodyAuth = encodeFormBody(dataAuth);

    const authUrl = `https://${ACCOUNT}.myvtex.com/api/vtexid/pub/authentication/start`;

    const authenticationTokenResponse = await fetch(authUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      },
      body: formBodyAuth,
    });

    if (!authenticationTokenResponse.ok) {
      throw new Error(
        `VTEX Auth Start failed: ${authenticationTokenResponse.status}.`
      );
    }

    const resultAuthenticationToken = await authenticationTokenResponse.json();
    console.log("resultAuthenticationToken", resultAuthenticationToken);
    if (!resultAuthenticationToken?.authenticationToken) {
      throw new Error("VTEX did not return an authentication token in step 1.");
    }

    const vssToken = resultAuthenticationToken.authenticationToken;

    // --- PASO 2: Validar credenciales con el token VSS (Obtener Cookie VtexIdclientAutCookie) ---

    const bodyLogin = {
      login: email,
      password: password,
      recaptcha: "", // Puedes necesitar un valor real
    };

    const formBodyLoginString = encodeFormBody(bodyLogin);

    const validateUrl = `https://${ACCOUNT}.myvtex.com/api/vtexid/pub/authentication/classic/validate`;

    const response = await fetch(validateUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        // Usar el token VSS obtenido en el paso 1 como cookie
        Cookie: `_vss=${vssToken}`,
      },
      body: formBodyLoginString,
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = {
          message: "Unknown authentication error during validation.",
        };
      }
      throw new Error(
        `VTEX Login validation failed: ${
          response.status
        }. Message: ${JSON.stringify(errorData)}`
      );
    }

    const responseJSON = await response.json();
    console.log("responseJSON", responseJSON);
    // El token final de VTEX (VtexIdclientAutCookie)

    if (responseJSON?.authStatus === "WrongCredentials") {
      // 💡 CAMBIO CLAVE: Lanzamos un objeto de error que lleva el estado.
      const error = new Error("VTEX Login Failed: Wrong Credentials.");
      (error as any).authStatus = responseJSON.authStatus; // Adjuntamos la propiedad
      throw error;
    }
    const finalVtexToken = responseJSON?.authCookie?.Value;
    if (!finalVtexToken) {
      throw new Error(
        "Login successful, but final VtexIdclientAutCookie value was not returned."
      );
    }

    // 3. Persistir el token final.
    await saveVtexAuthCookies(finalVtexToken);

        try {
        // Al loguearse, forzamos la creación de un nuevo OrderForm
        // (o recuperamos uno si existe, si no pasamos ID se crea uno).
        const orderForm = await this.getOrderForm();
          console.log("orderForm", orderForm)
        // Guardamos el orderFormId. Este ID se usará para construir la cookie
        // 'checkout.vtex.com=__ofid={ID}' en futuras llamadas de carrito.
        await saveVtexOrderFormId(orderForm.orderFormId); 
        
    } catch (e) {
        // No lanzamos un error aquí, ya que el login fue exitoso.
        // El usuario puede seguir navegando, pero sin un carrito asociado.
        console.warn("Warning: Failed to create or persist OrderForm after successful login.", e);
        // También puedes optar por borrar la autenticación si un carrito es CRÍTICO:
        // await saveVtexAuthCookies(null); 
    }

    return finalVtexToken;
  }

  async addToCart(productId: string, quantity: number): Promise<any> {
    // Este método podría ser llamado por un `syncCart` con un solo item,
    // pero lo mantenemos por si se necesita una acción directa.
    return this.syncCart([{ id: productId, quantity, seller: '1' }]);
  }

  async syncCart(items: { id: string; quantity: number; seller: string; uniqueId?: string }[]): Promise<Cart> {
    const orderFormId = await getVtexOrderFormId();
    if (!orderFormId) {
      throw new Error("No OrderForm ID found. Cannot sync cart.");
    }

    const url = `${this.storeUrl}/api/checkout/pub/orderForm/${orderFormId}/items`;

    // El cuerpo de la petición REEMPLAZA todos los items del carrito con esta nueva lista.
    // Es perfecto para nuestro patrón de sincronización.
    const body = {
      orderItems: items.map(item => ({
        id: item.id,
        quantity: item.quantity,
        seller: item.seller ?? '1',
        uniqueId: item.uniqueId, // Se añade el uniqueId si está presente
      })),
    };

  
  

    console.log("body",url, body)
    try {
      const updatedOrderForm: VtexOrderForm = await this.apiCall(url, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });

      console.log('Cart synced successfully with VTEX.');
      // ✨ CAMBIO CLAVE: Mapeamos la respuesta antes de devolverla.
      return mapVtexOrderFormToCart(updatedOrderForm);

    } catch (error) {
      console.error('Failed to sync cart with VTEX:', error);
      throw error;
    }
  }

  async updateCartItems(items: { itemIndex: number; quantity: number; id: string; uniqueId: string; seller: string; }[]): Promise<{ success: boolean; quantity: number; }> {
    const orderFormId = await getVtexOrderFormId();
    if (!orderFormId) {
      throw new Error("No OrderForm ID found. Cannot update cart items.");
    }

    // El endpoint de GraphQL es diferente al de REST
    const url = `${this.storeUrl}/_v/private/graphql/v1?workspace=${this.workspace}`; // Usamos la propiedad de la clase

    const variables = {
      orderFormId: orderFormId,
      orderItems: items.map(item => ({
        uniqueId: item.uniqueId, // ID de la línea del carrito
        seller: item.seller || '1',
        quantity: String(item.quantity),
      }))
    };

console.log("variables", variables)
    try {
      // Usamos apiCall, pero apuntando a la URL de GraphQL
      const response: { data: { updateItems: VtexOrderForm } } = await this.apiCall(url, {
        method: 'POST',
        body: JSON.stringify({
          query: UPDATE_ITEMS_MUTATION,
          variables: variables,
        }),
      });

      console.log("response",response);
      console.log('Cart items updated successfully via GraphQL.');

      // Devolvemos un objeto con el éxito y la cantidad actualizada del primer item.
      // Esto es útil si VTEX ajusta la cantidad (ej. por stock).
      const updatedItem = response.data.updateItems.items.find(
        (item: any) => item.uniqueId === items[0].uniqueId
      );
      return { success: true, quantity: updatedItem?.quantity ?? items[0].quantity };

    } catch (error) {
      console.error('Failed to update cart items via GraphQL:', error);
      throw error;
    }
  }

  async removeAllCartItems(): Promise<Cart> {

    console.log("ENTRE removeAllCartItems")
    // 1. Obtener el estado actual y real del carrito desde el servidor.
    // Llamamos al método getOrderForm de esta misma clase.
    const currentOrderForm = await this.getOrderForm();

    const itemsToClear = currentOrderForm.items;

    // Si el carrito ya está vacío, devolvemos el estado actual mapeado.
    if (!itemsToClear || itemsToClear.length === 0) {
      console.log("Cart is already empty on the server.");
      return mapVtexOrderFormToCart(currentOrderForm);
    }

    // 2. Construir el payload para la mutación, usando la información obtenida.
    const itemsToUpdate = itemsToClear.map((item, index) => ({
      itemIndex: index,
      quantity: 0,
      id: item.id,
      uniqueId: item.uniqueId,
      seller: item.seller || '1',
    }));


  
   
    console.log("itemsToUpdate>>>>>>>>>>>>>>>>>>>>>", itemsToUpdate)
    // 3. Ejecutar la mutación `updateCartItems` para vaciar el carrito.
    // Reutilizamos el método que ya usa la mutación GraphQL.
    await this.updateCartItems(itemsToUpdate);

    // 4. Obtener el estado actualizado del carrito
    const updatedOrderForm = await this.getOrderForm();
    return mapVtexOrderFormToCart(updatedOrderForm);
  }

  async placeOrder(): Promise<boolean> {
    console.log("Placing order on VTEX.");
    return true;
  }



  public async getOrderForm(orderFormId?: string): Promise<VtexOrderForm> {
    const ACCOUNT = this.accountName;
    if (!ACCOUNT) {
      throw new Error(
        "VTEX Account name could not be determined for OrderForm API."
      );
    }

    const currentOrderFormId = orderFormId || await getVtexOrderFormId();
    const orderFormUrl = `https://${ACCOUNT}.myvtex.com/api/checkout/pub/orderForm/${currentOrderFormId || ''}`;
    // Si orderFormId es vacío, VTEX lo interpreta como "crear nuevo".

    try {
      // Usamos fetch ya que es una API REST simple y maneja la cookie de checkout.
      const response = await fetch(orderFormUrl, {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(
          `OrderForm API failed with status: ${response.status}.`
        );
      }

      const orderFormJson: VtexOrderForm = await response.json();
      
      // La cookie 'checkout.vtex.com' se establece automáticamente si usas fetch/axios
      // en un entorno web, PERO DEBEMOS ASUMIR QUE EN RN NO ES ASÍ y
      // que el ID se obtendrá del JSON y se persistirá por separado.

      return orderFormJson;

    } catch (error) {
      console.error("Error al obtener o crear orderForm:", error);
      throw new Error(
        `Failed to fetch or create OrderForm: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async getUserProfile(email: string): Promise<any> {
    // Usamos el endpoint de Profile System para obtener datos del usuario
    // Nota: Este endpoint puede requerir cookies de autenticación (VtexIdclientAutCookie)
    // que ya deberían estar manejadas por el fetcher o las cookies globales.
    
    // Opción 1: Buscar por email en Master Data (CL) - Requiere permisos públicos o token
    // Opción 2: Usar endpoint de checkout para obtener perfil asociado al orderForm
    // Opción 3: Profile System (pvt) - Requiere credenciales de app, no seguro para cliente.
    
    // Vamos a intentar obtenerlo del orderForm primero, que es lo más seguro en storefront.
    try {
        const orderForm = await this.getOrderForm();
        if (orderForm.clientProfileData && orderForm.clientProfileData.email === email) {
            return {
                firstName: orderForm.clientProfileData.firstName,
                lastName: orderForm.clientProfileData.lastName,
                email: orderForm.clientProfileData.email,
                phone: orderForm.clientProfileData.phone,
                document: orderForm.clientProfileData.document,
            };
        }
        
        // Si no está en el orderForm (ej. login fresco sin checkout), intentamos Master Data
        // URL: /api/dataentities/CL/search?_fields=firstName,lastName,email,phone,document&_where=email={email}
        // Esto suele estar bloqueado para acceso público anónimo, pero con cookie de usuario logueado podría funcionar.
        
        const searchUrl = `/api/dataentities/CL/search?_fields=firstName,lastName,email,phone,document&_where=email=${email}`;
        const response = await this.apiCall(searchUrl, {
            method: 'GET',
            headers: {
                'REST-Range': 'resources=0-1'
            }
        });
        
        if (Array.isArray(response) && response.length > 0) {
            return response[0];
        }
        
        return null;

    } catch (error) {
        console.error("Error fetching user profile:", error);
        throw error;
    }
  }

}
