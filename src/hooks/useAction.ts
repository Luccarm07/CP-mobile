import { useCallback, useRef, useState } from "react"
import { Alert } from "react-native"
import { toUserMessage } from "@/utils/errors"

/**
 * Executa uma ação assíncrona (salvar, excluir, confessar...) controlando o "carregando"
 * e mostrando o erro traduzido. Ignora cliques repetidos enquanto a ação está rodando.
 */
export function useAction() {
    const [running, setRunning] = useState(false)
    const busy = useRef(false)

    const run = useCallback(
        async (action: () => Promise<void>, options: { errorTitle?: string } = {}): Promise<boolean> => {
            if (busy.current) return false
            busy.current = true
            setRunning(true)
            try {
                await action()
                return true
            } catch (error) {
                Alert.alert(options.errorTitle ?? "Ops!", toUserMessage(error))
                return false
            } finally {
                busy.current = false
                setRunning(false)
            }
        },
        [],
    )

    return { run, running }
}
