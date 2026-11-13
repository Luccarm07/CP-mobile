// Testa as regras de negócio do serviço sem internet: o Firestore é trocado por mocks.

jest.mock("@/config/firebase", () => ({ db: {}, auth: {} }))
jest.mock("firebase/auth", () => ({}))
jest.mock("firebase/firestore", () => ({
    arrayRemove: jest.fn((v) => ({ arrayRemove: v })),
    arrayUnion: jest.fn((v) => ({ arrayUnion: v })),
    collection: jest.fn(() => ({})),
    deleteField: jest.fn(() => "DELETE"),
    doc: jest.fn((_db, ...path) => ({ id: path[path.length - 1] ?? "novo-id", path })),
    getDoc: jest.fn(),
    getDocs: jest.fn(),
    onSnapshot: jest.fn(),
    query: jest.fn(),
    runTransaction: jest.fn(),
    serverTimestamp: jest.fn(() => "SERVER_TIME"),
    updateDoc: jest.fn(),
    where: jest.fn(),
    writeBatch: jest.fn(),
}))

import * as firestore from "firebase/firestore"
import { User } from "firebase/auth"
import { createFridge, joinFridge, leaveFridge, removeMember } from "@/services/fridgeService"
import { AppError } from "@/utils/errors"
import { makeFridge } from "../test-utils/factories"

const mocked = firestore as jest.Mocked<typeof firestore>
const user = { uid: "beto", displayName: "Beto", email: "beto@fiap.com" } as User

beforeEach(() => jest.clearAllMocks())

describe("joinFridge", () => {
    it("recusa código que não existe", async () => {
        mocked.getDoc.mockResolvedValueOnce({ exists: () => false } as never)
        await expect(joinFridge("ABCDEF", user)).rejects.toThrow("Código não encontrado")
        expect(mocked.updateDoc).not.toHaveBeenCalled()
    })

    it("não entra de novo se já é membro", async () => {
        mocked.getDoc.mockResolvedValueOnce({ exists: () => true, data: () => ({ fridgeId: "f1" }) } as never)
        mocked.getDocs.mockResolvedValueOnce({ docs: [{ id: "f1" }] } as never)
        await expect(joinFridge("abcdef", user)).resolves.toEqual({ fridgeId: "f1", alreadyMember: true })
        expect(mocked.updateDoc).not.toHaveBeenCalled()
    })

    it("entra adicionando a si mesmo e a prova do código", async () => {
        mocked.getDoc.mockResolvedValueOnce({ exists: () => true, data: () => ({ fridgeId: "f1" }) } as never)
        mocked.getDocs.mockResolvedValueOnce({ docs: [] } as never)
        mocked.updateDoc.mockResolvedValueOnce(undefined)
        await expect(joinFridge("abc-def", user)).resolves.toEqual({ fridgeId: "f1", alreadyMember: false })
        expect(mocked.updateDoc).toHaveBeenCalledWith(expect.anything(), {
            memberIds: { arrayUnion: "beto" },
            "members.beto": "Beto",
            "joinProof.beto": "ABCDEF",
        })
    })

    it("explica quando as regras recusam (geladeira lotada)", async () => {
        mocked.getDoc.mockResolvedValueOnce({ exists: () => true, data: () => ({ fridgeId: "f1" }) } as never)
        mocked.getDocs.mockResolvedValueOnce({ docs: [] } as never)
        mocked.updateDoc.mockRejectedValueOnce({ code: "permission-denied" })
        await expect(joinFridge("ABCDEF", user)).rejects.toThrow("lotada")
    })
})

describe("createFridge", () => {
    it("tenta outro código quando o sorteado já existe", async () => {
        let call = 0
        mocked.runTransaction.mockImplementation(async (_db, fn) => {
            call++
            const tx = { get: jest.fn().mockResolvedValue({ exists: () => call === 1 }), set: jest.fn() }
            return fn(tx as never)
        })
        await expect(createFridge("Rep", user)).resolves.toBe("novo-id")
        expect(mocked.runTransaction).toHaveBeenCalledTimes(2)
    })

    it("desiste depois de 5 colisões seguidas", async () => {
        mocked.runTransaction.mockImplementation(async (_db, fn) =>
            fn({ get: jest.fn().mockResolvedValue({ exists: () => true }), set: jest.fn() } as never),
        )
        await expect(createFridge("Rep", user)).rejects.toBeInstanceOf(AppError)
        expect(mocked.runTransaction).toHaveBeenCalledTimes(5)
    })
})

describe("sair e remover membros", () => {
    const fridge = makeFridge()

    it("admin não pode sair nem ser removido", async () => {
        await expect(leaveFridge(fridge, "admin")).rejects.toThrow("exclua a geladeira")
        await expect(removeMember(fridge, "admin")).rejects.toThrow("não pode ser removido")
        expect(mocked.updateDoc).not.toHaveBeenCalled()
    })

    it("membro sai tirando o próprio uid e o nome", async () => {
        mocked.updateDoc.mockResolvedValueOnce(undefined)
        await leaveFridge(fridge, "ana")
        expect(mocked.updateDoc).toHaveBeenCalledWith(expect.anything(), {
            memberIds: { arrayRemove: "ana" },
            "members.ana": "DELETE",
        })
    })
})
