import type {
    RelatoriosResponse,
} from "@/types/relatorio";

async function obterMensagemErro(
    resposta: Response,
): Promise<string> {
    const dados = await resposta
        .json()
        .catch(() => null);

    return (
        dados?.erro ??
        "Não foi possível carregar os relatórios."
    );
}

export async function buscarRelatorios(): Promise<RelatoriosResponse> {
    const resposta = await fetch(
        "/api/relatorios",
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