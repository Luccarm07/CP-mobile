// Validações feitas ANTES de chamar o Firebase. Cada função devolve um objeto
// com a mensagem de erro de cada campo (vazio = tudo certo).

import { Category } from "@/types"
import { parseBrDate } from "./dates"

export type FieldErrors<K extends string> = Partial<Record<K, string>>

export const hasErrors = (errors: object) => Object.values(errors).some(Boolean)

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function validateEmail(email: string): string | undefined {
    if (!email.trim()) return "Informe o e-mail."
    if (!EMAIL_REGEX.test(email.trim())) return "E-mail inválido."
    return undefined
}

export function validateLogin(email: string, password: string): FieldErrors<"email" | "password"> {
    return {
        email: validateEmail(email),
        password: password ? undefined : "Informe a senha.",
    }
}

export function validateSignUp(input: {
    name: string
    email: string
    password: string
    confirm: string
}): FieldErrors<"name" | "email" | "password" | "confirm"> {
    const name = input.name.trim()
    return {
        name: !name ? "Informe seu nome." : name.length > 40 ? "Use no máximo 40 caracteres." : undefined,
        email: validateEmail(input.email),
        password:
            input.password.length < 6
                ? "A senha precisa ter pelo menos 6 caracteres."
                : undefined,
        confirm: input.confirm !== input.password ? "As senhas não são iguais." : undefined,
    }
}

export function validateFridgeName(name: string): string | undefined {
    const value = name.trim()
    if (!value) return "Dê um nome para a geladeira."
    if (value.length > 40) return "Use no máximo 40 caracteres."
    return undefined
}

/** Código de convite: 6 caracteres, letras maiúsculas e números (sem 0, 1, I e O). */
export const INVITE_CODE_REGEX = /^[A-HJ-NP-Z2-9]{6}$/

export function normalizeInviteCode(code: string): string {
    return code.toUpperCase().replace(/[^A-Z0-9]/g, "")
}

export function validateInviteCode(code: string): string | undefined {
    const value = normalizeInviteCode(code)
    if (!value) return "Digite o código de convite."
    if (!INVITE_CODE_REGEX.test(value)) return "O código tem 6 caracteres (letras e números)."
    return undefined
}

export const CATEGORIES: Category[] = ["laticinio", "marmita", "doce", "bebida", "fruta", "outro"]

export interface ItemForm {
    name: string
    category: Category | null
    expiresOnText: string // DD/MM/AAAA, como o usuário digitou
    note: string
}

export function validateItem(form: ItemForm): FieldErrors<"name" | "category" | "expiresOn" | "note"> {
    const name = form.name.trim()
    return {
        name: !name ? "O que é o item?" : name.length > 40 ? "Use no máximo 40 caracteres." : undefined,
        category: form.category && CATEGORIES.includes(form.category) ? undefined : "Escolha uma categoria.",
        expiresOn: !form.expiresOnText.trim()
            ? "Informe a validade."
            : parseBrDate(form.expiresOnText)
              ? undefined
              : "Data inválida. Use DD/MM/AAAA.",
        note: form.note.trim().length > 120 ? "Use no máximo 120 caracteres." : undefined,
    }
}

export const CONFESSION_MAX = 140
