import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/theme.context';
import SearchInput from '../components/SearchInput';

const { width } = Dimensions.get('window');

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const HomeScreen = () => {
    const router = useRouter();
    const { theme, toggleTheme } = useTheme();
    const insets = useSafeAreaInsets();
    const isDark = theme === 'dark';

    const textColor = isDark ? '#FFFFFF' : '#000000';
    const bgColor = isDark ? '#000000' : '#FFFFFF';
    const secondaryText = isDark ? '#AAAAAA' : '#666666';

    const categories = [
        { id: '1', name: 'NEW ARRIVALS', image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&q=80' },
        { id: '2', name: 'ESSENTIALS', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80' },
        { id: '3', name: 'ACCESSORIES', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80' },
    ];

    const featuredProducts = [
        { id: '1', name: 'OVERSIZED BLAZER', price: 129, image: 'https://images.unsplash.com/photo-1551028919-ac7675ef0c62?w=800&q=80' },
        { id: '2', name: 'LEATHER BOOTS', price: 189, image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80' },
        { id: '3', name: 'WOOL COAT', price: 299, image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&q=80' },
        { id: '4', name: 'SILK SCARF', price: 49, image: 'https://images.unsplash.com/photo-1584030373081-f37b7bb4fa8e?w=800&q=80' },
    ];

    return (
        <View style={[styles.container, { backgroundColor: bgColor }]}>
            <ScrollView 
                contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top }]} 
                showsVerticalScrollIndicator={false}
            >
                {/* Header / Search */}
                <View style={styles.header}>
                    <View style={styles.headerTop}>
                        <Text style={[styles.logo, { color: textColor }]}>STORE</Text>
                        <View style={{ flexDirection: 'row', gap: 15 }}>
                            <TouchableOpacity onPress={toggleTheme}>
                                <Ionicons 
                                    name={isDark ? 'moon' : 'sunny'} 
                                    size={24} 
                                    color={textColor} 
                                />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => {
                                // Simple logout logic for now: clear token and go to login
                                // In a real app, use the logout use case
                                router.replace('/login');
                            }}>
                                <Ionicons 
                                    name="log-out-outline" 
                                    size={24} 
                                    color={textColor} 
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <SearchInput />
                </View>

                {/* Hero Section */}
                <Animated.View entering={FadeInDown.duration(800)} style={styles.heroContainer}>
                    <Image 
                        source={{ uri: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1000&q=80' }} 
                        style={styles.heroImage} 
                    />
                    <View style={styles.heroOverlay}>
                        <Text style={styles.heroTitle}>SUMMER 2025</Text>
                        <Text style={styles.heroSubtitle}>MINIMALIST COLLECTION</Text>
                        <TouchableOpacity 
                            style={[styles.heroButton, { backgroundColor: isDark ? '#FFF' : '#000' }]}
                            onPress={() => router.push('/(tabs)/categories')}
                        >
                            <Text style={[styles.heroButtonText, { color: isDark ? '#000' : '#FFF' }]}>SHOP NOW</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>

                {/* Categories */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: textColor }]}>SHOP BY CATEGORY</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesList}>
                        {categories.map((cat, index) => (
                            <AnimatedTouchable 
                                key={cat.id}
                                entering={FadeInDown.delay(200 + index * 100).duration(600)}
                                style={styles.categoryCard}
                                onPress={() => router.push('/(tabs)/categories')}
                            >
                                <Image source={{ uri: cat.image }} style={styles.categoryImage} />
                                <View style={styles.categoryOverlay} />
                                <Text style={styles.categoryName}>{cat.name}</Text>
                            </AnimatedTouchable>
                        ))}
                    </ScrollView>
                </View>

                {/* Featured */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: textColor }]}>TRENDING NOW</Text>
                    <View style={styles.featuredGrid}>
                        {featuredProducts.map((product, index) => (
                            <AnimatedTouchable
                                key={product.id}
                                entering={FadeInDown.delay(400 + index * 100).duration(600)}
                                style={styles.productCard}
                                onPress={() => router.push('/product/detail')}
                            >
                                <Image source={{ uri: product.image }} style={styles.productImage} />
                                <View style={styles.productInfo}>
                                    <Text style={[styles.productName, { color: textColor }]}>{product.name}</Text>
                                    <Text style={[styles.productPrice, { color: secondaryText }]}>{product.price}</Text>
                                </View>
                            </AnimatedTouchable>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    header: {
        paddingHorizontal: 20,
        marginBottom: 20,
        gap: 15,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    logo: {
        fontSize: 24,
        fontWeight: '900',
        letterSpacing: 1,
        marginBottom: 5,
    },
    heroContainer: {
        width: width,
        height: 500,
        marginBottom: 40,
        position: 'relative',
    },
    heroImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    heroOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    heroTitle: {
        color: '#FFF',
        fontSize: 42,
        fontWeight: '900',
        letterSpacing: 2,
        textAlign: 'center',
        marginBottom: 10,
    },
    heroSubtitle: {
        color: '#FFF',
        fontSize: 14,
        letterSpacing: 3,
        marginBottom: 30,
        fontWeight: '600',
    },
    heroButton: {
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 0, // Square buttons for minimalist look
    },
    heroButtonText: {
        fontSize: 14,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    section: {
        marginBottom: 40,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: 1,
        paddingHorizontal: 20,
        marginBottom: 20,
        textTransform: 'uppercase',
    },
    categoriesList: {
        paddingHorizontal: 20,
        gap: 15,
    },
    categoryCard: {
        width: 200,
        height: 250,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    categoryImage: {
        ...StyleSheet.absoluteFillObject,
    },
    categoryOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    categoryName: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: '800',
        letterSpacing: 2,
        zIndex: 1,
    },
    featuredGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 20,
        gap: 15,
    },
    productCard: {
        width: (width - 55) / 2,
        marginBottom: 10,
    },
    productImage: {
        width: '100%',
        height: 250,
        backgroundColor: '#f8f8f8',
        marginBottom: 10,
    },
    productInfo: {
        alignItems: 'flex-start',
    },
    productName: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.5,
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    productPrice: {
        fontSize: 12,
        fontWeight: '400',
    },
});

export default HomeScreen;
