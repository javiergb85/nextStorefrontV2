import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStorefront } from '../../context/storefront.context';
import { useTheme } from '../../context/theme.context';

const ProfileScreen = () => {
    const router = useRouter();
    const { userProfile, userAddresses, fetchAddresses, logout, isGuest } = useStorefront().useLoginStore();
    const { theme, toggleTheme } = useTheme();
    const insets = useSafeAreaInsets();
    const [showAddresses, setShowAddresses] = React.useState(false);
    const [isLoginModalVisible, setIsLoginModalVisible] = React.useState(false); // 💡 New State
    
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

    React.useEffect(() => {
        const loadAddresses = async () => {
             if (userProfile?.email) {
                console.log("ProfileScreen: Fetching addresses for", userProfile.email);
                try {
                    await fetchAddresses(userProfile.email);
                } catch (error: any) {
                    console.error("ProfileScreen: Error fetching addresses", error);
                    if (error.message && (error.message.includes("Authentication required") || error.message.includes("401"))) {
                        setIsLoginModalVisible(true);
                    }
                }
            }
        };
        loadAddresses();
    }, [userProfile?.email]);

    if (isGuest) {
        return (
            <View style={[styles.container, { backgroundColor: bgColor, paddingTop: insets.top }]}>
                <View style={styles.header}>
                    <Text style={[styles.title, { color: textColor }]}>PERFIL</Text>
                    <TouchableOpacity onPress={toggleTheme}>
                        <Ionicons 
                            name={isDark ? 'moon' : 'sunny'} 
                            size={24} 
                            color={textColor} 
                        />
                    </TouchableOpacity>
                </View>

                <View style={styles.guestContainer}>
                    <Ionicons name="person-circle-outline" size={120} color={secondaryText} />
                    <Text style={[styles.guestTitle, { color: textColor }]}>No has iniciado sesión</Text>
                    <Text style={[styles.guestSubtitle, { color: secondaryText }]}>
                        Inicia sesión para ver tu perfil, tus pedidos y tus direcciones guardadas.
                    </Text>
                    
                    <TouchableOpacity 
                        style={[styles.loginButton, { backgroundColor: textColor }]}
                        onPress={async () => {
                            await logout(); // Importante: Limpia el estado de invitado para poder entrar al login
                            router.replace('/login');
                        }}
                    >
                        <Text style={[styles.loginButtonText, { color: bgColor }]}>INICIAR SESIÓN</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: bgColor, paddingTop: insets.top }]}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: borderColor }]}>
                <Text style={[styles.title, { color: textColor }]}>PERFIL</Text>
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
                <TouchableOpacity 
                    style={[styles.menuItem, { borderBottomColor: borderColor }]}
                    onPress={() => router.push('/(tabs)/orders')}
                >
                    <Text style={[styles.menuItemText, { color: textColor }]}>MIS PEDIDOS</Text>
                    <Ionicons name="chevron-forward" size={20} color={secondaryText} />
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.menuItem, { borderBottomColor: borderColor }]}
                    onPress={() => setShowAddresses(!showAddresses)}
                >
                    <Text style={[styles.menuItemText, { color: textColor }]}>DIRECCIONES</Text>
                    <Ionicons name={showAddresses ? "chevron-down" : "chevron-forward"} size={20} color={secondaryText} />
                </TouchableOpacity>

                {showAddresses && (
                    <View style={styles.addressesContainer}>
                        {userAddresses?.map((address: any, index: number) => (
                            <View key={index} style={[styles.addressItem, { backgroundColor: cardBg }]}>
                                <Text style={[styles.addressText, { color: textColor }]}>
                                    {address.street} {address.number}
                                </Text>
                                <Text style={[styles.addressSubText, { color: secondaryText }]}>
                                    {address.neighborhood}, {address.city}, {address.state}
                                </Text>
                                <Text style={[styles.addressSubText, { color: secondaryText }]}>
                                    {address.postalCode}
                                </Text>
                            </View>
                        ))}
                         {(!userAddresses || userAddresses.length === 0) && (
                             <Text style={{color: secondaryText, padding: 10}}>No se encontraron direcciones.</Text>
                         )}
                    </View>
                )}

                <TouchableOpacity 
                    style={[styles.menuItem, { borderBottomColor: borderColor }]}
                    onPress={() => router.push('/account/cards')}
                >
                    <Text style={[styles.menuItemText, { color: textColor }]}>MÉTODOS DE PAGO</Text>
                    <Ionicons name="chevron-forward" size={20} color={secondaryText} />
                </TouchableOpacity>
            </View>

            {/* Logout Button */}
            <TouchableOpacity 
                style={[styles.logoutButton, { borderColor: textColor }]}
                onPress={logout}
            >
                <Text style={[styles.logoutText, { color: textColor }]}>CERRAR SESIÓN</Text>
            </TouchableOpacity>

            {/* Login Required Modal */}
            <Modal
                visible={isLoginModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => {}} // Bloqueamos el cierre manual (back button android)
            >
                 <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: cardBg, borderColor: borderColor }]}>
                        <Ionicons name="alert-circle-outline" size={50} color={isDark ? '#FFF' : '#000'} style={{ marginBottom: 20 }} />
                        <Text style={[styles.modalTitle, { color: textColor }]}>Sesión Expirada</Text>
                        <Text style={[styles.modalMessage, { color: secondaryText }]}>
                            Tu sesión ha expirado o se requiere autenticación. Por favor inicia sesión de nuevo para continuar.
                        </Text>
                        
                        <TouchableOpacity 
                            style={[styles.modalButton, { backgroundColor: isDark ? '#FFF' : '#000' }]}
                            onPress={async () => {
                                setIsLoginModalVisible(false);
                                await logout();
                                // El logout ya limpia el estado y AuthGuard (si existe) debería redirigir, 
                                // o podemos redirigir manualmente si es necesario.
                                router.replace('/(auth)/login'); 
                            }}
                        >
                            <Text style={[styles.modalButtonText, { color: isDark ? '#000' : '#FFF' }]}>INICIAR SESIÓN DE NUEVO</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
    addressesContainer: {
        marginBottom: 20,
    },
    addressItem: {
        padding: 15,
        marginBottom: 10,
        borderRadius: 8,
    },
    addressText: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 4,
    },
    addressSubText: {
        fontSize: 12,
        marginBottom: 2,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        padding: 30,
        borderRadius: 20,
        alignItems: 'center',
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    modalMessage: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 20,
    },
    modalButton: {
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 30,
        width: '100%',
        alignItems: 'center',
    },
    modalButtonText: {
        fontSize: 14,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    guestContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    guestTitle: {
        fontSize: 24,
        fontWeight: '900',
        marginTop: 20,
        marginBottom: 10,
        textAlign: 'center',
        textTransform: 'uppercase',
    },
    guestSubtitle: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 40,
        lineHeight: 24,
    },
    loginButton: {
        width: '100%',
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginButtonText: {
        fontSize: 14,
        fontWeight: '800',
        letterSpacing: 2,
    },
});

export default ProfileScreen;
