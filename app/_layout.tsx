import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Redirect, Stack, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { StorefrontProvider, useStorefront } from './src/context/storefront.context';
import { ThemeProvider as CustomThemeProvider, useTheme } from './src/context/theme.context';
import { ThemeTransitionOverlay } from './src/presentation/components/ThemeTransitionOverlay';
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
      <CustomThemeProvider>
        <LayoutContent />
      </CustomThemeProvider>
    </StorefrontProvider>
  );
}

const LayoutContent = () => {
  const { theme, setViewRef } = useTheme();
  
  return (
    <ThemeProvider value={theme === 'dark' ? DarkTheme : DefaultTheme}>
      <View style={{ flex: 1 }}>
        {/* The View we capture (The App Content) */}
        <View 
            style={{ flex: 1 }} 
            ref={(ref) => {
                // console.log("View Ref set:", ref ? "Valid" : "Null");
                setViewRef(ref);
            }} 
            collapsable={false}
        >
          <AuthGuard>
            <Stack>
              <Stack.Screen 
                name="(tabs)" 
                options={{ headerShown: false }} 
              />
              
              <Stack.Screen 
                name="product/[slug]" 
                options={{ headerShown: false }} 
              />
              <Stack.Screen 
                name="[...vtexPath]" 
                options={{ headerShown: false }} 
              />
              <Stack.Screen 
                name="login" 
                options={{ headerShown: false }} 
              />
              <Stack.Screen 
                name="checkout" 
                options={{ headerShown: false }} 
              />
              <Stack.Screen name="+not-found" />
            </Stack>
          </AuthGuard>
        </View>
        
        {/* The Overlay (Sits on top, not captured) */}
        <ThemeTransitionOverlay />
      </View>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
};