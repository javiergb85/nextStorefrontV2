import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { useTheme } from '../../context/theme.context';
import { getAuthToken } from '../../shared/utils/auth-storage.util';

export default function PaymentMethodsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const isDark = theme === 'dark';
    const bgColor = isDark ? '#000000' : '#FFFFFF';
    const textColor = isDark ? '#FFFFFF' : '#000000';

    useEffect(() => {
        const loadToken = async () => {
            try {
                const t = await getAuthToken();
                console.log("Token loaded for WebView:", t ? "Yes" : "No");
                setToken(t);
            } catch (error) {
                console.error("Error loading token for WebView:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadToken();
    }, []);
console.log("Cookie ", token);
    const injectedCookieScript = token ? `
        (function() {
            try {
                document.cookie = "VtexIdclientAutCookie_hanesar=${token};domain=www.hanes.ar;path=/";
                console.log("Cookie injected successfully");

                // Inject JS to hide unwanted elements using direct DOM manipulation properties as requested
                setInterval(() => {
                    const classesToHide = [
                        '.vtex-sticky-layout-0-x-wrapper',
                        '.vtex-store-footer-2-x-footerLayout',
                        '.vtex-pageHeader__children',
                        '.vtex-pageHeader-link__container'
                    ];

                    classesToHide.forEach(className => {
                        const elements = document.querySelectorAll(className);
                        elements.forEach(el => {
                            if (el && el.style && el.style.display !== 'none') {
                                el.style.display = 'none';
                            }
                        });
                    });
                }, 100); // Check every 100ms
                
                console.log("JS Hiding script injected successfully");

            } catch(e) {
                console.error("Injection failed", e);
            }
        })();
        true;
    ` : '';

    if (isLoading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: bgColor }]}>
                <ActivityIndicator size="large" color={textColor} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: bgColor, paddingTop: insets.top }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={textColor} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: textColor }]}>PAYMENT METHODS</Text>
                <View style={{ width: 24 }} /> 
            </View>
            
            <WebView
                source={{ uri: 'https://www.hanes.ar/account#/cards' }}
                injectedJavaScriptBeforeContentLoaded={injectedCookieScript}
                sharedCookiesEnabled={true}
                startInLoadingState={true}
                renderLoading={() => (
                    <View style={[styles.loadingContainer, { backgroundColor: bgColor }]}>
                        <ActivityIndicator size="large" color={textColor} />
                    </View>
                )}
                style={{ flex: 1, backgroundColor: bgColor }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    backButton: {
        padding: 5,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
