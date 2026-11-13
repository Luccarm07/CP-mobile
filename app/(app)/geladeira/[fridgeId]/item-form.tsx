// Cadastro e edição de item (a mesma tela serve para os dois: com itemId, edita).

import { useState } from "react"
import { Text, View } from "react-native"
import { router, Stack, useLocalSearchParams } from "expo-router"
import { Button } from "@/components/Button"
import { Chip } from "@/components/Chip"
import { Screen } from "@/components/Screen"
import { EmptyState } from "@/components/States"
import { TextField } from "@/components/TextField"
import { useCurrentUser } from "@/contexts/AuthContext"
import { useFridgeContext } from "@/contexts/FridgeContext"
import { useAction } from "@/hooks/useAction"
import { addItem, updateItem } from "@/services/itemService"
import { Category, ItemInput } from "@/types"
import { colors, spacing } from "@/theme"
import { addDays, formatBrDate, maskBrDate, parseBrDate, toDateKey } from "@/utils/dates"
import { CATEGORY_INFO } from "@/utils/itemRules"
import { CATEGORIES, FieldErrors, hasErrors, ItemForm, validateItem } from "@/utils/validation"

const QUICK_DATES = [
    { label: "Hoje", days: 0 },
    { label: "Amanhã", days: 1 },
    { label: "+3 dias", days: 3 },
    { label: "+1 semana", days: 7 },
]

export default function ItemFormScreen() {
    const user = useCurrentUser()
    const { fridgeId, itemId } = useLocalSearchParams<{ fridgeId: string; itemId?: string }>()
    const { items } = useFridgeContext()
    const editing = itemId ? items.find((i) => i.id === itemId) : undefined

    const [form, setForm] = useState<ItemForm>(() => ({
        name: editing?.name ?? "",
        category: editing?.category ?? null,
        expiresOnText: editing ? formatBrDate(editing.expiresOn) : "",
        note: editing?.note ?? "",
    }))
    const [errors, setErrors] = useState<FieldErrors<"name" | "category" | "expiresOn" | "note">>({})
    const { run, running } = useAction()

    // Editando um item que sumiu da lista, mudou de situação ou não é seu
    if (itemId && (!editing || editing.status !== "na_geladeira" || editing.ownerId !== user.uid)) {
        return (
            <>
                <Stack.Screen options={{ title: "Editar item" }} />
                <EmptyState emoji="🤷" title="Não dá para editar" message="Este item foi excluído, confessado ou não é seu.">
                    <Button title="Voltar" onPress={() => router.back()} style={{ marginTop: spacing.lg, alignSelf: "stretch" }} />
                </EmptyState>
            </>
        )
    }

    const set = <K extends keyof ItemForm>(key: K, value: ItemForm[K]) => setForm((f) => ({ ...f, [key]: value }))

    async function handleSave() {
        const found = validateItem(form)
        setErrors(found)
        if (hasErrors(found)) return
        const input: ItemInput = {
            name: form.name,
            category: form.category as Category,
            expiresOn: parseBrDate(form.expiresOnText) as string,
            note: form.note,
        }
        const ok = await run(
            () => (editing ? updateItem(fridgeId, editing.id, input) : addItem(fridgeId, input, user)),
            { errorTitle: "Não foi possível salvar" },
        )
        if (ok) router.back()
    }

    const typedDate = parseBrDate(form.expiresOnText)
    const isPast = typedDate !== null && typedDate < toDateKey(new Date())

    return (
        <Screen footer={<Button title={editing ? "Salvar alterações" : "Guardar na geladeira"} onPress={handleSave} loading={running} />}>
            <Stack.Screen options={{ title: editing ? "Editar item" : "Guardar item" }} />

            <TextField
                label="O que é?"
                value={form.name}
                onChangeText={(v) => set("name", v)}
                error={errors.name}
                placeholder="Ex.: Iogurte de morango"
                maxLength={40}
            />

            <Text style={{ fontSize: 14, fontWeight: "600", color: colors.text, marginBottom: spacing.xs }}>Categoria</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.xs }}>
                {CATEGORIES.map((c) => (
                    <Chip
                        key={c}
                        label={`${CATEGORY_INFO[c].emoji} ${CATEGORY_INFO[c].label}`}
                        selected={form.category === c}
                        onPress={() => set("category", c)}
                    />
                ))}
            </View>
            <Text style={{ color: colors.danger, fontSize: 13, marginBottom: spacing.md }}>{errors.category ?? ""}</Text>

            <TextField
                label="Validade"
                value={form.expiresOnText}
                onChangeText={(v) => set("expiresOnText", maskBrDate(v))}
                error={errors.expiresOn}
                hint={isPast ? "⚠️ Essa data já passou, mas tudo bem se for de propósito." : "DD/MM/AAAA"}
                keyboardType="number-pad"
                placeholder="DD/MM/AAAA"
                maxLength={10}
            />
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.lg, marginTop: -spacing.xs }}>
                {QUICK_DATES.map((q) => {
                    const text = formatBrDate(toDateKey(addDays(new Date(), q.days)))
                    return (
                        <Chip key={q.label} label={q.label} selected={form.expiresOnText === text} onPress={() => set("expiresOnText", text)} />
                    )
                })}
            </View>

            <TextField
                label="Recado (opcional)"
                value={form.note}
                onChangeText={(v) => set("note", v)}
                error={errors.note}
                hint={`${form.note.length}/120`}
                placeholder="Ex.: É pra amanhã cedo, NÃO MEXA 😤"
                maxLength={120}
                multiline
            />
        </Screen>
    )
}
