import type {
    TipoInteracao,
} from "@/types/oportunidade";

export type NovaInteracaoPayload = {
    tipo: TipoInteracao;
    descricao: string;
    data?: string;
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