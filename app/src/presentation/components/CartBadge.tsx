import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import { useStorefront } from '../../context/storefront.context';

export const CartBadge = ({ style }: { style?: any }) => {
    const { useCartStore } = useStorefront();
    const { cart } = useCartStore();
    
    // Distinct product count
    const badgeCount = cart?.items?.length || 0;

    // Badge Animation
    const badgeScale = useSharedValue(0);

    useEffect(() => {
        if (badgeCount > 0) {
            badgeScale.value = withSequence(
                withTiming(1.2, { duration: 100 }),
                withSpring(1, { damping: 10, stiffness: 100 })
            );
        } else {
            badgeScale.value = withTiming(0, { duration: 200 });
        }
    }, [badgeCount]);

    const rBadgeStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: badgeScale.value }],
        };
    });

    if (badgeCount === 0) return null;

    return (
        <Animated.View style={[styles.badge, style, rBadgeStyle]}>
            <Animated.Text style={styles.badgeText}>
                {badgeCount > 99 ? '99+' : badgeCount}
            </Animated.Text>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    badge: {
        position: 'absolute',
        top: -8,
        right: -10,
        backgroundColor: '#FF3B30', // iOS Red
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
        borderWidth: 1.5,
        borderColor: '#FFFFFF',
        zIndex: 10,
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: 'bold',
    }
});
