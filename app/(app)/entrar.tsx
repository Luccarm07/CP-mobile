import { useState } from "react"
import { Alert, Text } from "react-native"
import { router } from "expo-router"
import { Button } from "@/components/Button"
import { Screen } from "@/components/Screen"
import { TextField } from "@/components/TextField"
import { useCurrentUser } from "@/contexts/AuthContext"
import { useAction } from "@/hooks/useAction"
import { joinFridge } from "@/services/fridgeService"
import { font, spacing } from "@/theme"
import { normalizeInviteCode, validateInviteCode } from "@/utils/validation"

export default function JoinFridgeScreen() {
    const user = useCurrentUser()
    const [code, setCode] = useState("")
    const [error, setError] = useState<string>()
    const { run, running } = useAction()

    async function handleJoin() {
        const found = validateInviteCode(code)
        setError(found)
        if (found) return
        let result = { fridgeId: "", alreadyMember: false }
        const ok = await run(async () => {
            result = await joinFridge(code, user)
        }, { errorTitle: "Não foi possível entrar" })
        if (!ok) return

        router.replace({ pathname: "/(app)/geladeira/[fridgeId]", params: { fridgeId: result.fridgeId } })
        if (result.alreadyMember) Alert.alert("Você já está aqui", "Você já fazia parte desta geladeira.")
    }

    return (
        <Screen footer={<Button title="Entrar na geladeira" onPress={handleJoin} loading={running} />}>
            <Text style={[font.small, { marginBottom: spacing.lg }]}>
                Peça o código de 6 caracteres para o admin da geladeira (fica na tela de membros).
            </Text>
            <TextField
                label="Código de convite"
                value={code}
                onChangeText={(text) => setCode(normalizeInviteCode(text).slice(0, 6))}
                error={error}
                autoCapitalize="characters"
                autoCorrect={false}
                placeholder="EX.: K7M2QX"
                style={{ fontSize: 26, letterSpacing: 6, textAlign: "center", fontWeight: "800" }}
                returnKeyType="go"
                onSubmitEditing={handleJoin}
                autoFocus
            />
        </Screen>
    )
}
