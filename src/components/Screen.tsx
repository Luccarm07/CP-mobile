import { ReactNode } from "react"
import {
    KeyboardAvoidingView,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    View,
} from "react-native"
import { colors, spacing } from "@/theme"

interface Props {
    children: ReactNode
    /** Rodapé fixo (ex.: botão principal). */
    footer?: ReactNode
    refreshing?: boolean
    onRefresh?: () => void
}

/**
 * Container padrão das telas: rolagem, teclado sem cobrir os campos e,
 * opcionalmente, "puxar para atualizar".
 */
export function Screen({ children, footer, refreshing, onRefresh }: Props) {
    return (
        <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
            <ScrollView
                style={styles.flex}
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
                refreshControl={
                    onRefresh ? (
                        <RefreshControl
                            refreshing={Boolean(refreshing)}
                            onRefresh={onRefresh}
                            tintColor={colors.primary}
                            colors={[colors.primary]}
                        />
                    ) : undefined
                }
            >
                {children}
            </ScrollView>
            {footer && <View style={styles.footer}>{footer}</View>}
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.lg, paddingBottom: spacing.xxl },
    footer: {
        padding: spacing.lg,
        paddingBottom: spacing.xl,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        backgroundColor: colors.background,
    },
})
