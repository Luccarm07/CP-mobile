// Disponibiliza a geladeira aberta e seus itens (em tempo real) para todas as telas
// dentro de /geladeira/[fridgeId]. Assim existe UMA escuta para cada coisa, e todas
// as telas veem os mesmos dados ao mesmo tempo.

import { createContext, ReactNode, useContext, useRef } from "react"
import { useRealtime } from "@/hooks/useRealtime"
import { subscribeFridge } from "@/services/fridgeService"
import { subscribeItems } from "@/services/itemService"
import { Fridge, Item } from "@/types"

interface FridgeState {
    fridge: Fridge | null | undefined // undefined = carregando, null = sem acesso/excluída
    items: Item[]
    fridgeLoading: boolean
    fridgeError: unknown
    itemsLoading: boolean
    itemsError: unknown
    retry: () => void
    /** Marcado antes de sair/excluir, para a tela não piscar "sem acesso" no caminho. */
    closingRef: React.MutableRefObject<boolean>
}

const FridgeContext = createContext<FridgeState | null>(null)

export function FridgeProvider({ fridgeId, children }: { fridgeId: string; children: ReactNode }) {
    const closingRef = useRef(false)
    const fridgeState = useRealtime<Fridge | null>(
        (onData, onError) => subscribeFridge(fridgeId, onData, onError),
        [fridgeId],
    )
    const isMember = Boolean(fridgeState.data)
    // Só escuta os itens depois de confirmar que o usuário é membro
    const itemsState = useRealtime<Item[]>(
        (onData, onError) => (isMember ? subscribeItems(fridgeId, onData, onError) : null),
        [fridgeId, isMember],
    )

    const value: FridgeState = {
        fridge: fridgeState.data,
        items: itemsState.data ?? [],
        fridgeLoading: fridgeState.loading,
        fridgeError: fridgeState.error,
        itemsLoading: isMember && itemsState.loading && !itemsState.data,
        itemsError: itemsState.error,
        retry: () => {
            fridgeState.retry()
            itemsState.retry()
        },
        closingRef,
    }
    return <FridgeContext.Provider value={value}>{children}</FridgeContext.Provider>
}

export function useFridgeContext(): FridgeState {
    const context = useContext(FridgeContext)
    if (!context) throw new Error("useFridgeContext precisa estar dentro de <FridgeProvider>")
    return context
}
