"use client";

import { useQuery } from "@tanstack/react-query";
import {
    AlertCircle,
    BriefcaseBusiness,
    ChartNoAxesCombined,
    CircleDollarSign,
    Download,
    FileSpreadsheet,
    Loader2,
    RefreshCw,
    Target,
} from "lucide-react";

import {
    buscarRelatorios,
} from "@/lib/relatorio";
import {
    exportarRelatoriosExcel,
    exportarRelatoriosPDF,
} from "@/lib/exportar-relatorios";
import {
    GraficoVendas,
} from "@/components/relatorios/grafico-vendas";
import {
    GraficoPipeline,
} from "@/components/relatorios/grafico-pipeline";
import {
    GraficoOrigens,
} from "@/components/relatorios/grafico-origens";
import {
    RankingVendedores
} from "./ranking-vendedores";

function formatarMoeda(valor: number) {
    return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
}

export function RelatoriosPage() {
    const {
        data,
        isPending,
        isFetching,
        isError,
        error,
        refetch,
    } = useQuery({
        queryKey: ["relatorios"],
        queryFn: buscarRelatorios,
    });

    if (isPending) {
        return (
            <div className="flex min-h-[500px] items-center justify-center gap-3 text-slate-400">
                <Loader2
                    size={22}
                    className="animate-spin"
                />

                Carregando relatórios...
            </div>
        );
    }

    if (isError || !data) {
        return (
            <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center">
                <AlertCircle
                    size={34}
                    className="text-red-400"
                />

                <h2 className="mt-4 font-semibold text-red-300">
                    Não foi possível carregar os relatórios
                </h2>

                <p className="mt-2 text-sm text-slate-400">
                    {error instanceof Error
                        ? error.message
                        : "Ocorreu um erro inesperado."}
                </p>

                <button
                    type="button"
                    onClick={() => refetch()}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white"
                >
                    <RefreshCw size={16} />
                    Tentar novamente
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <p className="text-sm font-medium text-cyan-400">
                        Inteligência comercial
                    </p>

                    <h1 className="mt-2 text-3xl font-bold text-white">
                        Relatórios
                    </h1>

                    <p className="mt-2 text-slate-400">
                        Acompanhe o desempenho da operação comercial.
                    </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                        type="button"
                        onClick={() =>
                            exportarRelatoriosExcel(data)
                        }
                        className="
            inline-flex items-center
            justify-center gap-2
            rounded-xl
            border border-emerald-500/30
            bg-emerald-500/10
            px-4 py-2.5
            text-sm font-semibold
            text-emerald-300
            transition
            hover:bg-emerald-500/20
        "
                    >
                        <FileSpreadsheet size={17} />
                        Exportar Excel
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            exportarRelatoriosPDF(data)
                        }
                        className="
            inline-flex items-center
            justify-center gap-2
            rounded-xl
            border border-red-500/30
            bg-red-500/10
            px-4 py-2.5
            text-sm font-semibold
            text-red-300
            transition
            hover:bg-red-500/20
        "
                    >
                        <Download size={17} />
                        Exportar PDF
                    </button>

                    <button
                        type="button"
                        onClick={() => refetch()}
                        disabled={isFetching}
                        className="
                            inline-flex items-center
                            justify-center gap-2
                            rounded-xl
                            border border-slate-800
                            bg-slate-900
                            px-4 py-2.5
                            text-sm text-slate-300
                            transition
                            hover:bg-slate-800
                            disabled:opacity-60
                        "
                    >
                        <RefreshCw
                            size={16}
                            className={
                                isFetching
                                    ? "animate-spin"
                                    : ""
                            }
                        />

                        Atualizar
                    </button>
                </div>
            </header>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
                    <CircleDollarSign className="text-emerald-400" />

                    <p className="mt-4 text-sm text-slate-400">
                        Faturamento fechado
                    </p>

                    <strong className="mt-2 block text-2xl text-white">
                        {formatarMoeda(
                            data.resumo
                                .faturamentoFechado,
                        )}
                    </strong>
                </article>

                <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
                    <BriefcaseBusiness className="text-cyan-400" />

                    <p className="mt-4 text-sm text-slate-400">
                        Pipeline aberto
                    </p>

                    <strong className="mt-2 block text-2xl text-white">
                        {formatarMoeda(
                            data.resumo
                                .valorPipeline,
                        )}
                    </strong>
                </article>

                <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
                    <Target className="text-violet-400" />

                    <p className="mt-4 text-sm text-slate-400">
                        Taxa de conversão
                    </p>

                    <strong className="mt-2 block text-2xl text-white">
                        {data.resumo.taxaConversao.toFixed(
                            1,
                        )}
                        %
                    </strong>
                </article>

                <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
                    <ChartNoAxesCombined className="text-amber-400" />

                    <p className="mt-4 text-sm text-slate-400">
                        Ticket médio
                    </p>

                    <strong className="mt-2 block text-2xl text-white">
                        {formatarMoeda(
                            data.resumo.ticketMedio,
                        )}
                    </strong>
                </article>
            </section>

            <section className="grid gap-6 xl:grid-cols-2">
                <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
                    <h2 className="text-xl font-semibold text-white">
                        Vendas por mês
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Faturamento das oportunidades fechadas.
                    </p>

                    <div className="mt-6">
                        <GraficoVendas
                            dados={
                                data.vendasPorMes
                            }
                        />
                    </div>
                </article>

                <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
                    <h2 className="text-xl font-semibold text-white">
                        Pipeline por etapa
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Distribuição atual das oportunidades.
                    </p>

                    <div className="mt-6">
                        <GraficoPipeline
                            dados={
                                data.oportunidadesPorStatus
                            }
                        />
                    </div>
                </article>
            </section>

            <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
                <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
                    <h2 className="text-xl font-semibold text-white">
                        Origem dos leads
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Canais que mais geram clientes.
                    </p>

                    <div className="mt-6">
                        <GraficoOrigens
                            dados={data.origens}
                        />
                    </div>
                </article>

                <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
                    <h2 className="text-xl font-semibold text-white">
                        Ranking de vendedores
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Desempenho por valor vendido.
                    </p>

                    <div className="mt-6">
                        <RankingVendedores
                            dados={data.ranking}
                        />
                    </div>
                </article>
            </section>
        </div>
    );
}