"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    MenuInteracao,
} from "@/components/oportunidades/menu-interacao";
import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import {
    ModalTarefa,
} from "@/components/tarefas/modal-tarefa";
import {
    AlertCircle,
    ArrowLeft,
    BriefcaseBusiness,
    Building2,
    CalendarDays,
    CheckCircle2,
    CircleDollarSign,
    Clock3,
    Mail,
    MessageCircle,
    Phone,
    Target,
    Trash2,
    UserRound,
    Plus,
    Pencil,
} from "lucide-react";

import {
    alterarStatusOportunidade,
    buscarOportunidade,
    excluirOportunidade,
} from "@/lib/oportunidade";

import {
    StatusOportunidade,
    TipoInteracao,
} from "@/types/oportunidade";

import {
    ModalInteracao,
} from "@/components/oportunidades/modal-interacao";

import {
    ModalOportunidade,
} from "@/components/oportunidades/modal-oportunidade";

type Props = {
    oportunidadeId: string;
};

const statusDisponiveis: {
    valor: StatusOportunidade;
    rotulo: string;
}[] = [
        {
            valor: "NOVO_LEAD",
            rotulo: "Novo lead",
        },
        {
            valor: "PRIMEIRO_CONTATO",
            rotulo: "Primeiro contato",
        },
        {
            valor: "QUALIFICADO",
            rotulo: "Qualificado",
        },
        {
            valor: "PROPOSTA_ENVIADA",
            rotulo: "Proposta enviada",
        },
        {
            valor: "NEGOCIACAO",
            rotulo: "Negociação",
        },
        {
            valor: "FECHADO",
            rotulo: "Fechado",
        },
        {
            valor: "PERDIDO",
            rotulo: "Perdido",
        },
    ];

const coresStatus: Record<StatusOportunidade, string> = {
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

const iconesInteracao: Record<
    TipoInteracao,
    typeof Phone
> = {
    LIGACAO: Phone,
    EMAIL: Mail,
    WHATSAPP: MessageCircle,
    REUNIAO: UserRound,
    VISITA: Building2,
    ANOTACAO: BriefcaseBusiness,
};

function formatarMoeda(valor: number) {
    return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
}

function formatarData(data: string | null) {
    if (!data) {
        return "Não definida";
    }

    return new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "medium",
    }).format(new Date(data));
}

function formatarDataHora(data: string) {
    return new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(data));
}

export function DetalhesOportunidade({
    oportunidadeId,
}: Props) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [
        modalInteracaoAberto,
        setModalInteracaoAberto,
    ] = useState(false);

    const [
        modalEditarAberto,
        setModalEditarAberto,
    ] = useState(false);

    const [
        modalTarefaAberto,
        setModalTarefaAberto,
    ] = useState(false);


    const {
        data,
        isPending,
        isError,
        error,
    } = useQuery({
        queryKey: [
            "oportunidade",
            oportunidadeId,
        ],
        queryFn: () =>
            buscarOportunidade(oportunidadeId),
    });

    const mutationStatus = useMutation({
        mutationFn: (status: StatusOportunidade) =>
            alterarStatusOportunidade(
                oportunidadeId,
                status,
            ),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [
                    "oportunidade",
                    oportunidadeId,
                ],
            });

            queryClient.invalidateQueries({
                queryKey: ["oportunidades"],
            });
        },
    });

    const mutationExcluir = useMutation({
        mutationFn: () =>
            excluirOportunidade(oportunidadeId),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["oportunidades"],
            });

            router.push("/oportunidades");
        },
    });

    function confirmarExclusao() {
        const confirmou = window.confirm(
            "Tem certeza de que deseja excluir esta oportunidade? As tarefas e interações vinculadas também poderão ser removidas.",
        );

        if (confirmou) {
            mutationExcluir.mutate();
        }
    }

    if (isPending) {
        return (
            <div className="space-y-6">
                <div className="h-10 w-56 animate-pulse rounded-xl bg-slate-800" />

                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                    {Array.from({
                        length: 4,
                    }).map((_, indice) => (
                        <div
                            key={indice}
                            className="h-32 animate-pulse rounded-2xl border border-slate-800 bg-slate-900"
                        />
                    ))}
                </div>
            </div>
        );
    }

    if (isError || !data) {
        return (
            <div
                className="
                    flex items-center gap-3
                    rounded-2xl
                    border border-red-500/30
                    bg-red-500/10
                    p-5 text-red-300
                "
            >
                <AlertCircle size={20} />

                <span>
                    {error instanceof Error
                        ? error.message
                        : "Não foi possível carregar a oportunidade."}
                </span>
            </div>
        );
    }

    const oportunidade = data.oportunidade;

    const tarefasPendentes =
        oportunidade.tarefas.filter(
            (tarefa) =>
                tarefa.status === "PENDENTE" ||
                tarefa.status === "EM_ANDAMENTO",
        );

    return (
        <div className="space-y-8">
            <div
                className="
                    flex flex-col gap-5
                    lg:flex-row
                    lg:items-start
                    lg:justify-between
                "
            >
                <div>
                    <Link
                        href="/oportunidades"
                        className="
                            mb-4 inline-flex
                            items-center gap-2
                            text-sm text-slate-400
                            transition
                            hover:text-cyan-400
                        "
                    >
                        <ArrowLeft size={17} />

                        Voltar para oportunidades
                    </Link>

                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-3xl font-bold text-white">
                            {oportunidade.titulo}
                        </h1>

                        <span
                            className={`
                                rounded-full border
                                px-3 py-1
                                text-xs font-semibold
                                ${coresStatus[oportunidade.status]}
                            `}
                        >
                            {statusDisponiveis.find(
                                (status) =>
                                    status.valor ===
                                    oportunidade.status,
                            )?.rotulo}
                        </span>
                    </div>

                    <p className="mt-2 max-w-3xl text-slate-400">
                        {oportunidade.descricao ||
                            "Esta oportunidade ainda não possui uma descrição."}
                    </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">

                    <select
                        value={oportunidade.status}
                        disabled={mutationStatus.isPending}
                        onChange={(evento) =>
                            mutationStatus.mutate(
                                evento.target
                                    .value as StatusOportunidade,
                            )
                        }
                        className="
                            rounded-xl
                            border border-slate-700
                            bg-slate-900
                            px-4 py-3
                            text-sm font-medium text-white
                            outline-none
                            transition
                            focus:border-cyan-500
                            disabled:opacity-60
                        "
                    >
                        {statusDisponiveis.map((status) => (
                            <option
                                key={status.valor}
                                value={status.valor}
                            >
                                {status.rotulo}
                            </option>
                        ))}
                    </select>

                    <button
                        type="button"
                        onClick={() => setModalEditarAberto(true)}
                        className="
                            inline-flex
                            items-center justify-center gap-2
                            rounded-xl
                            border border-cyan-500/30
                            bg-cyan-500/10
                            px-4 py-3
                            text-sm font-semibold text-cyan-300
                            transition
                            hover:bg-cyan-500/20
                        "
                    >
                        <Pencil size={17} />
                        Editar
                    </button>



                    <button
                        type="button"
                        onClick={confirmarExclusao}
                        disabled={mutationExcluir.isPending}
                        className="
                            inline-flex
                            items-center justify-center gap-2
                            rounded-xl
                            border border-red-500/30
                            bg-red-500/10
                            px-4 py-3
                            text-sm font-semibold text-red-300
                            transition
                            hover:bg-red-500/20
                            disabled:cursor-not-allowed
                            disabled:opacity-60
                        "
                    >
                        <Trash2 size={17} />

                        {mutationExcluir.isPending
                            ? "Excluindo..."
                            : "Excluir"}
                    </button>
                </div>
            </div>

            {(mutationStatus.isError ||
                mutationExcluir.isError) && (
                    <div
                        className="
                        rounded-xl
                        border border-red-500/30
                        bg-red-500/10
                        px-4 py-3
                        text-sm text-red-300
                    "
                    >
                        {mutationStatus.error instanceof Error
                            ? mutationStatus.error.message
                            : mutationExcluir.error instanceof Error
                                ? mutationExcluir.error.message
                                : "Não foi possível concluir a operação."}
                    </div>
                )}

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-400">
                            Valor
                        </span>

                        <CircleDollarSign className="text-emerald-400" />
                    </div>

                    <p className="mt-4 text-3xl font-extrabold tracking-tight text-white">
                        {formatarMoeda(
                            oportunidade.valor,
                        )}
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-400">
                            Probabilidade
                        </span>

                        <Target className="text-cyan-400" />
                    </div>

                    <p className="mt-4 text-2xl font-bold text-white">
                        {oportunidade.probabilidade}%
                    </p>

                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all"
                            style={{
                                width: `${oportunidade.probabilidade}%`,
                            }}
                        />
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-400">
                            Previsão
                        </span>

                        <CalendarDays className="text-violet-400" />
                    </div>

                    <p className="mt-4 text-lg font-semibold text-white">
                        {formatarData(
                            oportunidade.previsaoFechamento,
                        )}
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-400">
                            Responsável
                        </span>

                        <UserRound className="text-amber-400" />
                    </div>

                    <p className="mt-4 text-lg font-semibold text-white">
                        {oportunidade.responsavel?.nome ??
                            "Não definido"}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                        {oportunidade.responsavel?.email}
                    </p>
                </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
                <section className="rounded-2xl border border-slate-800 bg-slate-900">
                    <div
                        className="
        flex flex-col gap-4
        border-b border-slate-800
        px-6 py-5
        sm:flex-row
        sm:items-center
        sm:justify-between
    "
                    >
                        <div>
                            <h2 className="text-lg font-semibold text-white">
                                Histórico de interações
                            </h2>

                            <p className="mt-1 text-sm text-slate-400">
                                Ligações, mensagens, reuniões e anotações.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                setModalInteracaoAberto(true)
                            }
                            className="
                                inline-flex items-center
                                justify-center gap-2
                                rounded-xl
                                bg-cyan-500
                                px-4 py-2.5
                                text-sm font-semibold
                                text-slate-950
                                transition
                                hover:bg-cyan-400
                            "

                        >
                            <Plus size={17} />

                            Nova interação
                        </button>
                    </div>

                    <div className="p-6">
                        {oportunidade.interacoes.length ===
                            0 ? (
                            <div className="py-12 text-center">
                                <MessageCircle
                                    size={34}
                                    className="mx-auto text-slate-600"
                                />

                                <p className="mt-3 font-medium text-slate-300">
                                    Nenhuma interação registrada
                                </p>

                                <p className="mt-1 text-sm text-slate-500">
                                    As interações com o cliente aparecerão aqui.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-5">
                                {oportunidade.interacoes.map(
                                    (interacao) => {
                                        const Icone =
                                            iconesInteracao[
                                            interacao.tipo
                                            ];

                                        return (
                                            <div
                                                key={
                                                    interacao.id
                                                }
                                                className="flex gap-4"
                                            >
                                                <div
                                                    className="
                                                        flex h-10 w-10
                                                        shrink-0
                                                        items-center justify-center
                                                        rounded-xl
                                                        border border-slate-700
                                                        bg-slate-950
                                                        text-cyan-400
                                                    "
                                                >
                                                    <Icone
                                                        size={
                                                            18
                                                        }
                                                    />
                                                </div>

                                                <div className="min-w-0 flex-1 border-b border-slate-800 pb-5">
                                                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                                        <p className="font-medium text-white">
                                                            {interacao.tipo.replaceAll(
                                                                "_",
                                                                " ",
                                                            )}
                                                        </p>

                                                        <div className="flex items-center gap-2">
                                                            <time className="text-xs text-slate-500">
                                                                {formatarDataHora(interacao.data)}
                                                            </time>

                                                            <MenuInteracao
                                                                oportunidadeId={oportunidadeId}
                                                                interacao={interacao}
                                                            />
                                                        </div>
                                                    </div>

                                                    <p className="mt-2 text-sm leading-6 text-slate-400">
                                                        {
                                                            interacao.descricao
                                                        }
                                                    </p>

                                                    <p className="mt-2 text-xs text-slate-600">
                                                        Registrado por{" "}
                                                        {interacao
                                                            .usuario
                                                            ?.nome ??
                                                            "usuário removido"}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    },
                                )}
                            </div>
                        )}
                    </div>
                </section>

                <div className="space-y-6">
                    <section className="rounded-2xl border border-slate-800 bg-slate-900">
                        <div className="border-b border-slate-800 px-6 py-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-semibold text-white">
                                        Tarefas
                                    </h2>

                                    <p className="mt-1 text-sm text-slate-400">
                                        {
                                            tarefasPendentes.length
                                        }{" "}
                                        pendentes
                                    </p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setModalTarefaAberto(true)}
                                        className="
                                        inline-flex
                                        items-center
                                        gap-2
                                        rounded-xl
                                        bg-cyan-500
                                        px-3 py-2
                                        text-sm
                                        font-semibold
                                        text-slate-950
                                        transition
                                        hover:bg-cyan-400
                                        "
                                    >
                                        <Plus size={16} />

                                        Nova tarefa
                                    </button>

                                    <CheckCircle2 className="text-emerald-400" />
                                </div>
                            </div>
                        </div>

                        <div className="p-5">
                            {oportunidade.tarefas.length ===
                                0 ? (
                                <div className="py-10 text-center">
                                    <Clock3
                                        size={36}
                                        className="mx-auto text-slate-600"
                                    />

                                    <p className="mt-4 font-medium text-slate-300">
                                        Nenhuma tarefa vinculada
                                    </p>

                                    <p className="mt-2 text-sm text-slate-500">
                                        As tarefas desta negociação aparecerão aqui.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {oportunidade.tarefas.map(
                                        (tarefa) => (
                                            <div
                                                key={
                                                    tarefa.id
                                                }
                                                className="
                                                    rounded-xl
                                                    border border-slate-800
                                                    bg-slate-950/70
                                                    p-4
                                                "
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <p className="font-medium text-white">
                                                        {
                                                            tarefa.titulo
                                                        }
                                                    </p>

                                                    <span className="shrink-0 rounded-full bg-slate-800 px-2 py-1 text-[10px] font-semibold text-slate-300">
                                                        {
                                                            tarefa.prioridade
                                                        }
                                                    </span>
                                                </div>

                                                <p className="mt-2 text-xs text-slate-500">
                                                    Prazo:{" "}
                                                    {formatarData(
                                                        tarefa.dataLimite,
                                                    )}
                                                </p>

                                                <p className="mt-1 text-xs text-slate-600">
                                                    {
                                                        tarefa.status
                                                    }
                                                </p>
                                            </div>
                                        ),
                                    )}
                                </div>
                            )}
                        </div>
                    </section>

                    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                        <h2 className="text-lg font-semibold text-white">
                            Cliente
                        </h2>

                        <div className="mt-5 space-y-4">
                            <div>
                                <p className="text-xs uppercase tracking-wide text-slate-600">
                                    Nome
                                </p>

                                <p className="mt-1 font-medium text-slate-200">
                                    {
                                        oportunidade.cliente
                                            .nome
                                    }
                                </p>
                            </div>

                            <div>
                                <p className="text-xs uppercase tracking-wide text-slate-600">
                                    Empresa
                                </p>

                                <p className="mt-1 text-slate-300">
                                    {oportunidade.cliente
                                        .empresa ||
                                        "Não informada"}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs uppercase tracking-wide text-slate-600">
                                    Telefone
                                </p>

                                <p className="mt-1 text-slate-300">
                                    {oportunidade.cliente
                                        .telefone ||
                                        "Não informado"}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs uppercase tracking-wide text-slate-600">
                                    E-mail
                                </p>

                                <p className="mt-1 break-all text-slate-300">
                                    {oportunidade.cliente
                                        .email ||
                                        "Não informado"}
                                </p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
            <ModalOportunidade
                aberto={modalEditarAberto}
                fechar={() => setModalEditarAberto(false)}
                modo="editar"
                oportunidade={oportunidade}
            />

            <ModalInteracao
                oportunidadeId={oportunidadeId}
                aberto={modalInteracaoAberto}
                aoFechar={() =>
                    setModalInteracaoAberto(false)
                }
            />

            <ModalTarefa
                oportunidadeId={oportunidadeId}
                aberto={modalTarefaAberto}
                aoFechar={() =>
                    setModalTarefaAberto(false)
                }
            />
        </div>
    );
}