import type {
    PrioridadeTarefa,
    StatusTarefa,
} from "@/types/oportunidade";

export type NovaTarefaPayload = {
    titulo: string;
    descricao?: string;
    prioridade: PrioridadeTarefa;
    status?: StatusTarefa;
    dataLimite?: string | null;
    responsavelId?: string;
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

export async function criarTarefa(
    oportunidadeId: string,
    payload: NovaTarefaPayload,
) {
    const resposta = await fetch(
        `/api/oportunidades/${oportunidadeId}/tarefas`,
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