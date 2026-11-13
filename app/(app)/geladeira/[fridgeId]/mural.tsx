import { useMemo, useState } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { Screen } from "@/components/Screen"
import { EmptyState } from "@/components/States"
import { useCurrentUser } from "@/contexts/AuthContext"
import { useFridgeContext } from "@/contexts/FridgeContext"
import { colors, font, radius, spacing } from "@/theme"
import { weekFromOffset } from "@/utils/dates"
import { CATEGORY_INFO } from "@/utils/itemRules"
import { buildWeeklyRanking, titleFor } from "@/utils/ranking"

export default function WallOfShameScreen() {
    const user = useCurrentUser()
    const { items } = useFridgeContext()
    const [offset, setOffset] = useState(0) // 0 = esta semana, -1 = semana passada...
    const week = weekFromOffset(offset)
    const ranking = useMemo(() => buildWeeklyRanking(items, week.key), [items, week.key])

    return (
        <Screen>
            <View style={styles.weekNav}>
                <Pressable onPress={() => setOffset((o) => o - 1)} hitSlop={12} accessibilityLabel="Semana anterior">
                    <Text style={styles.arrow}>‹</Text>
                </Pressable>
                <View style={{ alignItems: "center" }}>
                    <Text style={font.subtitle}>{offset === 0 ? "Esta semana" : offset === -1 ? "Semana passada" : "Semana"}</Text>
                    <Text style={font.small}>{week.label}</Text>
                </View>
                <Pressable
                    onPress={() => setOffset((o) => Math.min(0, o + 1))}
                    disabled={offset === 0}
                    hitSlop={12}
                    accessibilityLabel="Próxima semana"
                >
                    <Text style={[styles.arrow, offset === 0 && { opacity: 0.2 }]}>›</Text>
                </Pressable>
            </View>

            <View style={styles.stats}>
                <Stat emoji="🙊" value={ranking.totalConfessions} label="confissões" />
                <Stat emoji="🕵️" value={ranking.openMysteries} label="mistérios abertos" />
                <Stat
                    emoji={ranking.favoriteCategory ? CATEGORY_INFO[ranking.favoriteCategory].emoji : "🤷"}
                    value={ranking.favoriteCategory ? CATEGORY_INFO[ranking.favoriteCategory].label : "—"}
                    label="mais atacado"
                />
            </View>

            {ranking.culprits.length === 0 ? (
                <EmptyState
                    emoji="😇"
                    title="Ninguém confessou nada"
                    message={
                        ranking.openMysteries > 0
                            ? "Mas tem item sumido sem dono... alguém aqui não está falando a verdade. 🤨"
                            : "Uma semana de paz na geladeira. Raro!"
                    }
                />
            ) : (
                ranking.culprits.map((c, index) => (
                    <View key={c.id} style={[styles.card, index === 0 && styles.first]}>
                        <Text style={styles.position}>{index + 1}º</Text>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.name}>
                                {c.name}
                                {c.id === user.uid ? " (você 😳)" : ""}
                            </Text>
                            <Text style={styles.title}>{titleFor(index)}</Text>
                            <Text style={font.small}>
                                😇 {c.forgiven} perdoado{c.forgiven === 1 ? "" : "s"} · 💸 {c.charged} cobrado
                                {c.charged === 1 ? "" : "s"}
                                {c.pending ? ` · ⏳ ${c.pending} aguardando` : ""}
                            </Text>
                        </View>
                        <Text style={styles.total}>{c.total}</Text>
                    </View>
                ))
            )}

            <Text style={[font.small, { textAlign: "center", marginTop: spacing.lg }]}>
                Só aparece aqui quem confessou. Quem come escondido fica nos "mistérios"… 👀
            </Text>
        </Screen>
    )
}

function Stat({ emoji, value, label }: { emoji: string; value: number | string; label: string }) {
    return (
        <View style={styles.stat}>
            <Text style={{ fontSize: 22 }}>{emoji}</Text>
            <Text style={[styles.statValue, typeof value === "string" && styles.statText]} numberOfLines={1} adjustsFontSizeToFit>
                {value}
            </Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    weekNav: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.lg },
    arrow: { fontSize: 40, color: colors.primaryDark, paddingHorizontal: spacing.md },
    stats: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.lg },
    stat: {
        flex: 1,
        alignItems: "center",
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    statValue: { fontSize: 20, fontWeight: "800", color: colors.text },
    statText: { fontSize: 15, marginVertical: 3 },
    statLabel: { fontSize: 12, color: colors.textMuted, textAlign: "center" },
    card: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        padding: spacing.lg,
        marginBottom: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
    },
    first: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
    position: { fontSize: 22, fontWeight: "800", color: colors.primaryDark, width: 36 },
    name: { fontSize: 17, fontWeight: "800", color: colors.text },
    title: { fontSize: 14, fontWeight: "700", color: colors.primaryDark, marginVertical: 2 },
    total: { fontSize: 30, fontWeight: "900", color: colors.primary },
})
