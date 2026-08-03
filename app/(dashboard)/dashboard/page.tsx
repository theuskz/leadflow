"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
    AlertCircle,
    ArrowRight,
    BriefcaseBusiness,
    CircleDollarSign,
    Clock3,
    Loader2,
    RefreshCw,
    Trophy,
    TrendingUp,
    UsersRound,
} from "lucide-react";

import {
    buscarDashboard,
} from "@/lib/dashboard";

import {
    GraficoVendas,
} from "@/components/relatorios/grafico-vendas";

import type {
    StatusOportunidadeDashboard,
} from "@/types/dashboard";

const nomesStatus: Record<
    StatusOportunidadeDashboard,
    string
> = {
    NOVO_LEAD: "Novo lead",
    PRIMEIRO_CONTATO: "Primeiro contato",
    QUALIFICADO: "Qualificado",
    PROPOSTA_ENVIADA: "Proposta enviada",
    NEGOCIACAO: "Negociação",
    FECHADO: "Fechado",
    PERDIDO: "Perdido",
};

const coresStatus: Record<
    StatusOportunidadeDashboard,
    string
> = {
    NOVO_LEAD:
        "border-slate-500/30 bg-slate-500/10 text-slate-300",
    PRIMEIRO_CONTATO:
        "border-blue-500/30 bg-blue-500/10 text-blue-300",
    QUALIFICADO:
        "border-violet-500/30 bg-violet-500/10 text-violet-300",
    PROPOSTA_ENVIADA:
        "border-amber-500/30 bg-amber-500/10 text-amber-300",
    NEGOCIACAO:
        "border-orange-500/30 bg-orange-500/10 text-orange-300",
    FECHADO:
        "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    PERDIDO:
        "border-red-500/30 bg-red-500/10 text-red-300",
};

function formatarMoeda(valor: number) {
    return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
}

function formatarData(data: string) {
    return new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "medium",
    }).format(new Date(data));
}

export default function DashboardPage() {
    const {
        data,
        isPending,
        isFetching,
        isError,
        error,
        refetch,
    } = useQuery({
        queryKey: ["dashboard"],
        queryFn: buscarDashboard,
    });

    if (isPending) {
        return (
            <div className="flex min-h-[500px] items-center justify-center gap-3 text-slate-400">
                <Loader2
                    size={22}
                    className="animate-spin"
                />

                Carregando dashboard...
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
                    Não foi possível carregar o dashboard
                </h2>

                <p className="mt-2 text-sm text-slate-400">
                    {error instanceof Error
                        ? error.message
                        : "Ocorreu um erro inesperado."}
                </p>

                <button
                    type="button"
                    onClick={() => refetch()}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-400"
                >
                    <RefreshCw size={16} />
                    Tentar novamente
                </button>
            </div>
        );
    }

    const maiorQuantidade = Math.max(
        ...data.funil.map(
            (item) => item.quantidade,
        ),
        1,
    );

    const metricas = [
        {
            titulo: "Total de clientes",
            valor: String(
                data.resumo.totalClientes,
            ),
            descricao:
                "Clientes ativos no sistema",
            icon: UsersRound,
        },
        {
            titulo:
                "Oportunidades abertas",
            valor: String(
                data.resumo
                    .oportunidadesAbertas,
            ),
            descricao:
                "Negociações em andamento",
            icon: BriefcaseBusiness,
        },
        {
            titulo: "Valor em negociação",
            valor: formatarMoeda(
                data.resumo.valorPipeline,
            ),
            descricao:
                "Soma das oportunidades abertas",
            icon: CircleDollarSign,
        },
        {
            titulo: "Taxa de conversão",
            valor: `${data.resumo.taxaConversao.toFixed(
                1,
            )}%`,
            descricao: `${data.resumo.oportunidadesFechadas} fechadas e ${data.resumo.oportunidadesPerdidas} perdidas`,
            icon: TrendingUp,
        },
    ];

    return (
        <div className="space-y-6">
            <header className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                    <p className="text-sm font-medium text-blue-400">
                        Visão geral
                    </p>

                    <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">
                        Dashboard comercial
                    </h1>

                    <p className="mt-2 text-slate-400">
                        Acompanhe os principais indicadores da sua operação.
                    </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                        type="button"
                        onClick={() => refetch()}
                        disabled={isFetching}
                        className="
                            inline-flex h-11
                            items-center justify-center gap-2
                            rounded-xl
                            border border-slate-800
                            bg-slate-900
                            px-4 text-sm font-medium
                            text-slate-300
                            transition
                            hover:bg-slate-800
                            hover:text-white
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

                    <Link
                        href="/oportunidades"
                        className="
                            inline-flex h-11
                            items-center justify-center gap-2
                            rounded-xl
                            bg-blue-600
                            px-5
                            text-sm font-semibold
                            text-white
                            transition
                            hover:bg-blue-700
                        "
                    >
                        Nova oportunidade
                    </Link>
                </div>
            </header>

            <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {metricas.map((metrica) => {
                    const Icon = metrica.icon;

                    return (
                        <article
                            key={metrica.titulo}
                            className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5"
                        >
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                                <Icon className="h-5 w-5" />
                            </div>

                            <p className="mt-5 text-sm text-slate-400">
                                {metrica.titulo}
                            </p>

                            <p className="mt-2 text-2xl font-bold text-white">
                                {metrica.valor}
                            </p>

                            <p className="mt-2 text-xs text-slate-500">
                                {metrica.descricao}
                            </p>
                        </article>
                    );
                })}
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
                <article className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
                    <div>
                        <h2 className="text-lg font-semibold text-white">
                            Desempenho comercial
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Vendas fechadas nos últimos seis meses
                        </p>
                    </div>

                    <div className="mt-6">
                        <GraficoVendas
                            dados={
                                data.vendasPorMes
                            }
                        />
                    </div>
                </article>

                <article className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
                    <h2 className="text-lg font-semibold text-white">
                        Resumo do funil
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Distribuição atual das oportunidades
                    </p>

                    <div className="mt-6 space-y-5">
                        {data.funil.map(
                            (etapa) => {
                                const percentual =
                                    (etapa.quantidade /
                                        maiorQuantidade) *
                                    100;

                                return (
                                    <div
                                        key={
                                            etapa.status
                                        }
                                    >
                                        <div className="mb-2 flex items-center justify-between">
                                            <span className="text-sm text-slate-300">
                                                {
                                                    etapa.nome
                                                }
                                            </span>

                                            <span className="text-sm font-semibold text-white">
                                                {
                                                    etapa.quantidade
                                                }
                                            </span>
                                        </div>

                                        <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                                            <div
                                                className="h-full rounded-full bg-blue-600 transition-all"
                                                style={{
                                                    width: `${percentual}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            },
                        )}
                    </div>
                </article>
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                <article className="rounded-2xl border border-slate-800 bg-slate-900/60">
                    <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">
                        <div>
                            <h2 className="text-lg font-semibold text-white">
                                Oportunidades recentes
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Negociações atualizadas recentemente
                            </p>
                        </div>

                        <Link
                            href="/oportunidades"
                            className="inline-flex items-center gap-2 text-sm font-medium text-blue-400 transition hover:text-blue-300"
                        >
                            Ver todas
                            <ArrowRight size={16} />
                        </Link>
                    </div>

                    {data.ultimasOportunidades
                        .length === 0 ? (
                        <div className="flex min-h-[260px] items-center justify-center p-6 text-sm text-slate-600">
                            Nenhuma oportunidade cadastrada.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-2xl">
                                <thead>
                                    <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wider text-slate-500">
                                        <th className="px-6 py-4 font-medium">
                                            Cliente
                                        </th>

                                        <th className="px-6 py-4 font-medium">
                                            Oportunidade
                                        </th>

                                        <th className="px-6 py-4 font-medium">
                                            Valor
                                        </th>

                                        <th className="px-6 py-4 font-medium">
                                            Etapa
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {data.ultimasOportunidades.map(
                                        (
                                            oportunidade,
                                        ) => (
                                            <tr
                                                key={
                                                    oportunidade.id
                                                }
                                                className="border-b border-slate-800/70 last:border-0"
                                            >
                                                <td className="px-6 py-5">
                                                    <Link
                                                        href={`/oportunidades/${oportunidade.id}`}
                                                        className="text-sm font-medium text-white transition hover:text-blue-400"
                                                    >
                                                        {
                                                            oportunidade
                                                                .cliente
                                                                .nome
                                                        }
                                                    </Link>

                                                    {oportunidade
                                                        .cliente
                                                        .empresa && (
                                                            <p className="mt-1 text-xs text-slate-600">
                                                                {
                                                                    oportunidade
                                                                        .cliente
                                                                        .empresa
                                                                }
                                                            </p>
                                                        )}
                                                </td>

                                                <td className="px-6 py-5 text-sm text-slate-400">
                                                    {
                                                        oportunidade.titulo
                                                    }
                                                </td>

                                                <td className="px-6 py-5 text-sm font-medium text-slate-200">
                                                    {formatarMoeda(
                                                        oportunidade.valor,
                                                    )}
                                                </td>

                                                <td className="px-6 py-5">
                                                    <span
                                                        className={`
                                                            rounded-full border
                                                            px-3 py-1
                                                            text-xs font-medium
                                                            ${coresStatus[
                                                            oportunidade
                                                                .status
                                                            ]
                                                            }
                                                        `}
                                                    >
                                                        {
                                                            nomesStatus[
                                                            oportunidade
                                                                .status
                                                            ]
                                                        }
                                                    </span>
                                                </td>
                                            </tr>
                                        ),
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </article>

                <div className="space-y-6">
                    <article className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-white">
                                    Melhor vendedor
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Maior valor fechado
                                </p>
                            </div>

                            <Trophy className="text-amber-400" />
                        </div>

                        {data.melhorVendedor ? (
                            <div className="mt-6">
                                <p className="text-xl font-semibold text-white">
                                    {
                                        data
                                            .melhorVendedor
                                            .nome
                                    }
                                </p>

                                <p className="mt-2 text-3xl font-bold tracking-tight text-cyan-400">
                                    {formatarMoeda(
                                        data
                                            .melhorVendedor
                                            .valor,
                                    )}
                                </p>

                                <p className="mt-2 text-sm text-slate-500">
                                    {
                                        data
                                            .melhorVendedor
                                            .quantidade
                                    }{" "}
                                    venda
                                    {data
                                        .melhorVendedor
                                        .quantidade !==
                                        1
                                        ? "s"
                                        : ""}
                                </p>
                            </div>
                        ) : (
                            <div className="mt-6 flex min-h-[120px] items-center justify-center text-center text-sm text-slate-600">
                                Nenhuma venda fechada.
                            </div>
                        )}
                    </article>

                    <article className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-white">
                                    Precisam de atenção
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Sem atualização há 7 dias ou mais
                                </p>
                            </div>

                            <Clock3 className="text-orange-400" />
                        </div>

                        {data
                            .oportunidadesAtencao
                            .length === 0 ? (
                            <div className="mt-6 flex min-h-[120px] items-center justify-center text-center text-sm text-slate-600">
                                Nenhuma oportunidade parada.
                            </div>
                        ) : (
                            <div className="mt-5 space-y-3">
                                {data.oportunidadesAtencao.map(
                                    (
                                        oportunidade,
                                    ) => (
                                        <Link
                                            key={
                                                oportunidade.id
                                            }
                                            href={`/oportunidades/${oportunidade.id}`}
                                            className="
                                                block rounded-xl
                                                border border-slate-800
                                                bg-slate-950/70
                                                p-4 transition
                                                hover:border-orange-500/30
                                                hover:bg-orange-500/5
                                            "
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="truncate font-medium text-white">
                                                        {
                                                            oportunidade.titulo
                                                        }
                                                    </p>

                                                    <p className="mt-1 truncate text-xs text-slate-500">
                                                        {
                                                            oportunidade
                                                                .cliente
                                                                .nome
                                                        }
                                                    </p>
                                                </div>

                                                <span className="shrink-0 rounded-full bg-orange-500/10 px-2.5 py-1 text-xs font-semibold text-orange-300">
                                                    {
                                                        oportunidade.diasSemAtualizacao
                                                    }{" "}
                                                    dias
                                                </span>
                                            </div>

                                            <p className="mt-3 text-sm font-medium text-slate-300">
                                                {formatarMoeda(
                                                    oportunidade.valor,
                                                )}
                                            </p>
                                        </Link>
                                    ),
                                )}
                            </div>
                        )}
                    </article>
                </div>
            </section>
        </div>
    );
}