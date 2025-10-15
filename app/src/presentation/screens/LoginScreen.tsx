import { useRouter } from "expo-router";
import React from "react";
import { Button, StyleSheet, Text, View } from "react-native";
//import { useLoginStore } from '../../store/login.store';
import { useStorefront } from "../../context/storefront.context";

const LoginScreen = () => {
  const { login, isLoading, accessToken } = useStorefront().useLoginStore();
  const router = useRouter();

  // Redireccionar si el usuario ya está autenticado.
  if (accessToken) {
    router.replace("/");
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
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar Sesión</Text>
      <Button
        title={isLoading ? "Iniciando..." : "Login"}
        onPress={handleLogin}
        disabled={isLoading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
});

export default LoginScreen;
