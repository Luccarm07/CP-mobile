import { hasErrors, normalizeInviteCode, validateEmail, validateFridgeName, validateInviteCode, validateItem, validateLogin, validateSignUp } from "@/utils/validation"

describe("validações de formulário", () => {
    it("valida e-mail", () => {
        expect(validateEmail("")).toBe("Informe o e-mail.")
        expect(validateEmail("ana@")).toBe("E-mail inválido.")
        expect(validateEmail(" ana@fiap.com.br ")).toBeUndefined()
    })

    it("login exige e-mail e senha", () => {
        expect(hasErrors(validateLogin("", ""))).toBe(true)
        expect(hasErrors(validateLogin("ana@fiap.com", "123456"))).toBe(false)
    })

    it("cadastro confere nome, senha mínima e confirmação", () => {
        const ok = { name: "Ana", email: "ana@fiap.com", password: "123456", confirm: "123456" }
        expect(hasErrors(validateSignUp(ok))).toBe(false)
        expect(validateSignUp({ ...ok, name: "   " }).name).toBeDefined()
        expect(validateSignUp({ ...ok, password: "123", confirm: "123" }).password).toBeDefined()
        expect(validateSignUp({ ...ok, confirm: "654321" }).confirm).toBe("As senhas não são iguais.")
    })

    it("nome da geladeira", () => {
        expect(validateFridgeName(" ")).toBeDefined()
        expect(validateFridgeName("x".repeat(41))).toBeDefined()
        expect(validateFridgeName("Rep. Toca do Tatu")).toBeUndefined()
    })

    it("código de convite: normaliza e valida", () => {
        expect(normalizeInviteCode(" k7m-2qx ")).toBe("K7M2QX")
        expect(validateInviteCode("")).toBeDefined()
        expect(validateInviteCode("K7M2Q")).toBeDefined()
        expect(validateInviteCode("K7M2Q0")).toBeDefined() // 0 não existe no alfabeto
        expect(validateInviteCode("k7m2qx")).toBeUndefined()
    })

    it("item: nome, categoria, data válida e recado curto", () => {
        const ok = { name: "Iogurte", category: "laticinio" as const, expiresOnText: "20/11/2026", note: "" }
        expect(hasErrors(validateItem(ok))).toBe(false)
        expect(validateItem({ ...ok, name: "" }).name).toBeDefined()
        expect(validateItem({ ...ok, category: null }).category).toBeDefined()
        expect(validateItem({ ...ok, expiresOnText: "31/02/2026" }).expiresOn).toBe("Data inválida. Use DD/MM/AAAA.")
        expect(validateItem({ ...ok, note: "a".repeat(121) }).note).toBeDefined()
    })
})
