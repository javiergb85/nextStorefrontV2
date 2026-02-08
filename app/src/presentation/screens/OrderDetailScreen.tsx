import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStorefront } from '../../context/storefront.context';
import { useTheme } from '../../context/theme.context';

const OrderDetailScreen = () => {
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { selectedOrder, isLoading, error, fetchOrderDetail, clearSelectedOrder } = useStorefront().useOrderStore();

  const isDark = theme === 'dark';
  const bgColor = isDark ? '#000' : '#f5f5f5';
  const cardBg = isDark ? '#111' : '#fff';
  const textColor = isDark ? '#fff' : '#000';
  const secondaryText = isDark ? '#aaa' : '#6b7280';

  useEffect(() => {
    if (orderId) {
      fetchOrderDetail(orderId);
    }
    return () => {
      clearSelectedOrder();
    };
  }, [orderId]);

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top, backgroundColor: isDark ? '#000' : '#f5f5f5' }]}>
        <Text style={{ color: 'red' }}>{error}</Text>
        <TouchableOpacity onPress={() => orderId && fetchOrderDetail(orderId)}>
          <Text style={{ color: isDark ? '#FFF' : '#000', marginTop: 10 }}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!selectedOrder) {
    return null;
  }

  const formatPrice = (value: number) => (value / 100).toFixed(2);

  const getCardIcon = (paymentSystemName: string | undefined) => {
    const name = paymentSystemName?.toLowerCase() || '';
    if (name.includes('visa')) return <FontAwesome5 name="cc-visa" size={24} color="#1a1f71" />;
    if (name.includes('mastercard')) return <FontAwesome5 name="cc-mastercard" size={24} color="#eb001b" />;
    if (name.includes('amex') || name.includes('american express')) return <FontAwesome5 name="cc-amex" size={24} color="#006fcf" />;
    return <FontAwesome5 name="credit-card" size={24} color="#333" />;
  };

  const paymentName = selectedOrder?.paymentData?.transactions?.[0]?.payments?.[0]?.paymentSystemName || 'Tarjeta';
  const lastDigits = selectedOrder?.paymentData?.transactions?.[0]?.payments?.[0]?.lastDigits || '****';

  return (
    <View style={[styles.mainContainer, { paddingTop: insets.top, backgroundColor: bgColor }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header with Back Button */}
        <View style={styles.navHeader}>
             <TouchableOpacity onPress={() => router.back()} style={[styles.backButton, { backgroundColor: cardBg }]}>
                <Ionicons name="arrow-back" size={24} color={textColor} />
             </TouchableOpacity>
        </View>

        <View style={styles.container}>
          <View style={styles.invoiceContainer}>
            {/* Invoice Slot */}
            <View style={styles.invoiceSlot}>
              <View style={styles.slotHole} />
            </View>

            {/* Invoice Card */}
            <View style={[styles.invoice, { backgroundColor: cardBg }]}>
              {/* Gradient Overlay */}
              <LinearGradient
                colors={isDark ? ['rgba(255,255,255,0.1)', 'transparent'] : ['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.1)', 'transparent']}
                style={styles.invoiceGradient}
              />

              {/* Title */}
              <View style={styles.titleContainer}>
                <View style={[styles.dashedLine, { borderColor: textColor }]} />
                <Text style={[styles.title, { color: textColor }]}>Factura del Pedido &mdash; {selectedOrder.orderId?.slice(0, 8)}...</Text>
                <View style={[styles.dashedLine, { borderColor: textColor }]} />
              </View>

              {/* Amounts */}
              <View style={styles.amountRow}>
                <Text style={[styles.amountLabel, { color: secondaryText }]}>Total <Text style={[styles.amountValue, { color: textColor }]}>${formatPrice(selectedOrder.value)}</Text></Text>
              </View>
              <View style={styles.amountRow}>
                <Text style={[styles.amountLabel, { color: secondaryText }]}>Productos <Text style={[styles.amountValue, { color: textColor }]}>{selectedOrder.items.length}</Text></Text>
              </View>

              <View style={styles.divider} />

              {/* Items List */}
              <View style={styles.itemsList}>
                {selectedOrder.items.map((item: any, index: number) => (
                  <View key={item.id || index} style={[styles.itemRow, { borderBottomColor: isDark ? '#222' : '#eee' }]}>
                    <View style={[styles.itemImageContainer, { borderRightColor: isDark ? '#222' : '#eee' }]}>
                      <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
                    </View>
                    <View style={styles.itemInfo}>
                      <Text style={[styles.itemName, { color: textColor }]} numberOfLines={1}>{item.name}</Text>
                      <View style={[styles.itemTag, { borderColor: isDark ? '#333' : '#ddd' }]}>
                        <FontAwesome5 name="check-circle" size={12} color="#22c55e" style={{ marginRight: 4 }} />
                        <Text style={[styles.itemTagText, { color: textColor }]}>${formatPrice(item.price)} x {item.quantity}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>

              {/* Order Status */}
              <View style={[styles.paymentStatus, { borderColor: isDark ? '#333' : '#ddd' }]}>
                <View style={styles.statusHeadingRow}>
                  <Text style={[styles.statusHeading, { color: secondaryText }]}>Estado del Pedido</Text>
                  <Text style={[styles.statusValue, { color: textColor }]}>{selectedOrder.statusDescription}</Text>
                </View>
                
                <View style={[styles.statusProgress, { backgroundColor: isDark ? '#222' : '#eee' }]}>
                  {/* Simulated Progress Bar */}
                  <View style={[styles.checkpoint, { backgroundColor: cardBg, borderColor: isDark ? '#333' : '#eee' }]}>
                    <FontAwesome5 name="check-circle" size={14} color={textColor} />
                  </View>
                  <View style={[styles.checkpoint, { left: '25%', backgroundColor: cardBg, borderColor: isDark ? '#333' : '#eee' }]}>
                    <FontAwesome5 name="check-circle" size={14} color={textColor} />
                  </View>
                   <View style={[styles.checkpoint, { left: '50%', backgroundColor: cardBg, borderColor: isDark ? '#333' : '#eee' }]}>
                    <FontAwesome5 name="check-circle" size={14} color={textColor} />
                  </View>
                   <View style={[styles.checkpoint, { left: '75%', backgroundColor: cardBg, borderColor: isDark ? '#333' : '#eee' }]}>
                    <View style={[styles.circle, { backgroundColor: textColor }]} />
                  </View>
                   <View style={[styles.checkpoint, { right: 0, backgroundColor: cardBg, borderColor: isDark ? '#333' : '#eee' }]}>
                    <FontAwesome5 name="stamp" size={14} color={textColor} />
                  </View>
                </View>
              </View>

              {/* Buttons */}
              <View style={styles.btnGroup}>
                <TouchableOpacity style={[styles.btn, styles.reminderBtn, { backgroundColor: isDark ? '#fff' : '#111827', borderColor: isDark ? '#fff' : '#1b1b1b' }]}>
                  <Text style={[styles.btnTextWhite, { color: isDark ? '#000' : '#fff' }]}>Rastrear Pedido</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, styles.downloadBtn, { backgroundColor: isDark ? '#111' : '#fff', borderColor: isDark ? '#333' : '#eee' }]}>
                  <Text style={[styles.btnTextBlack, { color: textColor }]}>Descargar Factura</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.divider} />
        </View>
      </ScrollView>

      {/* Sticky Footer */}
      <View style={[styles.stickyFooter, { backgroundColor: cardBg, borderColor: isDark ? '#222' : '#eee', paddingBottom: insets.bottom + 20 }]}>
          {/* Payment Info */}
          <View style={styles.paymentInfo}>
            <Text style={[styles.paymentLabel, { color: secondaryText }]}>Método de Pago</Text>
            <View style={styles.cardInfo}>
              <Text style={[styles.cardText, { color: textColor }]}>{paymentName} **** {lastDigits}</Text>
              <View style={styles.cardIcon}>
                 {getCardIcon(paymentName)}
              </View>
            </View>
          </View>

          {/* Footer Button */}
          <TouchableOpacity style={[styles.payNowBtn, { backgroundColor: isDark ? '#fff' : '#111827', borderColor: isDark ? '#fff' : '#1b1b1b' }]}>
            <Text style={[styles.payNowText, { color: isDark ? '#000' : '#fff' }]}>Pedir de nuevo</Text>
          </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    paddingBottom: 160,
  },
  navHeader: {
      paddingHorizontal: 20,
      paddingVertical: 10,
  },
  backButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#fff',
      borderRadius: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
  },
  container: {
    width: '95%',
    maxWidth: 425,
    alignSelf: 'center',
    marginTop: 10,
  },
  invoiceContainer: {
    position: 'relative',
    marginBottom: 20,
    // Min height to accommodate the absolute positioned invoice
    minHeight: 600, 
  },
  invoiceSlot: {
    width: '100%',
    height: 120,
    backgroundColor: '#2b2b2b',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#2c2c2c',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.45,
    shadowRadius: 15,
    elevation: 10,
    zIndex: 1,
  },
  slotHole: {
    backgroundColor: '#000',
    borderRadius: 100,
    width: '90%',
    height: 25,
    alignSelf: 'center',
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#1b1b1b',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.45,
    shadowRadius: 15,
    elevation: 5,
  },
  invoice: {
    position: 'absolute',
    width: '90%',
    top: 24, // 1.5em approx
    alignSelf: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 25,
    elevation: 5,
    zIndex: 2, // Above the slot
  },
  invoiceGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 80,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  titleContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1b1b1b',
    textAlign: 'center',
    marginVertical: 8,
    letterSpacing: 0.5,
  },
  dashedLine: {
    width: '100%',
    height: 1,
    borderWidth: 1,
    borderColor: '#1b1b1b',
    borderStyle: 'dashed',
    opacity: 0.2,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  amountLabel: {
    fontSize: 16,
    color: '#6b7280',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  amountValue: {
    fontWeight: '700',
    color: '#000',
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 12,
  },
  itemsList: {
    marginVertical: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 8,
  },
  itemImageContainer: {
    padding: 8,
    borderRightWidth: 1,
    borderRightColor: '#eee',
    marginRight: 12,
  },
  itemImage: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
  },
  itemInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemName: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  itemTag: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  itemTagText: {
    fontSize: 12,
    color: '#333',
  },
  paymentStatus: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 15,
    padding: 16,
    marginTop: 16,
  },
  statusHeadingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statusHeading: {
    textTransform: 'uppercase',
    fontWeight: '500',
    color: '#6b7280',
    fontSize: 12,
  },
  statusValue: {
    textTransform: 'uppercase',
    fontWeight: '500',
    color: '#000',
    fontSize: 12,
  },
  statusProgress: {
    height: 6,
    backgroundColor: '#eee', // Fallback
    marginTop: 24,
    marginBottom: 8,
    position: 'relative',
    borderRadius: 3,
    overflow: 'visible', // Allow checkpoints to stick out
  },
  checkpoint: {
    position: 'absolute',
    top: -10, // Center vertically relative to the 6px line
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#fff',
    borderWidth: 0.5,
    borderColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  circle: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: '#000',
  },
  btnGroup: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  btn: {
    flex: 1,
    borderRadius: 100,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  reminderBtn: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1b1b1b',
  },
  downloadBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
  },
  btnTextWhite: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
  btnTextBlack: {
    color: '#333',
    fontSize: 13,
    fontWeight: '500',
  },
  paymentInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 20,
  },
  paymentLabel: {
    fontSize: 16,
    color: '#6b7280',
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardText: {
    fontSize: 16,
    color: '#333',
  },
  cardIcon: {
    width: 35,
    height: 26,
    // backgroundColor: '#1a43bf', // Removed background color
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  payNowBtn: {
    backgroundColor: '#111827',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1b1b1b',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.45,
    shadowRadius: 15,
    elevation: 5,
  },
  payNowText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  stickyFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
  },
});

export default OrderDetailScreen;
