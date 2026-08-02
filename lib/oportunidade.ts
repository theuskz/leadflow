import type {
    DetalhesOportunidadeResponse,
    StatusOportunidade,
} from "@/types/oportunidade";

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

export async function buscarOportunidade(
    id: string,
): Promise<DetalhesOportunidadeResponse> {
    const resposta = await fetch(
        `/api/oportunidades/${id}`,
        {
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

export async function alterarStatusOportunidade(
    id: string,
    status: StatusOportunidade,
) {
    const resposta = await fetch(
        `/api/oportunidades/${id}/status`,
        {
            method: "PATCH",
            credentials: "include",

            headers: {
                "Content-Type": "application/json",
            },

            body: JSON.stringify({
                status,
            }),
        },
    );

    if (!resposta.ok) {
        throw new Error(
            await obterMensagemErro(resposta),
        );
    }

    return resposta.json();
}

export async function excluirOportunidade(
    id: string,
) {
    const resposta = await fetch(
        `/api/oportunidades/${id}`,
        {
            method: "DELETE",
            credentials: "include",
        },
    );

    if (!resposta.ok) {
        throw new Error(
            await obterMensagemErro(resposta),
        );
    }

    return resposta.json();
}

import { NovaOportunidadePayload } from "@/lib/oportunidades";

export type AtualizarOportunidadePayload =
    NovaOportunidadePayload & {
        motivoPerda?: string | null;
        responsavelId?: string;
    };

type AtualizarOportunidadeParametros = {
    id: string;
    dados: AtualizarOportunidadePayload;
};

export async function atualizarOportunidade({
    id,
    dados,
}: AtualizarOportunidadeParametros) {
    const resposta = await fetch(`/api/oportunidades/${id}`, {
        method: "PUT",

        headers: {
            "Content-Type": "application/json",
        },

        body: JSON.stringify(dados),
    });

    const resultado = await resposta.json();

    if (!resposta.ok) {
        throw new Error(
            resultado.erro ??
            "Não foi possível atualizar a oportunidade.",
        );
    }

    return resultado.oportunidade;
}
