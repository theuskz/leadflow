import type {
    OportunidadesResponse,
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
        dados?.mensagem ??
        "Não foi possível concluir a operação."
    );
}

export async function buscarFunil(): Promise<OportunidadesResponse> {
    const resposta = await fetch(
        "/api/oportunidades",
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

export type MoverOportunidadeParametros = {
    oportunidadeId: string;
    status: StatusOportunidade;
    motivoPerda?: string | null;
};

export async function moverOportunidade({
    oportunidadeId,
    status,
    motivoPerda,
}: MoverOportunidadeParametros) {
    const resposta = await fetch(
        `/api/oportunidades/${oportunidadeId}/status`,
        {
            method: "PATCH",
            credentials: "include",

            headers: {
                "Content-Type": "application/json",
            },

            body: JSON.stringify({
                status,
                motivoPerda:
                    status === "PERDIDO"
                        ? motivoPerda
                        : null,
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