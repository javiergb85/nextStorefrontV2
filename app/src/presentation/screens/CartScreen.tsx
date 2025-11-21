import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStorefront } from '../../context/storefront.context';
import { useTheme } from '../../context/theme.context';
import { CartItem } from '../../data/providers/vtex/vtex.types/vtex.cart.types';
import { formatPrice } from '../../shared/utils/formatters';

// Reusable Quantity Selector
const QuantitySelector = ({
  quantity,
  onDecrease,
  onIncrease,
  isDark,
}: {
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
  isDark: boolean;
}) => (
  <View style={styles.quantitySelectorContainer}>
    <TouchableOpacity
      onPress={onDecrease}
      style={[
        styles.quantityButton,
        { borderColor: isDark ? '#333' : '#E5E5E5' },
      ]}
    >
      <Ionicons name="remove" size={16} color={isDark ? '#FFF' : '#000'} />
    </TouchableOpacity>
    <Text style={[styles.quantityText, { color: isDark ? '#FFF' : '#000' }]}>
      {quantity}
    </Text>
    <TouchableOpacity
      onPress={onIncrease}
      style={[
        styles.quantityButton,
        {
          backgroundColor: isDark ? '#FFF' : '#000',
          borderColor: isDark ? '#FFF' : '#000',
        },
      ]}
    >
      <Ionicons name="add" size={16} color={isDark ? '#000' : '#FFF'} />
    </TouchableOpacity>
  </View>
);

// Cart Item Card
const CartItemCard = ({
  item,
  isDark,
}: {
  item: CartItem;
  isDark: boolean;
}) => {
  const { updateItemQuantity, removeItem } = useStorefront().useCartStore();

  const handleIncrease = () => {
    updateItemQuantity(item.product.id, item.quantity + 1);
  };

  const handleDecrease = () => {
    if (item.quantity > 1) {
      updateItemQuantity(item.product.id, item.quantity - 1);
    } else {
      removeItem(item.product.id);
    }
  };

  const textColor = isDark ? '#FFFFFF' : '#000000';
  const secondaryText = isDark ? '#AAAAAA' : '#666666';
  const cardBg = isDark ? '#000000' : '#FFFFFF'; // Transparent/Background color

  return (
    <View style={[styles.itemContainer, { backgroundColor: cardBg }]}>
      <View style={[styles.imageContainer, { backgroundColor: isDark ? '#111' : '#F5F5F5' }]}>
        <Image
          source={{ uri: item.product.image }}
          style={styles.itemImage}
          resizeMode="contain"
        />
      </View>
      <View style={styles.itemDetails}>
        <View>
            <Text style={[styles.itemName, { color: textColor }]} numberOfLines={2}>
            {item.product.name}
            </Text>
            <Text style={[styles.itemPrice, { color: secondaryText }]}>
            {formatPrice(item.price)}
            </Text>
        </View>
        <View style={styles.itemActions}>
          <QuantitySelector
            quantity={item.quantity}
            onIncrease={handleIncrease}
            onDecrease={handleDecrease}
            isDark={isDark}
          />
        </View>
      </View>
    </View>
  );
};

const CartScreen = () => {
  const { cart, isSyncing, syncError, clearCart } = useStorefront().useCartStore();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const isDark = theme === 'dark';

  const bgColor = isDark ? '#000000' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#000000';
  const borderColor = isDark ? '#333333' : '#E5E5E5';

  if (!cart || cart.items?.length === 0) {
    return (
      <View style={[styles.centered, { backgroundColor: bgColor }]}>
        <Text style={[styles.emptyText, { color: textColor }]}>YOUR BAG IS EMPTY</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10, borderColor: borderColor }]}>
        <Text style={[styles.headerTitle, { color: textColor }]}>MY BAG</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {isSyncing && <ActivityIndicator size="small" color={textColor} style={{ marginRight: 10 }} />}
            <TouchableOpacity onPress={clearCart}>
            <Text style={styles.clearButtonText}>CLEAR</Text>
            </TouchableOpacity>
        </View>
      </View>

      {syncError && <Text style={styles.errorText}>{syncError}</Text>}

      <FlatList
        data={cart.items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <CartItemCard item={item} isDark={isDark} />}
        contentContainerStyle={[styles.listContainer, { paddingBottom: 150 }]} // Space for footer
        showsVerticalScrollIndicator={false}
      />

      {/* Footer */}
      <View style={[styles.footer, { backgroundColor: bgColor, borderColor: borderColor, paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.subtotalContainer}>
          <Text style={[styles.subtotalLabel, { color: textColor }]}>SUBTOTAL</Text>
          <Text style={[styles.subtotalValue, { color: textColor }]}>
            {formatPrice(cart?.subtotal)}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.checkoutButton, { backgroundColor: isDark ? '#FFFFFF' : '#000000' }]}
        >
          <Text style={[styles.checkoutButtonText, { color: isDark ? '#000000' : '#FFFFFF' }]}>
            CHECKOUT
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    // borderBottomWidth: 1, // Optional: Remove for cleaner look
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -1,
    textTransform: 'uppercase',
  },
  clearButtonText: {
    color: '#FF3B30', // Minimalist red
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  errorText: {
    color: '#FF3B30',
    textAlign: 'center',
    padding: 8,
    fontSize: 12,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  itemContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    // No shadows, no borders
  },
  imageContainer: {
    width: 100,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  itemImage: {
    width: '90%',
    height: '90%',
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '400',
  },
  itemActions: {
    alignItems: 'flex-start', // Align left
  },
  quantitySelectorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 0, // Sharp
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '600',
    marginHorizontal: 12,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 20,
    borderTopWidth: 1,
  },
  subtotalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    alignItems: 'flex-end',
  },
  subtotalLabel: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  subtotalValue: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  checkoutButton: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 0, // Sharp
  },
  checkoutButtonText: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});

export default CartScreen;