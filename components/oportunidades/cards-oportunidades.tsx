"use client";

import { DollarSign, Target, Trophy, XCircle } from "lucide-react";
import { Oportunidade } from "@/types/oportunidade";

type Props = {
    oportunidades: Oportunidade[];
};

export function CardsOportunidades({ oportunidades }: Props) {
    const total = oportunidades.length;

    const negociacao = oportunidades.filter(
        (o) => o.status === "NEGOCIACAO",
    ).length;

    const fechadas = oportunidades.filter(
        (o) => o.status === "FECHADO",
    ).length;

    const perdidas = oportunidades.filter(
        (o) => o.status === "PERDIDO",
    ).length;

    const valorTotal = oportunidades
        .filter((o) => o.status !== "PERDIDO")
        .reduce((acc, o) => acc + o.valor, 0);

    const cards = [
        {
            titulo: "Valor em Pipeline",
            valor: valorTotal.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
            }),
            icone: DollarSign,
        },
        {
            titulo: "Em Negociação",
            valor: negociacao,
            icone: Target,
        },
        {
            titulo: "Fechadas",
            valor: fechadas,
            icone: Trophy,
        },
        {
            titulo: "Perdidas",
            valor: perdidas,
            icone: XCircle,
        },
    ];

    return (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => {
                const Icon = card.icone;

                return (
                    <div
                        key={card.titulo}
                        className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
                    >
                        <div className="mb-5 flex items-center justify-between">
                            <Icon className="h-7 w-7 text-cyan-400" />

                            <span className="text-xs text-slate-500">
                                Oportunidades
                            </span>
                        </div>

                        <h3 className="text-sm text-slate-400">
                            {card.titulo}
                        </h3>

                        <p className="mt-2 text-3xl font-bold text-white">
                            {card.valor}
                        </p>

                        {card.titulo !== "Valor em Pipeline" && (
                            <p className="mt-2 text-xs text-slate-500">
                                Total: {total}
                            </p>
                        )}
                    </div>
                );
            })}
        </div>
    );
}