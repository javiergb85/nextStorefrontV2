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
import { useStorefront } from '../../context/storefront.context';
import { useTheme } from '../../context/theme.context';
import { CartBadge } from '../components/CartBadge';
import CategoryRibbon from '../components/CategoryRibbon';
import PromotionalSlider from '../components/PromotionalSlider';
import SearchInput from '../components/SearchInput';

const { width } = Dimensions.get('window');

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const HomeScreen = () => {
    const router = useRouter();
    const { theme, toggleTheme } = useTheme();
    const insets = useSafeAreaInsets();
    const { useLoginStore } = useStorefront();
    const { logout } = useLoginStore();
    const isDark = theme === 'dark';

    const textColor = isDark ? '#FFFFFF' : '#000000';
    const bgColor = isDark ? '#000000' : '#FFFFFF';
    const secondaryText = isDark ? '#AAAAAA' : '#666666';

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
                            <TouchableOpacity onPress={() => router.push('/(tabs)/cart')}>
                                <View>
                                    <Ionicons 
                                        name="cart-outline" 
                                        size={24} 
                                        color={textColor} 
                                    />
                                    <CartBadge style={{ top: -5, right: -8 }} />
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={logout}>
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

                {/* New Promotional Slider */}
                <PromotionalSlider />

                {/* New Category Ribbon */}
                <CategoryRibbon />

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
