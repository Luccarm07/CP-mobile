import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react"
import { onAuthStateChanged, User } from "firebase/auth"
import { auth } from "@/config/firebase"
import { reloadUser } from "@/services/authService"

interface AuthState {
    user: User | null
    /** true até o Firebase dizer se existe uma sessão salva no aparelho */
    initializing: boolean
    /** Recarrega o usuário (ex.: depois de verificar o e-mail ou trocar o nome). */
    refreshUser: () => Promise<User | null>
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [initializing, setInitializing] = useState(true)
    // O objeto User é o mesmo depois do reload(); este contador força a tela a atualizar
    const [, setVersion] = useState(0)

    useEffect(() => {
        // onAuthStateChanged dispara no login, no logout e ao abrir o app com sessão salva
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser)
            setInitializing(false)
        })
        return unsubscribe // para de escutar quando o provider sai da tela
    }, [])

    const refreshUser = useCallback(async () => {
        const fresh = await reloadUser()
        setUser(fresh)
        setVersion((v) => v + 1)
        return fresh
    }, [])

    return (
        <AuthContext.Provider value={{ user, initializing, refreshUser }}>{children}</AuthContext.Provider>
    )
}

export function useAuth(): AuthState {
    const context = useContext(AuthContext)
    if (!context) throw new Error("useAuth precisa estar dentro de <AuthProvider>")
    return context
}

/** Para telas da área logada: o layout (app) já garante que existe usuário. */
export function useCurrentUser(): User {
    const { user } = useAuth()
    if (!user) throw new Error("Nenhum usuário logado")
    return user
}
