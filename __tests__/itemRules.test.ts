import { getItemActions } from "@/utils/itemRules"
import { makeFridge, makeItem } from "../test-utils/factories"

const fridge = makeFridge()

describe("quem pode fazer o quê com um item", () => {
    it("dono de item na geladeira: edita, avisa sumiço e exclui, mas não confessa", () => {
        expect(getItemActions(makeItem(), fridge, "ana")).toEqual({
            canEdit: true,
            canReportMissing: true,
            canConfess: false,
            canJudge: false,
            canDelete: true,
        })
    })

    it("outro membro só pode confessar", () => {
        expect(getItemActions(makeItem(), fridge, "beto")).toEqual({
            canEdit: false,
            canReportMissing: false,
            canConfess: true,
            canJudge: false,
            canDelete: false,
        })
    })

    it("item sumido ainda aceita confissão", () => {
        expect(getItemActions(makeItem({ status: "sumiu" }), fridge, "beto").canConfess).toBe(true)
    })

    it("depois da confissão só o dono julga, e não pode mais apagar", () => {
        const item = makeItem({ status: "confessado", culpritId: "beto" })
        const owner = getItemActions(item, fridge, "ana")
        expect(owner.canJudge).toBe(true)
        expect(owner.canDelete).toBe(false)
        expect(owner.canEdit).toBe(false)
        expect(getItemActions(item, fridge, "beto").canConfess).toBe(false)
    })

    it("admin pode jogar fora qualquer item", () => {
        const item = makeItem({ status: "perdoado" })
        expect(getItemActions(item, fridge, "admin").canDelete).toBe(true)
        expect(getItemActions(item, fridge, "ana").canDelete).toBe(false)
    })
})
