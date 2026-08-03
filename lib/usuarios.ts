import type {
    CriarUsuarioPayload,
    UsuariosResponse,
} from "@/types/usuario";

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

export async function buscarUsuarios(): Promise<UsuariosResponse> {
    const resposta = await fetch(
        "/api/usuarios",
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

export async function criarUsuario(
    payload: CriarUsuarioPayload,
) {
    const resposta = await fetch(
        "/api/usuarios",
        {
            method: "POST",
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