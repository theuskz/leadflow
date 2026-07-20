export type StatusOportunidade =
    | "NOVO_LEAD"
    | "PRIMEIRO_CONTATO"
    | "QUALIFICADO"
    | "PROPOSTA_ENVIADA"
    | "NEGOCIACAO"
    | "FECHADO"
    | "PERDIDO";

export interface Oportunidade {
    id: string;
    titulo: string;
    descricao: string | null;
    valor: number;

    status: StatusOportunidade;

    probabilidade: number;

    previsaoFechamento: string | null;

    criadoEm: string;
    atualizadoEm: string;

    cliente: {
        id: string;
        nome: string;
        empresa: string | null;
    };

    responsavel: {
        id: string;
        nome: string;
        email: string;
    } | null;

    _count: {
        tarefas: number;
        interacoes: number;
    };
}

export interface OportunidadesResponse {
    oportunidades: Oportunidade[];
}