// src/presentation/screens/ProductListScreen.tsx

import { Link } from "expo-router"; // 👈 Importa Link de expo-router
import React, { useEffect } from "react";
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
//import { useProductStore } from '../../store/product.store';
import { useStorefront } from "../../context/storefront.context";

const { width } = Dimensions.get("window");
const itemWidth = (width - 48) / 2;

interface ProductListScreenProps {
  searchInput: any;
  loadNextPage: () => void;
}

const QuantitySelector = ({
  quantity,
  onDecrease,
  onIncrease,
}: {
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
}) => (
  <View style={styles.quantitySelectorContainer}>
    <TouchableOpacity onPress={onDecrease} style={styles.quantityButton}>
      <Text style={styles.quantityButtonText}>-</Text>
    </TouchableOpacity>
    <Text style={styles.quantityText}>{quantity}</Text>
    <TouchableOpacity onPress={onIncrease} style={styles.quantityButton}>
      <Text style={styles.quantityButtonText}>+</Text>
    </TouchableOpacity>
  </View>
);

// Pasa navigation a ProductCard para que pueda navegar
const ProductCard = ({ product }: { product: DomainProduct }) => {
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
          slug: encodeURIComponent(product?.slug || "") || product?.slug,
        },
      }}
      asChild
    >
      <TouchableOpacity style={styles.card}>
        <Image
          source={{ uri: product.images[0] }}
          style={styles.productImage}
          resizeMode="contain"
        />
        <View style={styles.textContainer}>
          <Text style={styles.productName} numberOfLines={2}>
            {product.name}
          </Text>
          <Text style={styles.productPrice}>${product.price.toFixed(2)}</Text>
          {cartItem ? (
            <QuantitySelector
              quantity={cartItem.quantity}
              onIncrease={handleIncrease}
              onDecrease={handleDecrease}
            />
          ) : (
            <TouchableOpacity
              style={styles.addToCartButton}
              onPress={handleAddToCart}
            >
              <Text style={styles.addToCartButtonText}>Añadir al carrito</Text>
            </TouchableOpacity>
          )}
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

  const { products, isLoading, error, fetchProducts, isFetchingMore } =
    useProductStore();
  const { logout } = useLoginStore();
console.log("products", JSON.stringify(products))
  // Componente de encabezado personalizado
  const CustomHeader = () => (
    <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
      <Text style={styles.headerTitle}>Catálogo</Text>
      <TouchableOpacity onPress={logout} style={styles.logoutButton}>
        <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );

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
        <ActivityIndicator size="small" color="#007BFF" />
      </View>
    );
  };
  // 💡 useEffect usa la prop searchInput directamente
  useEffect(() => {
    fetchProducts(searchInput);
  }, [fetchProducts, searchInput]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Cargando productos...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>
          ❌ ¡Ocurrió un error!
          {"\n"}
          {error}
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.safeAreaContainer,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <CustomHeader />
      <View style={styles.container}>
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ProductCard product={item} />}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={<FooterLoader />}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    paddingHorizontal: 16,
  },
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    // paddingTop: insets.top se maneja directamente en el componente
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  logoutButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
    backgroundColor: "#dc3545", // Rojo
  },
  logoutButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  row: {
    justifyContent: "space-between",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    margin: 8,
    overflow: "hidden",
    width: itemWidth,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productImage: {
    width: "100%",
    height: 150,
  },
  textContainer: {
    padding: 10,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    minHeight: 40,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4CAF50",
    marginTop: 5,
  },
  addToCartButton: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: "center",
  },
  addToCartButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  quantitySelectorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  quantityButton: {
    backgroundColor: "#ddd",
    padding: 8,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  quantityButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#555",
  },
  quantityText: {
    fontSize: 18,
    fontWeight: "bold",
    marginHorizontal: 10,
  },
  errorText: {
    color: "red",
    textAlign: "center",
  },
  list: {
    paddingVertical: 16,
  },
});

export default ProductListScreen;
