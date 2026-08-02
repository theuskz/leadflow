"use client";

import { useRouter } from "next/navigation";

import { Oportunidade } from "@/types/oportunidade";

type Props = {
    oportunidades: Oportunidade[];
};

const cores = {
    NOVO_LEAD: "bg-slate-700",
    PRIMEIRO_CONTATO: "bg-blue-600",
    QUALIFICADO: "bg-cyan-600",
    PROPOSTA_ENVIADA: "bg-yellow-600",
    NEGOCIACAO: "bg-orange-600",
    FECHADO: "bg-green-600",
    PERDIDO: "bg-red-600",
} as const;

export function TabelaOportunidades({
    oportunidades,
}: Props) {
    const router = useRouter();

    return (
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
            <table className="w-full">
                <thead className="bg-slate-950">
                    <tr className="text-left text-sm text-slate-400">
                        <th className="p-4">Título</th>
                        <th>Cliente</th>
                        <th>Valor</th>
                        <th>Status</th>
                        <th>Prob.</th>
                        <th>Tarefas</th>
                    </tr>
                </thead>

                <tbody>
                    {oportunidades.map((o) => (
                        <tr
                            key={o.id}
                            onClick={() =>
                                router.push(`/oportunidades/${o.id}`)
                            }
                            className="
                                cursor-pointer
                                border-t
                                border-slate-800
                                hover:bg-slate-800/40
                                transition-colors
                            "
                        >
                            <td className="p-4">
                                <div className="font-medium text-white">
                                    {o.titulo}
                                </div>

                                <div className="text-xs text-slate-500">
                                    {o.descricao}
                                </div>
                            </td>

                            <td className="text-slate-300">
                                {o.cliente.nome}
                            </td>

                            <td className="text-slate-300">
                                {o.valor.toLocaleString("pt-BR", {
                                    style: "currency",
                                    currency: "BRL",
                                })}
                            </td>

                            <td>
                                <span
                                    className={`rounded-full px-3 py-1 text-xs text-white ${cores[o.status]}`}
                                >
                                    {o.status.replaceAll("_", " ")}
                                </span>
                            </td>

                            <td className="font-semibold text-cyan-400">
                                {o.probabilidade}%
                            </td>

                            <td className="text-slate-400">
                                {o._count.tarefas}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}