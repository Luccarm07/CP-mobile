// Funções de data. Todas trabalham no fuso do aparelho e com strings simples
// (AAAA-MM-DD), que são fáceis de comparar e de validar nas regras do Firestore.

const pad = (n: number) => String(n).padStart(2, "0")

/** Date -> "AAAA-MM-DD" */
export function toDateKey(date: Date): string {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/** "AAAA-MM-DD" -> Date (meia-noite local) */
export function fromDateKey(key: string): Date {
    const [y, m, d] = key.split("-").map(Number)
    return new Date(y, m - 1, d)
}

/** Soma (ou subtrai) dias de uma data. */
export function addDays(date: Date, days: number): Date {
    const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    copy.setDate(copy.getDate() + days)
    return copy
}

/**
 * Converte o que o usuário digitou ("DD/MM/AAAA") para "AAAA-MM-DD".
 * Devolve null se a data não existir (ex.: 31/02/2026).
 */
export function parseBrDate(text: string): string | null {
    const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(text.trim())
    if (!match) return null
    const [, d, m, y] = match.map(Number)
    const date = new Date(y, m - 1, d)
    const exists = date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d
    return exists ? toDateKey(date) : null
}

/** "AAAA-MM-DD" -> "DD/MM/AAAA" */
export function formatBrDate(key: string): string {
    const [y, m, d] = key.split("-")
    return `${d}/${m}/${y}`
}

/** Aplica a máscara DD/MM/AAAA enquanto o usuário digita. */
export function maskBrDate(text: string): string {
    const digits = text.replace(/\D/g, "").slice(0, 8)
    if (digits.length <= 2) return digits
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
}

/** Dias entre hoje e a data (negativo = já passou). */
export function daysUntil(key: string, today: Date = new Date()): number {
    const ms = fromDateKey(key).getTime() - fromDateKey(toDateKey(today)).getTime()
    return Math.round(ms / 86_400_000)
}

/** Semana ISO 8601 (segunda a domingo), ex.: "2026-W46". */
export function isoWeek(date: Date): string {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    const weekday = d.getUTCDay() || 7 // domingo vira 7
    d.setUTCDate(d.getUTCDate() + 4 - weekday) // a quinta-feira define o ano da semana
    const yearStart = Date.UTC(d.getUTCFullYear(), 0, 1)
    const week = Math.ceil(((d.getTime() - yearStart) / 86_400_000 + 1) / 7)
    return `${d.getUTCFullYear()}-W${pad(week)}`
}

/** Segunda-feira da semana de `date`. */
export function mondayOf(date: Date): Date {
    const weekday = date.getDay() || 7
    return addDays(date, 1 - weekday)
}

/** Semana deslocada a partir da atual (0 = esta semana, -1 = semana passada...). */
export function weekFromOffset(offset: number, today: Date = new Date()) {
    const monday = addDays(mondayOf(today), offset * 7)
    const sunday = addDays(monday, 6)
    const short = (d: Date) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`
    return { key: isoWeek(monday), label: `${short(monday)} a ${short(sunday)}` }
}
