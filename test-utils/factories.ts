import { Fridge, Item } from "@/types"

export function makeItem(overrides: Partial<Item> = {}): Item {
    return {
        id: "item1",
        name: "Iogurte de morango",
        category: "laticinio",
        expiresOn: "2026-11-20",
        note: "",
        ownerId: "ana",
        ownerName: "Ana",
        status: "na_geladeira",
        culpritId: null,
        culpritName: null,
        confession: null,
        confessedWeek: null,
        createdAt: null,
        confessedAt: null,
        pendingSync: false,
        ...overrides,
    }
}

export function makeFridge(overrides: Partial<Fridge> = {}): Fridge {
    return {
        id: "f1",
        name: "Rep",
        inviteCode: "K7M2QX",
        ownerId: "admin",
        memberIds: ["admin", "ana", "beto"],
        members: { admin: "Admin", ana: "Ana", beto: "Beto" },
        ...overrides,
    }
}
