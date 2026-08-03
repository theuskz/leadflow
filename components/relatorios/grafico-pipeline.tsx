"use client";

import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import type {
    OportunidadePorStatusRelatorio,
} from "@/types/relatorio";

type Props = {
    dados: OportunidadePorStatusRelatorio[];
};

export function GraficoPipeline({ dados }: Props) {
    const possuiDados = dados.some(
        (item) => item.quantidade > 0,
    );

    if (!possuiDados) {
        return (
            <div className="flex min-h-[320px] items-center justify-center rounded-xl border border-dashed border-slate-800 text-sm text-slate-600">
                Nenhuma oportunidade cadastrada.
            </div>
        );
    }

    return (
        <div className="h-[320px] w-full">
            <ResponsiveContainer
                width="100%"
                height="100%"
            >
                <BarChart
                    data={dados}
                    layout="vertical"
                    margin={{
                        left: 20,
                    }}
                >
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#1e293b"
                        horizontal={false}
                    />

                    <XAxis
                        type="number"
                        stroke="#64748b"
                        tickLine={false}
                        axisLine={false}
                        fontSize={12}
                        allowDecimals={false}
                    />

                    <YAxis
                        type="category"
                        dataKey="nome"
                        width={120}
                        stroke="#64748b"
                        tickLine={false}
                        axisLine={false}
                        fontSize={12}
                    />

                    <Tooltip
                        cursor={{
                            fill: "rgba(34, 211, 238, 0.06)",
                        }}
                        contentStyle={{
                            background: "#020617",
                            border: "1px solid #334155",
                            borderRadius: "12px",
                        }}
                        formatter={(valor) => [
                            Number(valor),
                            "Oportunidades",
                        ]}
                    />

                    <Bar
                        dataKey="quantidade"
                        fill="#2563eb"
                        radius={[0, 8, 8, 0]}
                        maxBarSize={30}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}