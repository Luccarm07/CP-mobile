import { Redirect } from "expo-router"
import { LoadingState } from "@/components/States"
import { useAuth } from "@/contexts/AuthContext"

// Primeira rota: decide entre login e área logada.
export default function Index() {
    const { user, initializing } = useAuth()
    if (initializing) return <LoadingState message="Abrindo a geladeira..." />
    return <Redirect href={user ? "/(app)" : "/(auth)/login"} />
}
