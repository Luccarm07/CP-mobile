import { Pressable, StyleSheet, Text, View } from "react-native"
import { router, Stack } from "expo-router"
import { Button } from "@/components/Button"
import { Screen } from "@/components/Screen"
import { EmptyState, ErrorState, LoadingState } from "@/components/States"
import { useCurrentUser } from "@/contexts/AuthContext"
import { useRealtime } from "@/hooks/useRealtime"
import { subscribeMyFridges } from "@/services/fridgeService"
import { Fridge } from "@/types"
import { colors, radius, spacing } from "@/theme"
import { VerifyEmailBanner } from "@/components/VerifyEmailBanner"

export default function MyFridgesScreen() {
    const user = useCurrentUser()
    const { data: fridges, loading, error, retry } = useRealtime<Fridge[]>(
        (onData, onError) => subscribeMyFridges(user.uid, onData, onError),
        [user.uid],
    )

    const header = (
        <Stack.Screen
            options={{
                // À esquerda: a direita costuma ficar coberta pelo botão de ferramentas do Expo Go
                headerLeft: () => (
                    <Pressable onPress={() => router.push("/(app)/perfil")} hitSlop={12} accessibilityLabel="Meu perfil e sair">
                        <Text style={{ fontSize: 26 }}>🙂</Text>
                    </Pressable>
                ),
            }}
        />
    )

    if (loading && !fridges) return <>{header}<LoadingState /></>
    if (error && !fridges) return <>{header}<ErrorState error={error} onRetry={retry} /></>

    return (
        <Screen
            footer={
                <View style={styles.actions}>
                    <Button title="➕ Criar" onPress={() => router.push("/(app)/nova-geladeira")} style={{ flex: 1 }} />
                    <Button title="🔑 Tenho código" variant="secondary" onPress={() => router.push("/(app)/entrar")} style={{ flex: 1 }} />
                </View>
            }
        >
            {header}
            <Text style={styles.hello}>Oi, {user.displayName?.split(" ")[0] || "pessoa"}! 👋</Text>
            <VerifyEmailBanner />

            {fridges && fridges.length === 0 ? (
                <EmptyState
                    emoji="🧊"
                    title="Nenhuma geladeira ainda"
                    message="Crie uma para sua casa, república ou escritório, ou entre com o código que um amigo te passou."
                />
            ) : (
                fridges?.map((fridge) => (
                    <Pressable
                        key={fridge.id}
                        onPress={() => router.push({ pathname: "/(app)/geladeira/[fridgeId]", params: { fridgeId: fridge.id } })}
                        style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
                        accessibilityRole="button"
                    >
                        <Text style={styles.cardEmoji}>🧊</Text>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.cardTitle}>{fridge.name}</Text>
                            <Text style={styles.cardSub}>
                                {fridge.memberIds.length} {fridge.memberIds.length === 1 ? "pessoa" : "pessoas"}
                                {fridge.ownerId === user.uid ? " · você é admin" : ""}
                            </Text>
                        </View>
                        <Text style={styles.chevron}>›</Text>
                    </Pressable>
                ))
            )}
        </Screen>
    )
}

const styles = StyleSheet.create({
    hello: { fontSize: 20, fontWeight: "700", color: colors.text, marginBottom: spacing.lg },
    actions: { flexDirection: "row", gap: spacing.sm },
    card: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        padding: spacing.lg,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    cardEmoji: { fontSize: 36 },
    cardTitle: { fontSize: 18, fontWeight: "800", color: colors.text },
    cardSub: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
    chevron: { fontSize: 28, color: colors.textMuted },
})
