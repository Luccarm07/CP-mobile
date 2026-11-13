import { useRef, useState } from "react"
import { StyleSheet, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Link, router } from "expo-router"
import { Button } from "@/components/Button"
import { Screen } from "@/components/Screen"
import { TextField, TextFieldRef } from "@/components/TextField"
import { useAction } from "@/hooks/useAction"
import { signIn } from "@/services/authService"
import { colors, font, spacing } from "@/theme"
import { FieldErrors, hasErrors, validateLogin } from "@/utils/validation"

export default function LoginScreen() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [errors, setErrors] = useState<FieldErrors<"email" | "password">>({})
    const passwordRef = useRef<TextFieldRef>(null)
    const { run, running } = useAction()

    async function handleLogin() {
        const found = validateLogin(email, password)
        setErrors(found)
        if (hasErrors(found)) return
        // Se der certo, o AuthContext percebe o login e o layout redireciona sozinho
        await run(() => signIn(email, password), { errorTitle: "Não foi possível entrar" })
    }

    return (
        <SafeAreaView style={styles.safe}>
            <Screen>
                <View style={styles.hero}>
                    <Text style={styles.logo}>🍓🥛</Text>
                    <Text style={styles.title}>Quem Comeu{"\n"}Meu Iogurte?</Text>
                    <Text style={styles.subtitle}>
                        A geladeira compartilhada onde nada some sem confissão.
                    </Text>
                </View>

                <TextField
                    label="E-mail"
                    value={email}
                    onChangeText={setEmail}
                    error={errors.email}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    returnKeyType="next"
                    onSubmitEditing={() => passwordRef.current?.focus()}
                    placeholder="voce@email.com"
                />
                <TextField
                    ref={passwordRef}
                    label="Senha"
                    value={password}
                    onChangeText={setPassword}
                    error={errors.password}
                    secureTextEntry
                    autoComplete="password"
                    returnKeyType="go"
                    onSubmitEditing={handleLogin}
                />

                <Button title="Entrar" onPress={handleLogin} loading={running} />
                <Button
                    title="Esqueci minha senha"
                    variant="ghost"
                    onPress={() => router.push({ pathname: "/(auth)/esqueci-senha", params: { email } })}
                    style={{ marginTop: spacing.sm }}
                />

                <View style={styles.signup}>
                    <Text style={font.small}>Ainda não tem conta? </Text>
                    <Link href="/(auth)/cadastro" style={styles.link}>
                        Criar conta
                    </Link>
                </View>
            </Screen>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    hero: { alignItems: "center", marginTop: spacing.xl, marginBottom: spacing.xl },
    logo: { fontSize: 56 },
    title: { ...font.title, fontSize: 30, textAlign: "center", marginTop: spacing.sm },
    subtitle: { ...font.small, textAlign: "center", marginTop: spacing.sm, fontSize: 15 },
    signup: { flexDirection: "row", justifyContent: "center", marginTop: spacing.lg },
    link: { color: colors.primary, fontWeight: "700", fontSize: 13 },
})
