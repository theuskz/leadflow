"use client";

import {
    useEffect,
    useState,
} from "react";
import {
    Bell,
    Check,
    LayoutPanelLeft,
    Loader2,
    Palette,
    RefreshCw,
    Save,
    Settings2,
    Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import {
    buscarConfiguracoes,
    configuracoesPadrao,
    restaurarConfiguracoes,
    salvarConfiguracoes,
} from "@/lib/configuracoes";

import type {
    ConfiguracoesUsuario,
} from "@/types/configuracoes";

type AlternadorProps = {
    ativo: boolean;
    alterar: (ativo: boolean) => void;
    titulo: string;
    descricao: string;
};

function Alternador({
    ativo,
    alterar,
    titulo,
    descricao,
}: AlternadorProps) {
    return (
        <div className="flex items-start justify-between gap-5 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <div>
                <p className="font-medium text-slate-200">
                    {titulo}
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                    {descricao}
                </p>
            </div>

            <button
                type="button"
                role="switch"
                aria-checked={ativo}
                onClick={() =>
                    alterar(!ativo)
                }
                className={`
                    relative h-7 w-12 shrink-0
                    rounded-full transition
                    ${ativo
                        ? "bg-primary"
                        : "bg-slate-700"
                    }
                `}
            >
                <span
                    className={`
                        absolute top-1 h-5 w-5
                        rounded-full bg-white
                        transition
                        ${ativo
                            ? "left-6"
                            : "left-1"
                        }
                    `}
                />
            </button>
        </div>
    );
}

export function ConfiguracoesPage() {
    const [
        configuracoes,
        setConfiguracoes,
    ] = useState<ConfiguracoesUsuario>(
        configuracoesPadrao,
    );

    const [carregando, setCarregando] =
        useState(true);

    const [salvando, setSalvando] =
        useState(false);

    useEffect(() => {
        setConfiguracoes(
            buscarConfiguracoes(),
        );

        setCarregando(false);
    }, []);

    function alterarCampo<
        Campo extends keyof ConfiguracoesUsuario,
    >(
        campo: Campo,
        valor: ConfiguracoesUsuario[Campo],
    ) {
        setConfiguracoes(
            (estadoAtual) => ({
                ...estadoAtual,
                [campo]: valor,
            }),
        );
    }

    async function salvar() {
        try {
            setSalvando(true);

            salvarConfiguracoes(
                configuracoes,
            );

            await new Promise(
                (resolve) =>
                    setTimeout(resolve, 350),
            );

            toast.success(
                "Configurações salvas com sucesso.",
            );
        } catch {
            toast.error(
                "Não foi possível salvar as configurações.",
            );
        } finally {
            setSalvando(false);
        }
    }

    function restaurar() {
        const confirmou =
            window.confirm(
                "Deseja restaurar todas as configurações padrão?",
            );

        if (!confirmou) {
            return;
        }

        const padrao =
            restaurarConfiguracoes();

        setConfiguracoes(padrao);

        toast.success(
            "Configurações restauradas.",
        );
    }

    if (carregando) {
        return (
            <div className="flex min-h-[500px] items-center justify-center gap-3 text-slate-400">
                <Loader2
                    size={22}
                    className="animate-spin"
                />

                Carregando configurações...
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <p className="text-sm font-medium text-primary">
                        Preferências
                    </p>

                    <h1 className="mt-2 text-3xl font-bold text-white">
                        Configurações
                    </h1>

                    <p className="mt-2 max-w-2xl text-slate-400">
                        Personalize a aparência e o comportamento do LeadFlow.
                    </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                        type="button"
                        onClick={restaurar}
                        className="
                            inline-flex items-center
                            justify-center gap-2
                            rounded-xl
                            border border-slate-700
                            px-4 py-2.5
                            text-sm font-medium
                            text-slate-300
                            transition
                            hover:bg-slate-800
                            hover:text-white
                        "
                    >
                        <RefreshCw size={16} />
                        Restaurar
                    </button>

                    <button
                        type="button"
                        onClick={salvar}
                        disabled={salvando}
                        className="
                            inline-flex items-center
                            justify-center gap-2
                            rounded-xl
                            bg-primary
                            px-4 py-2.5
                            text-sm font-semibold
                            text-slate-950
                            transition
                            hover:bg-primary/90
                            disabled:opacity-60
                        "
                    >
                        {salvando ? (
                            <Loader2
                                size={17}
                                className="animate-spin"
                            />
                        ) : (
                            <Save size={17} />
                        )}

                        {salvando
                            ? "Salvando..."
                            : "Salvar alterações"}
                    </button>
                </div>
            </header>


            <section className="rounded-2xl border border-slate-800 bg-slate-900/70">
                <div className="flex items-center gap-3 border-b border-slate-800 px-6 py-5">
                    <LayoutPanelLeft className="text-violet-400" />

                    <div>
                        <h2 className="text-lg font-semibold text-white">
                            Interface
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Controle o comportamento da navegação.
                        </p>
                    </div>
                </div>

                <div className="grid gap-4 p-6 lg:grid-cols-2">
                    <Alternador
                        ativo={
                            configuracoes.sidebarRecolhida
                        }
                        alterar={(valor) =>
                            alterarCampo(
                                "sidebarRecolhida",
                                valor,
                            )
                        }
                        titulo="Sidebar recolhida"
                        descricao="Inicia o menu lateral em sua versão compacta."
                    />

                    <Alternador
                        ativo={
                            configuracoes.animacoesAtivas
                        }
                        alterar={(valor) =>
                            alterarCampo(
                                "animacoesAtivas",
                                valor,
                            )
                        }
                        titulo="Animações da interface"
                        descricao="Mantém transições e movimentos visuais ativos."
                    />
                </div>
            </section>

            <section className="rounded-2xl border border-slate-800 bg-slate-900/70">
                <div className="flex items-center gap-3 border-b border-slate-800 px-6 py-5">
                    <Bell className="text-amber-400" />

                    <div>
                        <h2 className="text-lg font-semibold text-white">
                            Notificações
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Defina quais avisos deseja receber.
                        </p>
                    </div>
                </div>

                <div className="grid gap-4 p-6 lg:grid-cols-2">
                    <Alternador
                        ativo={
                            configuracoes.notificacoesSistema
                        }
                        alterar={(valor) =>
                            alterarCampo(
                                "notificacoesSistema",
                                valor,
                            )
                        }
                        titulo="Avisos do sistema"
                        descricao="Receba mensagens sobre ações e mudanças importantes."
                    />

                    <Alternador
                        ativo={
                            configuracoes.notificacoesTarefas
                        }
                        alterar={(valor) =>
                            alterarCampo(
                                "notificacoesTarefas",
                                valor,
                            )
                        }
                        titulo="Lembretes de tarefas"
                        descricao="Receba alertas sobre tarefas próximas do prazo."
                    />

                    <Alternador
                        ativo={
                            configuracoes.notificacoesOportunidades
                        }
                        alterar={(valor) =>
                            alterarCampo(
                                "notificacoesOportunidades",
                                valor,
                            )
                        }
                        titulo="Atualizações de oportunidades"
                        descricao="Receba avisos quando negociações forem atualizadas."
                    />
                </div>
            </section>

            <section className="rounded-2xl border border-slate-800 bg-slate-900/70">
                <div className="flex items-center gap-3 border-b border-slate-800 px-6 py-5">
                    <Settings2 className="text-emerald-400" />

                    <div>
                        <h2 className="text-lg font-semibold text-white">
                            Preferências gerais
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Defina padrões usados no CRM.
                        </p>
                    </div>
                </div>

                <div className="grid gap-5 p-6 md:grid-cols-3">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-300">
                            Idioma
                        </label>

                        <select
                            value={
                                configuracoes.idioma
                            }
                            onChange={() => null}
                            className="h-12 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 text-sm text-white outline-none focus:border-primary"
                        >
                            <option value="pt-BR">
                                Português (Brasil)
                            </option>
                        </select>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-300">
                            Moeda
                        </label>

                        <select
                            value={
                                configuracoes.moeda
                            }
                            onChange={() => null}
                            className="h-12 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 text-sm text-white outline-none focus:border-primary"
                        >
                            <option value="BRL">
                                Real brasileiro
                            </option>
                        </select>
                    </div>

                    <div>
                        <label
                            htmlFor="itens-pagina"
                            className="mb-2 block text-sm font-medium text-slate-300"
                        >
                            Itens por página
                        </label>

                        <select
                            id="itens-pagina"
                            value={
                                configuracoes.itensPorPagina
                            }
                            onChange={(evento) =>
                                alterarCampo(
                                    "itensPorPagina",
                                    Number(
                                        evento.target
                                            .value,
                                    ) as
                                    | 10
                                    | 20
                                    | 50,
                                )
                            }
                            className="h-12 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 text-sm text-white outline-none focus:border-primary"
                        >
                            <option value={10}>
                                10 itens
                            </option>

                            <option value={20}>
                                20 itens
                            </option>

                            <option value={50}>
                                50 itens
                            </option>
                        </select>
                    </div>
                </div>
            </section>

            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
                <div className="flex items-start gap-3">
                    <Sparkles
                        size={20}
                        className="mt-0.5 shrink-0 text-primary"
                    />

                    <p className="text-sm leading-6 text-slate-400">
                        As preferências são salvas neste navegador. A sincronização entre dispositivos poderá ser adicionada posteriormente.
                    </p>
                </div>
            </div>
        </div>
    );
}