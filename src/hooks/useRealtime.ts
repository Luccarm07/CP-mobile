import { DependencyList, useCallback, useEffect, useState } from "react"
import { Unsubscribe } from "firebase/firestore"

export interface RealtimeState<T> {
    data: T | undefined
    loading: boolean
    error: unknown
    /** Recria a escuta (botão "Tentar de novo"). */
    retry: () => void
}

/**
 * Hook genérico para qualquer escuta em tempo real do Firestore (onSnapshot).
 * Cuida dos três estados (carregando, erro, dados) e cancela a escuta ao sair da tela,
 * para não vazar memória nem gastar leituras à toa.
 */
export function useRealtime<T>(
    subscribe: (onData: (data: T) => void, onError: (error: unknown) => void) => Unsubscribe | null,
    deps: DependencyList,
): RealtimeState<T> {
    const [data, setData] = useState<T>()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<unknown>(null)
    const [attempt, setAttempt] = useState(0)

    useEffect(() => {
        setLoading(true)
        setError(null)
        const unsubscribe = subscribe(
            (value) => {
                setData(value)
                setError(null)
                setLoading(false)
            },
            (err) => {
                setError(err)
                setLoading(false)
            },
        )
        if (!unsubscribe) setLoading(false)
        return () => unsubscribe?.()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [...deps, attempt])

    const retry = useCallback(() => setAttempt((a) => a + 1), [])
    return { data, loading, error, retry }
}
