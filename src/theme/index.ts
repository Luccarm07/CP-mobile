// Paleta "iogurte de morango": rosa, creme e menta.
export const colors = {
    background: "#FFF8EE",
    surface: "#FFFFFF",
    primary: "#E5487F",
    primaryDark: "#B8305F",
    primarySoft: "#FDE3EC",
    mint: "#22A88F",
    mintSoft: "#DDF5EF",
    warning: "#E8971C",
    warningSoft: "#FFF0D6",
    danger: "#D63B3B",
    dangerSoft: "#FDE2E2",
    text: "#2B2238",
    textMuted: "#7A7186",
    border: "#EFE4D6",
    white: "#FFFFFF",
}

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 }

export const radius = { sm: 8, md: 14, lg: 22, pill: 999 }

export const font = {
    title: { fontSize: 26, fontWeight: "800" as const, color: colors.text },
    subtitle: { fontSize: 18, fontWeight: "700" as const, color: colors.text },
    body: { fontSize: 15, color: colors.text },
    small: { fontSize: 13, color: colors.textMuted },
}
