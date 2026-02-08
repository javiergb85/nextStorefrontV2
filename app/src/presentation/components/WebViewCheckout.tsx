import CookieManager from '@react-native-cookies/cookies';
import React, { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { saveVtexSessionCookies } from '../../shared/utils/auth-storage.util';

interface WebViewCheckoutProps {
  checkout: any;
  hostname: string;
  sessionCookie: string;
  vtexIdClientCookie: string;
  segmentCookie: string;
  orderFormCookie: string;
  onAddressChange?: (postalCode: string) => void;
}

export const WebViewCheckout: React.FC<WebViewCheckoutProps> = ({
  checkout,
  hostname,
  sessionCookie,
  vtexIdClientCookie,
  segmentCookie,
  orderFormCookie,
  onAddressChange,
}) => {
  const uri = `https://${hostname}/checkout/?orderFormId=${checkout?.orderForm?.orderFormId}&channelId=app/#/shipping`;
  
  // 💡 VERIFICACIÓN: Loguear cookies del CookieManager al montar
  // React.useEffect(() => {
  //     const checkCookies = async () => {
  //         try {
  //             const cookies = await CookieManager.get(`https://master--hanesar.myvtex.com`);
  //             console.log("🔍 [WebViewCheckout] Cookies in CookieManager for", hostname, ":", JSON.stringify(cookies, null, 2));
  //         } catch (error) {
  //             console.error("❌ [WebViewCheckout] Error getting cookies:", error);
  //         }
  //     };
  //     checkCookies();
  // }, [hostname]);

  console.log(uri);

  const injectedJavaScript = useMemo(() => {
    const pickupInPOint = JSON.stringify({
      activeTab: 'pickup-in-point',
      selectedLeanShippingOption: 'CHEAPEST',
      isScheduledDeliveryActive: true,
      originComponent: 'omnishipping',
    });

    const delivery = JSON.stringify({
      activeTab: 'delivery',
      selectedLeanShippingOption: 'CHEAPEST',
      isScheduledDeliveryActive: true,
      originComponent: 'omnishipping',
    });
    

    // Note: Ensure checkout structure matches this access path
    const selectedAddress =
      checkout?.orderForm?.shipping?.selectedAddress?.addressType === 'search'
        ? pickupInPOint
        : delivery;
    console.log("COOKIES>>>>", `'vtex_session=${sessionCookie};domain=www.hanes.ar;path=/;' 'VtexIdclientAutCookie_${hostname.replace(/\.myvtex\.com/g, '')}=${vtexIdClientCookie} ;domain=www.hanes.ar;path=/;' 'vtex_segment=${segmentCookie};domain=www.hanes.ar;path=/;' 'checkout.vtex.com=__ofid=${orderFormCookie};domain=www.hanes.ar;path=/;';`);   
    return `
      (function() {
        try {
          var selectedAddress = ${selectedAddress};
          document.cookie = 'vtex_session=${sessionCookie};domain=www.hanes.ar;path=/;';
          document.cookie = 'VtexIdclientAutCookie_${hostname.replace(/\.myvtex\.com/g, '')}=${vtexIdClientCookie};domain=www.hanes.ar;path=/;';
          document.cookie = 'vtex_segment=${segmentCookie};domain=www.hanes.ar;path=/;';
          document.cookie = 'checkout.vtex.com=__ofid=${orderFormCookie};domain=www.hanes.ar;path=/;';

          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'address', payload: selectedAddress }));
          window.localStorage.setItem('aditionalShippingData', JSON.stringify(selectedAddress));
          
          const geoCoordinates = ${JSON.stringify(checkout?.orderForm?.shipping?.selectedAddress?.geoCoordinates)};
          if (geoCoordinates) {
             window.sessionStorage.setItem('currentPosition', JSON.stringify({ geoCoordinates: geoCoordinates }));
          }

          // 💡 Monitor Cookie Changes
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'debug', payload: 'Injected script started. Initial cookie length: ' + document.cookie.length }));

          // 💡 Hide unwanted elements logic
          setInterval(function() {
              var classesToHide = [
                  '.logo-container',
                  '.matching-container',
                  '.ribbon-banner'
              ];

              classesToHide.forEach(function(className) {
                  var elements = document.querySelectorAll(className);
                  elements.forEach(function(el) {
                      if (el && el.style && el.style.display !== 'none') {
                          el.style.display = 'none';
                      }
                  });
              });
          }, 100);


          var lastCookie = document.cookie;
          setInterval(function() {
            var currentCookie = document.cookie;
            if (currentCookie !== lastCookie) {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'debug', payload: 'Cookie change detected! Old len: ' + lastCookie.length + ', New len: ' + currentCookie.length }));
              lastCookie = currentCookie;
              
              // Notify native side to fetch cookies
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'cookieChange' }));
            }

            // 💡 Monitor Address Changes (Postal Code)
            if (window.vtexjs && window.vtexjs.checkout && window.vtexjs.checkout.orderForm) {
                var shippingData = window.vtexjs.checkout.orderForm.shippingData;
                if (shippingData && shippingData.selectedAddresses && shippingData.selectedAddresses.length > 0) {
                    var currentPostalCode = shippingData.selectedAddresses[0].postalCode;
                    var lastPostalCode = window.sessionStorage.getItem('lastPostalCode');
                    
                    if (currentPostalCode && currentPostalCode !== lastPostalCode) {
                         window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'addressChange', payload: { postalCode: currentPostalCode } }));
                         window.sessionStorage.setItem('lastPostalCode', currentPostalCode);
                    }
                }
            }

          }, 1000);

        } catch (e) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', payload: 'Error executing injected script: ' + e.message }));
        }
      })();
      true; // Note: injectedJavaScript should return true or void to avoid warnings in some versions
    `;
  }, [checkout, sessionCookie, vtexIdClientCookie, segmentCookie, orderFormCookie]);


  

  return (
    <View style={styles.container}>
      <WebView
        webviewDebuggingEnabled={true}
        source={{ uri }}
        injectedJavaScript={injectedJavaScript}
        onMessage={async (event) => {
          try {
             // console.log('Event Message:', event.nativeEvent.data);
             const data = JSON.parse(event.nativeEvent.data);
             
             if (data.type === 'debug' || data.type === 'error') {
                 console.log(`[WebView ${data.type}]:`, data.payload);
             }

             if (data.type === 'cookieChange') {
                 console.log("🍪 [Native] WebView reported cookie change. Fetching from CookieManager...");
                 
                 // DEBUG: Log all cookies to see what's actually available
                //  try {
                //      const allCookies = await CookieManager.getAll(true);
                //      console.log("🍪 [Native] All Cookies (Global):", JSON.stringify(allCookies, null, 2));
                //  } catch (err) {
                //      console.error("❌ [Native] Error getting all cookies:", err);
                //  }

                 const cookies = await CookieManager.get(`https://${hostname}`);
                 
                 const session = cookies['vtex_session']?.value;
                 const segment = cookies['vtex_segment']?.value;

                 console.log("🔍 [Native] Retrieved Cookies:", { 
                     session: session ? 'Found' : 'Missing', 
                     segment: segment ? 'Found' : 'Missing' 
                 });

                 if (session || segment) {
                     // 1. Update SecureStore
                     await saveVtexSessionCookies(session, segment);
                     console.log("✅ [Native] Saved cookies to SecureStore");
                 }
             }
             
             if (data.type === 'addressChange') {
                 const { postalCode } = data.payload;
                 console.log("📍 [Native] Address changed in WebView. Postal Code:", postalCode);
                 if (onAddressChange) {
                     onAddressChange(postalCode);
                 }
             }

          } catch (e) {
             // Handle legacy messages or non-JSON messages
             console.log('WebView Message (Raw):', event.nativeEvent.data);
          }
        }}
        sharedCookiesEnabled={true}
        cookiesEnabled={true}
        javaScriptEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        )}
        style={styles.webview}
        // 💡 Disable Cache Props
        cacheEnabled={false}
        cacheMode="LOAD_NO_CACHE"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
});
