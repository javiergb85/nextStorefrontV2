// src/data/providers/vtex.provider.ts

import { AuthRepository } from "@/app/src/domain/repositories/auth.repository";
import { getVtexOrderFormId, getVtexSessionCookies, saveVtexAuthCookies, saveVtexOrderFormId, saveVtexSessionCookies } from "@/app/src/shared/utils/auth-storage.util";
import { Product as DomainProduct } from "../../../domain/entities/product";
import { SearchResult } from "../../../domain/entities/search-result";
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
import { OrderDetail, OrderListResponse } from "./vtex.types/vtex.orders.types";
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

  async fetchProducts(input: ProductFetchInput = {}): Promise<SearchResult> {
    console.log("VTEX Provider: fetchProducts input:", JSON.stringify(input, null, 2));

     const defaultVariables = {
          // If we have selectedFacets, query and map can be simplified/omitted
          // as selectedFacets provide the exact filters.
          query: input.selectedFacets?.length ? undefined : input.query,
          queryFacets: input.query, // Always pass query for facets computation
          fullText: input.fullText,
          map: input.selectedFacets?.length ? undefined : input.map,
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

    console.log("VTEX Provider: GraphQL Variables:", JSON.stringify(defaultVariables, null, 2));

    const response: VtexProducts = await this.apiCall(undefined, {
      method: "POST",
      body: JSON.stringify({
        query: PRODUCT_SEARCH_QUERY,
        variables: defaultVariables,
      }),
    });

    const rawProducts = response.data.productSearch.products;
    const products = rawProducts.map(mapVtexProductToDomain);
    const facets = response.data.facets.facets.map(facet => ({
      name: facet.name,
      values: facet.values.map(val => ({
        id: val.id,
        name: val.name,
        key: val.key,
        value: val.value,
        quantity: val.quantity,
        selected: val.selected,
        href: val.href,
        range: val.range
      }))
    }));

    console.log(`VTEX Provider: Found ${products.length} products. RecordsFiltered: ${response.data.productSearch.recordsFiltered}`);

    return {
      products,
      facets,
      totalCount: response.data.productSearch.recordsFiltered,
    };
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

        // 4. Actualizar la sesión de VTEX
        await this.updateSession(email);
        
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
  }

  async syncCart(items: { id: string; quantity: number; seller: string; uniqueId?: string }[]): Promise<Cart> {
    const orderFormId = await getVtexOrderFormId();
    if (!orderFormId) {
      throw new Error("No OrderForm ID found. Cannot sync cart.");
    }

    // 1. Clasificar items en "para agregar" y "para actualizar"
    const itemsToAdd = items.filter(item => !item.uniqueId || item.uniqueId.startsWith('temp-'));
    const itemsToUpdate = items.filter(item => item.uniqueId && !item.uniqueId.startsWith('temp-'));

    console.log(`SyncCart: ${itemsToAdd.length} items to add, ${itemsToUpdate.length} items to update.`);

    try {
      // 2. Procesar AGREGAR items (si los hay)
      if (itemsToAdd.length > 0) {
        console.log("Adding new items to cart...", itemsToAdd);
        
        const url = `${this.storeUrl}/api/checkout/pub/orderForm/${orderFormId}/items`;
        
        const body = {
          orderItems: itemsToAdd.map(item => ({
            id: item.id, // SKU ID es necesario para agregar
            quantity: item.quantity,
            seller: item.seller || '1',
          }))
        };

        await this.apiCall(url, {
            method: 'POST',
            body: JSON.stringify(body),
             headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        console.log("Items added successfully.");
      }

      // 3. Procesar ACTUALIZAR items (si los hay)
      if (itemsToUpdate.length > 0) {
        console.log("Updating existing items...", itemsToUpdate);
        await this.updateCartItems(itemsToUpdate.map(item => ({
             // Adaptamos la estructura para reutilizar updateCartItems
             itemIndex: 0, 
             quantity: item.quantity,
             id: item.id,
             uniqueId: item.uniqueId!,
             seller: item.seller || '1'
        })));
        console.log("Items updated successfully.");
      }

      // 4. Obtener el estado final y devolverlo
      console.log("Fetching final cart state...");
      const finalOrderForm = await this.getOrderForm();
      return mapVtexOrderFormToCart(finalOrderForm);

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
 
console.log("variables>>>>", variables)
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




  async getCart(): Promise<Cart> {
    const orderForm = await this.getOrderForm();
    return mapVtexOrderFormToCart(orderForm);
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
    
    const headers: Record<string, string> = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    };

    // Only send the cookie if we have a valid ID
    if (currentOrderFormId) {
        headers['Cookie'] = `checkout.vtex.com=__ofid=${currentOrderFormId};`;
    }

    try {
      const response = await fetch(orderFormUrl, {
        method: "GET",
        headers: headers,
      });

      if (!response.ok) {
        throw new Error(
          `OrderForm API failed with status: ${response.status}.`
        );
      }

      const orderFormJson: VtexOrderForm = await response.json();
      
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
        console.log("getUserProfile called for:", email);
        const orderForm = await this.getOrderForm();
        console.log("orderForm.clientProfileData:", orderForm.clientProfileData);
        
        const userProfileId = orderForm.userProfileId;
        console.log("orderForm.userProfileId:", userProfileId);

        if (orderForm.clientProfileData && orderForm.clientProfileData.email === email && userProfileId) {
            console.log("Returning profile from OrderForm with ID:", userProfileId);
            return {
                id: userProfileId,
                firstName: orderForm.clientProfileData.firstName,
                lastName: orderForm.clientProfileData.lastName,
                email: orderForm.clientProfileData.email,
                phone: orderForm.clientProfileData.phone,
                document: orderForm.clientProfileData.document,
            };
        } else {
             console.log("OrderForm skipped. matchedEmail:", orderForm.clientProfileData?.email === email, "hasId:", !!userProfileId);
        }
        
        // Si no está en el orderForm (ej. login fresco sin checkout), intentamos Master Data
        // URL: /api/dataentities/CL/search?_fields=firstName,lastName,email,phone,document&_where=email={email}
        // Esto suele estar bloqueado para acceso público anónimo, pero con cookie de usuario logueado podría funcionar.
        
        const searchUrl = `${this.storeUrl}/api/dataentities/CL/search?_fields=id,firstName,lastName,email,phone,document&_where=email=${email}`;
        const response = await this.apiCall(searchUrl, {
            method: 'GET',
            headers: {
                'REST-Range': 'resources=0-1',
                'X-VTEX-API-AppKey': /* TODO: API KEY */"",
                'X-VTEX-API-AppToken': /* TODO: API TOKEN */""
            }
        });
        console.log("response getUserProfile (CL)", response);
        if (Array.isArray(response) && response.length > 0) {
            console.log("Returning profile from MasterData (CL):", response[0]);
            return response[0];
        }
        
        console.warn("UserProfile not found in OrderForm or MasterData. Returning basic profile with email.");
        return { email };

    } catch (error) {
        console.error("Error fetching user profile:", error);
        throw error;
    }
  }


    async getUserAddresses(email: string, userId?: string): Promise<any[]> {
        try {
            console.log("getUserAddresses called for:", email, "userId:", userId);
            
            // 1. Si tenemos un userId explicito, probamos primero con ese (es más rápido)
            if (userId) {
                 console.log("Debug: Trying with provided userId:", userId);
                 const adUrl = `${this.storeUrl}/api/dataentities/AD/search?_where=userId=${encodeURIComponent(userId)}&_fields=_all`;
                 try {
                     const response = await this.apiCall(adUrl, {
                        method: 'GET',
                        headers: {
                            'REST-Range': 'resources=0-100',
                              'X-VTEX-API-AppKey': /* TODO: API KEY */"",
                'X-VTEX-API-AppToken': /* TODO: API TOKEN */""
                        }
                    });
                    if (Array.isArray(response) && response.length > 0) {
                        console.log(`Debug: Found addresses with provided userId.`);
                        return response;
                    }
                    console.log("Debug: No addresses found with provided userId. Falling back to CL lookup.");
                 } catch (e) {
                     console.warn("Debug: Error searching with provided userId, continuing to fallback.", e);
                 }
            }

            // 2. Si falló lo anterior o no teníamos userId, buscamos en CL por email
            console.log("Debug: Searching in CL by email for canonical IDs...");
            try {
                // Buscamos id (Document ID) y userId (Login ID) en CL
                const clUrl = `${this.storeUrl}/api/dataentities/CL/search?_fields=id,userId&_where=email=${encodeURIComponent(email)}`;
                
                const clResponse = await this.apiCall(clUrl, {
                    method: 'GET',
                    headers: {
                        'REST-Range': 'resources=0-1',
                        'X-VTEX-API-AppKey': /* TODO: API KEY */"",
                        'X-VTEX-API-AppToken': /* TODO: API TOKEN */""
                    }
                });

                console.log("Debug: CL Search Response:", JSON.stringify(clResponse));

                if (!Array.isArray(clResponse) || clResponse.length === 0) {
                    console.warn("User not found in CL, cannot fetch addresses.");
                    return [];
                }
                
                const documentId = clResponse[0].id;
                const loginId = clResponse[0].userId; 
                
                console.log(`Debug: Found CL User. DocumentId: ${documentId}, LoginId: ${loginId}`);

                // 2a. Intentamos con Document ID (común para registros creados en checkout)
                if (documentId && documentId !== userId) { // Evitamos repetir si ya lo probamos
                     console.log("Debug: Fetching addresses for DocumentId:", documentId);
                     const adUrl = `${this.storeUrl}/api/dataentities/AD/search?_where=userId=${encodeURIComponent(documentId)}&_fields=_all`;
                
                     const response = await this.apiCall(adUrl, {
                        method: 'GET',
                        headers: {
                            'REST-Range': 'resources=0-100',
                            'X-VTEX-API-AppKey': /* TODO: API KEY */"",
                            'X-VTEX-API-AppToken': /* TODO: API TOKEN */""
                        }
                     });
                     
                     if (Array.isArray(response) && response.length > 0) {
                        console.log(`Debug: Found addresses using DocumentId.`);
                        return response;
                     }
                }

                // 2b. Intentamos con Login ID (Alt UserId)
                if (loginId && loginId !== userId && loginId !== documentId) {
                     console.log("Debug: Fetching addresses for LoginId:", loginId);
                     const adUrl = `${this.storeUrl}/api/dataentities/AD/search?_where=userId=${encodeURIComponent(loginId)}&_fields=_all`;
                     
                     const response = await this.apiCall(adUrl, {
                        method: 'GET',
                        headers: {
                            'REST-Range': 'resources=0-100',
                            'X-VTEX-API-AppKey': /* TODO: API KEY */"",
                            'X-VTEX-API-AppToken': /* TODO: API TOKEN */""
                        }
                    });
                    
                    if (Array.isArray(response) && response.length > 0) {
                        console.log(`Debug: Found addresses using LoginId.`);
                        return response;
                    }
                }
                
                console.log("Debug: No addresses found with any ID.");
                return [];

            } catch (err: any) {
                console.error("Debug: Error in getUserAddresses CL/Fallback flow:", err);
                throw err;
            }
        
        } catch (error) {
            console.error("Error fetching user addresses:", error);
            throw error;
        }
    }



  async fetchCategories(depth: number = 3): Promise<any[]> {
    try {
      const url = `${this.storeUrl}/api/catalog_system/pub/category/tree/${depth}`;
      const response = await this.apiCall(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
      return response;
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw new Error("Failed to fetch categories");
    }
  }

  async listOrders(email: string): Promise<OrderListResponse> {
    try {
      // /api/oms/user/orders/?page=1&includeProfileLastPurchases=true
      const url = `${this.storeUrl}/api/oms/user/orders/?page=1&includeProfileLastPurchases=true`;
      
      // const authToken = await getAuthToken();
      // const orderFormId = await getVtexOrderFormId();
      
      // const cookieHeader = `VtexIdclientAutCookie=${authToken}; checkout.vtex.com=__ofid=${orderFormId}`;
      
      // console.log("listOrders calling with axios:", url, cookieHeader);

      // const response = await axios.get(url, {
      //   headers: {
      //     'Accept': 'application/json',
      //     'Content-Type': 'application/json',
      //     'VtexIdclientAutCookie': 'eyJhbGciOiJFUzI1NiIsImtpZCI6IjEwQzNFMDhDNkE4RkFFRkQ2MUNEQzBFRjVEQjgxOTZCNDU0QzBEMDIiLCJ0eXAiOiJqd3QifQ.eyJzdWIiOiJwYXVsYS5tb250ZXNyb2RyaWd1ZXpAYmFsbG9vbi1ncm91cC5jb20iLCJhY2NvdW50IjoiaGFuZXNhciIsImF1ZGllbmNlIjoid2Vic3RvcmUiLCJzZXNzIjoiZTY2MWFmM2MtNDNkMy00YjQxLWI4YWItMTYzODUyOWZjZjhlIiwiZXhwIjoxNzYzODUxNjY4LCJ0eXBlIjoidXNlciIsInVzZXJJZCI6ImE1NzIwOGIwLThjMWItNGMwNy1iNGU2LWYyMjMwNDFiNjBjNyIsImlhdCI6MTc2Mzc2NTI2OCwiaXNSZXByZXNlbnRhdGl2ZSI6ZmFsc2UsImlzcyI6InRva2VuLWVtaXR0ZXIiLCJqdGkiOiI5ZDkwNWFhNS0xNmMxLTQ0M2MtODY0ZC0yOWZhNTkzNmMxOTkifQ.RVw31Jcyu7ANyiAmecPOeT7EpEAUt5PQy-vHq34bL9Mc0As_EHEDOhMS2m15vcFTpcX_p5fq7rwp6c8QSxLq4Q'
      //   //  'Cookie': cookieHeader
      //   }
      // });

      const response = await this.apiCall(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
      return response;
      
    } catch (error) {
      console.error("Error fetching orders:", error);
      throw new Error("Failed to fetch orders");
    }
  }
  
  async getOrder(orderId: string): Promise<OrderDetail> {
    try {
      const url = `${this.storeUrl}/api/oms/user/orders/${orderId}`;
      const response = await this.apiCall(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
      return response;
    } catch (error) {
      console.error("Error fetching order detail:", error);
      throw new Error("Failed to fetch order detail");
    }
  }

  async setOrderFormUserProfile(orderFormId: string, userProfile: any): Promise<void> {
    try {
      const url = `${this.storeUrl}/api/checkout/pub/orderForm/${orderFormId}/attachments/clientProfileData`;
      
      const body = {
        email: userProfile.email,
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        phone: userProfile.phone,
        document: userProfile.document,
        documentType: userProfile.documentType, // Optional but good to have
      };

      console.log("Setting user profile on OrderForm:", url, body);

      await this.apiCall(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      
      console.log("User profile set on OrderForm successfully.");
    } catch (error) {
      console.error("Error setting user profile on OrderForm:", error);
      // We don't throw here to avoid blocking the user if this fails, 
      // but we log it. It might be critical for checkout though.
    }
  }

  async updateSession(email?: string, postalCode?: string): Promise<void> {
    try {
        const url = `${this.storeUrl}/api/sessions`;
        const body: any = {
            public: {}
        };

        if (email) {
             body.public.storeUserEmail = { value: email };
        }
        
        if (postalCode) {
             body.public.postalCode = { value: postalCode };
             body.public.country = { value: "USA" }; // Ensure country is set when setting postal code
        } else if (!email) {
             // Default behavior if nothing specific is passed, maybe just init
             body.public.country = { value: "USA" };
        }

        console.log("Updating VTEX Session:", url, body);

        const { session, segment } = await getVtexSessionCookies();
        
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };
        
        if (session || segment) {
            const cookieParts = [];
            if (session) cookieParts.push(`vtex_session=${session}`);
            if (segment) cookieParts.push(`vtex_segment=${segment}`);
            headers['Cookie'] = cookieParts.join('; ');
        }

        const response = await fetch(url, {
            method: 'PATCH',
            headers: headers,
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            console.warn("Failed to update session:", response.status);
            return;
        }

        const data = await response.json();
        console.log("Session Update Response:", data);

        const { sessionToken, segmentToken } = data;

        if (sessionToken || segmentToken) {
            await saveVtexSessionCookies(sessionToken, segmentToken);
            console.log("VTEX Session Cookies Updated via Body");
        }

    } catch (error) {
        console.error("Error updating VTEX session:", error);
    }
  }
}
