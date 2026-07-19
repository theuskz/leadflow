import { SignJWT, jwtVerify } from "jose";

export type TokenPayload = {
    usuarioId: string;
    nome: string;
    email: string;
    nivel: "ADMIN" | "GERENTE" | "VENDEDOR";
};

function obterJwtSecret() {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error("JWT_SECRET não configurado.");
    }

    return new TextEncoder().encode(secret);
}

export async function criarToken(payload: TokenPayload) {
    return new SignJWT(payload)
        .setProtectedHeader({
            alg: "HS256",
        })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(obterJwtSecret());
}

export async function verificarToken(token: string) {
    try {
        const { payload } = await jwtVerify(
            token,
            obterJwtSecret(),
        );

        return payload as TokenPayload;
    } catch {
        return null;
    }
}