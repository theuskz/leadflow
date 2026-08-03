export type StatusOportunidadeRelatorio =
    | "NOVO_LEAD"
    | "PRIMEIRO_CONTATO"
    | "QUALIFICADO"
    | "PROPOSTA_ENVIADA"
    | "NEGOCIACAO"
    | "FECHADO"
    | "PERDIDO";

export type OrigemLeadRelatorio =
    | "SITE"
    | "INSTAGRAM"
    | "FACEBOOK"
    | "WHATSAPP"
    | "INDICACAO"
    | "EVENTO"
    | "LIGACAO"
    | "OUTRO";

export type ResumoRelatorios = {
    faturamentoFechado: number;
    valorPipeline: number;
    taxaConversao: number;
    ticketMedio: number;
    oportunidadesAbertas: number;
    oportunidadesFechadas: number;
    oportunidadesPerdidas: number;
};

export type OportunidadePorStatusRelatorio = {
    status: StatusOportunidadeRelatorio;
    nome: string;
    quantidade: number;
    valor: number;
};

export type VendaPorMesRelatorio = {
    mes: string;
    valor: number;
    quantidade: number;
};

export type RankingRelatorio = {
    id: string;
    nome: string;
    quantidade: number;
    valor: number;
};

export type OrigemRelatorio = {
    origem: OrigemLeadRelatorio;
    nome: string;
    quantidade: number;
};

export type RelatoriosResponse = {
    resumo: ResumoRelatorios;
    oportunidadesPorStatus: OportunidadePorStatusRelatorio[];
    vendasPorMes: VendaPorMesRelatorio[];
    ranking: RankingRelatorio[];
    origens: OrigemRelatorio[];
};