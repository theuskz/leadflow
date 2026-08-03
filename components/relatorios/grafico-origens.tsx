"use client";

import {
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
} from "recharts";

import type {
    OrigemRelatorio,
} from "@/types/relatorio";

type Props = {
    dados: OrigemRelatorio[];
};

const cores = [
    "#06b6d4",
    "#2563eb",
    "#8b5cf6",
    "#f59e0b",
    "#10b981",
    "#ef4444",
    "#f97316",
    "#64748b",
];

export function GraficoOrigens({ dados }: Props) {
    const dadosComValor = dados.filter(
        (item) => item.quantidade > 0,
    );

    if (dadosComValor.length === 0) {
        return (
            <div className="flex min-h-[320px] items-center justify-center rounded-xl border border-dashed border-slate-800 text-sm text-slate-600">
                Nenhuma origem de lead disponível.
            </div>
        );
    }

    return (
        <div className="h-[320px] w-full">
            <ResponsiveContainer
                width="100%"
                height="100%"
            >
                <PieChart>
                    <Pie
                        data={dadosComValor}
                        dataKey="quantidade"
                        nameKey="nome"
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={110}
                        paddingAngle={3}
                    >
                        {dadosComValor.map(
                            (_, indice) => (
                                <Cell
                                    key={indice}
                                    fill={
                                        cores[
                                        indice %
                                        cores.length
                                        ]
                                    }
                                />
                            ),
                        )}
                    </Pie>

                    <Tooltip
                        contentStyle={{
                            background: "#020617",
                            border: "1px solid #334155",
                            borderRadius: "12px",
                        }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}