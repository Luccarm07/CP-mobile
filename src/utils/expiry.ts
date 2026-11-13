import { daysUntil } from "./dates"

export type ExpiryLevel = "vencido" | "vence_hoje" | "vencendo" | "ok"

/** Quantos dias antes da validade o item passa a ser "vencendo". */
export const EXPIRING_SOON_DAYS = 2

export function expiryLevel(expiresOn: string, today: Date = new Date()): ExpiryLevel {
    const days = daysUntil(expiresOn, today)
    if (days < 0) return "vencido"
    if (days === 0) return "vence_hoje"
    if (days <= EXPIRING_SOON_DAYS) return "vencendo"
    return "ok"
}

export function expiryLabel(expiresOn: string, today: Date = new Date()): string {
    const days = daysUntil(expiresOn, today)
    if (days < -1) return `Venceu há ${-days} dias`
    if (days === -1) return "Venceu ontem"
    if (days === 0) return "Vence hoje"
    if (days === 1) return "Vence amanhã"
    return `Vence em ${days} dias`
}
