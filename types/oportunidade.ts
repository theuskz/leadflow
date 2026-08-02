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

export type PrioridadeTarefa =
    | "BAIXA"
    | "MEDIA"
    | "ALTA"
    | "URGENTE";

export type StatusTarefa =
    | "PENDENTE"
    | "EM_ANDAMENTO"
    | "CONCLUIDA"
    | "CANCELADA";

export type TipoInteracao =
    | "LIGACAO"
    | "EMAIL"
    | "WHATSAPP"
    | "REUNIAO"
    | "VISITA"
    | "ANOTACAO";

export interface TarefaOportunidade {
    id: string;
    titulo: string;
    descricao: string | null;
    prioridade: PrioridadeTarefa;
    status: StatusTarefa;
    dataLimite: string | null;
    concluidaEm: string | null;
    criadoEm: string;

    responsavel: {
        id: string;
        nome: string;
    } | null;
}

export interface InteracaoOportunidade {
    id: string;
    tipo: TipoInteracao;
    descricao: string;
    data: string;
    criadoEm: string;

    usuario: {
        id: string;
        nome: string;
    } | null;
}

export interface DetalhesOportunidade extends Oportunidade {
    motivoPerda: string | null;

    cliente: {
        id: string;
        nome: string;
        email: string | null;
        telefone: string | null;
        empresa: string | null;
        cargo: string | null;
        status: string;
        origem: string;
    };

    tarefas: TarefaOportunidade[];
    interacoes: InteracaoOportunidade[];
}

export interface DetalhesOportunidadeResponse {
    oportunidade: DetalhesOportunidade;
}