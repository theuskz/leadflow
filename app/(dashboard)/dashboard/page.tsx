import {
    ArrowDownRight,
    ArrowUpRight,
    BriefcaseBusiness,
    CircleDollarSign,
    TrendingUp,
    UsersRound,
} from "lucide-react";

const metricas = [
    {
        titulo: "Total de leads",
        valor: "248",
        variacao: "+12,5%",
        positivo: true,
        descricao: "comparado ao mês anterior",
        icon: UsersRound,
    },
    {
        titulo: "Oportunidades abertas",
        valor: "64",
        variacao: "+8,2%",
        positivo: true,
        descricao: "comparado ao mês anterior",
        icon: BriefcaseBusiness,
    },
    {
        titulo: "Valor em negociação",
        valor: "R$ 184.500",
        variacao: "+16,4%",
        positivo: true,
        descricao: "comparado ao mês anterior",
        icon: CircleDollarSign,
    },
    {
        titulo: "Taxa de conversão",
        valor: "28,7%",
        variacao: "-2,1%",
        positivo: false,
        descricao: "comparado ao mês anterior",
        icon: TrendingUp,
    },
];

const oportunidades = [
    {
        cliente: "Grupo Horizonte",
        titulo: "Implantação de sistema",
        valor: "R$ 28.500",
        etapa: "Negociação",
    },
    {
        cliente: "Construtora Alfa",
        titulo: "Consultoria comercial",
        valor: "R$ 18.900",
        etapa: "Proposta enviada",
    },
    {
        cliente: "Tech Solutions",
        titulo: "Plano empresarial",
        valor: "R$ 12.400",
        etapa: "Qualificado",
    },
];

export default function DashboardPage() {
    return (
        <div>
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                    <p className="text-sm font-medium text-blue-400">
                        Visão geral
                    </p>

                    <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">
                        Dashboard comercial
                    </h1>

                    <p className="mt-2 text-slate-400">
                        Acompanhe os principais indicadores da sua operação.
                    </p>
                </div>

                <button
                    type="button"
                    className="inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                    Nova oportunidade
                </button>
            </div>

            <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {metricas.map((metrica) => {
                    const Icon = metrica.icon;

                    return (
                        <article
                            key={metrica.titulo}
                            className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                                    <Icon className="h-5 w-5" />
                                </div>

                                <div
                                    className={`
                                        flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium
                                        ${
                                            metrica.positivo
                                                ? "bg-emerald-500/10 text-emerald-400"
                                                : "bg-red-500/10 text-red-400"
                                        }
                                    `}
                                >
                                    {metrica.positivo ? (
                                        <ArrowUpRight className="h-3.5 w-3.5" />
                                    ) : (
                                        <ArrowDownRight className="h-3.5 w-3.5" />
                                    )}

                                    {metrica.variacao}
                                </div>
                            </div>

                            <p className="mt-5 text-sm text-slate-400">
                                {metrica.titulo}
                            </p>

                            <p className="mt-2 text-2xl font-bold text-white">
                                {metrica.valor}
                            </p>

                            <p className="mt-2 text-xs text-slate-500">
                                {metrica.descricao}
                            </p>
                        </article>
                    );
                })}
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
                <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-white">
                                Desempenho comercial
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Evolução das vendas nos últimos meses
                            </p>
                        </div>

                        <select className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-300 outline-none">
                            <option>Últimos 6 meses</option>
                            <option>Últimos 12 meses</option>
                        </select>
                    </div>

                    <div className="mt-8 flex h-72 items-center justify-center rounded-xl border border-dashed border-slate-800 bg-slate-950/50">
                        <p className="text-sm text-slate-600">
                            Gráfico será adicionado com dados reais
                        </p>
                    </div>
                </section>

                <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
                    <h2 className="text-lg font-semibold text-white">
                        Resumo do funil
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Distribuição das oportunidades
                    </p>

                    <div className="mt-6 space-y-5">
                        {[
                            {
                                titulo: "Novos leads",
                                valor: 48,
                                porcentagem: 85,
                            },
                            {
                                titulo: "Qualificados",
                                valor: 32,
                                porcentagem: 65,
                            },
                            {
                                titulo: "Propostas",
                                valor: 18,
                                porcentagem: 42,
                            },
                            {
                                titulo: "Negociação",
                                valor: 11,
                                porcentagem: 28,
                            },
                            {
                                titulo: "Fechados",
                                valor: 7,
                                porcentagem: 18,
                            },
                        ].map((etapa) => (
                            <div key={etapa.titulo}>
                                <div className="mb-2 flex items-center justify-between">
                                    <span className="text-sm text-slate-300">
                                        {etapa.titulo}
                                    </span>

                                    <span className="text-sm font-semibold text-white">
                                        {etapa.valor}
                                    </span>
                                </div>

                                <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                                    <div
                                        className="h-full rounded-full bg-blue-600"
                                        style={{
                                            width: `${etapa.porcentagem}%`,
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/60">
                <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">
                    <div>
                        <h2 className="text-lg font-semibold text-white">
                            Oportunidades recentes
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Negociações atualizadas recentemente
                        </p>
                    </div>

                    <button
                        type="button"
                        className="text-sm font-medium text-blue-400 transition hover:text-blue-300"
                    >
                        Ver todas
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-2xl">
                        <thead>
                            <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wider text-slate-500">
                                <th className="px-6 py-4 font-medium">
                                    Cliente
                                </th>
                                <th className="px-6 py-4 font-medium">
                                    Oportunidade
                                </th>
                                <th className="px-6 py-4 font-medium">
                                    Valor
                                </th>
                                <th className="px-6 py-4 font-medium">
                                    Etapa
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {oportunidades.map((oportunidade) => (
                                <tr
                                    key={oportunidade.cliente}
                                    className="border-b border-slate-800/70 last:border-0"
                                >
                                    <td className="px-6 py-5 text-sm font-medium text-white">
                                        {oportunidade.cliente}
                                    </td>

                                    <td className="px-6 py-5 text-sm text-slate-400">
                                        {oportunidade.titulo}
                                    </td>

                                    <td className="px-6 py-5 text-sm font-medium text-slate-200">
                                        {oportunidade.valor}
                                    </td>

                                    <td className="px-6 py-5">
                                        <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">
                                            {oportunidade.etapa}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}