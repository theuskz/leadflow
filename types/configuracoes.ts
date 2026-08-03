export type ConfiguracoesUsuario = {

    sidebarRecolhida: boolean;
    animacoesAtivas: boolean;

    notificacoesSistema: boolean;
    notificacoesTarefas: boolean;
    notificacoesOportunidades: boolean;

    moeda: "BRL";
    idioma: "pt-BR";
    itensPorPagina: 10 | 20 | 50;
};
