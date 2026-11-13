// Quem pode fazer o quê com um item. Espelha as regras do Firestore (firestore.rules):
// a tela usa isto para mostrar só os botões permitidos, e o servidor garante de verdade.

import { Category, Fridge, Item, ItemStatus } from "@/types"

export interface ItemActions {
    canEdit: boolean
    canReportMissing: boolean
    canConfess: boolean
    canJudge: boolean
    canDelete: boolean
}

export function getItemActions(item: Item, fridge: Fridge, uid: string): ItemActions {
    const isItemOwner = item.ownerId === uid
    const isAdmin = fridge.ownerId === uid
    return {
        canEdit: isItemOwner && item.status === "na_geladeira",
        canReportMissing: isItemOwner && item.status === "na_geladeira",
        canConfess: !isItemOwner && (item.status === "na_geladeira" || item.status === "sumiu"),
        canJudge: isItemOwner && item.status === "confessado",
        canDelete:
            isAdmin || (isItemOwner && (item.status === "na_geladeira" || item.status === "sumiu")),
    }
}

export const STATUS_INFO: Record<ItemStatus, { label: string; emoji: string }> = {
    na_geladeira: { label: "Na geladeira", emoji: "🧊" },
    sumiu: { label: "Sumiu! Ninguém confessou", emoji: "🕵️" },
    confessado: { label: "Confessado, aguardando veredito", emoji: "🙊" },
    perdoado: { label: "Perdoado", emoji: "😇" },
    cobrado: { label: "Cobrado: vai ter que repor", emoji: "💸" },
}

export const CATEGORY_INFO: Record<Category, { label: string; emoji: string }> = {
    laticinio: { label: "Laticínio", emoji: "🥛" },
    marmita: { label: "Marmita", emoji: "🍱" },
    doce: { label: "Doce", emoji: "🍫" },
    bebida: { label: "Bebida", emoji: "🥤" },
    fruta: { label: "Fruta", emoji: "🍎" },
    outro: { label: "Outro", emoji: "🧀" },
}

