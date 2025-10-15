import React, { useEffect } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import HTML from 'react-native-render-html';
//import { useProductDetailStore } from '../../store/productDetail.store';
import { useStorefront } from '../../context/storefront.context';

interface ProductDetailScreenProps {
  productId: string;
}

const ProductDetailScreen: React.FC<ProductDetailScreenProps> = ({ productId }) => {
const { useProductDetailStore, useCartStore } = useStorefront();
  const { product, isLoading, error, fetchProductDetail } = useProductDetailStore();
  const { addItem } = useCartStore();
  const { width } = useWindowDimensions(); // 👈 Call the hook here
console.log("Product DETAIL")
  useEffect(() => {
    if (productId) {
      fetchProductDetail(productId);
    }
  }, [productId, fetchProductDetail]);

  const handleAddToCart = () => {
    if (product) {
      addItem(product.id, 1);
      alert('Product added to cart!');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading product details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.centered}>
        <Text>Product not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: product.images[0] }}
          style={styles.productImage}
          resizeMode="contain"
        />
      </View>
      <View style={styles.detailsContainer}>
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.productPrice}>${product.price.toFixed(2)}</Text>
        {product?.listPrice > product.price && (
          <Text style={styles.listPrice}>List Price: ${product?.listPrice.toFixed(2)}</Text>
        )}
        {/* 👈 Pass contentWidth to the HTML component */}
        <HTML source={{ html: product.description }} contentWidth={width} /> 
        <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
          <Text style={styles.addToCartButtonText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  imageContainer: {
    flex: 1,
  },
  productImage: {
    width: '100%',
    height: 300,
    borderRadius: 8,
  },
  detailsContainer: {
    flex: 1,
    paddingLeft: 20,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  productPrice: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 10,
  },
  listPrice: {
    fontSize: 16,
    color: '#888',
    textDecorationLine: 'line-through',
  },
  addToCartButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 4,
    marginTop: 20,
    alignItems: 'center',
  },
  addToCartButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
});

export default ProductDetailScreen;