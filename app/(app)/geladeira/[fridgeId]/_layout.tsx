import { router, Stack, useLocalSearchParams } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import { Button } from "@/components/Button"
import { EmptyState, ErrorState, LoadingState } from "@/components/States"
import { FridgeProvider, useFridgeContext } from "@/contexts/FridgeContext"
import { colors, spacing } from "@/theme"

// Com isto, abrir direto /geladeira/X/membros ainda deixa a lista de itens "embaixo" na pilha
export const unstable_settings = { initialRouteName: "index" }

export default function FridgeLayout() {
    const { fridgeId } = useLocalSearchParams<{ fridgeId: string }>()
    return (
        <FridgeProvider fridgeId={fridgeId}>
            <FridgeGate />
        </FridgeProvider>
    )
}

/** Só mostra as telas da geladeira quando ela carregou e o usuário é membro. */
function FridgeGate() {
    const { fridge, fridgeLoading, fridgeError, retry, closingRef } = useFridgeContext()

    // Importante: depois que a geladeira carregou, o Stack nunca é desmontado
    // (senão a navegação interna seria perdida a cada atualização)
    if (fridge === null && closingRef.current) return <LoadingState message="Saindo..." />
    if (fridge === undefined) {
        if (fridgeError && !fridgeLoading) return <ErrorState error={fridgeError} onRetry={retry} />
        return <LoadingState message="Abrindo a geladeira..." />
    }
    if (fridge === null) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, padding: spacing.lg }}>
                <EmptyState
                    emoji="🚪"
                    title="Geladeira indisponível"
                    message="Ela foi excluída ou você não faz mais parte dela."
                >
                    <Button
                        title="Voltar para minhas geladeiras"
                        onPress={() => router.replace("/(app)")}
                        style={{ marginTop: spacing.lg, alignSelf: "stretch" }}
                    />
                </EmptyState>
            </SafeAreaView>
        )
    }

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
            <Stack.Screen name="index" options={{ title: fridge.name }} />
            <Stack.Screen name="item-form" options={{ presentation: "modal" }} />
            <Stack.Screen name="item/[itemId]" options={{ title: "Detalhes" }} />
            <Stack.Screen name="mural" options={{ title: "Mural da Vergonha" }} />
            <Stack.Screen name="membros" options={{ title: "Membros e convite" }} />
        </Stack>
    )
}
