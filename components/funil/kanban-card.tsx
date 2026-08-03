"use client";

import { CSSProperties } from "react";
import { useDraggable } from "@dnd-kit/core";
import {
    Building2,
    CalendarDays,
    GripVertical,
    Target,
    UserRound,
} from "lucide-react";

import type {
    Oportunidade,
} from "@/types/oportunidade";

type Props = {
    oportunidade: Oportunidade;
    arrastando?: boolean;
    aoAbrir?: () => void;
};

function formatarMoeda(valor: number) {
    return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
}

function formatarData(data: string | null) {
    if (!data) {
        return "Sem previsão";
    }

    return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(new Date(data));
}

export function KanbanCard({
    oportunidade,
    arrastando = false,
    aoAbrir,
}: Props) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        isDragging,
    } = useDraggable({
        id: oportunidade.id,
        data: {
            oportunidade,
            tipo: "oportunidade",
        },
    });

    const style: CSSProperties | undefined =
        transform
            ? {
                transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
            }
            : undefined;

    return (
        <article
            ref={setNodeRef}
            style={style}
            onClick={() => {
                if (!isDragging) {
                    aoAbrir?.();
                }
            }}
            className={[
                "rounded-2xl border border-slate-800",
                "bg-slate-950/80 p-4 shadow-sm",
                "transition duration-200",
                "hover:border-slate-700 hover:bg-slate-950",
                "hover:shadow-lg hover:shadow-black/10",
                "cursor-pointer",
                isDragging || arrastando
                    ? "z-50 opacity-60 shadow-2xl"
                    : "",
            ].join(" ")}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <h3 className="line-clamp-2 font-semibold leading-5 text-white">
                        {oportunidade.titulo}
                    </h3>

                    <p className="mt-1 truncate text-sm text-slate-400">
                        {oportunidade.cliente.nome}
                    </p>
                </div>

                <button
                    type="button"
                    aria-label="Arrastar oportunidade"
                    className="
                        shrink-0 cursor-grab rounded-lg
                        p-1.5 text-slate-600
                        transition hover:bg-slate-800
                        hover:text-slate-300
                        active:cursor-grabbing
                    "
                    onClick={(evento) =>
                        evento.stopPropagation()
                    }
                    {...listeners}
                    {...attributes}
                >
                    <GripVertical size={17} />
                </button>
            </div>

            {oportunidade.cliente.empresa && (
                <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                    <Building2 size={14} />

                    <span className="truncate">
                        {oportunidade.cliente.empresa}
                    </span>
                </div>
            )}

            <p className="mt-4 text-xl font-bold tracking-tight text-white">
                {formatarMoeda(oportunidade.valor)}
            </p>

            <div className="mt-4">
                <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-slate-500">
                        <Target size={13} />
                        Probabilidade
                    </span>

                    <strong className="text-cyan-400">
                        {oportunidade.probabilidade}%
                    </strong>
                </div>

                <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                        style={{
                            width: `${oportunidade.probabilidade}%`,
                        }}
                    />
                </div>
            </div>

            <div className="mt-4 space-y-2 border-t border-slate-800 pt-4">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                    <UserRound size={14} />

                    <span className="truncate">
                        {oportunidade.responsavel?.nome ??
                            "Sem responsável"}
                    </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500">
                    <CalendarDays size={14} />

                    <span>
                        {formatarData(
                            oportunidade.previsaoFechamento,
                        )}
                    </span>
                </div>
            </div>
        </article>
    );
}