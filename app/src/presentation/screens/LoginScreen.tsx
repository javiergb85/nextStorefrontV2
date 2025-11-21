import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStorefront } from "../../context/storefront.context";
import { useTheme } from "../../context/theme.context";

const LoginScreen = () => {
  const { login, isLoading, accessToken } = useStorefront().useLoginStore();
  const router = useRouter();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const isDark = theme === 'dark';

  // State for inputs (visual only as per request, logic is hardcoded)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Colors
  const bgColor = isDark ? '#000000' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#000000';
  const secondaryText = isDark ? '#AAAAAA' : '#666666';
  const inputBg = isDark ? '#111111' : '#F9F9F9';
  const borderColor = isDark ? '#333333' : '#E5E5E5';
  const buttonBg = isDark ? '#FFFFFF' : '#000000';
  const buttonText = isDark ? '#000000' : '#FFFFFF';

  // Redireccionar si el usuario ya está autenticado.
  // Redireccionar si el usuario ya está autenticado.
  React.useEffect(() => {
    if (accessToken) {
      router.replace("/");
    }
  }, [accessToken]);

  if (accessToken) {
    return null;
  }

  const handleLogin = async () => {
    // Aquí invocas tu caso de uso de login con credenciales de prueba.
    // En una aplicación real, obtendrías estos valores de los campos de entrada.
    console.log("entrando");

    //await login("prueba1@yopmail.com", "contraseña123");

    await login("javier.guevarabarrios@balloon-group.com", "Jagb27027055..");
    // await login('test@test.com', 'password123');
  };

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.content}
      >
        {/* Header / Logo */}
        <View style={[styles.header, { marginTop: insets.top + 40 }]}>
            <Text style={[styles.logo, { color: textColor }]}>STORE</Text>
        </View>

        <View style={styles.formContainer}>
            <Text style={[styles.title, { color: textColor }]}>WELCOME BACK</Text>
            <Text style={[styles.subtitle, { color: secondaryText }]}>Please sign in to continue</Text>

            {/* Email Input */}
            <View style={styles.inputWrapper}>
                <Text style={[styles.label, { color: textColor }]}>EMAIL</Text>
                <TextInput
                    style={[styles.input, { backgroundColor: inputBg, borderColor: borderColor, color: textColor }]}
                    placeholder="Enter your email"
                    placeholderTextColor={secondaryText}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />
            </View>

            {/* Password Input */}
            <View style={styles.inputWrapper}>
                <Text style={[styles.label, { color: textColor }]}>PASSWORD</Text>
                <TextInput
                    style={[styles.input, { backgroundColor: inputBg, borderColor: borderColor, color: textColor }]}
                    placeholder="Enter your password"
                    placeholderTextColor={secondaryText}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />
            </View>

            {/* Forgot Password */}
            <TouchableOpacity style={styles.forgotPassword}>
                <Text style={[styles.forgotPasswordText, { color: secondaryText }]}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
                style={[styles.loginButton, { backgroundColor: buttonBg }]}
                onPress={handleLogin}
                disabled={isLoading}
                activeOpacity={0.9}
            >
                {isLoading ? (
                    <ActivityIndicator size="small" color={buttonText} />
                ) : (
                    <Text style={[styles.loginButtonText, { color: buttonText }]}>LOGIN</Text>
                )}
            </TouchableOpacity>

            {/* Sign Up Link */}
            <View style={styles.footer}>
                <Text style={[styles.footerText, { color: secondaryText }]}>Don't have an account? </Text>
                <TouchableOpacity>
                    <Text style={[styles.signUpText, { color: textColor }]}>Sign Up</Text>
                </TouchableOpacity>
            </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logo: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 4,
  },
  formContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 40,
    letterSpacing: 0.5,
  },
  inputWrapper: {
    marginBottom: 24,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  input: {
    height: 50,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
    borderRadius: 0, // Sharp corners
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 30,
  },
  forgotPasswordText: {
    fontSize: 12,
    fontWeight: '500',
  },
  loginButton: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 0, // Sharp corners
    marginBottom: 24,
  },
  loginButtonText: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
  },
  signUpText: {
    fontSize: 14,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;
