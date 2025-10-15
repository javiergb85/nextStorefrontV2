import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Redirect, Stack, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { StorefrontProvider, useStorefront } from './src/context/storefront.context';
import config from "./src/providers.json";
 
// Lógica de autenticación centralizada
const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const segments = useSegments();
  const { accessToken, isLoading, initializeAuth } = useStorefront().useLoginStore();
  const inLoginRoute = segments[0] === 'login';

  useEffect(() => {
    initializeAuth();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // Redirigimos si no hay token Y la ruta actual no es la de login
  if (!accessToken && !inLoginRoute) {
    return <Redirect href="/login" />;
  }
  
  // Si hay token Y estamos en la ruta de login, redirigimos a la página principal
  if (accessToken && inLoginRoute) {
    return <Redirect href="/" />;
  }

  return <>{children}</>;
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  
  // Cargamos las fuentes
  const [fontsLoaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  
  if (!fontsLoaded) {
    return null;
  }
 
  return (
    <StorefrontProvider config={config}>
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthGuard>
        <Stack>
          <Stack.Screen 
            name="index" 
            options={{ headerShown: false }} 
          />
          
          <Stack.Screen 
            name="product/[slug]" // 👈 CAMBIO: Apunta a la nueva ruta
            options={{ headerShown: false }} // Puedes añadir un título aquí si quieres, ej: options={{ title: 'Producto' }}
          />
          <Stack.Screen 
            name="[...vtexPath]" // El nombre coincide con el directorio 'app/search/'
            options={{ headerShown: false }} // Ajusta las opciones según necesites
          />
          <Stack.Screen name="login" options={{ headerShown: false }} /> 
          <Stack.Screen name="cart" options={{ title: 'Mi Carrito' }} /> 
          <Stack.Screen name="+not-found" />
        </Stack>
      </AuthGuard>
      <StatusBar style="auto" />
    </ThemeProvider>
    </StorefrontProvider>
  );
}