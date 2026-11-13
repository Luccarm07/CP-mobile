import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from "react-native"
import { colors, radius, spacing } from "@/theme"

type Variant = "primary" | "secondary" | "danger" | "ghost" | "mint"

interface Props {
    title: string
    onPress: () => void
    variant?: Variant
    loading?: boolean
    disabled?: boolean
    style?: ViewStyle
}

const VARIANTS: Record<Variant, { bg: string; fg: string; border: string }> = {
    primary: { bg: colors.primary, fg: colors.white, border: colors.primary },
    mint: { bg: colors.mint, fg: colors.white, border: colors.mint },
    secondary: { bg: colors.surface, fg: colors.primary, border: colors.primary },
    danger: { bg: colors.dangerSoft, fg: colors.danger, border: colors.dangerSoft },
    ghost: { bg: "transparent", fg: colors.primaryDark, border: "transparent" },
}

export function Button({ title, onPress, variant = "primary", loading, disabled, style }: Props) {
    const v = VARIANTS[variant]
    const inactive = disabled || loading
    return (
        <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: inactive, busy: loading }}
            onPress={onPress}
            disabled={inactive}
            style={({ pressed }) => [
                styles.base,
                { backgroundColor: v.bg, borderColor: v.border },
                pressed && { opacity: 0.8 },
                inactive && { opacity: 0.55 },
                style,
            ]}
        >
            {loading ? (
                <ActivityIndicator color={v.fg} />
            ) : (
                <Text style={[styles.text, { color: v.fg }]}>{title}</Text>
            )}
        </Pressable>
    )
}

const styles = StyleSheet.create({
    base: {
        minHeight: 50,
        borderRadius: radius.md,
        borderWidth: 1.5,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: spacing.lg,
    },
    text: { fontSize: 16, fontWeight: "700" },
})
