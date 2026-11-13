import { expiryLabel, expiryLevel } from "@/utils/expiry"

const today = new Date(2026, 10, 12)

describe("validade", () => {
    it("classifica o nível de urgência", () => {
        expect(expiryLevel("2026-11-11", today)).toBe("vencido")
        expect(expiryLevel("2026-11-12", today)).toBe("vence_hoje")
        expect(expiryLevel("2026-11-14", today)).toBe("vencendo")
        expect(expiryLevel("2026-11-15", today)).toBe("ok")
    })

    it("gera textos amigáveis", () => {
        expect(expiryLabel("2026-11-09", today)).toBe("Venceu há 3 dias")
        expect(expiryLabel("2026-11-11", today)).toBe("Venceu ontem")
        expect(expiryLabel("2026-11-12", today)).toBe("Vence hoje")
        expect(expiryLabel("2026-11-13", today)).toBe("Vence amanhã")
        expect(expiryLabel("2026-11-17", today)).toBe("Vence em 5 dias")
    })
})
