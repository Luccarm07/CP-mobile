import { AppError, toUserMessage, withTimeout } from "@/utils/errors"
import { generateInviteCode } from "@/utils/inviteCode"
import { INVITE_CODE_REGEX } from "@/utils/validation"

describe("mensagens de erro", () => {
    it("traduz códigos do Firebase", () => {
        expect(toUserMessage({ code: "auth/invalid-credential" })).toBe("E-mail ou senha incorretos.")
        expect(toUserMessage({ code: "auth/email-already-in-use" })).toContain("Já existe uma conta")
        expect(toUserMessage({ code: "unavailable" })).toContain("Sem conexão")
    })

    it("mantém a mensagem de AppError e tem um padrão para o resto", () => {
        expect(toUserMessage(new AppError("Código não encontrado."))).toBe("Código não encontrado.")
        expect(toUserMessage(new Error("xyz"))).toBe("Algo deu errado. Tente de novo.")
        expect(toUserMessage({ code: "codigo-desconhecido" })).toBe("Algo deu errado. Tente de novo.")
    })
})

describe("withTimeout", () => {
    afterEach(() => jest.useRealTimers())

    it("devolve o resultado quando a promessa resolve a tempo", async () => {
        await expect(withTimeout(Promise.resolve(42), 1000)).resolves.toBe(42)
    })

    it("repassa o erro original", async () => {
        await expect(withTimeout(Promise.reject({ code: "permission-denied" }), 1000)).rejects.toEqual({ code: "permission-denied" })
    })

    it("desiste quando o servidor não responde (sem internet)", async () => {
        jest.useFakeTimers()
        const pending = withTimeout(new Promise(() => {}), 5000)
        jest.advanceTimersByTime(5000)
        await expect(pending).rejects.toBeInstanceOf(AppError)
    })
})

describe("código de convite", () => {
    it("tem 6 caracteres do alfabeto sem letras ambíguas", () => {
        for (let i = 0; i < 200; i++) expect(generateInviteCode()).toMatch(INVITE_CODE_REGEX)
        expect(generateInviteCode(() => 0)).toBe("AAAAAA")
        expect(generateInviteCode(() => 0.9999)).toBe("999999")
    })
})
