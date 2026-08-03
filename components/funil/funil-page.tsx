"use client";

import {
    useMemo,
    useState,
} from "react";
import { useQuery } from "@tanstack/react-query";
import {
    AlertCircle,
    BriefcaseBusiness,
    FilterX,
    Loader2,
    RefreshCw,
    Search,
    UserRound,
} from "lucide-react";

import {
    buscarFunil,
} from "@/lib/funil";

import {
    KanbanBoard,
} from "@/components/funil/kanban-board";

function formatarMoeda(valor: number) {
    return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
}

function normalizarTexto(texto: string) {
    return texto
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

export function FunilPage() {
    const [busca, setBusca] = useState("");
    const [
        responsavelSelecionado,
        setResponsavelSelecionado,
    ] = useState("TODOS");

    const {
        data,
        isPending,
        isFetching,
        isError,
        error,
        refetch,
    } = useQuery({
        queryKey: ["funil"],
        queryFn: buscarFunil,
    });

    const oportunidades =
        data?.oportunidades ?? [];

    const responsaveis = useMemo(() => {
        const mapa = new Map<
            string,
            {
                id: string;
                nome: string;
            }
        >();

        oportunidades.forEach(
            (oportunidade) => {
                if (
                    oportunidade.responsavel
                ) {
                    mapa.set(
                        oportunidade
                            .responsavel.id,
                        {
                            id: oportunidade
                                .responsavel.id,
                            nome: oportunidade
                                .responsavel.nome,
                        },
                    );
                }
            },
        );

        return Array.from(
            mapa.values(),
        ).sort((a, b) =>
            a.nome.localeCompare(
                b.nome,
                "pt-BR",
            ),
        );
    }, [oportunidades]);

    const oportunidadesFiltradas =
        useMemo(() => {
            const termo =
                normalizarTexto(busca);

            return oportunidades.filter(
                (oportunidade) => {
                    const correspondeBusca =
                        !termo ||
                        [
                            oportunidade.titulo,
                            oportunidade.cliente
                                .nome,
                            oportunidade.cliente
                                .empresa ?? "",
                            oportunidade.responsavel
                                ?.nome ?? "",
                            oportunidade.descricao ??
                            "",
                        ].some((valor) =>
                            normalizarTexto(
                                valor,
                            ).includes(termo),
                        );

                    const correspondeResponsavel =
                        responsavelSelecionado ===
                        "TODOS" ||
                        (responsavelSelecionado ===
                            "SEM_RESPONSAVEL" &&
                            !oportunidade.responsavel) ||
                        oportunidade.responsavel
                            ?.id ===
                        responsavelSelecionado;

                    return (
                        correspondeBusca &&
                        correspondeResponsavel
                    );
                },
            );
        }, [
            oportunidades,
            busca,
            responsavelSelecionado,
        ]);

    const oportunidadesAbertas =
        oportunidadesFiltradas.filter(
            (oportunidade) =>
                oportunidade.status !==
                "FECHADO" &&
                oportunidade.status !==
                "PERDIDO",
        );

    const valorPipeline =
        oportunidadesAbertas.reduce(
            (total, oportunidade) =>
                total +
                oportunidade.valor,
            0,
        );

    const possuiFiltros =
        Boolean(busca.trim()) ||
        responsavelSelecionado !==
        "TODOS";

    function limparFiltros() {
        setBusca("");
        setResponsavelSelecionado(
            "TODOS",
        );
    }

    if (isPending) {
        return (
            <div className="flex min-h-[500px] items-center justify-center gap-3 text-slate-400">
                <Loader2
                    size={22}
                    className="animate-spin"
                />

                Carregando funil de vendas...
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center">
                <AlertCircle
                    size={34}
                    className="text-red-400"
                />

                <h2 className="mt-4 font-semibold text-red-300">
                    Não foi possível carregar o funil
                </h2>

                <p className="mt-2 text-sm text-slate-400">
                    {error instanceof Error
                        ? error.message
                        : "Ocorreu um erro inesperado."}
                </p>

                <button
                    type="button"
                    onClick={() =>
                        refetch()
                    }
                    className="
                        mt-5 inline-flex
                        items-center gap-2
                        rounded-xl
                        bg-red-500
                        px-4 py-2.5
                        text-sm font-semibold
                        text-white
                        transition
                        hover:bg-red-400
                    "
                >
                    <RefreshCw
                        size={16}
                    />

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
                        Pipeline comercial
                    </p>

                    <h1 className="mt-2 text-3xl font-bold text-white">
                        Funil de vendas
                    </h1>

                    <p className="mt-2 max-w-2xl text-slate-400">
                        Arraste as oportunidades entre as etapas para atualizar o andamento das negociações.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() =>
                        refetch()
                    }
                    disabled={
                        isFetching
                    }
                    className="
                        inline-flex items-center
                        justify-center gap-2
                        rounded-xl
                        border border-slate-800
                        bg-slate-900
                        px-4 py-2.5
                        text-sm font-medium
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
            </header>

            <section className="grid gap-4 sm:grid-cols-2">
                <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-400">
                            Pipeline aberto
                        </span>

                        <BriefcaseBusiness className="text-cyan-400" />
                    </div>

                    <strong className="mt-4 block text-3xl font-bold tracking-tight text-white">
                        {formatarMoeda(
                            valorPipeline,
                        )}
                    </strong>
                </article>

                <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-400">
                            Oportunidades abertas
                        </span>

                        <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                            Em andamento
                        </span>
                    </div>

                    <strong className="mt-4 block text-3xl font-bold tracking-tight text-white">
                        {
                            oportunidadesAbertas.length
                        }
                    </strong>
                </article>
            </section>

            <section
                className="
                    rounded-2xl
                    border border-slate-800
                    bg-slate-900/70
                    p-4
                "
            >
                <div
                    className="
                        grid gap-3
                        lg:grid-cols-[minmax(280px,1fr)_280px_auto]
                    "
                >
                    <div className="relative">
                        <Search
                            size={18}
                            className="
                                pointer-events-none
                                absolute left-4 top-1/2
                                -translate-y-1/2
                                text-slate-500
                            "
                        />

                        <input
                            type="search"
                            value={busca}
                            onChange={(
                                evento,
                            ) =>
                                setBusca(
                                    evento
                                        .target
                                        .value,
                                )
                            }
                            placeholder="Buscar por oportunidade, cliente ou empresa..."
                            className="
                                h-12 w-full
                                rounded-xl
                                border border-slate-700
                                bg-slate-950
                                pl-11 pr-4
                                text-sm text-white
                                outline-none
                                transition
                                placeholder:text-slate-600
                                focus:border-cyan-500
                            "
                        />
                    </div>

                    <div className="relative">
                        <UserRound
                            size={18}
                            className="
                                pointer-events-none
                                absolute left-4 top-1/2
                                -translate-y-1/2
                                text-slate-500
                            "
                        />

                        <select
                            value={
                                responsavelSelecionado
                            }
                            onChange={(
                                evento,
                            ) =>
                                setResponsavelSelecionado(
                                    evento
                                        .target
                                        .value,
                                )
                            }
                            className="
                                h-12 w-full
                                appearance-none
                                rounded-xl
                                border border-slate-700
                                bg-slate-950
                                pl-11 pr-4
                                text-sm text-white
                                outline-none
                                transition
                                focus:border-cyan-500
                            "
                        >
                            <option value="TODOS">
                                Todos os responsáveis
                            </option>

                            <option value="SEM_RESPONSAVEL">
                                Sem responsável
                            </option>

                            {responsaveis.map(
                                (
                                    responsavel,
                                ) => (
                                    <option
                                        key={
                                            responsavel.id
                                        }
                                        value={
                                            responsavel.id
                                        }
                                    >
                                        {
                                            responsavel.nome
                                        }
                                    </option>
                                ),
                            )}
                        </select>
                    </div>

                    <button
                        type="button"
                        onClick={
                            limparFiltros
                        }
                        disabled={
                            !possuiFiltros
                        }
                        className="
                            inline-flex h-12
                            items-center
                            justify-center gap-2
                            rounded-xl
                            border border-slate-700
                            px-4
                            text-sm font-medium
                            text-slate-300
                            transition
                            hover:bg-slate-800
                            hover:text-white
                            disabled:cursor-not-allowed
                            disabled:opacity-40
                        "
                    >
                        <FilterX
                            size={17}
                        />

                        Limpar
                    </button>
                </div>

                <div
                    className="
                        mt-4 flex flex-col
                        gap-2 border-t
                        border-slate-800
                        pt-4 text-sm
                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                    "
                >
                    <p className="text-slate-500">
                        Exibindo{" "}
                        <strong className="text-slate-300">
                            {
                                oportunidadesFiltradas.length
                            }
                        </strong>{" "}
                        de{" "}
                        <strong className="text-slate-300">
                            {
                                oportunidades.length
                            }
                        </strong>{" "}
                        oportunidades
                    </p>

                    {possuiFiltros && (
                        <span className="text-xs font-medium text-cyan-400">
                            Filtros ativos
                        </span>
                    )}
                </div>
            </section>

            {oportunidades.length ===
                0 ? (
                <div className="flex min-h-[340px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-8 text-center">
                    <BriefcaseBusiness
                        size={38}
                        className="text-slate-600"
                    />

                    <h2 className="mt-4 font-semibold text-white">
                        Nenhuma oportunidade cadastrada
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                        Cadastre oportunidades para visualizá-las no funil.
                    </p>
                </div>
            ) : oportunidadesFiltradas
                .length === 0 ? (
                <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-8 text-center">
                    <Search
                        size={36}
                        className="text-slate-600"
                    />

                    <h2 className="mt-4 font-semibold text-white">
                        Nenhum resultado encontrado
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                        Tente alterar ou limpar os filtros aplicados.
                    </p>

                    <button
                        type="button"
                        onClick={
                            limparFiltros
                        }
                        className="
                            mt-5 inline-flex
                            items-center gap-2
                            rounded-xl
                            bg-cyan-500
                            px-4 py-2.5
                            text-sm font-semibold
                            text-slate-950
                            transition
                            hover:bg-cyan-400
                        "
                    >
                        <FilterX
                            size={16}
                        />

                        Limpar filtros
                    </button>
                </div>
            ) : (
                <KanbanBoard
                    oportunidades={
                        oportunidadesFiltradas
                    }
                />
            )}
        </div>
    );
}