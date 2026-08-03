"use client";

import { useDroppable } from "@dnd-kit/core";
import { CircleDollarSign } from "lucide-react";

import type {
    Oportunidade,
    StatusOportunidade,
} from "@/types/oportunidade";

import {
    KanbanCard,
} from "@/components/funil/kanban-card";

type Props = {
    status: StatusOportunidade;
    titulo: string;
    oportunidades: Oportunidade[];
    cor: string;
    aoAbrirOportunidade: (
        oportunidadeId: string,
    ) => void;
};

function formatarMoedaCompacta(valor: number) {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        notation: "compact",
        maximumFractionDigits: 1,
    }).format(valor);
}

export function KanbanColumn({
    status,
    titulo,
    oportunidades,
    cor,
    aoAbrirOportunidade,
}: Props) {
    const {
        setNodeRef,
        isOver,
    } = useDroppable({
        id: status,
        data: {
            status,
            tipo: "coluna",
        },
    });

    const valorTotal = oportunidades.reduce(
        (total, oportunidade) =>
            total + oportunidade.valor,
        0,
    );

    return (
        <section
            ref={setNodeRef}
            className={[
                "flex w-[310px] min-w-[310px] flex-col",
                "rounded-2xl border bg-slate-900/70",
                "transition duration-200",
                isOver
                    ? "border-cyan-500/60 bg-cyan-500/5 shadow-lg shadow-cyan-950/20"
                    : "border-slate-800",
            ].join(" ")}
        >
            <header className="border-b border-slate-800 p-4">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                        <span
                            className={[
                                "h-2.5 w-2.5 shrink-0 rounded-full",
                                cor,
                            ].join(" ")}
                        />

                        <h2 className="truncate font-semibold text-white">
                            {titulo}
                        </h2>
                    </div>

                    <span className="rounded-full bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-300">
                        {oportunidades.length}
                    </span>
                </div>

                <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                    <CircleDollarSign size={14} />

                    <span>
                        {formatarMoedaCompacta(
                            valorTotal,
                        )}
                    </span>
                </div>
            </header>

            <div className="flex min-h-[300px] flex-1 flex-col gap-3 p-3">
                {oportunidades.length > 0 ? (
                    oportunidades.map(
                        (oportunidade) => (
                            <KanbanCard
                                key={oportunidade.id}
                                oportunidade={oportunidade}
                                aoAbrir={() =>
                                    aoAbrirOportunidade(
                                        oportunidade.id,
                                    )
                                }
                            />
                        ),
                    )
                ) : (
                    <div
                        className={[
                            "flex min-h-36 items-center justify-center",
                            "rounded-xl border border-dashed",
                            "p-5 text-center text-sm",
                            isOver
                                ? "border-cyan-500/50 text-cyan-300"
                                : "border-slate-800 text-slate-600",
                        ].join(" ")}
                    >
                        {isOver
                            ? "Solte a oportunidade aqui"
                            : "Nenhuma oportunidade nesta etapa"}
                    </div>
                )}
            </div>
        </section>
    );
}