import { buildWeeklyRanking, titleFor } from "@/utils/ranking"
import { makeItem } from "../test-utils/factories"

const W = "2026-W46"

describe("Mural da Vergonha", () => {
    const items = [
        makeItem({ id: "1", status: "perdoado", culpritId: "beto", culpritName: "Beto", confessedWeek: W, category: "doce" }),
        makeItem({ id: "2", status: "cobrado", culpritId: "beto", culpritName: "Beto", confessedWeek: W, category: "doce" }),
        makeItem({ id: "3", status: "confessado", culpritId: "carla", culpritName: "Carla", confessedWeek: W }),
        makeItem({ id: "4", status: "cobrado", culpritId: "carla", culpritName: "Carla", confessedWeek: "2026-W45" }),
        makeItem({ id: "5", status: "sumiu" }),
        makeItem({ id: "6", status: "sumiu" }),
        makeItem({ id: "7" }),
    ]

    it("conta só as confissões da semana escolhida e ordena pelo total", () => {
        const r = buildWeeklyRanking(items, W)
        expect(r.totalConfessions).toBe(3)
        expect(r.culprits.map((c) => [c.name, c.total])).toEqual([
            ["Beto", 2],
            ["Carla", 1],
        ])
        expect(r.culprits[0]).toMatchObject({ forgiven: 1, charged: 1, pending: 0 })
        expect(r.culprits[1]).toMatchObject({ pending: 1 })
    })

    it("mostra mistérios abertos e a categoria mais atacada", () => {
        const r = buildWeeklyRanking(items, W)
        expect(r.openMysteries).toBe(2)
        expect(r.favoriteCategory).toBe("doce")
    })

    it("semana sem confissões fica vazia", () => {
        const r = buildWeeklyRanking(items, "2026-W40")
        expect(r.culprits).toEqual([])
        expect(r.favoriteCategory).toBeNull()
    })

    it("dá títulos aos primeiros colocados", () => {
        expect(titleFor(0)).toContain("Rato de Geladeira")
        expect(titleFor(7)).toContain("Aprendiz")
    })
})
