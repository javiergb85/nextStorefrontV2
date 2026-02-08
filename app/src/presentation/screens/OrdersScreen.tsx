import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStorefront } from '../../context/storefront.context';
import { useTheme } from '../../context/theme.context';

const OrdersScreen = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { orders, isLoading, error, fetchOrders } = useStorefront().useOrderStore();
  const { userProfile, isGuest, logout } = useStorefront().useLoginStore();
  
  const isDark = theme === 'dark';
  const bgColor = isDark ? '#000000' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#000000';
  const secondaryText = isDark ? '#AAAAAA' : '#666666';
  const cardBg = isDark ? '#111111' : '#F9F9F9';
  const borderColor = isDark ? '#333333' : '#E5E5E5';
  const primaryColor = isDark ? '#FFFFFF' : '#000000'; // Assuming primary is black/white for now or use a specific color
  const errorColor = '#FF3B30';

  console.log("OrdersScreen: userProfile", userProfile);

  useEffect(() => {
    console.log("OrdersScreen: useEffect triggered", userProfile?.email);
    if (userProfile?.email && !isGuest) {
      console.log("OrdersScreen: calling fetchOrders with", userProfile.email);
      fetchOrders(userProfile.email);
    } else {
      console.log("OrdersScreen: userProfile.email is missing or user is guest");
    }
  }, [userProfile, isGuest]);

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.orderCard, { backgroundColor: cardBg, borderColor: borderColor }]}
      onPress={() => router.push({ pathname: '/(tabs)/order-detail', params: { orderId: item.orderId } })}
    >
      <View style={styles.orderHeader}>
        <Text style={[styles.orderId, { color: textColor }]}>Pedido #{item.orderId}</Text>
        <Text style={[styles.orderDate, { color: secondaryText }]}>
          {new Date(item.creationDate).toLocaleDateString()}
        </Text>
      </View>
      <View style={styles.orderFooter}>
        <Text style={[styles.orderTotal, { color: primaryColor }]}>
          ${item.totalValue.toFixed(2)}
        </Text>
        <Text style={[styles.orderStatus, { color: secondaryText }]}>
          {item.statusDescription}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: bgColor, paddingTop: insets.top }]}>
      <View style={[styles.header, { borderBottomColor: borderColor }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: textColor }]}>Mis Pedidos</Text>
      </View>

      {isGuest ? (
        <View style={styles.guestContainer}>
          <Ionicons name="receipt-outline" size={80} color={secondaryText} />
          <Text style={[styles.guestTitle, { color: textColor }]}>Inicia sesión para ver tus pedidos</Text>
          <TouchableOpacity 
            style={[styles.loginButton, { backgroundColor: textColor }]}
            onPress={async () => {
              await logout(); // Importante: Limpia el estado de invitado
              router.replace('/login');
            }}
          >
            <Text style={[styles.loginButtonText, { color: bgColor }]}>INICIAR SESIÓN</Text>
          </TouchableOpacity>
        </View>
      ) : isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={primaryColor} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={{ color: errorColor }}>{error}</Text>
          <TouchableOpacity onPress={() => userProfile?.email && fetchOrders(userProfile.email)}>
            <Text style={{ color: primaryColor, marginTop: 10 }}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderItem}
          keyExtractor={(item) => item.orderId}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={{ color: secondaryText }}>No se encontraron pedidos.</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  orderCard: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderId: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  orderDate: {
    fontSize: 14,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderTotal: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  orderStatus: {
    fontSize: 14,
  },
  guestContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  guestTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 30,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  loginButton: {
    width: '100%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonText: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2,
  },
});

export default OrdersScreen;
