// Sem 0/O e 1/I para ninguém confundir ao ditar o código para os amigos.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

/** Gera um código de convite de 6 caracteres. `random` é injetável para os testes. */
export function generateInviteCode(random: () => number = Math.random): string {
    let code = ""
    for (let i = 0; i < 6; i++) {
        code += ALPHABET[Math.floor(random() * ALPHABET.length)]
    }
    return code
}
