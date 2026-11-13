import { useState } from "react"
import { Text } from "react-native"
import { router, useLocalSearchParams } from "expo-router"
import { Button } from "@/components/Button"
import { Screen } from "@/components/Screen"
import { Banner } from "@/components/States"
import { TextField } from "@/components/TextField"
import { useAction } from "@/hooks/useAction"
import { resetPassword } from "@/services/authService"
import { font, spacing } from "@/theme"
import { validateEmail } from "@/utils/validation"

export default function ForgotPasswordScreen() {
    const params = useLocalSearchParams<{ email?: string }>()
    const [email, setEmail] = useState(params.email ?? "")
    const [error, setError] = useState<string>()
    const [sentTo, setSentTo] = useState<string | null>(null)
    const { run, running } = useAction()

    async function handleSend() {
        const found = validateEmail(email)
        setError(found)
        if (found) return
        const ok = await run(() => resetPassword(email), { errorTitle: "Não foi possível enviar" })
        if (ok) setSentTo(email.trim())
    }

    return (
        <Screen>
            <Text style={font.title}>Recuperar senha</Text>
            <Text style={[font.small, { marginTop: spacing.xs, marginBottom: spacing.xl }]}>
                Enviaremos um link para você criar uma senha nova.
            </Text>

            {sentTo && (
                <Banner
                    tone="success"
                    text={`Se existir uma conta com ${sentTo}, o link já está a caminho. Confira também o spam.`}
                />
            )}

            <TextField
                label="E-mail"
                value={email}
                onChangeText={setEmail}
                error={error}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
            />
            <Button title={sentTo ? "Enviar de novo" : "Enviar link"} onPress={handleSend} loading={running} />
            <Button title="Voltar para o login" variant="ghost" onPress={() => router.back()} style={{ marginTop: spacing.sm }} />
        </Screen>
    )
}
