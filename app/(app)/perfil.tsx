import { Alert, StyleSheet, Text, View } from "react-native"
import { Button } from "@/components/Button"
import { Screen } from "@/components/Screen"
import { useCurrentUser } from "@/contexts/AuthContext"
import { useAction } from "@/hooks/useAction"
import { displayNameOf, signOut } from "@/services/authService"
import { colors, font, radius, spacing } from "@/theme"
import { VerifyEmailBanner } from "@/components/VerifyEmailBanner"

export default function ProfileScreen() {
    const user = useCurrentUser()
    const { run, running } = useAction()

    function confirmSignOut() {
        Alert.alert("Sair da conta?", "Você vai precisar entrar de novo com e-mail e senha.", [
            { text: "Cancelar", style: "cancel" },
            // O layout (app) percebe que não há usuário e volta para o login
            { text: "Sair", style: "destructive", onPress: () => run(signOut) },
        ])
    }

    const name = displayNameOf(user)

    return (
        <Screen>
            <View style={styles.card}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text>
                </View>
                <Text style={font.subtitle}>{name}</Text>
                <Text style={font.small}>{user.email}</Text>
                <Text style={[styles.badge, user.emailVerified ? styles.ok : styles.pending]}>
                    {user.emailVerified ? "✅ E-mail confirmado" : "⏳ E-mail não confirmado"}
                </Text>
            </View>

            <VerifyEmailBanner />

            <Button title="Sair da conta" variant="danger" onPress={confirmSignOut} loading={running} />
        </Screen>
    )
}

const styles = StyleSheet.create({
    card: {
        alignItems: "center",
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        padding: spacing.xl,
        marginBottom: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
        gap: spacing.xs,
    },
    avatar: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: colors.primary,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: spacing.sm,
    },
    avatarText: { color: colors.white, fontSize: 32, fontWeight: "800" },
    badge: {
        marginTop: spacing.sm,
        fontSize: 13,
        fontWeight: "700",
        paddingHorizontal: spacing.md,
        paddingVertical: 4,
        borderRadius: radius.pill,
        overflow: "hidden",
    },
    ok: { backgroundColor: colors.mintSoft, color: "#11705E" },
    pending: { backgroundColor: colors.warningSoft, color: "#8A5600" },
})
