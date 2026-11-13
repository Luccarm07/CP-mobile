// Geladeiras (grupos) e convites.
//
// Coleções:
//   fridges/{fridgeId}       -> nome, código de convite, admin e membros
//   inviteCodes/{CODIGO}     -> { fridgeId }  (atalho para achar a geladeira pelo código)

import {
    arrayRemove,
    arrayUnion,
    collection,
    deleteField,
    doc,
    DocumentSnapshot,
    getDoc,
    getDocs,
    onSnapshot,
    query,
    runTransaction,
    serverTimestamp,
    Unsubscribe,
    updateDoc,
    where,
    writeBatch,
} from "firebase/firestore"
import { User } from "firebase/auth"
import { db } from "@/config/firebase"
import { Fridge } from "@/types"
import { AppError, getErrorCode, withTimeout } from "@/utils/errors"
import { generateInviteCode } from "@/utils/inviteCode"
import { normalizeInviteCode } from "@/utils/validation"
import { displayNameOf } from "./authService"

export const MAX_MEMBERS = 30

const fridgesCol = () => collection(db, "fridges")
const fridgeDoc = (id: string) => doc(db, "fridges", id)
const inviteDoc = (code: string) => doc(db, "inviteCodes", code)

function toFridge(snap: DocumentSnapshot): Fridge {
    const data = snap.data() ?? {}
    return {
        id: snap.id,
        name: data.name ?? "",
        inviteCode: data.inviteCode ?? "",
        ownerId: data.ownerId ?? "",
        memberIds: data.memberIds ?? [],
        members: data.members ?? {},
    }
}

/** Escuta em tempo real as geladeiras das quais o usuário participa. */
export function subscribeMyFridges(
    uid: string,
    onData: (fridges: Fridge[]) => void,
    onError: (error: unknown) => void,
): Unsubscribe {
    const q = query(fridgesCol(), where("memberIds", "array-contains", uid))
    return onSnapshot(
        q,
        (snap) => onData(snap.docs.map(toFridge).sort((a, b) => a.name.localeCompare(b.name))),
        onError,
    )
}

/** Escuta uma geladeira. Devolve null se ela foi excluída ou se o usuário saiu/foi removido. */
export function subscribeFridge(
    fridgeId: string,
    onData: (fridge: Fridge | null) => void,
    onError: (error: unknown) => void,
): Unsubscribe {
    return onSnapshot(
        fridgeDoc(fridgeId),
        (snap) => onData(snap.exists() ? toFridge(snap) : null),
        (error) => {
            // Sem permissão = não é (mais) membro ou a geladeira não existe mais
            if (getErrorCode(error) === "permission-denied") onData(null)
            else onError(error)
        },
    )
}

/**
 * Cria a geladeira e reserva um código de convite único.
 * A transação garante que dois grupos nunca fiquem com o mesmo código.
 */
export async function createFridge(name: string, user: User): Promise<string> {
    for (let attempt = 0; attempt < 5; attempt++) {
        const code = generateInviteCode()
        const fridgeId = await withTimeout(
            runTransaction(db, async (tx) => {
                const codeRef = inviteDoc(code)
                if ((await tx.get(codeRef)).exists()) return null // código já usado: tenta outro

                const fridgeRef = doc(fridgesCol())
                tx.set(fridgeRef, {
                    name: name.trim(),
                    inviteCode: code,
                    ownerId: user.uid,
                    memberIds: [user.uid],
                    members: { [user.uid]: displayNameOf(user) },
                    createdAt: serverTimestamp(),
                })
                tx.set(codeRef, { fridgeId: fridgeRef.id })
                return fridgeRef.id
            }),
        )
        if (fridgeId) return fridgeId
    }
    throw new AppError("Não foi possível gerar um código de convite. Tente de novo.")
}

/** Entra em uma geladeira pelo código. Devolve o id e se o usuário já era membro. */
export async function joinFridge(
    rawCode: string,
    user: User,
): Promise<{ fridgeId: string; alreadyMember: boolean }> {
    const code = normalizeInviteCode(rawCode)
    const codeSnap = await withTimeout(getDoc(inviteDoc(code)))
    if (!codeSnap.exists()) {
        throw new AppError("Código não encontrado. Confira com quem te convidou.")
    }
    const fridgeId: string = codeSnap.data().fridgeId

    const mine = await withTimeout(
        getDocs(query(fridgesCol(), where("memberIds", "array-contains", user.uid))),
    )
    if (mine.docs.some((d) => d.id === fridgeId)) return { fridgeId, alreadyMember: true }

    try {
        // joinProof prova para as regras do Firestore que o usuário conhece o código
        await withTimeout(
            updateDoc(fridgeDoc(fridgeId), {
                memberIds: arrayUnion(user.uid),
                [`members.${user.uid}`]: displayNameOf(user),
                [`joinProof.${user.uid}`]: code,
            }),
        )
    } catch (error) {
        if (getErrorCode(error) === "permission-denied") {
            throw new AppError(
                `Não foi possível entrar. A geladeira pode estar lotada (máximo de ${MAX_MEMBERS} pessoas) ou ter sido excluída.`,
            )
        }
        throw error
    }
    return { fridgeId, alreadyMember: false }
}

/** O próprio usuário sai da geladeira (o admin não pode sair, só excluir). */
export async function leaveFridge(fridge: Fridge, uid: string): Promise<void> {
    if (fridge.ownerId === uid) {
        throw new AppError("Você é o admin. Para sair, exclua a geladeira.")
    }
    await removeFromFridge(fridge.id, uid)
}

/** O admin remove outro membro. */
export async function removeMember(fridge: Fridge, memberId: string): Promise<void> {
    if (memberId === fridge.ownerId) throw new AppError("O admin não pode ser removido.")
    await removeFromFridge(fridge.id, memberId)
}

async function removeFromFridge(fridgeId: string, memberId: string) {
    await withTimeout(
        updateDoc(fridgeDoc(fridgeId), {
            memberIds: arrayRemove(memberId),
            [`members.${memberId}`]: deleteField(),
        }),
    )
}

/**
 * Exclui a geladeira inteira (só o admin). O Firestore não apaga subcoleções sozinho,
 * então apagamos os itens em lotes (writeBatch aceita até 500 operações) antes do grupo.
 */
export async function deleteFridge(fridge: Fridge): Promise<void> {
    const items = await withTimeout(getDocs(collection(db, "fridges", fridge.id, "items")))
    const BATCH_SIZE = 400
    for (let i = 0; i < items.docs.length; i += BATCH_SIZE) {
        const batch = writeBatch(db)
        items.docs.slice(i, i + BATCH_SIZE).forEach((d) => batch.delete(d.ref))
        await withTimeout(batch.commit())
    }
    const batch = writeBatch(db)
    batch.delete(inviteDoc(fridge.inviteCode))
    batch.delete(fridgeDoc(fridge.id))
    await withTimeout(batch.commit())
}
