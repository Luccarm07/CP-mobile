import { Redirect, Stack } from "expo-router"
import { LoadingState } from "@/components/States"
import { useAuth } from "@/contexts/AuthContext"
import { colors } from "@/theme"

// Área logada: quem não está logado volta para o login.
export default function AppLayout() {
    const { user, initializing } = useAuth()
    if (initializing) return <LoadingState />
    if (!user) return <Redirect href="/(auth)/login" />

    return (
        <Stack
            screenOptions={{
                headerStyle: { backgroundColor: colors.background },
                headerShadowVisible: false,
                headerTintColor: colors.primaryDark,
                headerTitleStyle: { fontWeight: "800", color: colors.text },
                headerBackTitle: "Voltar",
                contentStyle: { backgroundColor: colors.background },
            }}
        >
            <Stack.Screen name="index" options={{ title: "Minhas geladeiras" }} />
            <Stack.Screen name="nova-geladeira" options={{ title: "Nova geladeira", presentation: "modal" }} />
            <Stack.Screen name="entrar" options={{ title: "Entrar com código", presentation: "modal" }} />
            <Stack.Screen name="perfil" options={{ title: "Meu perfil" }} />
            <Stack.Screen name="geladeira/[fridgeId]" options={{ headerShown: false }} />
        </Stack>
    )
}
