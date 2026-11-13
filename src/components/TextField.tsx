import { ComponentRef, Ref } from "react"
import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native"
import { colors, radius, spacing } from "@/theme"

export type TextFieldRef = ComponentRef<typeof TextInput>

interface Props extends TextInputProps {
    ref?: Ref<TextFieldRef>
    label: string
    error?: string
    hint?: string
}

// No React 19 "ref" é uma prop comum: não precisa mais de forwardRef
export function TextField({ ref, label, error, hint, style, ...inputProps }: Props) {
    return (
        <View style={styles.wrapper}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
                ref={ref}
                placeholderTextColor={colors.textMuted}
                style={[styles.input, error ? styles.inputError : null, style]}
                accessibilityLabel={label}
                {...inputProps}
            />
            {error ? (
                <Text style={styles.error}>{error}</Text>
            ) : hint ? (
                <Text style={styles.hint}>{hint}</Text>
            ) : null}
        </View>
    )
}

const styles = StyleSheet.create({
    wrapper: { marginBottom: spacing.md },
    label: { fontSize: 14, fontWeight: "600", color: colors.text, marginBottom: spacing.xs },
    input: {
        backgroundColor: colors.surface,
        borderWidth: 1.5,
        borderColor: colors.border,
        borderRadius: radius.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        fontSize: 16,
        color: colors.text,
    },
    inputError: { borderColor: colors.danger },
    error: { color: colors.danger, fontSize: 13, marginTop: spacing.xs },
    hint: { color: colors.textMuted, fontSize: 13, marginTop: spacing.xs },
})
