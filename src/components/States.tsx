// Estados de tela reaproveitáveis: carregando, erro, vazio e aviso.

import { ActivityIndicator, StyleSheet, Text, View } from "react-native"
import { colors, font, radius, spacing } from "@/theme"
import { toUserMessage } from "@/utils/errors"
import { Button } from "./Button"

export function LoadingState({ message = "Carregando..." }: { message?: string }) {
    return (
        <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[font.small, { marginTop: spacing.md }]}>{message}</Text>
        </View>
    )
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
    return (
        <View style={styles.center}>
            <Text style={styles.emoji}>🥶</Text>
            <Text style={font.subtitle}>Não deu para carregar</Text>
            <Text style={[font.small, styles.text]}>{toUserMessage(error)}</Text>
            {onRetry && <Button title="Tentar de novo" onPress={onRetry} style={{ marginTop: spacing.lg }} />}
        </View>
    )
}

export function EmptyState({
    emoji,
    title,
    message,
    children,
}: {
    emoji: string
    title: string
    message?: string
    children?: React.ReactNode
}) {
    return (
        <View style={styles.empty}>
            <Text style={styles.emoji}>{emoji}</Text>
            <Text style={[font.subtitle, { textAlign: "center" }]}>{title}</Text>
            {message && <Text style={[font.small, styles.text]}>{message}</Text>}
            {children}
        </View>
    )
}

type BannerTone = "info" | "warning" | "success" | "danger"
const TONES: Record<BannerTone, { bg: string; fg: string }> = {
    info: { bg: colors.primarySoft, fg: colors.primaryDark },
    warning: { bg: colors.warningSoft, fg: "#8A5600" },
    success: { bg: colors.mintSoft, fg: "#11705E" },
    danger: { bg: colors.dangerSoft, fg: colors.danger },
}

export function Banner({
    tone = "info",
    text,
    children,
}: {
    tone?: BannerTone
    text: string
    children?: React.ReactNode
}) {
    const t = TONES[tone]
    return (
        <View style={[styles.banner, { backgroundColor: t.bg }]}>
            <Text style={{ color: t.fg, fontSize: 14, fontWeight: "600" }}>{text}</Text>
            {children}
        </View>
    )
}

const styles = StyleSheet.create({
    center: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: spacing.xl,
        backgroundColor: colors.background,
    },
    empty: { alignItems: "center", paddingVertical: spacing.xxl, paddingHorizontal: spacing.lg },
    emoji: { fontSize: 52, marginBottom: spacing.md },
    text: { textAlign: "center", marginTop: spacing.sm },
    banner: { borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md, gap: spacing.sm },
})
