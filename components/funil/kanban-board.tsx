"use client";

import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    useMemo,
    useState,
} from "react";
import { useRouter } from "next/navigation";
import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import {
    moverOportunidade,
    type MoverOportunidadeParametros,
} from "@/lib/funil";

import type {
    Oportunidade,
    StatusOportunidade,
} from "@/types/oportunidade";

import {
    KanbanCard,
} from "@/components/funil/kanban-card";

import {
    KanbanColumn,
} from "@/components/funil/kanban-column";

import {
    ModalMotivoPerda,
} from "@/components/funil/modal-motivo-perda";

type Props = {
    oportunidades: Oportunidade[];
};

type ConfiguracaoColuna = {
    status: StatusOportunidade;
    titulo: string;
    cor: string;
};

type MovimentoPendente = {
    oportunidade: Oportunidade;
    novoStatus: StatusOportunidade;
};

const colunas: ConfiguracaoColuna[] = [
    {
        status: "NOVO_LEAD",
        titulo: "Novo lead",
        cor: "bg-slate-400",
    },
    {
        status: "PRIMEIRO_CONTATO",
        titulo: "Primeiro contato",
        cor: "bg-blue-500",
    },
    {
        status: "QUALIFICADO",
        titulo: "Qualificado",
        cor: "bg-violet-500",
    },
    {
        status: "PROPOSTA_ENVIADA",
        titulo: "Proposta enviada",
        cor: "bg-amber-500",
    },
    {
        status: "NEGOCIACAO",
        titulo: "Negociação",
        cor: "bg-orange-500",
    },
    {
        status: "FECHADO",
        titulo: "Fechado",
        cor: "bg-emerald-500",
    },
    {
        status: "PERDIDO",
        titulo: "Perdido",
        cor: "bg-red-500",
    },
];

const probabilidadesPorStatus: Record<
    StatusOportunidade,
    number
> = {
    NOVO_LEAD: 10,
    PRIMEIRO_CONTATO: 20,
    QUALIFICADO: 40,
    PROPOSTA_ENVIADA: 60,
    NEGOCIACAO: 80,
    FECHADO: 100,
    PERDIDO: 0,
};

export function KanbanBoard({
    oportunidades,
}: Props) {
    const router = useRouter();
    const queryClient =
        useQueryClient();

    const [
        oportunidadeAtiva,
        setOportunidadeAtiva,
    ] = useState<Oportunidade | null>(
        null,
    );

    const [
        movimentoPendente,
        setMovimentoPendente,
    ] = useState<MovimentoPendente | null>(
        null,
    );

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
    );

    const oportunidadesAgrupadas =
        useMemo(() => {
            const grupos = {} as Record<
                StatusOportunidade,
                Oportunidade[]
            >;

            for (const coluna of colunas) {
                grupos[coluna.status] = [];
            }

            for (const oportunidade of oportunidades) {
                grupos[
                    oportunidade.status
                ].push(oportunidade);
            }

            return grupos;
        }, [oportunidades]);

    const mutationMover = useMutation({
        mutationFn: (
            parametros: MoverOportunidadeParametros,
        ) =>
            moverOportunidade(
                parametros,
            ),

        onMutate: async ({
            oportunidadeId,
            status,
        }) => {
            await queryClient.cancelQueries({
                queryKey: ["funil"],
            });

            const dadosAnteriores =
                queryClient.getQueryData<{
                    oportunidades: Oportunidade[];
                }>(["funil"]);

            queryClient.setQueryData<{
                oportunidades: Oportunidade[];
            }>(
                ["funil"],
                (dadosAtuais) => {
                    if (!dadosAtuais) {
                        return dadosAtuais;
                    }

                    return {
                        ...dadosAtuais,

                        oportunidades:
                            dadosAtuais.oportunidades.map(
                                (
                                    oportunidade,
                                ) =>
                                    oportunidade.id ===
                                        oportunidadeId
                                        ? {
                                            ...oportunidade,
                                            status,
                                            probabilidade:
                                                probabilidadesPorStatus[
                                                status
                                                ],
                                        }
                                        : oportunidade,
                            ),
                    };
                },
            );

            return {
                dadosAnteriores,
            };
        },

        onSuccess: () => {
            setMovimentoPendente(
                null,
            );
        },

        onError: (
            _erro,
            _variaveis,
            contexto,
        ) => {
            if (
                contexto?.dadosAnteriores
            ) {
                queryClient.setQueryData(
                    ["funil"],
                    contexto.dadosAnteriores,
                );
            }
        },

        onSettled: async () => {
            await queryClient.invalidateQueries({
                queryKey: ["funil"],
            });

            await queryClient.invalidateQueries({
                queryKey: [
                    "oportunidades",
                ],
            });

            await queryClient.invalidateQueries({
                queryKey: ["dashboard"],
            });
        },
    });

    function mover(
        oportunidade: Oportunidade,
        novoStatus: StatusOportunidade,
        motivoPerda?: string,
    ) {
        mutationMover.mutate({
            oportunidadeId:
                oportunidade.id,

            status: novoStatus,

            motivoPerda:
                novoStatus === "PERDIDO"
                    ? motivoPerda
                    : null,
        });
    }

    function aoIniciarArraste(
        evento: DragStartEvent,
    ) {
        const oportunidade =
            oportunidades.find(
                (item) =>
                    item.id ===
                    String(
                        evento.active.id,
                    ),
            );

        setOportunidadeAtiva(
            oportunidade ?? null,
        );
    }

    function aoFinalizarArraste(
        evento: DragEndEvent,
    ) {
        setOportunidadeAtiva(null);

        const oportunidadeId =
            String(evento.active.id);

        const novoStatus =
            evento.over?.id as
            | StatusOportunidade
            | undefined;

        if (!novoStatus) {
            return;
        }

        const oportunidade =
            oportunidades.find(
                (item) =>
                    item.id ===
                    oportunidadeId,
            );

        if (
            !oportunidade ||
            oportunidade.status ===
            novoStatus
        ) {
            return;
        }

        if (
            novoStatus === "PERDIDO"
        ) {
            setMovimentoPendente({
                oportunidade,
                novoStatus,
            });

            return;
        }

        mover(
            oportunidade,
            novoStatus,
        );
    }

    function fecharModalPerda() {
        if (
            mutationMover.isPending
        ) {
            return;
        }

        setMovimentoPendente(null);
    }

    function confirmarPerda(
        motivoPerda: string,
    ) {
        if (!movimentoPendente) {
            return;
        }

        mover(
            movimentoPendente
                .oportunidade,
            "PERDIDO",
            motivoPerda,
        );
    }

    const erroMover =
        mutationMover.error instanceof
            Error
            ? mutationMover.error.message
            : mutationMover.isError
                ? "Não foi possível mover a oportunidade."
                : undefined;

    return (
        <>
            {mutationMover.isError &&
                !movimentoPendente && (
                    <div
                        className="
                            mb-5 rounded-xl
                            border border-red-500/30
                            bg-red-500/10
                            px-4 py-3
                            text-sm text-red-300
                        "
                    >
                        {erroMover}
                    </div>
                )}

            <DndContext
                sensors={sensors}
                onDragStart={
                    aoIniciarArraste
                }
                onDragEnd={
                    aoFinalizarArraste
                }
                onDragCancel={() =>
                    setOportunidadeAtiva(
                        null,
                    )
                }
            >
                <div className="overflow-x-auto pb-5">
                    <div className="flex min-w-max items-start gap-4">
                        {colunas.map(
                            (coluna) => (
                                <KanbanColumn
                                    key={
                                        coluna.status
                                    }
                                    status={
                                        coluna.status
                                    }
                                    titulo={
                                        coluna.titulo
                                    }
                                    cor={
                                        coluna.cor
                                    }
                                    oportunidades={
                                        oportunidadesAgrupadas[
                                        coluna
                                            .status
                                        ]
                                    }
                                    aoAbrirOportunidade={(
                                        oportunidadeId,
                                    ) =>
                                        router.push(
                                            `/oportunidades/${oportunidadeId}`,
                                        )
                                    }
                                />
                            ),
                        )}
                    </div>
                </div>

                <DragOverlay>
                    {oportunidadeAtiva ? (
                        <div className="w-[286px]">
                            <KanbanCard
                                oportunidade={
                                    oportunidadeAtiva
                                }
                                arrastando
                            />
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>

            <ModalMotivoPerda
                aberto={Boolean(
                    movimentoPendente,
                )}
                tituloOportunidade={
                    movimentoPendente
                        ?.oportunidade
                        .titulo
                }
                carregando={
                    mutationMover.isPending
                }
                erro={
                    movimentoPendente
                        ? erroMover
                        : undefined
                }
                aoFechar={
                    fecharModalPerda
                }
                aoConfirmar={
                    confirmarPerda
                }
            />
        </>
    );
}