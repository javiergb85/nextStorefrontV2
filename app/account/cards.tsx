import { Stack } from 'expo-router';
import PaymentMethodsScreen from '../src/presentation/screens/PaymentMethodsScreen';

export default function CardsRoute() {
    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <PaymentMethodsScreen />
        </>
    );
}
