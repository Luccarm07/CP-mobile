// Tipos compartilhados pelo app inteiro.

/** Situação de um item dentro da geladeira. */
export type ItemStatus =
    | "na_geladeira" // está lá, intacto
    | "sumiu" // o dono procurou e não achou (mistério!)
    | "confessado" // alguém confessou que comeu, aguardando o veredito do dono
    | "perdoado" // o dono perdoou o culpado
    | "cobrado" // o dono cobrou o culpado (vai ter que repor)

export type Category = "laticinio" | "marmita" | "doce" | "bebida" | "fruta" | "outro"

export interface Fridge {
    id: string
    name: string
    inviteCode: string
    ownerId: string
    memberIds: string[]
    /** uid -> nome de exibição de cada membro */
    members: Record<string, string>
}

export interface Item {
    id: string
    name: string
    category: Category
    /** Data de validade no formato AAAA-MM-DD */
    expiresOn: string
    note: string
    ownerId: string
    ownerName: string
    status: ItemStatus
    culpritId: string | null
    culpritName: string | null
    confession: string | null
    /** Semana ISO da confissão (ex.: 2026-W46), usada no Mural da Vergonha */
    confessedWeek: string | null
    createdAt: Date | null
    confessedAt: Date | null
    /** true enquanto a alteração ainda não chegou ao servidor (ex.: sem internet) */
    pendingSync: boolean
}

/** Campos que o usuário preenche ao cadastrar/editar um item. */
export interface ItemInput {
    name: string
    category: Category
    expiresOn: string
    note: string
}
