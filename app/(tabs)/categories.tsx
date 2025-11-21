import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStorefront } from '../src/context/storefront.context';
import { useTheme } from '../src/context/theme.context';

const CategoriesScreen = () => {
    const router = useRouter();
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    const { useCategoryStore } = useStorefront();
    const { categories, isLoading, error, fetchCategories } = useCategoryStore();
    const isDark = theme === 'dark';

    const bgColor = isDark ? '#000000' : '#FFFFFF';
    const textColor = isDark ? '#FFFFFF' : '#000000';
    const secondaryText = isDark ? '#AAAAAA' : '#666666';
    const cardBg = isDark ? '#111111' : '#F9F9F9';

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleCategoryPress = (category: any) => {
        // Navigate to PLP with category path
        // Assuming category.url is like "https://store.com/clothing/shirts"
        // We need to extract the path segments.
        // Or better, use the category ID or name if the URL structure is complex.
        // For VTEX, the URL usually contains the path.
        
        // Simple extraction logic (adjust based on actual VTEX URL structure)
        const path = category.url.replace(/^https?:\/\/[^\/]+/, ''); 
        // path might be "/clothing/shirts"
        
        // Remove leading slash
        const cleanPath = path.startsWith('/') ? path.substring(1) : path;
        
        router.push(`/(tabs)/${cleanPath}`);
    };

    const renderCategoryItem = ({ item, index }: { item: any, index: number }) => (
        <Animated.View entering={FadeInDown.delay(index * 50).duration(500)}>
            <TouchableOpacity 
                style={[styles.categoryCard, { backgroundColor: cardBg }]}
                onPress={() => handleCategoryPress(item)}
            >
                <View style={styles.categoryInfo}>
                    <Text style={[styles.categoryName, { color: textColor }]}>{item.name}</Text>
                    {item.children && item.children.length > 0 && (
                        <Text style={[styles.subcategoriesText, { color: secondaryText }]}>
                            {item.children.length} Subcategories
                        </Text>
                    )}
                </View>
                <Ionicons name="chevron-forward" size={20} color={secondaryText} />
            </TouchableOpacity>
        </Animated.View>
    );

    if (isLoading && categories.length === 0) {
        return (
            <View style={[styles.centered, { backgroundColor: bgColor }]}>
                <ActivityIndicator size="large" color={textColor} />
            </View>
        );
    }

    if (error) {
        return (
            <View style={[styles.centered, { backgroundColor: bgColor }]}>
                <Text style={[styles.errorText, { color: textColor }]}>Failed to load categories</Text>
                <TouchableOpacity onPress={() => fetchCategories()} style={styles.retryButton}>
                    <Text style={[styles.retryText, { color: textColor }]}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: bgColor, paddingTop: insets.top }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: textColor }]}>SHOP</Text>
            </View>
            
            <FlatList
                data={categories}
                keyExtractor={(item) => String(item.id)}
                renderItem={renderCategoryItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
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
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    listContent: {
        padding: 20,
    },
    categoryCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        marginBottom: 10,
        borderRadius: 0, // Sharp corners
    },
    categoryInfo: {
        flex: 1,
    },
    categoryName: {
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 1,
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    subcategoriesText: {
        fontSize: 12,
    },
    errorText: {
        marginBottom: 20,
    },
    retryButton: {
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    retryText: {
        fontWeight: 'bold',
    },
});

export default CategoriesScreen;
