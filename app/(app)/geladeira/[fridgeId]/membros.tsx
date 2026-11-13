import { Alert, Share, StyleSheet, Text, View } from "react-native"
import { router } from "expo-router"
import * as Clipboard from "expo-clipboard"
import { useState } from "react"
import { Button } from "@/components/Button"
import { Screen } from "@/components/Screen"
import { useCurrentUser } from "@/contexts/AuthContext"
import { useFridgeContext } from "@/contexts/FridgeContext"
import { useAction } from "@/hooks/useAction"
import { deleteFridge, leaveFridge, removeMember } from "@/services/fridgeService"
import { colors, font, radius, spacing } from "@/theme"

export default function MembersScreen() {
    const user = useCurrentUser()
    const { fridge, closingRef } = useFridgeContext()
    const [copied, setCopied] = useState(false)
    const { run, running } = useAction()
    const removing = useAction()

    if (!fridge) return null
    const isAdmin = fridge.ownerId === user.uid

    // Admin primeiro, depois em ordem alfabética
    const members = Object.entries(fridge.members)
        .map(([id, name]) => ({ id, name }))
        .sort((a, b) => (a.id === fridge.ownerId ? -1 : b.id === fridge.ownerId ? 1 : a.name.localeCompare(b.name)))

    async function copyCode() {
        await Clipboard.setStringAsync(fridge!.inviteCode)
        setCopied(true)
    }

    async function shareCode() {
        try {
            await Share.share({
                message: `Entra na geladeira "${fridge!.name}" no app Quem Comeu Meu Iogurte? 🍓🥛\nCódigo de convite: ${fridge!.inviteCode}`,
            })
        } catch {
            Alert.alert("Ops!", "Não foi possível abrir o compartilhamento. Use o botão Copiar.")
        }
    }

    function confirmRemove(memberId: string, name: string) {
        Alert.alert(`Remover ${name}?`, "A pessoa perde o acesso à geladeira. Os itens dela continuam na lista.", [
            { text: "Cancelar", style: "cancel" },
            { text: "Remover", style: "destructive", onPress: () => removing.run(() => removeMember(fridge!, memberId)) },
        ])
    }

    /** Sai da tela antes de perder o acesso, para não mostrar "sem acesso" no caminho. */
    async function closeWith(action: () => Promise<void>) {
        closingRef.current = true
        const ok = await run(action)
        if (ok) router.replace("/(app)")
        else closingRef.current = false
    }

    function confirmLeave() {
        Alert.alert("Sair da geladeira?", "Para voltar, você vai precisar do código de convite.", [
            { text: "Cancelar", style: "cancel" },
            { text: "Sair", style: "destructive", onPress: () => closeWith(() => leaveFridge(fridge!, user.uid)) },
        ])
    }

    function confirmDelete() {
        Alert.alert(
            "Excluir a geladeira?",
            `Todos os itens, confissões e o Mural de "${fridge!.name}" serão apagados para todo mundo. Não dá para desfazer.`,
            [
                { text: "Cancelar", style: "cancel" },
                { text: "Excluir tudo", style: "destructive", onPress: () => closeWith(() => deleteFridge(fridge!)) },
            ],
        )
    }

    return (
        <Screen>
            <View style={styles.codeCard}>
                <Text style={font.small}>Código de convite</Text>
                <Text style={styles.code} selectable>
                    {fridge.inviteCode}
                </Text>
                <View style={styles.row}>
                    <Button title={copied ? "✅ Copiado" : "📋 Copiar"} variant="secondary" onPress={copyCode} style={{ flex: 1 }} />
                    <Button title="📤 Enviar" onPress={shareCode} style={{ flex: 1 }} />
                </View>
            </View>

            <Text style={[font.subtitle, { marginBottom: spacing.sm }]}>
                {members.length} {members.length === 1 ? "membro" : "membros"}
            </Text>
            {members.map((m) => (
                <View key={m.id} style={styles.member}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{m.name.charAt(0).toUpperCase()}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={font.body}>
                            {m.name}
                            {m.id === user.uid ? " (você)" : ""}
                        </Text>
                        {m.id === fridge.ownerId && <Text style={styles.admin}>👑 Admin</Text>}
                    </View>
                    {isAdmin && m.id !== user.uid && (
                        <Button
                            title="Remover"
                            variant="ghost"
                            onPress={() => confirmRemove(m.id, m.name)}
                            disabled={removing.running}
                            style={{ minHeight: 36 }}
                        />
                    )}
                </View>
            ))}

            <View style={{ marginTop: spacing.xl }}>
                {isAdmin ? (
                    <Button title="🗑️ Excluir geladeira" variant="danger" onPress={confirmDelete} loading={running} />
                ) : (
                    <Button title="🚪 Sair da geladeira" variant="danger" onPress={confirmLeave} loading={running} />
                )}
            </View>
        </Screen>
    )
}

const styles = StyleSheet.create({
    codeCard: {
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        padding: spacing.lg,
        alignItems: "center",
        marginBottom: spacing.xl,
        borderWidth: 2,
        borderColor: colors.primarySoft,
        borderStyle: "dashed",
    },
    code: { fontSize: 38, fontWeight: "900", letterSpacing: 8, color: colors.primary, marginVertical: spacing.md },
    row: { flexDirection: "row", gap: spacing.sm, alignSelf: "stretch" },
    member: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        padding: spacing.md,
        marginBottom: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.mint,
        alignItems: "center",
        justifyContent: "center",
    },
    avatarText: { color: colors.white, fontWeight: "800", fontSize: 18 },
    admin: { fontSize: 12, color: colors.primaryDark, fontWeight: "700", marginTop: 2 },
})
