import type {
    OportunidadesResponse,
    StatusOportunidade,
} from "@/types/oportunidade";

export type ClienteParaOportunidade = {
    id: string;
    nome: string;
    empresa: string | null;
};

export type NovaOportunidadePayload = {
    titulo: string;
    descricao?: string;
    valor: number;
    status: StatusOportunidade;
    probabilidade: number;
    previsaoFechamento?: string | null;
    clienteId: string;
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

export async function buscarOportunidades(
    busca = "",
): Promise<OportunidadesResponse> {
    const parametros = new URLSearchParams();

    if (busca.trim()) {
        parametros.set("busca", busca.trim());
    }

    const query = parametros.toString();

    const resposta = await fetch(
        `/api/oportunidades${query ? `?${query}` : ""}`,
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

export async function buscarClientesParaOportunidade(): Promise<
    ClienteParaOportunidade[]
> {
    const resposta = await fetch(
        "/api/clientes?limite=100",
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

    const dados = await resposta.json();

    if (Array.isArray(dados)) {
        return dados;
    }

    if (Array.isArray(dados.clientes)) {
        return dados.clientes;
    }

    if (Array.isArray(dados.dados)) {
        return dados.dados;
    }

    return [];
}

export async function criarOportunidade(
    payload: NovaOportunidadePayload,
) {
    const resposta = await fetch(
        "/api/oportunidades",
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