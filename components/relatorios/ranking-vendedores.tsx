import {
    Medal,
    Trophy,
} from "lucide-react";

import type {
    RankingRelatorio,
} from "@/types/relatorio";

type Props = {
    dados: RankingRelatorio[];
};

function formatarMoeda(valor: number) {
    return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
}

export function RankingVendedores({
    dados,
}: Props) {
    if (dados.length === 0) {
        return (
            <div className="flex min-h-[280px] items-center justify-center rounded-xl border border-dashed border-slate-800 text-sm text-slate-600">
                Nenhuma venda fechada para o ranking.
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {dados.map((item, indice) => (
                <article
                    key={item.id}
                    className="flex items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-950/70 p-4"
                >
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-slate-300">
                            {indice === 0 ? (
                                <Trophy
                                    size={19}
                                    className="text-amber-400"
                                />
                            ) : (
                                <Medal size={19} />
                            )}
                        </div>

                        <div className="min-w-0">
                            <p className="truncate font-medium text-white">
                                {item.nome}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                                {item.quantidade} venda
                                {item.quantidade !== 1
                                    ? "s"
                                    : ""}
                            </p>
                        </div>
                    </div>

                    <strong className="shrink-0 text-sm text-cyan-400">
                        {formatarMoeda(
                            item.valor,
                        )}
                    </strong>
                </article>
            ))}
        </div>
    );
}