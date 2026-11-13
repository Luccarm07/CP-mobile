import { useState } from "react"
import { Alert, StyleSheet, Text, View } from "react-native"
import { router, useLocalSearchParams } from "expo-router"
import { Button } from "@/components/Button"
import { Screen } from "@/components/Screen"
import { Banner, EmptyState } from "@/components/States"
import { TextField } from "@/components/TextField"
import { useCurrentUser } from "@/contexts/AuthContext"
import { useFridgeContext } from "@/contexts/FridgeContext"
import { useAction } from "@/hooks/useAction"
import { confess, deleteItem, judge, reportMissing } from "@/services/itemService"
import { colors, font, radius, spacing } from "@/theme"
import { formatBrDate } from "@/utils/dates"
import { expiryLabel } from "@/utils/expiry"
import { CATEGORY_INFO, getItemActions, STATUS_INFO } from "@/utils/itemRules"
import { CONFESSION_MAX } from "@/utils/validation"

export default function ItemDetailScreen() {
    const user = useCurrentUser()
    const { fridgeId, itemId } = useLocalSearchParams<{ fridgeId: string; itemId: string }>()
    const { fridge, items } = useFridgeContext()
    const item = items.find((i) => i.id === itemId)
    const [confessing, setConfessing] = useState(false)
    const [message, setMessage] = useState("")
    const [feedback, setFeedback] = useState<string | null>(null)
    const { run, running } = useAction()
    const deleting = useAction()

    // Como a lista é em tempo real, o item pode ser excluído enquanto a tela está aberta
    if (!item || !fridge) {
        return (
            <EmptyState emoji="💨" title="Este item não existe mais" message="Alguém tirou ele da geladeira.">
                <Button title="Voltar" onPress={() => router.back()} style={{ marginTop: spacing.lg, alignSelf: "stretch" }} />
            </EmptyState>
        )
    }

    const actions = getItemActions(item, fridge, user.uid)
    const category = CATEGORY_INFO[item.category] ?? CATEGORY_INFO.outro
    const status = STATUS_INFO[item.status]
    const isMine = item.ownerId === user.uid

    async function handleConfess() {
        const ok = await run(() => confess(fridgeId, item!.id, message, user), { errorTitle: "Não deu para confessar" })
        if (ok) {
            setConfessing(false)
            setMessage("")
            setFeedback("Confissão registrada. A verdade liberta! 🙏 Agora é com o dono.")
        }
    }

    function confirmMissing() {
        Alert.alert("O item sumiu? 🕵️", "Todo mundo da geladeira vai ver que ele desapareceu. O culpado ainda pode confessar.", [
            { text: "Cancelar", style: "cancel" },
            {
                text: "Sumiu!",
                onPress: async () => {
                    const ok = await run(() => reportMissing(fridgeId, item!.id))
                    if (ok) setFeedback("Caso aberto. Vamos ver se alguém confessa...")
                },
            },
        ])
    }

    async function handleJudge(verdict: "perdoado" | "cobrado") {
        const ok = await run(() => judge(fridgeId, item!.id, verdict))
        if (ok) setFeedback(verdict === "perdoado" ? "Perdoado. Que coração bom! 😇" : "Cobrança registrada. Que reponha! 💸")
    }

    function confirmDelete() {
        const asAdmin = !isMine
        Alert.alert(
            asAdmin ? "Jogar fora este item?" : "Tirar da geladeira?",
            asAdmin ? `O item de ${item!.ownerName} será excluído para todos.` : "O item será excluído da lista.",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Excluir",
                    style: "destructive",
                    onPress: async () => {
                        const ok = await deleting.run(() => deleteItem(fridgeId, item!.id), { errorTitle: "Não foi possível excluir" })
                        if (ok) router.back()
                    },
                },
            ],
        )
    }

    return (
        <Screen>
            <View style={styles.header}>
                <Text style={styles.emoji}>{category.emoji}</Text>
                <Text style={[font.title, { textAlign: "center" }]}>{item.name}</Text>
                <Text style={font.small}>
                    {category.label} · {isMine ? "seu" : `de ${item.ownerName}`}
                </Text>
                <Text style={styles.status}>
                    {status.emoji} {status.label}
                </Text>
                {item.pendingSync && <Text style={font.small}>⏳ Aguardando internet para sincronizar</Text>}
            </View>

            {feedback && <Banner tone="success" text={feedback} />}

            <View style={styles.card}>
                <Row label="Validade" value={`${formatBrDate(item.expiresOn)} (${expiryLabel(item.expiresOn)})`} />
                {item.note ? <Row label="Recado do dono" value={`“${item.note}”`} /> : null}
                {item.createdAt && <Row label="Guardado em" value={item.createdAt.toLocaleDateString("pt-BR")} />}
            </View>

            {item.culpritName && (
                <View style={[styles.card, { backgroundColor: colors.primarySoft, borderColor: colors.primarySoft }]}>
                    <Text style={font.subtitle}>🙊 Confissão</Text>
                    <Text style={[font.body, { marginTop: spacing.xs }]}>
                        <Text style={{ fontWeight: "800" }}>{item.culpritId === user.uid ? "Você" : item.culpritName}</Text> admitiu que comeu
                        {item.confessedAt ? ` em ${item.confessedAt.toLocaleDateString("pt-BR")}` : ""}.
                    </Text>
                    {item.confession ? <Text style={styles.quote}>“{item.confession}”</Text> : null}
                </View>
            )}

            {/* Ações: cada botão só aparece para quem pode usar (as regras do Firestore garantem) */}
            {actions.canJudge && (
                <View style={styles.actions}>
                    <Text style={font.subtitle}>Qual o veredito?</Text>
                    <View style={styles.row}>
                        <Button title="😇 Perdoar" variant="mint" onPress={() => handleJudge("perdoado")} disabled={running} style={{ flex: 1 }} />
                        <Button title="💸 Cobrar" onPress={() => handleJudge("cobrado")} disabled={running} style={{ flex: 1 }} />
                    </View>
                </View>
            )}

            {actions.canConfess &&
                (confessing ? (
                    <View style={styles.actions}>
                        <TextField
                            label="Quer deixar um recado pro dono? (opcional)"
                            value={message}
                            onChangeText={setMessage}
                            maxLength={CONFESSION_MAX}
                            hint={`${message.length}/${CONFESSION_MAX}`}
                            placeholder="Ex.: Tava com fome, amanhã compro outro 🙏"
                            multiline
                            autoFocus
                        />
                        <Button title="🙊 Confirmar confissão" onPress={handleConfess} loading={running} />
                        <Button title="Cancelar" variant="ghost" onPress={() => setConfessing(false)} />
                    </View>
                ) : (
                    <Button
                        title={item.status === "sumiu" ? "🙋 Fui eu! Quero confessar" : "🙊 Comi! Quero confessar"}
                        onPress={() => setConfessing(true)}
                        style={{ marginBottom: spacing.sm }}
                    />
                ))}

            {actions.canEdit && (
                <Button
                    title="✏️ Editar"
                    variant="secondary"
                    onPress={() => router.push({ pathname: "/(app)/geladeira/[fridgeId]/item-form", params: { fridgeId, itemId: item.id } })}
                    style={{ marginBottom: spacing.sm }}
                />
            )}
            {actions.canReportMissing && (
                <Button title="🕵️ Sumiu! Alguém pegou" variant="secondary" onPress={confirmMissing} loading={running} style={{ marginBottom: spacing.sm }} />
            )}
            {actions.canDelete && (
                <Button
                    title={isMine ? "🗑️ Tirar da geladeira" : "🗑️ Jogar fora (admin)"}
                    variant="danger"
                    onPress={confirmDelete}
                    loading={deleting.running}
                />
            )}

            {(item.status === "perdoado" || item.status === "cobrado") && (
                <Text style={[font.small, { textAlign: "center", marginTop: spacing.md }]}>
                    Caso encerrado. Ele continua no Mural da Vergonha desta semana.
                </Text>
            )}
        </Screen>
    )
}

function Row({ label, value }: { label: string; value: string }) {
    return (
        <View style={{ marginBottom: spacing.sm }}>
            <Text style={font.small}>{label}</Text>
            <Text style={font.body}>{value}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    header: { alignItems: "center", marginBottom: spacing.lg, gap: spacing.xs },
    emoji: { fontSize: 64 },
    status: {
        marginTop: spacing.sm,
        backgroundColor: colors.surface,
        borderRadius: radius.pill,
        paddingHorizontal: spacing.md,
        paddingVertical: 6,
        fontWeight: "700",
        color: colors.text,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: colors.border,
    },
    card: {
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        padding: spacing.lg,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    quote: { fontStyle: "italic", marginTop: spacing.sm, color: colors.primaryDark, fontSize: 15 },
    actions: { gap: spacing.sm, marginBottom: spacing.md },
    row: { flexDirection: "row", gap: spacing.sm },
})
