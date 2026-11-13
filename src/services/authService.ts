// Tudo que fala com o Firebase Authentication fica aqui (as telas não importam o Firebase).

import {
    createUserWithEmailAndPassword,
    sendEmailVerification,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    updateProfile,
    User,
} from "firebase/auth"
import { auth } from "@/config/firebase"

export async function signIn(email: string, password: string): Promise<void> {
    await signInWithEmailAndPassword(auth, email.trim(), password)
}

/**
 * Cria a conta, salva o nome no perfil do Auth (displayName) e envia o e-mail de verificação.
 * Se só o envio do e-mail falhar, a conta continua valendo: dá para reenviar pelo Perfil.
 */
export async function signUp(name: string, email: string, password: string): Promise<void> {
    const { user } = await createUserWithEmailAndPassword(auth, email.trim(), password)
    await updateProfile(user, { displayName: name.trim() })
    try {
        await sendEmailVerification(user)
    } catch {
        // não impede o cadastro
    }
}

export async function resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email.trim())
}

export async function resendVerification(): Promise<void> {
    if (auth.currentUser) await sendEmailVerification(auth.currentUser)
}

/** Busca no servidor os dados mais novos do usuário (nome, e-mail verificado...). */
export async function reloadUser(): Promise<User | null> {
    if (!auth.currentUser) return null
    await auth.currentUser.reload()
    return auth.currentUser
}

export async function signOut(): Promise<void> {
    await firebaseSignOut(auth)
}

/** Nome que aparece para os outros membros. */
export function displayNameOf(user: Pick<User, "displayName" | "email">): string {
    return user.displayName?.trim() || user.email?.split("@")[0] || "Alguém"
}
