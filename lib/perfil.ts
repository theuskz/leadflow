import type {
    AlterarSenhaPayload,
    AtualizarPerfilPayload,
    PerfilResponse,
} from "@/types/perfil";

async function obterMensagemErro(
    resposta: Response,
): Promise<string> {
    const dados = await resposta
        .json()
        .catch(() => null);

    return (
        dados?.erro ??
        "Não foi possível concluir a operação."
    );
}

export async function buscarPerfil(): Promise<PerfilResponse> {
    const resposta = await fetch(
        "/api/auth/me",
        {
            method: "GET",
            credentials: "include",
            cache: "no-store",
        },
    );

    if (!resposta.ok) {
        throw new Error(
            await obterMensagemErro(resposta),
        );
    }

    return resposta.json();
}

export async function atualizarPerfil(
    payload: AtualizarPerfilPayload,
) {
    const resposta = await fetch(
        "/api/auth/me",
        {
            method: "PATCH",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        },
    );

    if (!resposta.ok) {
        throw new Error(
            await obterMensagemErro(resposta),
        );
    }

    return resposta.json();
}

export async function alterarSenha(
    payload: AlterarSenhaPayload,
) {
    const resposta = await fetch(
        "/api/auth/me",
        {
            method: "PUT",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        },
    );

    if (!resposta.ok) {
        throw new Error(
            await obterMensagemErro(resposta),
        );
    }

    return resposta.json();
}