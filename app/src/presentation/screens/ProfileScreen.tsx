import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStorefront } from '../../context/storefront.context';
import { useTheme } from '../../context/theme.context';

const ProfileScreen = () => {
    const { userProfile, logout } = useStorefront().useLoginStore();
    const { theme, toggleTheme } = useTheme();
    const insets = useSafeAreaInsets();
    const isDark = theme === 'dark';
    console.log("USER PROFILE", userProfile);
    const bgColor = isDark ? '#000000' : '#FFFFFF';
    const textColor = isDark ? '#FFFFFF' : '#000000';
    const secondaryText = isDark ? '#AAAAAA' : '#666666';
    const cardBg = isDark ? '#111111' : '#F9F9F9';
    const borderColor = isDark ? '#333333' : '#E5E5E5';

    const getInitials = (firstName?: string, lastName?: string) => {
        if (!firstName && !lastName) return 'U';
        return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
    };

    return (
        <View style={[styles.container, { backgroundColor: bgColor, paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={[styles.title, { color: textColor }]}>PROFILE</Text>
                <TouchableOpacity onPress={toggleTheme}>
                    <Ionicons 
                        name={isDark ? 'moon' : 'sunny'} 
                        size={24} 
                        color={textColor} 
                    />
                </TouchableOpacity>
            </View>

            {/* User Info */}
            <View style={styles.userInfoContainer}>
                <View style={[styles.avatar, { backgroundColor: isDark ? '#333' : '#EEE' }]}>
                    <Text style={[styles.avatarText, { color: textColor }]}>
                        {getInitials(userProfile?.firstName, userProfile?.lastName)}
                    </Text>
                </View>
                <View style={styles.userDetails}>
                    <Text style={[styles.userName, { color: textColor }]}>
                        {userProfile?.firstName} {userProfile?.lastName}
                    </Text>
                    <Text style={[styles.userEmail, { color: secondaryText }]}>
                        {userProfile?.email}
                    </Text>
                </View>
            </View>

            {/* Menu Items */}
            <View style={styles.menuContainer}>
                <TouchableOpacity style={[styles.menuItem, { borderBottomColor: borderColor }]}>
                    <Text style={[styles.menuItemText, { color: textColor }]}>MY ORDERS</Text>
                    <Ionicons name="chevron-forward" size={20} color={secondaryText} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.menuItem, { borderBottomColor: borderColor }]}>
                    <Text style={[styles.menuItemText, { color: textColor }]}>ADDRESSES</Text>
                    <Ionicons name="chevron-forward" size={20} color={secondaryText} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.menuItem, { borderBottomColor: borderColor }]}>
                    <Text style={[styles.menuItemText, { color: textColor }]}>PAYMENT METHODS</Text>
                    <Ionicons name="chevron-forward" size={20} color={secondaryText} />
                </TouchableOpacity>
            </View>

            {/* Logout Button */}
            <TouchableOpacity 
                style={[styles.logoutButton, { borderColor: textColor }]}
                onPress={logout}
            >
                <Text style={[styles.logoutText, { color: textColor }]}>LOGOUT</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 40,
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
    userInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 40,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 20,
    },
    avatarText: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    userDetails: {
        flex: 1,
    },
    userName: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 5,
        textTransform: 'uppercase',
    },
    userEmail: {
        fontSize: 14,
    },
    menuContainer: {
        marginBottom: 40,
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 20,
        borderBottomWidth: 1,
    },
    menuItemText: {
        fontSize: 14,
        fontWeight: '600',
        letterSpacing: 1,
    },
    logoutButton: {
        paddingVertical: 15,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 'auto',
        marginBottom: 40,
    },
    logoutText: {
        fontSize: 14,
        fontWeight: '800',
        letterSpacing: 2,
    },
});

export default ProfileScreen;
