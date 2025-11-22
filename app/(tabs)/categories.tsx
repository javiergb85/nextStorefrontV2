import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    LayoutAnimation,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    UIManager,
    View
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStorefront } from '../src/context/storefront.context';
import { useTheme } from '../src/context/theme.context';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const CategoryItem = ({ item, index, onPress, isDark, textColor, secondaryText }: any) => {
    const [expanded, setExpanded] = useState(false);
    const hasChildren = item.children && item.children.length > 0;

    const toggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpanded(!expanded);
    };

    return (
        <Animated.View entering={FadeInDown.delay(index * 50).duration(500)} style={styles.itemContainer}>
            <View style={styles.row}>
                <TouchableOpacity 
                    style={styles.mainTouchable} 
                    onPress={() => onPress(item)}
                >
                    <Text style={[styles.categoryName, { color: textColor }]}>{item.name}</Text>
                </TouchableOpacity>
                
                {hasChildren && (
                    <TouchableOpacity onPress={toggleExpand} style={styles.expandButton}>
                        <Ionicons 
                            name={expanded ? "chevron-up" : "chevron-down"} 
                            size={20} 
                            color={secondaryText} 
                        />
                    </TouchableOpacity>
                )}
            </View>

            {expanded && hasChildren && (
                <View style={styles.subList}>
                    {item.children.map((child: any) => (
                        <TouchableOpacity 
                            key={child.id} 
                            style={styles.subItem}
                            onPress={() => onPress(child)}
                        >
                            <Text style={[styles.subItemText, { color: secondaryText }]}>{child.name}</Text>
                            <Ionicons name="arrow-forward" size={12} color={secondaryText} />
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </Animated.View>
    );
};

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

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleCategoryPress = (category: any) => {
        const path = category.url.replace(/^https?:\/\/[^\/]+/, ''); 
        const cleanPath = path.startsWith('/') ? path.substring(1) : path;
        router.push(`/(tabs)/${cleanPath}`);
    };

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
                renderItem={({ item, index }) => (
                    <CategoryItem 
                        item={item} 
                        index={index} 
                        onPress={handleCategoryPress}
                        isDark={isDark}
                        textColor={textColor}
                        secondaryText={secondaryText}
                    />
                )}
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
    itemContainer: {
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.03)',
        paddingBottom: 15,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    mainTouchable: {
        flex: 1,
        paddingVertical: 5,
    },
    expandButton: {
        padding: 10,
    },
    categoryName: {
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    subList: {
        marginTop: 10,
        paddingLeft: 10,
    },
    subItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.02)',
    },
    subItemText: {
        fontSize: 14,
        fontWeight: '500',
        letterSpacing: 0.5,
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
