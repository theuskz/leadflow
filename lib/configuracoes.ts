import type {
    ConfiguracoesUsuario,
} from "@/types/configuracoes";

const CHAVE_CONFIGURACOES =
    "leadflow_configuracoes";

export const configuracoesPadrao: ConfiguracoesUsuario = {

    sidebarRecolhida: false,
    animacoesAtivas: true,

    notificacoesSistema: true,
    notificacoesTarefas: true,
    notificacoesOportunidades: true,

    moeda: "BRL",
    idioma: "pt-BR",
    itensPorPagina: 10,
};

export function buscarConfiguracoes(): ConfiguracoesUsuario {
    if (typeof window === "undefined") {
        return configuracoesPadrao;
    }

    const configuracoesSalvas =
        window.localStorage.getItem(
            CHAVE_CONFIGURACOES,
        );

    if (!configuracoesSalvas) {

        return configuracoesPadrao;
    }

    try {
        const configuracoes = {
            ...configuracoesPadrao,
            ...JSON.parse(
                configuracoesSalvas,
            ),
        } as ConfiguracoesUsuario;


        return configuracoes;
    } catch {

        return configuracoesPadrao;
    }
}

export function salvarConfiguracoes(
    configuracoes: ConfiguracoesUsuario,
) {
    window.localStorage.setItem(
        CHAVE_CONFIGURACOES,
        JSON.stringify(configuracoes),
    );

    window.dispatchEvent(
        new CustomEvent(
            "leadflow-configuracoes-alteradas",
            {
                detail: configuracoes,
            },
        ),
    );
}

export function restaurarConfiguracoes() {
    window.localStorage.removeItem(
        CHAVE_CONFIGURACOES,
    );


    window.dispatchEvent(
        new CustomEvent(
            "leadflow-configuracoes-alteradas",
            {
                detail: configuracoesPadrao,
            },
        ),
    );

    return configuracoesPadrao;
}
