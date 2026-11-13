import { useMemo, useState } from "react"
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
import { router, Stack } from "expo-router"
import { Button } from "@/components/Button"
import { Chip } from "@/components/Chip"
import { ItemCard } from "@/components/ItemCard"
import { Screen } from "@/components/Screen"
import { Banner, EmptyState } from "@/components/States"
import { useCurrentUser } from "@/contexts/AuthContext"
import { useFridgeContext } from "@/contexts/FridgeContext"
import { Item } from "@/types"
import { colors, radius, spacing } from "@/theme"
import { toUserMessage } from "@/utils/errors"
import { expiryLevel } from "@/utils/expiry"

type Filter = "geladeira" | "meus" | "vencendo" | "casos"

const FILTERS: { key: Filter; label: string }[] = [
    { key: "geladeira", label: "🧊 Na geladeira" },
    { key: "meus", label: "🙋 Meus" },
    { key: "vencendo", label: "⏰ Vencendo" },
    { key: "casos", label: "🕵️ Casos" },
]

const EMPTY: Record<Filter, { emoji: string; title: string; message: string }> = {
    geladeira: { emoji: "🫙", title: "Geladeira vazia", message: "Guarde o primeiro item tocando no botão abaixo." },
    meus: { emoji: "🙋", title: "Nada seu por aqui", message: "Itens que você guardar aparecem aqui." },
    vencendo: { emoji: "🌱", title: "Tudo fresquinho", message: "Nenhum item vence nos próximos 2 dias." },
    casos: { emoji: "😇", title: "Nenhum caso", message: "Ninguém confessou nada e nada sumiu. Ainda." },
}

const time = (item: Item) => (item.confessedAt ?? item.createdAt)?.getTime() ?? 0

export default function FridgeItemsScreen() {
    const user = useCurrentUser()
    const { fridge, items, itemsLoading, itemsError, retry } = useFridgeContext()
    const [filter, setFilter] = useState<Filter>("geladeira")

    // useMemo: só recalcula a lista quando os itens ou o filtro mudam
    const visible = useMemo(() => {
        const inFridge = items
            .filter((i) => i.status === "na_geladeira")
            .sort((a, b) => a.expiresOn.localeCompare(b.expiresOn))
        switch (filter) {
            case "geladeira":
                return inFridge
            case "meus":
                return items
                    .filter((i) => i.ownerId === user.uid)
                    .sort((a, b) => time(b) - time(a))
            case "vencendo":
                return inFridge.filter((i) => expiryLevel(i.expiresOn) !== "ok")
            case "casos":
                return items.filter((i) => i.status !== "na_geladeira").sort((a, b) => time(b) - time(a))
        }
    }, [items, filter, user.uid])

    const counts = useMemo(
        () => ({
            inFridge: items.filter((i) => i.status === "na_geladeira").length,
            expiring: items.filter((i) => i.status === "na_geladeira" && expiryLevel(i.expiresOn) !== "ok").length,
            mysteries: items.filter((i) => i.status === "sumiu").length,
            awaitingMe: items.filter((i) => i.status === "confessado" && i.ownerId === user.uid).length,
        }),
        [items, user.uid],
    )

    if (!fridge) return null

    const goBack = () => (router.canGoBack() ? router.back() : router.replace("/(app)"))
    const empty = EMPTY[filter]

    return (
        <Screen
            footer={
                <Button
                    title="➕ Guardar um item"
                    onPress={() => router.push({ pathname: "/(app)/geladeira/[fridgeId]/item-form", params: { fridgeId: fridge.id } })}
                />
            }
        >
            <Stack.Screen
                options={{
                    headerLeft: () => (
                        <Pressable onPress={goBack} hitSlop={12} accessibilityLabel="Voltar para minhas geladeiras">
                            <Text style={styles.headerIcon}>‹</Text>
                        </Pressable>
                    ),
                    headerRight: () => (
                        <View style={{ flexDirection: "row", gap: spacing.lg }}>
                            <Pressable
                                hitSlop={10}
                                accessibilityLabel="Mural da Vergonha"
                                onPress={() => router.push({ pathname: "/(app)/geladeira/[fridgeId]/mural", params: { fridgeId: fridge.id } })}
                            >
                                <Text style={styles.headerEmoji}>🏆</Text>
                            </Pressable>
                            <Pressable
                                hitSlop={10}
                                accessibilityLabel="Membros e convite"
                                onPress={() => router.push({ pathname: "/(app)/geladeira/[fridgeId]/membros", params: { fridgeId: fridge.id } })}
                            >
                                <Text style={styles.headerEmoji}>👥</Text>
                            </Pressable>
                        </View>
                    ),
                }}
            />

            <View style={styles.stats}>
                <Stat value={counts.inFridge} label="na geladeira" />
                <Stat value={counts.expiring} label="vencendo" highlight={counts.expiring > 0} />
                <Stat value={counts.mysteries} label="mistérios" highlight={counts.mysteries > 0} />
            </View>

            {fridge.memberIds.length === 1 && (
                <Banner tone="success" text={`Só você por aqui! Mande o código ${fridge.inviteCode} para o pessoal entrar.`}>
                    <Button
                        title="👥 Convidar pessoas"
                        variant="secondary"
                        onPress={() => router.push({ pathname: "/(app)/geladeira/[fridgeId]/membros", params: { fridgeId: fridge.id } })}
                    />
                </Banner>
            )}

            {counts.awaitingMe > 0 && (
                <Pressable onPress={() => setFilter("casos")} style={styles.alert}>
                    <Text style={styles.alertText}>
                        🙊 {counts.awaitingMe === 1 ? "Alguém confessou" : `${counts.awaitingMe} confissões`} sobre item seu!
                        Toque para dar o veredito.
                    </Text>
                </Pressable>
            )}

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
                {FILTERS.map((f) => (
                    <Chip key={f.key} label={f.label} selected={filter === f.key} onPress={() => setFilter(f.key)} />
                ))}
            </ScrollView>

            {itemsError ? (
                <Banner tone="danger" text={toUserMessage(itemsError)}>
                    <Button title="Tentar de novo" variant="secondary" onPress={retry} />
                </Banner>
            ) : null}

            {itemsLoading ? (
                <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
            ) : visible.length === 0 ? (
                <EmptyState emoji={empty.emoji} title={empty.title} message={empty.message} />
            ) : (
                visible.map((item) => (
                    <ItemCard
                        key={item.id}
                        item={item}
                        isMine={item.ownerId === user.uid}
                        onPress={() =>
                            router.push({
                                pathname: "/(app)/geladeira/[fridgeId]/item/[itemId]",
                                params: { fridgeId: fridge.id, itemId: item.id },
                            })
                        }
                    />
                ))
            )}
        </Screen>
    )
}

function Stat({ value, label, highlight }: { value: number; label: string; highlight?: boolean }) {
    return (
        <View style={[styles.stat, highlight && { backgroundColor: colors.warningSoft }]}>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    headerIcon: { fontSize: 34, color: colors.primaryDark, marginTop: -4, paddingRight: spacing.sm },
    headerEmoji: { fontSize: 24 },
    stats: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.md },
    stat: {
        flex: 1,
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        paddingVertical: spacing.md,
        alignItems: "center",
        borderWidth: 1,
        borderColor: colors.border,
    },
    statValue: { fontSize: 22, fontWeight: "800", color: colors.text },
    statLabel: { fontSize: 12, color: colors.textMuted },
    alert: {
        backgroundColor: colors.primarySoft,
        borderRadius: radius.md,
        padding: spacing.md,
        marginBottom: spacing.md,
    },
    alertText: { color: colors.primaryDark, fontWeight: "700" },
    filters: { gap: spacing.sm, paddingBottom: spacing.md },
})
