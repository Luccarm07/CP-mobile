import { useState } from "react"
import { Alert, StyleSheet, View } from "react-native"
import { useAuth } from "@/contexts/AuthContext"
import { useAction } from "@/hooks/useAction"
import { resendVerification } from "@/services/authService"
import { Button } from "./Button"
import { Banner } from "./States"

/** Lembrete para confirmar o e-mail (não bloqueia o uso do app). */
export function VerifyEmailBanner() {
    const { user, refreshUser } = useAuth()
    const [sent, setSent] = useState(false)
    const resend = useAction()
    const check = useAction()

    if (!user || user.emailVerified) return null

    return (
        <Banner
            tone="warning"
            text={
                sent
                    ? `Enviamos um novo link para ${user.email}.`
                    : `Confirme seu e-mail (${user.email}) pelo link que enviamos.`
            }
        >
            <View style={styles.row}>
                <Button
                    title="Reenviar"
                    variant="secondary"
                    loading={resend.running}
                    onPress={() => resend.run(async () => {
                        await resendVerification()
                        setSent(true)
                    })}
                    style={styles.button}
                />
                <Button
                    title="Já confirmei"
                    variant="secondary"
                    loading={check.running}
                    onPress={() =>
                        check.run(async () => {
                            // Se ainda não confirmou, avisa (o banner some sozinho se confirmou)
                            const fresh = await refreshUser()
                            if (!fresh?.emailVerified) {
                                Alert.alert("Ainda não", "Não encontramos a confirmação. Abra o link do e-mail e tente de novo.")
                            }
                        })
                    }
                    style={styles.button}
                />
            </View>
        </Banner>
    )
}

const styles = StyleSheet.create({
    row: { flexDirection: "row", gap: 8 },
    button: { flex: 1, minHeight: 40 },
})
