import { Pressable, StyleSheet, Text, View } from "react-native"
import { Item } from "@/types"
import { colors, radius, spacing } from "@/theme"
import { expiryLabel, expiryLevel } from "@/utils/expiry"
import { CATEGORY_INFO, STATUS_INFO } from "@/utils/itemRules"

interface Props {
    item: Item
    isMine: boolean
    onPress: () => void
}

const EXPIRY_COLORS = {
    vencido: { bg: colors.dangerSoft, fg: colors.danger },
    vence_hoje: { bg: colors.warningSoft, fg: "#8A5600" },
    vencendo: { bg: colors.warningSoft, fg: "#8A5600" },
    ok: { bg: colors.mintSoft, fg: "#11705E" },
}

export function ItemCard({ item, isMine, onPress }: Props) {
    const category = CATEGORY_INFO[item.category] ?? CATEGORY_INFO.outro
    const inFridge = item.status === "na_geladeira"
    const expiry = EXPIRY_COLORS[expiryLevel(item.expiresOn)]
    const status = STATUS_INFO[item.status]

    return (
        <Pressable
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={`${item.name}, de ${item.ownerName}`}
            style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
        >
            <Text style={styles.emoji}>{category.emoji}</Text>
            <View style={{ flex: 1 }}>
                <Text style={styles.name} numberOfLines={1}>
                    {item.name}
                </Text>
                <Text style={styles.owner}>
                    {isMine ? "Seu" : `De ${item.ownerName}`}
                    {item.pendingSync ? "  ·  ⏳ sincronizando" : ""}
                </Text>
                <View style={styles.badges}>
                    {inFridge ? (
                        <Text style={[styles.badge, { backgroundColor: expiry.bg, color: expiry.fg }]}>
                            {expiryLabel(item.expiresOn)}
                        </Text>
                    ) : (
                        <Text style={[styles.badge, styles.statusBadge]}>
                            {status.emoji} {status.label}
                            {item.culpritName ? ` · ${item.culpritName}` : ""}
                        </Text>
                    )}
                </View>
            </View>
            <Text style={styles.chevron}>›</Text>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    card: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        padding: spacing.md,
        marginBottom: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
    },
    emoji: { fontSize: 34 },
    name: { fontSize: 16, fontWeight: "700", color: colors.text },
    owner: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
    badges: { flexDirection: "row", marginTop: spacing.xs },
    badge: {
        fontSize: 12,
        fontWeight: "700",
        paddingHorizontal: spacing.sm,
        paddingVertical: 3,
        borderRadius: radius.pill,
        overflow: "hidden",
    },
    statusBadge: { backgroundColor: colors.primarySoft, color: colors.primaryDark },
    chevron: { fontSize: 28, color: colors.textMuted },
})
