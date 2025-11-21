import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import { useTheme } from '../../context/theme.context';
import { SearchOverlay } from './SearchOverlay';

const SearchInput = () => {
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  const router = useRouter();
  const { theme } = useTheme();

  const themeStyles = useMemo(() => {
      const isDark = theme === 'dark';
      return StyleSheet.create({
          container: {
            paddingHorizontal: 0, // Remove padding to align with other content if needed, or keep it
            paddingVertical: 10,
            width: '100%',
          },
          inputContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: isDark ? '#1A1A1A' : '#F5F5F5', // Subtle contrast
            borderRadius: 12, // Modern rounded corners
            height: 50, // Slightly taller for better touch target
            paddingHorizontal: 16,
            // No border for cleaner look, or very subtle
            borderWidth: 1,
            borderColor: isDark ? '#333' : 'transparent', 
          },
          placeholderText: {
              flex: 1,
              color: isDark ? '#888' : '#999',
              fontSize: 16,
              fontWeight: '500',
              marginLeft: 12,
          },
          iconColor: {
              color: isDark ? '#FFF' : '#000',
          },
      });
  }, [theme]);

  const handleSearch = (term: string) => {
    setIsOverlayVisible(false);
    
    // Hardcoded params as requested
    const pathSegments = ["hombre", "boxers", "azul", "liso"];
    const queryParams = {
        priceRange: "8936 TO 13333",
        term: "", // Keeping term empty as requested in the snippet
    };

    router.push({
        pathname: "/[...vtexPath]",
        params: { vtexPath: pathSegments, ...queryParams },
    });
  };

  return (
    <>
      <View style={themeStyles.container}>
        <TouchableWithoutFeedback onPress={() => setIsOverlayVisible(true)}>
            <View style={themeStyles.inputContainer}>
                <Ionicons name="search-outline" size={20} color={themeStyles.iconColor.color} />
                <Text style={themeStyles.placeholderText}>Search for products...</Text>
            </View>
        </TouchableWithoutFeedback>
      </View>
      
      <SearchOverlay 
        isVisible={isOverlayVisible} 
        onClose={() => setIsOverlayVisible(false)}
        onSearch={handleSearch}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight:100,
    width: '100%',
  },
});

export default SearchInput;