export type StatusOportunidadeDashboard =
    | "NOVO_LEAD"
    | "PRIMEIRO_CONTATO"
    | "QUALIFICADO"
    | "PROPOSTA_ENVIADA"
    | "NEGOCIACAO"
    | "FECHADO"
    | "PERDIDO";

export type ResumoDashboard = {
    totalClientes: number;
    oportunidadesAbertas: number;
    valorPipeline: number;
    taxaConversao: number;
    oportunidadesFechadas: number;
    oportunidadesPerdidas: number;
};

export type VendaPorMesDashboard = {
    mes: string;
    valor: number;
    quantidade: number;
};

export type ItemFunilDashboard = {
    status: StatusOportunidadeDashboard;
    nome: string;
    quantidade: number;
    valor: number;
};

export type OportunidadeRecenteDashboard = {
    id: string;
    titulo: string;
    valor: number;
    status: StatusOportunidadeDashboard;
    atualizadoEm: string;

    cliente: {
        id: string;
        nome: string;
        empresa: string | null;
    };

    responsavel: {
        id: string;
        nome: string;
    } | null;
};

export type MelhorVendedorDashboard = {
    id: string;
    nome: string;
    quantidade: number;
    valor: number;
};

export type OportunidadeAtencaoDashboard = {
    id: string;
    titulo: string;
    valor: number;
    status: StatusOportunidadeDashboard;
    diasSemAtualizacao: number;

    cliente: {
        id: string;
        nome: string;
        empresa: string | null;
    };
};

export type DashboardResponse = {
    resumo: ResumoDashboard;
    vendasPorMes: VendaPorMesDashboard[];
    funil: ItemFunilDashboard[];
    ultimasOportunidades: OportunidadeRecenteDashboard[];
    melhorVendedor: MelhorVendedorDashboard | null;
    oportunidadesAtencao: OportunidadeAtencaoDashboard[];
};