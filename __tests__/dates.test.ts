import { addDays, daysUntil, formatBrDate, isoWeek, maskBrDate, parseBrDate, toDateKey, weekFromOffset } from "@/utils/dates"

describe("datas", () => {
    it("converte Date para AAAA-MM-DD com zero à esquerda", () => {
        expect(toDateKey(new Date(2026, 0, 5))).toBe("2026-01-05")
    })

    it("lê DD/MM/AAAA e recusa datas que não existem", () => {
        expect(parseBrDate("20/11/2026")).toBe("2026-11-20")
        expect(parseBrDate("29/02/2028")).toBe("2028-02-29") // ano bissexto
        expect(parseBrDate("29/02/2027")).toBeNull()
        expect(parseBrDate("31/04/2026")).toBeNull()
        expect(parseBrDate("2026-11-20")).toBeNull()
        expect(parseBrDate("")).toBeNull()
    })

    it("formata e aplica a máscara enquanto digita", () => {
        expect(formatBrDate("2026-11-20")).toBe("20/11/2026")
        expect(maskBrDate("2")).toBe("2")
        expect(maskBrDate("201")).toBe("20/1")
        expect(maskBrDate("20112026")).toBe("20/11/2026")
        expect(maskBrDate("20/11/20269999")).toBe("20/11/2026")
    })

    it("conta os dias até a validade", () => {
        const today = new Date(2026, 10, 12, 23, 30) // horário não pode atrapalhar
        expect(daysUntil("2026-11-12", today)).toBe(0)
        expect(daysUntil("2026-11-13", today)).toBe(1)
        expect(daysUntil("2026-11-10", today)).toBe(-2)
        expect(daysUntil("2026-12-01", today)).toBe(19)
    })

    it("soma dias atravessando o mês", () => {
        expect(toDateKey(addDays(new Date(2026, 10, 28), 7))).toBe("2026-12-05")
    })

    it("calcula a semana ISO, inclusive na virada do ano", () => {
        expect(isoWeek(new Date(2026, 10, 12))).toBe("2026-W46")
        expect(isoWeek(new Date(2026, 10, 9))).toBe("2026-W46") // segunda
        expect(isoWeek(new Date(2026, 10, 15))).toBe("2026-W46") // domingo
        expect(isoWeek(new Date(2027, 0, 1))).toBe("2026-W53") // sexta 01/01/2027
        expect(isoWeek(new Date(2025, 11, 29))).toBe("2026-W01") // segunda 29/12/2025
    })

    it("navega entre semanas", () => {
        const today = new Date(2026, 10, 12)
        expect(weekFromOffset(0, today)).toEqual({ key: "2026-W46", label: "09/11 a 15/11" })
        expect(weekFromOffset(-1, today)).toEqual({ key: "2026-W45", label: "02/11 a 08/11" })
    })
})
