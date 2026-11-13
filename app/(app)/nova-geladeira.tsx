import { useState } from "react"
import { Text, View } from "react-native"
import { router } from "expo-router"
import { Button } from "@/components/Button"
import { Chip } from "@/components/Chip"
import { Screen } from "@/components/Screen"
import { TextField } from "@/components/TextField"
import { useCurrentUser } from "@/contexts/AuthContext"
import { useAction } from "@/hooks/useAction"
import { createFridge } from "@/services/fridgeService"
import { font, spacing } from "@/theme"
import { validateFridgeName } from "@/utils/validation"

const SUGGESTIONS = ["Rep. Casa Verde", "Geladeira do Escritório", "Lá de Casa", "Copa do 3º andar"]

export default function NewFridgeScreen() {
    const user = useCurrentUser()
    const [name, setName] = useState("")
    const [error, setError] = useState<string>()
    const { run, running } = useAction()

    async function handleCreate() {
        const found = validateFridgeName(name)
        setError(found)
        if (found) return
        let fridgeId = ""
        const ok = await run(async () => {
            fridgeId = await createFridge(name, user)
        }, { errorTitle: "Não foi possível criar" })
        if (ok) {
            // Troca o modal pela geladeira recém-criada (ela mostra o convite enquanto só tem você)
            router.replace({ pathname: "/(app)/geladeira/[fridgeId]", params: { fridgeId } })
        }
    }

    return (
        <Screen footer={<Button title="Criar geladeira" onPress={handleCreate} loading={running} />}>
            <Text style={[font.small, { marginBottom: spacing.lg }]}>
                Você vira o admin: recebe um código para convidar o pessoal e pode remover membros.
            </Text>
            <TextField
                label="Nome da geladeira"
                value={name}
                onChangeText={setName}
                error={error}
                maxLength={40}
                placeholder="Ex.: República Toca do Tatu"
                autoFocus
            />
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
                {SUGGESTIONS.map((s) => (
                    <Chip key={s} label={s} selected={name === s} onPress={() => setName(s)} />
                ))}
            </View>
        </Screen>
    )
}
