import { Pressable, StyleSheet, Text } from "react-native"
import { colors, radius, spacing } from "@/theme"

interface Props {
    label: string
    selected?: boolean
    onPress: () => void
}

/** Botão pequeno de seleção (filtros, categorias, atalhos de data). */
export function Chip({ label, selected, onPress }: Props) {
    return (
        <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={onPress}
            style={[styles.chip, selected && styles.selected]}
        >
            <Text style={[styles.text, selected && styles.textSelected]}>{label}</Text>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    chip: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: radius.pill,
        borderWidth: 1.5,
        borderColor: colors.border,
        backgroundColor: colors.surface,
    },
    selected: { backgroundColor: colors.primary, borderColor: colors.primary },
    text: { fontSize: 14, fontWeight: "600", color: colors.text },
    textSelected: { color: colors.white },
})
