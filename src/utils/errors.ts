// Tradução de erros técnicos (Firebase, rede) para mensagens que o usuário entende.

/** Erro "do app": a mensagem já está pronta para aparecer na tela. */
export class AppError extends Error {
    constructor(message: string) {
        super(message)
        this.name = "AppError"
    }
}

const FIREBASE_MESSAGES: Record<string, string> = {
    // Authentication
    "auth/invalid-email": "O e-mail informado não é válido.",
    "auth/invalid-credential": "E-mail ou senha incorretos.",
    "auth/wrong-password": "E-mail ou senha incorretos.",
    "auth/user-not-found": "E-mail ou senha incorretos.",
    "auth/missing-password": "Informe a senha.",
    "auth/email-already-in-use": "Já existe uma conta com este e-mail. Tente entrar ou recuperar a senha.",
    "auth/weak-password": "Senha fraca: use pelo menos 6 caracteres.",
    "auth/too-many-requests": "Muitas tentativas seguidas. Aguarde alguns minutos e tente de novo.",
    "auth/user-disabled": "Esta conta foi desativada.",
    "auth/network-request-failed": "Sem conexão com a internet. Verifique sua rede e tente de novo.",
    "auth/missing-email": "Informe o e-mail.",
    // Firestore
    "permission-denied": "Você não tem permissão para fazer isso.",
    unavailable: "Sem conexão com o servidor. Verifique sua internet e tente de novo.",
    "deadline-exceeded": "O servidor demorou para responder. Tente de novo.",
    "not-found": "Esse registro não existe mais.",
    aborted: "Outra pessoa alterou isso ao mesmo tempo. Tente de novo.",
    "resource-exhausted": "Limite de uso atingido. Tente mais tarde.",
}

const DEFAULT_MESSAGE = "Algo deu errado. Tente de novo."

export function getErrorCode(error: unknown): string | null {
    if (typeof error === "object" && error !== null && "code" in error) {
        const code = (error as { code: unknown }).code
        return typeof code === "string" ? code : null
    }
    return null
}

/** Converte qualquer erro em uma mensagem amigável em português. */
export function toUserMessage(error: unknown): string {
    if (error instanceof AppError) return error.message
    const code = getErrorCode(error)
    if (code && FIREBASE_MESSAGES[code]) return FIREBASE_MESSAGES[code]
    return DEFAULT_MESSAGE
}

/**
 * O Firestore guarda escritas feitas sem internet e só resolve a Promise quando o
 * servidor confirma. Para o botão não ficar "carregando" para sempre, limitamos a espera.
 */
export function withTimeout<T>(promise: Promise<T>, ms = 12_000): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        const timer = setTimeout(
            () =>
                reject(
                    new AppError(
                        "O servidor não respondeu. Verifique sua internet: a alteração será enviada assim que a conexão voltar.",
                    ),
                ),
            ms,
        )
        promise.then(
            (value) => {
                clearTimeout(timer)
                resolve(value)
            },
            (error) => {
                clearTimeout(timer)
                reject(error)
            },
        )
    })
}
