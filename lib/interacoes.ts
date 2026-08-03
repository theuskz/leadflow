import type {
    InteracaoOportunidade,
    TipoInteracao,
} from "@/types/oportunidade";

export type NovaInteracaoPayload = {
    tipo: TipoInteracao;
    descricao: string;
    data?: string;
};

export type AtualizarInteracaoPayload = {
    tipo: TipoInteracao;
    descricao: string;
    data?: string;
};

export type InteracaoResponse = {
    interacao: InteracaoOportunidade;
};

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

export async function criarInteracao(
    oportunidadeId: string,
    payload: NovaInteracaoPayload,
) {
    const resposta = await fetch(
        `/api/oportunidades/${oportunidadeId}/interacoes`,
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

export async function buscarInteracao(
    interacaoId: string,
): Promise<InteracaoResponse> {
    const resposta = await fetch(
        `/api/interacoes/${interacaoId}`,
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

export async function atualizarInteracao(
    interacaoId: string,
    payload: AtualizarInteracaoPayload,
) {
    const resposta = await fetch(
        `/api/interacoes/${interacaoId}`,
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

export async function excluirInteracao(
    interacaoId: string,
) {
    const resposta = await fetch(
        `/api/interacoes/${interacaoId}`,
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