import {
    OportunidadesResponse,
    StatusOportunidade,
} from "@/types/oportunidade";

export type ClienteOpcao = {
    id: string;
    nome: string;
    empresa: string | null;
};

export type NovaOportunidadePayload = {
    titulo: string;
    clienteId: string;
    descricao?: string;
    valor: number;
    status: StatusOportunidade;
    probabilidade: number;
    previsaoFechamento?: string | null;
};

type ClientesResponse = {
    clientes: ClienteOpcao[];
};

async function obterErro(resposta: Response) {
    const dados = await resposta.json().catch(() => null);

    return dados?.erro ?? "Ocorreu um erro inesperado.";
}

export async function buscarOportunidades(busca = "") {
    const resposta = await fetch(
        `/api/oportunidades?busca=${encodeURIComponent(busca)}`,
        {
            credentials: "include",
        },
    );

    if (!resposta.ok) {
        throw new Error(await obterErro(resposta));
    }

    return resposta.json() as Promise<OportunidadesResponse>;
}

export async function buscarClientesParaOportunidade() {
    const resposta = await fetch(
        "/api/clientes?pagina=1&limite=100",
        {
            credentials: "include",
        },
    );

    if (!resposta.ok) {
        throw new Error(await obterErro(resposta));
    }

    const dados = (await resposta.json()) as ClientesResponse;

    return dados.clientes;
}

export async function criarOportunidade(
    payload: NovaOportunidadePayload,
) {
    const resposta = await fetch("/api/oportunidades", {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    if (!resposta.ok) {
        throw new Error(await obterErro(resposta));
    }

    return resposta.json();
}