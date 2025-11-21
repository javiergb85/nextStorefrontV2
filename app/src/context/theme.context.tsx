import React, { createContext, ReactNode, useCallback, useContext, useRef, useState } from 'react';
import { useColorScheme, View } from 'react-native';
import { captureRef } from 'react-native-view-shot';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  nextTheme: Theme | null; // The theme we are transitioning TO (kept for compatibility, but we use image now)
  transitionImage: string | null;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  completeTransition: () => void; // Called when animation is done
  setViewRef: (ref: View | null) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const systemScheme = useColorScheme();
  const [theme, setThemeState] = useState<Theme>(systemScheme === 'dark' ? 'dark' : 'light');
  const [nextTheme, setNextTheme] = useState<Theme | null>(null);
  const [transitionImage, setTransitionImage] = useState<string | null>(null);
  const viewRef = useRef<View | null>(null);

  const setViewRef = useCallback((ref: View | null) => {
      viewRef.current = ref;
  }, []);

  const toggleTheme = useCallback(async () => {
    const targetTheme = theme === 'light' ? 'dark' : 'light';
    
    if (viewRef.current) {
        try {
            console.log("📸 Capturing snapshot...");
            const uri = await captureRef(viewRef.current, {
                format: 'png',
                quality: 0.8,
            });
            console.log("✅ Snapshot captured:", uri);
            // Skia useImage needs file:// scheme on iOS
            const formattedUri = uri.startsWith('file://') ? uri : `file://${uri}`;
            setTransitionImage(formattedUri);
            // Change the theme IMMEDIATELY after capture
            // The overlay will show the 'uri' (Old Theme) on top
            // The app behind will update to 'targetTheme'
            setThemeState(targetTheme);
            setNextTheme(targetTheme); // Trigger animation in overlay
        } catch (error) {
            console.error("❌ Snapshot failed", error);
            setThemeState(targetTheme); // Fallback
        }
    } else {
        console.warn("⚠️ viewRef is null, skipping snapshot");
        setThemeState(targetTheme);
    }
  }, [theme]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  const completeTransition = useCallback(() => {
      setNextTheme(null);
      setTransitionImage(null);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, nextTheme, toggleTheme, setTheme, completeTransition, setViewRef, transitionImage }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
