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
    VendaPorMesRelatorio,
} from "@/types/relatorio";

type Props = {
    dados: VendaPorMesRelatorio[];
};

function formatarMoeda(valor: number) {
    return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
}

export function GraficoVendas({ dados }: Props) {
    const possuiDados = dados.some(
        (item) =>
            item.valor > 0 ||
            item.quantidade > 0,
    );

    if (!possuiDados) {
        return (
            <div className="flex min-h-[320px] items-center justify-center rounded-xl border border-dashed border-slate-800 text-sm text-slate-600">
                Nenhuma venda fechada no período.
            </div>
        );
    }

    return (
        <div className="h-[320px] w-full">
            <ResponsiveContainer
                width="100%"
                height="100%"
            >
                <BarChart data={dados}>
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#1e293b"
                        vertical={false}
                    />

                    <XAxis
                        dataKey="mes"
                        stroke="#64748b"
                        tickLine={false}
                        axisLine={false}
                        fontSize={12}
                    />

                    <YAxis
                        stroke="#64748b"
                        tickLine={false}
                        axisLine={false}
                        fontSize={12}
                        tickFormatter={(valor) =>
                            new Intl.NumberFormat(
                                "pt-BR",
                                {
                                    notation: "compact",
                                },
                            ).format(
                                Number(valor),
                            )
                        }
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
                        labelStyle={{
                            color: "#f8fafc",
                        }}
                        formatter={(valor) => [
                            formatarMoeda(
                                Number(valor),
                            ),
                            "Vendas",
                        ]}
                    />

                    <Bar
                        dataKey="valor"
                        fill="#06b6d4"
                        radius={[8, 8, 0, 0]}
                        maxBarSize={64}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}