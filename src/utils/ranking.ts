// Monta o "Mural da Vergonha" da semana a partir dos itens da geladeira.

import { Category, Item } from "@/types"

export interface CulpritStats {
    id: string
    name: string
    total: number
    forgiven: number
    charged: number
    pending: number
}

export interface WeeklyRanking {
    culprits: CulpritStats[]
    totalConfessions: number
    /** Itens que sumiram e ninguém confessou (não depende da semana). */
    openMysteries: number
    favoriteCategory: Category | null
}

const TITLES = ["👑 Rato de Geladeira", "🥈 Boca Nervosa", "🥉 Beliscador Profissional"]

export function titleFor(position: number): string {
    return TITLES[position] ?? "🍴 Aprendiz de Larápio"
}

export function buildWeeklyRanking(items: Item[], week: string): WeeklyRanking {
    const byCulprit = new Map<string, CulpritStats>()
    const byCategory = new Map<Category, number>()
    let totalConfessions = 0

    for (const item of items) {
        if (item.confessedWeek !== week || !item.culpritId) continue
        totalConfessions++
        byCategory.set(item.category, (byCategory.get(item.category) ?? 0) + 1)

        const stats = byCulprit.get(item.culpritId) ?? {
            id: item.culpritId,
            name: item.culpritName ?? "Alguém",
            total: 0,
            forgiven: 0,
            charged: 0,
            pending: 0,
        }
        stats.total++
        if (item.status === "perdoado") stats.forgiven++
        else if (item.status === "cobrado") stats.charged++
        else stats.pending++
        byCulprit.set(item.culpritId, stats)
    }

    const culprits = [...byCulprit.values()].sort(
        (a, b) => b.total - a.total || b.charged - a.charged || a.name.localeCompare(b.name),
    )

    let favoriteCategory: Category | null = null
    let max = 0
    for (const [category, count] of byCategory) {
        if (count > max) {
            max = count
            favoriteCategory = category
        }
    }

    return {
        culprits,
        totalConfessions,
        openMysteries: items.filter((i) => i.status === "sumiu").length,
        favoriteCategory,
    }
}
