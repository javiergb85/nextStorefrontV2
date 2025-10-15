// src/presentation/screens/HomeScreen.tsx (o index.tsx)

import { Link } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SearchInput from "../components/SearchInput";

const HomeScreen = () => {
  const insets = useSafeAreaInsets();

  // 1. Define los segmentos de la ruta de categorías/marcas
  const pathSegments = ["hombre", "boxers", "azul", "liso"];

  // 2. Define los parámetros de query (los "selectedFacets" y otros filtros)
  // Estos irían después del '?' en la URL
  const queryParams = {
    // Ejemplo de un filtro de rango de precio
    priceRange: "8936 TO 13333",
    // Ejemplo de un término de búsqueda libre (fullText)
    term: "",
    // Otros filtros de facet si los necesitas (ej. color, talla, etc.)
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <SearchInput />
      <Text style={styles.title}>Simulación de Búsqueda VTEX</Text>
      <Text style={styles.subtitle}>
        Presiona el botón para navegar a la ruta de prueba.
      </Text>

      {/*
        El componente Link de Expo Router construye la navegación:
        href: define la ruta base (path) y los queryParams (filtros).
      */}
      <Link
        href={{
          // Apuntamos al archivo de ruta que debe manejar esto
          pathname: "/[...vtexPath]",
          // Pasamos los segmentos y los query params
          params: { vtexPath: pathSegments, ...queryParams },
        }}
        asChild // Usamos asChild para aplicar el TouchableOpacity
      >
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Ir a Productos (Ruta de Prueba)</Text>
          <Text style={styles.buttonSubText}>
            /{pathSegments.join("/")}?priceRange={queryParams.priceRange}
          </Text>
        </TouchableOpacity>
      </Link>

      <Link href="/cart" asChild>
        <TouchableOpacity style={ styles.cartButton}>
          
          <Text style={styles.buttonSubTextCart}>
            Ir a carrito
          </Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 50,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 40,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#007BFF",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
    elevation: 3,
  },
  cartButton: {
    marginTop: 20,
    borderRadius: 8,
     width: 100,
     height: 60,
     alignItems: "center",
     justifyContent: "center",
    // Un azul diferente para distinguirlo
    backgroundColor: "#17a2b8",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  buttonSubText: {
    color: "#E0E0E0",
    fontSize: 10,
    marginTop: 5,
  },
  buttonSubTextCart: {
    color: "#000",
    fontSize: 20,
    marginTop: 5,
  },
});

export default HomeScreen;
