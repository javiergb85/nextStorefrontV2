import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    useWindowDimensions
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import HTML from 'react-native-render-html';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStorefront } from '../../context/storefront.context';
import { useTheme } from '../../context/theme.context';

interface ProductDetailScreenProps {
  productId: string;
}

const { width } = Dimensions.get('window');

// Reusable Quantity Selector (Same as CartScreen/PLP for consistency)
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
      <Ionicons name="remove" size={20} color={isDark ? '#FFF' : '#000'} />
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
      <Ionicons name="add" size={20} color={isDark ? '#000' : '#FFF'} />
    </TouchableOpacity>
  </View>
);

const ProductDetailScreen: React.FC<ProductDetailScreenProps> = ({ productId }) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { useProductDetailStore, useCartStore } = useStorefront();
  const { product, isLoading, error, fetchProductDetail } = useProductDetailStore();
  const { addItem, cart, updateItemQuantity, removeItem } = useCartStore();
  const { width: windowWidth } = useWindowDimensions();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Colors
  const bgColor = isDark ? '#000000' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#000000';
  const secondaryText = isDark ? '#AAAAAA' : '#666666';
  const buttonBg = isDark ? '#FFFFFF' : '#000000';
  const buttonText = isDark ? '#000000' : '#FFFFFF';

  useEffect(() => {
    if (productId) {
      fetchProductDetail(productId);
    }
  }, [productId, fetchProductDetail]);

  // Find if product is in cart
  const cartItem = product ? cart?.items?.find(item => item.product.id === product.id) : undefined;

  const handleAddToCart = () => {
    if (product) {
      addItem(product.id, 1);
    }
  };

  const handleIncrease = () => {
    if (product && cartItem) {
      updateItemQuantity(product.id, cartItem.quantity + 1);
    }
  };

  const handleDecrease = () => {
    if (product && cartItem) {
      if (cartItem.quantity > 1) {
        updateItemQuantity(product.id, cartItem.quantity - 1);
      } else {
        removeItem(product.id);
      }
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: bgColor }]}>
        <ActivityIndicator size="large" color={textColor} />
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={[styles.centered, { backgroundColor: bgColor }]}>
        <Text style={[styles.errorText, { color: textColor }]}>
            {error || 'Product not found'}
        </Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
            <Text style={{ color: secondaryText, textDecorationLine: 'underline' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
        {/* Custom Header */}
        <View style={[styles.header, { paddingTop: insets.top, backgroundColor: 'transparent' }]}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color={textColor} />
            </TouchableOpacity>
            <TouchableOpacity>
                <Ionicons name="share-outline" size={24} color={textColor} />
            </TouchableOpacity>
        </View>

        <ScrollView 
            contentContainerStyle={{ paddingBottom: 100 }} 
            showsVerticalScrollIndicator={false}
        >
            {/* Product Image */}
            <Animated.View entering={FadeInDown.duration(600)} style={styles.imageContainer}>
                <Image
                    source={{ uri: product.images[0] }}
                    style={styles.productImage}
                    resizeMode="cover"
                />
            </Animated.View>

            {/* Product Info */}
            <View style={styles.infoContainer}>
                <Animated.Text entering={FadeInDown.delay(100).duration(600)} style={[styles.brand, { color: secondaryText }]}>
                    PREMIUM COLLECTION
                </Animated.Text>
                
                <Animated.Text entering={FadeInDown.delay(200).duration(600)} style={[styles.name, { color: textColor }]}>
                    {product.name}
                </Animated.Text>

                <Animated.Text entering={FadeInDown.delay(300).duration(600)} style={[styles.price, { color: textColor }]}>
                    ${product.price.toFixed(2)}
                </Animated.Text>

                {/* Description */}
                <Animated.View entering={FadeInDown.delay(400).duration(600)} style={styles.descriptionContainer}>
                    <Text style={[styles.sectionTitle, { color: textColor }]}>DESCRIPTION</Text>
                    <HTML 
                        source={{ html: product.description }} 
                        contentWidth={windowWidth}
                        baseStyle={{ color: secondaryText, fontSize: 14, lineHeight: 24 }}
                        tagsStyles={{
                            p: { marginBottom: 10 },
                            strong: { color: textColor, fontWeight: 'bold' }
                        }}
                    />
                </Animated.View>
            </View>
        </ScrollView>

        {/* Bottom Action Bar */}
        <Animated.View entering={FadeInUp.delay(500).duration(600)} style={[styles.bottomBar, { backgroundColor: bgColor, paddingBottom: insets.bottom + 20 }]}>
            {cartItem ? (
                <View style={styles.quantityContainer}>
                    <Text style={[styles.inBagText, { color: secondaryText }]}>IN BAG:</Text>
                    <QuantitySelector 
                        quantity={cartItem.quantity}
                        onIncrease={handleIncrease}
                        onDecrease={handleDecrease}
                        isDark={isDark}
                    />
                </View>
            ) : (
                <TouchableOpacity 
                    style={[styles.addToCartButton, { backgroundColor: buttonBg }]} 
                    onPress={handleAddToCart}
                    activeOpacity={0.9}
                >
                    <Text style={[styles.addToCartText, { color: buttonText }]}>ADD TO BAG</Text>
                    <Ionicons name="bag-handle-outline" size={20} color={buttonText} style={{ marginLeft: 10 }} />
                </TouchableOpacity>
            )}
        </Animated.View>
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
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)', // Subtle backdrop if needed
  },
  imageContainer: {
    width: width,
    height: 500,
    backgroundColor: '#f0f0f0',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    padding: 24,
  },
  brand: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  name: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginBottom: 10,
    textTransform: 'uppercase',
    lineHeight: 32,
  },
  price: {
    fontSize: 20,
    fontWeight: '400',
    marginBottom: 30,
  },
  descriptionContainer: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 15,
    textTransform: 'uppercase',
  },
  errorText: {
    fontSize: 16,
    marginBottom: 10,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  addToCartButton: {
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 0, // Sharp corners for premium feel
  },
  addToCartText: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  quantityContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: 56,
  },
  inBagText: {
      fontSize: 14,
      fontWeight: '600',
      letterSpacing: 1,
  },
  quantitySelectorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 0, // Sharp
  },
  quantityText: {
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 20,
  },
});

export default ProductDetailScreen;