// src/presentation/screens/ProductListScreen.tsx

import { Link } from "expo-router"; // 👈 Importa Link de expo-router
import React, { useEffect, useMemo } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Product as DomainProduct } from "../../domain/entities/product";
import SearchInput from "../components/SearchInput";
//import { useProductStore } from '../../store/product.store';
import { Ionicons } from "@expo/vector-icons";
import { useStorefront } from "../../context/storefront.context";
import { useTheme } from "../../context/theme.context";

const { width } = Dimensions.get("window");
const spacing = 16;
const itemWidth = (width - spacing * 3) / 2; // 2 columns with spacing

interface ProductListScreenProps {
  searchInput: any;
  loadNextPage: () => void;
}

const QuantitySelector = ({
  quantity,
  onDecrease,
  onIncrease,
  themeStyles,
  isDark
}: {
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
  themeStyles: any;
  isDark: boolean;
}) => (
  <View style={styles.quantitySelectorContainer}>
    <TouchableOpacity onPress={onDecrease} style={[themeStyles.quantityButton, { borderWidth: 1, borderColor: isDark ? '#333' : '#E5E5E5' }]}>
      <Ionicons name="remove" size={16} color={isDark ? '#FFF' : '#000'} />
    </TouchableOpacity>
    <Text style={themeStyles.quantityText}>{quantity}</Text>
    <TouchableOpacity onPress={onIncrease} style={[themeStyles.quantityButton, { backgroundColor: isDark ? '#FFF' : '#000' }]}>
      <Ionicons name="add" size={16} color={isDark ? '#000' : '#FFF'} />
    </TouchableOpacity>
  </View>
);

// Pasa navigation a ProductCard para que pueda navegar
const ProductCard = ({ product, themeStyles, isDark }: { product: DomainProduct, themeStyles: any, isDark: boolean }) => {
  // 1. Obtenemos el objeto 'cart' completo en lugar de 'items'
  const { cart, addItem, updateItemQuantity, removeItem } =
    useStorefront().useCartStore();
  
  // 2. Buscamos el item comparando el ID del producto correctamente
  const cartItem = cart?.items?.find(
    (item) => item.product.id === product.id
  );

  const handleIncrease = () => {
    if (cartItem) {
      updateItemQuantity(product.id, cartItem.quantity + 1);
    }
  };

  const handleDecrease = () => {
    if (cartItem && cartItem.quantity > 1) {
      updateItemQuantity(product.id, cartItem.quantity - 1);
    } else {
      removeItem(product.id);
    }
  };

  const handleAddToCart = () => {
    addItem(product.id, 1);
  };

  return (
    // 👈 Usa el componente Link para navegar a la PDP
    // La ruta debe ser la que definas para la PDP, por ejemplo: [slug].tsx
    <Link
      href={{
        pathname: "/product/[slug]", // 👈 CAMBIO: Usa la nueva ruta con prefijo
        params: {
          slug: encodeURIComponent(product?.slug || "") || "",
        },
      }}
      asChild
    >
      <TouchableOpacity style={themeStyles.card}>
        <View style={[styles.imageContainer, { backgroundColor: isDark ? '#111' : '#F5F5F5' }]}>
            <Image
            source={{ uri: product.images[0] }}
            style={styles.productImage}
            resizeMode="contain"
            />
        </View>
        
        <View style={styles.textContainer}>
          <View>
            <Text style={themeStyles.productName} numberOfLines={1}>
                {product.name}
            </Text>
            <Text style={themeStyles.productPrice}>${product.price.toFixed(2)}</Text>
          </View>

          <View style={{ marginTop: 12 }}>
            {cartItem ? (
                <QuantitySelector
                quantity={cartItem.quantity}
                onIncrease={handleIncrease}
                onDecrease={handleDecrease}
                themeStyles={themeStyles}
                isDark={isDark}
                />
            ) : (
                <TouchableOpacity
                style={themeStyles.addToCartButton}
                onPress={handleAddToCart}
                >
                <Text style={themeStyles.addToCartButtonText}>ADD TO BAG</Text>
                </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );
};

const ProductListScreen: React.FC<ProductListScreenProps> = ({
  searchInput,
  loadNextPage,
}) => {
  const insets = useSafeAreaInsets();

  // Ya no se necesitan 'params', 'pathSegments', 'utils' ni 'useMemo' aquí
  const { useProductStore, useLoginStore } = useStorefront();
  const { theme } = useTheme();

  const { products, isLoading, error, fetchProducts, isFetchingMore } =
    useProductStore();
  const { logout } = useLoginStore();

  // Dynamic Styles based on theme
  const themeStyles = useMemo(() => {
      const isDark = theme === 'dark';
      return StyleSheet.create({
          container: {
              flex: 1,
              backgroundColor: isDark ? '#000000' : '#FFFFFF',
          },
          headerContainer: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingBottom: 20,
            backgroundColor: isDark ? '#000000' : '#FFFFFF',
            // No border for minimal look
          },
          headerTitle: {
            fontSize: 32, // Larger, bolder title
            fontWeight: "900",
            letterSpacing: -1,
            color: isDark ? '#FFFFFF' : '#000000',
            textTransform: 'uppercase',
          },
          card: {
            // No background color for card, transparent
            marginBottom: 24,
            width: itemWidth,
            // No shadow/elevation
          },
          productName: {
            fontSize: 13,
            fontWeight: "500",
            color: isDark ? '#AAAAAA' : '#666666',
            marginBottom: 4,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          },
          productPrice: {
            fontSize: 15,
            fontWeight: "700",
            color: isDark ? '#FFFFFF' : '#000000',
          },
          addToCartButton: {
            backgroundColor: isDark ? '#FFFFFF' : '#000000',
            paddingVertical: 10,
            borderRadius: 0, // Sharp corners for modern look
            alignItems: "center",
            justifyContent: 'center',
          },
          addToCartButtonText: {
            color: isDark ? '#000000' : '#FFFFFF',
            fontWeight: "700",
            fontSize: 11,
            letterSpacing: 1,
          },
          quantityText: {
            fontSize: 14,
            fontWeight: "600",
            marginHorizontal: 12,
            color: isDark ? '#FFFFFF' : '#000000',
          },
          quantityButton: {
            padding: 6,
            borderRadius: 0, // Sharp
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'transparent', // Default transparent
          },
      });
  }, [theme]);

//console.log("products", JSON.stringify(products))
  // Componente de encabezado personalizado
  const CustomHeader = () => {
    const { theme, toggleTheme } = useTheme();
    return (
      <View style={[themeStyles.headerContainer, { paddingTop: insets.top + 10 }]}>
        <Text style={themeStyles.headerTitle}>SHOP</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <TouchableOpacity onPress={toggleTheme}>
                <Ionicons 
                    name={theme === 'dark' ? 'moon' : 'sunny'} 
                    size={20} 
                    color={theme === 'dark' ? '#FFF' : '#000'} 
                />
            </TouchableOpacity>
            <TouchableOpacity onPress={logout}>
                <Ionicons name="log-out-outline" size={20} color={theme === 'dark' ? '#FFF' : '#000'} />
            </TouchableOpacity>
        </View>
      </View>
    );
  };

  const handleLoadMore = () => {
    // Solo llama a loadNextPage si no estás cargando actualmente
    // y si la lista de productos no está vacía (para evitar llamadas iniciales)
    if (!isLoading && !isFetchingMore && products.length > 0) {
      loadNextPage();
    }
  };

  const FooterLoader = () => {
    // Asume que tu store tiene un estado para "isFetchingMore"
    if (!isFetchingMore) return null;
    return (
      <View style={{ paddingVertical: 20 }}>
        <ActivityIndicator size="small" color={theme === 'dark' ? '#FFF' : '#000'} />
      </View>
    );
  };
  // 💡 useEffect usa la prop searchInput directamente
  useEffect(() => {
    fetchProducts(searchInput);
  }, [fetchProducts, searchInput]);

  if (isLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme === 'dark' ? '#000' : '#FFF' }]}>
        <ActivityIndicator size="large" color={theme === 'dark' ? '#FFF' : '#000'} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centered, { backgroundColor: theme === 'dark' ? '#000' : '#FFF' }]}>
        <Text style={styles.errorText}>
          {error}
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        themeStyles.container,
        { paddingTop: 0, paddingBottom: insets.bottom },
      ]}
    >
      <CustomHeader />
      <View style={{ paddingHorizontal: 16, paddingBottom: 20 }}>
        <SearchInput />
      </View>
      <View style={themeStyles.container}>
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ProductCard product={item} themeStyles={themeStyles} isDark={theme === 'dark'} />}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={<FooterLoader />}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Static styles that don't change with theme
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  row: {
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  imageContainer: {
      width: '100%',
      aspectRatio: 0.85, // Taller images
      borderRadius: 4,
      marginBottom: 12,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
  },
  productImage: {
    width: "90%",
    height: "90%",
  },
  textContainer: {
    paddingHorizontal: 0, // Align with image edges
  },
  quantitySelectorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  errorText: {
    color: "red",
    textAlign: "center",
  },
  list: {
    paddingVertical: 0,
    paddingBottom: 40,
  },
});

export default ProductListScreen;
