import { Redirect, Stack } from "expo-router"
import { LoadingState } from "@/components/States"
import { useAuth } from "@/contexts/AuthContext"
import { colors } from "@/theme"

// Telas para quem NÃO está logado. Quem já entrou é mandado para a área logada.
export default function AuthLayout() {
    const { user, initializing } = useAuth()
    if (initializing) return <LoadingState />
    if (user) return <Redirect href="/(app)" />

    return (
        <Stack
            screenOptions={{
                headerStyle: { backgroundColor: colors.background },
                headerShadowVisible: false,
                headerTintColor: colors.primaryDark,
                headerTitle: "",
                contentStyle: { backgroundColor: colors.background },
            }}
        >
            <Stack.Screen name="login" options={{ headerShown: false }} />
        </Stack>
    )
}
