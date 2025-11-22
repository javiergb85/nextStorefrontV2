import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStorefront } from '../../context/storefront.context';
import { getAuthToken, getVtexOrderFormId, getVtexSessionCookies } from '../../shared/utils/auth-storage.util';
import { WebViewCheckout } from '../components/WebViewCheckout';

const CheckoutScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { services } = useStorefront();
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
        const token = await getAuthToken();
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!checkoutData || !cookies) {
    return (
      <View style={styles.container}>
        <Text>Error loading checkout</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="black" />
          <Text style={styles.backText}>Back to Cart</Text>
        </TouchableOpacity>
      </View>
      <WebViewCheckout
        checkout={checkoutData}
        hostname= 'hanesar.myvtex.com' 
        sessionCookie={cookies.sessionCookie}
        vtexIdClientCookie={cookies.vtexIdClientCookie}
        segmentCookie={cookies.segmentCookie}
        orderFormCookie={cookies.orderFormCookie}
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
