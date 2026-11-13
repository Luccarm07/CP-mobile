// Itens da geladeira: fridges/{fridgeId}/items/{itemId}

import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    QueryDocumentSnapshot,
    serverTimestamp,
    Timestamp,
    Unsubscribe,
    updateDoc,
} from "firebase/firestore"
import { User } from "firebase/auth"
import { db } from "@/config/firebase"
import { Item, ItemInput } from "@/types"
import { isoWeek } from "@/utils/dates"
import { withTimeout } from "@/utils/errors"
import { displayNameOf } from "./authService"

const itemsCol = (fridgeId: string) => collection(db, "fridges", fridgeId, "items")
const itemDoc = (fridgeId: string, itemId: string) => doc(db, "fridges", fridgeId, "items", itemId)

const toDate = (value: unknown) => (value instanceof Timestamp ? value.toDate() : null)

function toItem(snap: QueryDocumentSnapshot): Item {
    // "estimate": enquanto o servidor não confirma, usa o horário local no lugar do serverTimestamp
    const data = snap.data({ serverTimestamps: "estimate" })
    return {
        id: snap.id,
        name: data.name,
        category: data.category,
        expiresOn: data.expiresOn,
        note: data.note ?? "",
        ownerId: data.ownerId,
        ownerName: data.ownerName,
        status: data.status,
        culpritId: data.culpritId ?? null,
        culpritName: data.culpritName ?? null,
        confession: data.confession ?? null,
        confessedWeek: data.confessedWeek ?? null,
        createdAt: toDate(data.createdAt),
        confessedAt: toDate(data.confessedAt),
        pendingSync: snap.metadata.hasPendingWrites,
    }
}

/**
 * Escuta os itens em tempo real. includeMetadataChanges avisa também quando uma
 * alteração feita offline finalmente chega ao servidor (some o "sincronizando").
 */
export function subscribeItems(
    fridgeId: string,
    onData: (items: Item[]) => void,
    onError: (error: unknown) => void,
): Unsubscribe {
    return onSnapshot(
        itemsCol(fridgeId),
        { includeMetadataChanges: true },
        (snap) => onData(snap.docs.map(toItem)),
        onError,
    )
}

const clean = (input: ItemInput) => ({
    name: input.name.trim(),
    category: input.category,
    expiresOn: input.expiresOn,
    note: input.note.trim(),
})

export async function addItem(fridgeId: string, input: ItemInput, user: User): Promise<void> {
    await withTimeout(
        addDoc(itemsCol(fridgeId), {
            ...clean(input),
            ownerId: user.uid,
            ownerName: displayNameOf(user),
            status: "na_geladeira",
            createdAt: serverTimestamp(),
        }),
    )
}

export async function updateItem(fridgeId: string, itemId: string, input: ItemInput): Promise<void> {
    await withTimeout(updateDoc(itemDoc(fridgeId, itemId), clean(input)))
}

export async function deleteItem(fridgeId: string, itemId: string): Promise<void> {
    await withTimeout(deleteDoc(itemDoc(fridgeId, itemId)))
}

/** O dono avisa que o item sumiu e ninguém assumiu. */
export async function reportMissing(fridgeId: string, itemId: string): Promise<void> {
    await withTimeout(
        updateDoc(itemDoc(fridgeId, itemId), { status: "sumiu", missingAt: serverTimestamp() }),
    )
}

/** Alguém confessa que comeu o item de outra pessoa. */
export async function confess(
    fridgeId: string,
    itemId: string,
    message: string,
    user: User,
): Promise<void> {
    await withTimeout(
        updateDoc(itemDoc(fridgeId, itemId), {
            status: "confessado",
            culpritId: user.uid,
            culpritName: displayNameOf(user),
            confession: message.trim(),
            confessedAt: serverTimestamp(),
            confessedWeek: isoWeek(new Date()),
        }),
    )
}

/** O dono do item dá o veredito sobre a confissão. */
export async function judge(
    fridgeId: string,
    itemId: string,
    verdict: "perdoado" | "cobrado",
): Promise<void> {
    await withTimeout(
        updateDoc(itemDoc(fridgeId, itemId), { status: verdict, judgedAt: serverTimestamp() }),
    )
}
