// src/app/product/[slug].tsx
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import ProductDetailScreen from '../src/presentation/screens/productDetailScreen';



export default function SlugPage() {
  const { slug } = useLocalSearchParams();
console.log("SSDASD", slug)
  // useLocalSearchParams returns a string or an array of strings. 
  // We'll treat the slug as a string for this use case.
  const productId = Array.isArray(slug) ? slug[0] : slug;
  
  // If the slug is not available yet, you could return a loading or error state.
  if (!productId) {
    return null;
  }

  return <ProductDetailScreen productId={productId} />;
}