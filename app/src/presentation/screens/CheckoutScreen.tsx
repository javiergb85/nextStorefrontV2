import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStorefront } from '../../context/storefront.context';
import { useTheme } from '../../context/theme.context';
import { getAuthToken, getVtexOrderFormId, getVtexSessionCookies, isTokenExpired } from '../../shared/utils/auth-storage.util';
import { WebViewCheckout } from '../components/WebViewCheckout';

const CheckoutScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { services, useLoginStore } = useStorefront();
  const isGuest = useLoginStore((state) => state.isGuest);
  const [loading, setLoading] = useState(true);
  const [checkoutData, setCheckoutData] = useState<any>(null);
  const [cookies, setCookies] = useState<{
    sessionCookie: string;
    vtexIdClientCookie: string;
    segmentCookie: string;
    orderFormCookie: string;
  } | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        let token = await getAuthToken();
        
        // 💡 Check for token expiration
        if (token && isTokenExpired(token)) {
            console.log("⚠️ [CheckoutScreen] Token expired. Revalidating...");
            const revalidated = await useLoginStore.getState().revalidateAuth();
            if (revalidated) {
                console.log("✅ [CheckoutScreen] Revalidation successful.");
                token = await getAuthToken(); // Get new token
            } else {
                console.warn("❌ [CheckoutScreen] Revalidation failed.");
                // Handle failure (optional: redirect to login or show error)
            }
        } else {
             console.log("✅ [CheckoutScreen] Token is valid.");
        }

        const orderFormId = await getVtexOrderFormId();
        const { session, segment } = await getVtexSessionCookies();
        
        if (!orderFormId) {
            console.error("No orderFormId found");
            setLoading(false);
            return;
        }

        // Fetch full orderForm
        // We cast provider to any because getOrderForm might not be in the generic Provider interface explicitly defined in some contexts
        // but we know VtexProvider has it.
        const orderForm = await (services.provider as any).getOrderForm(orderFormId);

      
        setCookies({
          sessionCookie: session || '',
          vtexIdClientCookie: token || '',
          segmentCookie: segment || '',
          orderFormCookie: orderFormId,
        });

        setCheckoutData({ orderForm });
      } catch (error) {
        console.error('Failed to load checkout data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: isDark ? '#000' : '#fff' }]}>
        <ActivityIndicator size="large" color={isDark ? '#fff' : '#0000ff'} />
      </View>
    );
  }

  if (!checkoutData || !cookies) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
        <Text style={{ color: isDark ? '#fff' : '#000' }}>Error al cargar el pago</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: isDark ? '#000' : '#fff' }]}>
      <View style={[styles.header, { borderBottomColor: isDark ? '#222' : '#eee' }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={isDark ? '#fff' : 'black'} />
          <Text style={[styles.backText, { color: isDark ? '#fff' : 'black' }]}>Volver al carrito</Text>
        </TouchableOpacity>
      </View>
      <WebViewCheckout
        checkout={checkoutData}
        hostname= 'hanesar.myvtex.com' 
        sessionCookie={isGuest ? '' : cookies.sessionCookie}
        vtexIdClientCookie={isGuest ? '' : cookies.vtexIdClientCookie}
        segmentCookie={isGuest ? '' : cookies.segmentCookie}
        orderFormCookie={cookies.orderFormCookie}
        onAddressChange={async (postalCode) => {
            console.log("📬 [CheckoutScreen] Address changed. Syncing session with postal code:", postalCode);
            try {
                // We cast provider to any because updateSession might not be in the generic Provider interface
                await (services.provider as any).updateSession(undefined, postalCode);
                console.log("✅ [CheckoutScreen] Session synced with new postal code.");
            } catch (error) {
                console.error("❌ [CheckoutScreen] Failed to sync session:", error);
            }
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CheckoutScreen;
