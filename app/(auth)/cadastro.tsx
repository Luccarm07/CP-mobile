import { useState } from "react"
import { Text } from "react-native"
import { Button } from "@/components/Button"
import { Screen } from "@/components/Screen"
import { TextField } from "@/components/TextField"
import { useAuth } from "@/contexts/AuthContext"
import { useAction } from "@/hooks/useAction"
import { signUp } from "@/services/authService"
import { font, spacing } from "@/theme"
import { FieldErrors, hasErrors, validateSignUp } from "@/utils/validation"

type Field = "name" | "email" | "password" | "confirm"

export default function SignUpScreen() {
    const { refreshUser } = useAuth()
    const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" })
    const [errors, setErrors] = useState<FieldErrors<Field>>({})
    const { run, running } = useAction()

    const set = (field: Field) => (value: string) => setForm((f) => ({ ...f, [field]: value }))

    async function handleSignUp() {
        const found = validateSignUp(form)
        setErrors(found)
        if (hasErrors(found)) return
        await run(
            async () => {
                await signUp(form.name, form.email, form.password)
                // O nome é salvo logo depois de criar a conta; recarrega para a tela já mostrá-lo
                await refreshUser()
            },
            { errorTitle: "Não foi possível criar a conta" },
        )
    }

    return (
        <Screen footer={<Button title="Criar conta" onPress={handleSignUp} loading={running} />}>
            <Text style={font.title}>Criar conta</Text>
            <Text style={[font.small, { marginTop: spacing.xs, marginBottom: spacing.xl }]}>
                Seu nome aparece para o pessoal da geladeira (inclusive no Mural da Vergonha 👀).
            </Text>

            <TextField label="Nome" value={form.name} onChangeText={set("name")} error={errors.name} autoCapitalize="words" maxLength={40} />
            <TextField
                label="E-mail"
                value={form.email}
                onChangeText={set("email")}
                error={errors.email}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
            />
            <TextField
                label="Senha"
                value={form.password}
                onChangeText={set("password")}
                error={errors.password}
                hint="Mínimo de 6 caracteres"
                secureTextEntry
                autoComplete="new-password"
            />
            <TextField
                label="Confirmar senha"
                value={form.confirm}
                onChangeText={set("confirm")}
                error={errors.confirm}
                secureTextEntry
                autoComplete="new-password"
            />
        </Screen>
    )
}
