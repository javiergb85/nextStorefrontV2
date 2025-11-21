import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    withTiming,
    ZoomIn,
    ZoomOut
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/theme.context';

const TabItem = ({ 
    label, 
    icon, 
    isFocused, 
    onPress, 
    theme 
}: { 
    label: string, 
    icon: any, 
    isFocused: boolean, 
    onPress: () => void,
    theme: 'light' | 'dark'
}) => {
    const isDark = theme === 'dark';
    
    // Colors
    const activeBg = isDark ? '#FFFFFF' : '#000000';
    const inactiveBg = 'transparent';
    const activeText = isDark ? '#000000' : '#FFFFFF';
    const inactiveText = isDark ? '#888888' : '#666666';

    const rContainerStyle = useAnimatedStyle(() => {
        return {
            backgroundColor: withTiming(isFocused ? activeBg : inactiveBg, { duration: 300 }),
            paddingHorizontal: withTiming(isFocused ? 20 : 10, { duration: 300 }),
        };
    });

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
            <Animated.View style={[styles.tabItem, rContainerStyle]}>
                <Ionicons 
                    name={icon} 
                    size={20} 
                    color={isFocused ? activeText : inactiveText} 
                />
                {isFocused && (
                    <Animated.Text 
                        entering={ZoomIn.duration(300)} 
                        exiting={ZoomOut.duration(300)}
                        style={[styles.label, { color: activeText }]}
                        numberOfLines={1}
                    >
                        {label}
                    </Animated.Text>
                )}
            </Animated.View>
        </TouchableOpacity>
    );
};

export const CustomTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    const isDark = theme === 'dark';

    return (
        <View style={[
            styles.container, 
            { 
                backgroundColor: isDark ? '#000000' : '#FFFFFF',
                paddingBottom: insets.bottom + 10,
                borderTopColor: isDark ? '#333' : '#eee',
            }
        ]}>
            {state.routes.map((route, index) => {
                // Filter out routes that shouldn't be in the tab bar
                // Although _layout.tsx handles href: null, this is an extra safety layer
                // and ensures order if we wanted to enforce it.
                const allowedRoutes = ['index', 'categories', 'cart', 'profile'];
                if (!allowedRoutes.includes(route.name)) return null;

                const { options } = descriptors[route.key];
                const label =
                    options.tabBarLabel !== undefined
                        ? options.tabBarLabel
                        : options.title !== undefined
                        ? options.title
                        : route.name;

                const isFocused = state.index === index;

                const onPress = () => {
                    const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                        canPreventDefault: true,
                    });

                    if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(route.name, route.params);
                    }
                };

                // Map route names to icons
                let iconName: any = 'home-outline';
                if (route.name === 'index') iconName = isFocused ? 'home' : 'home-outline';
                if (route.name === 'categories') iconName = isFocused ? 'grid' : 'grid-outline';
                if (route.name === 'cart') iconName = isFocused ? 'cart' : 'cart-outline';
                if (route.name === 'profile') iconName = isFocused ? 'person' : 'person-outline';

                // Clean up label
                let displayLabel = label as string;
                if (route.name === 'index') displayLabel = 'Home';
                if (route.name === 'categories') displayLabel = 'Shop';
                if (route.name === 'cart') displayLabel = 'Cart';
                if (route.name === 'profile') displayLabel = 'Profile';

                return (
                    <TabItem
                        key={route.key}
                        label={displayLabel}
                        icon={iconName}
                        isFocused={isFocused}
                        onPress={onPress}
                        theme={theme}
                    />
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingTop: 15,
        borderTopWidth: 1,
        elevation: 0, // No shadow
        shadowOpacity: 0,
    },
    tabItem: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 44,
        borderRadius: 22, // Pill shape
        justifyContent: 'center',
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 4,
    }
});
