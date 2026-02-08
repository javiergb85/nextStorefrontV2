import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { HomeSection } from '../../domain/entities/home-layout';
import CategoryRibbon from './CategoryRibbon';
import PromotionalSlider from './PromotionalSlider';

const { width } = Dimensions.get('window');
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface HomeSectionRendererProps {
    section: HomeSection;
    textColor: string;
    secondaryText: string;
}

const HomeSectionRenderer = ({ section, textColor, secondaryText }: HomeSectionRendererProps) => {
    const router = useRouter();

    switch (section.type) {
        case 'hero-slider':
            return <PromotionalSlider items={section.items} />;
        
        case 'categories':
            return <CategoryRibbon items={section.items} textColor={textColor} secondaryText={secondaryText} />;
        
        case 'featured-products':
            return (
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: textColor }]}>{section.title}</Text>
                    <View style={styles.featuredGrid}>
                        {section.items.map((product, index) => (
                            <AnimatedTouchable
                                key={product.id}
                                entering={FadeInDown.delay(400 + index * 100).duration(600)}
                                style={styles.productCard}
                                onPress={() => product.link 
                                    ? router.push(`/(tabs)${product.link}`) 
                                    : router.push('/product/detail')
                                }
                            >
                                <Image source={{ uri: product.image }} style={styles.productImage} />
                                <View style={styles.productInfo}>
                                    <Text style={[styles.productName, { color: textColor }]}>{product.name}</Text>
                                    {product.price !== undefined && (
                                        <Text style={[styles.productPrice, { color: secondaryText }]}>{product.price}</Text>
                                    )}
                                </View>
                            </AnimatedTouchable>
                        ))}
                    </View>
                </View>
            );
        
        default:
            return null;
    }
};

const styles = StyleSheet.create({
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

export default HomeSectionRenderer;
