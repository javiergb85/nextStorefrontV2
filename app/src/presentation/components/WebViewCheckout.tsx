import React, { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

interface WebViewCheckoutProps {
  checkout: any;
  hostname: string;
  sessionCookie: string;
  vtexIdClientCookie: string;
  segmentCookie: string;
  orderFormCookie: string;
}

export const WebViewCheckout: React.FC<WebViewCheckoutProps> = ({
  checkout,
  hostname,
  sessionCookie,
  vtexIdClientCookie,
  segmentCookie,
  orderFormCookie,
}) => {
  const uri = `https://${hostname}/checkout/?orderFormId=${checkout?.orderForm?.orderFormId}&channelId=app/#/shipping`;

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
          document.cookie = 'vtex_session=${sessionCookie};domain=www.hanes.ar;path=/;';
          document.cookie = 'VtexIdclientAutCookie_${hostname.replace(/\.myvtex\.com/g, '')}=${vtexIdClientCookie};domain=www.hanes.ar;path=/;';
          document.cookie = 'vtex_segment=${segmentCookie};domain=www.hanes.ar;path=/;';
          document.cookie = 'checkout.vtex.com=__ofid=${orderFormCookie};domain=www.hanes.ar;path=/;';

          window.ReactNativeWebView.postMessage(${JSON.stringify(selectedAddress)});
          window.localStorage.setItem('aditionalShippingData', ${JSON.stringify(selectedAddress)});
          
          const geoCoordinates = ${JSON.stringify(checkout?.orderForm?.shipping?.selectedAddress?.geoCoordinates)};
          if (geoCoordinates) {
             window.sessionStorage.setItem('currentPosition', JSON.stringify({ geoCoordinates: geoCoordinates }));
          }
        } catch (e) {
          window.ReactNativeWebView.postMessage('Error executing injected script: ' + e.message);
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
        onMessage={(event) => {
          console.log('WebView Message:', event.nativeEvent.data);
        }}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        )}
        style={styles.webview}
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
