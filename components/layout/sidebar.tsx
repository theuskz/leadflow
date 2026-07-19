"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    BarChart3,
    BriefcaseBusiness,
    ChevronLeft,
    ChevronRight,
    LayoutDashboard,
    ListTodo,
    Settings,
    TrendingUp,
    UserRound,
    UsersRound,
    X,
} from "lucide-react";

type SidebarProps = {
    abertaMobile: boolean;
    fecharMobile: () => void;
    recolhida: boolean;
    alternarRecolhida: () => void;
};

const itensMenu = [
    {
        titulo: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        titulo: "Clientes",
        href: "/clientes",
        icon: UsersRound,
    },
    {
        titulo: "Oportunidades",
        href: "/oportunidades",
        icon: BriefcaseBusiness,
    },
    {
        titulo: "Funil de vendas",
        href: "/funil",
        icon: TrendingUp,
    },
    {
        titulo: "Tarefas",
        href: "/tarefas",
        icon: ListTodo,
    },
    {
        titulo: "Relatórios",
        href: "/relatorios",
        icon: BarChart3,
    },
];

const itensInferiores = [
    {
        titulo: "Perfil",
        href: "/perfil",
        icon: UserRound,
    },
    {
        titulo: "Configurações",
        href: "/configuracoes",
        icon: Settings,
    },
];

export function Sidebar({
    abertaMobile,
    fecharMobile,
    recolhida,
    alternarRecolhida,
}: SidebarProps) {
    const pathname = usePathname();

    function itemAtivo(href: string) {
        if (href === "/dashboard") {
            return pathname === href;
        }

        return pathname.startsWith(href);
    }

    return (
        <>
            {abertaMobile && (
                <button
                    type="button"
                    aria-label="Fechar menu"
                    onClick={fecharMobile}
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
                />
            )}

            <aside
                className={`
                    fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-800
                    bg-slate-950 transition-all duration-300
                    ${recolhida ? "w-20" : "w-72"}
                    ${abertaMobile ? "translate-x-0" : "-translate-x-full"}
                    lg:translate-x-0
                `}
            >
                <div className="flex h-20 items-center justify-between border-b border-slate-800 px-5">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-3 overflow-hidden"
                        onClick={fecharMobile}
                    >
                        <div className="flex h-11 min-w-11 items-center justify-center rounded-xl bg-blue-600 font-bold text-white">
                            LF
                        </div>

                        {!recolhida && (
                            <div className="whitespace-nowrap">
                                <p className="font-semibold text-white">
                                    LeadFlow
                                </p>

                                <p className="text-xs text-slate-500">
                                    CRM Comercial
                                </p>
                            </div>
                        )}
                    </Link>

                    <button
                        type="button"
                        onClick={fecharMobile}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white lg:hidden"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
                    {itensMenu.map((item) => {
                        const Icon = item.icon;
                        const ativo = itemAtivo(item.href);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={fecharMobile}
                                title={recolhida ? item.titulo : undefined}
                                className={`
                                    flex items-center rounded-xl px-3 py-3 text-sm font-medium transition
                                    ${recolhida ? "justify-center" : "gap-3"}
                                    ${
                                        ativo
                                            ? "bg-blue-600 text-white shadow-lg shadow-blue-950/30"
                                            : "text-slate-400 hover:bg-slate-900 hover:text-white"
                                    }
                                `}
                            >
                                <Icon className="h-5 w-5 min-w-5" />

                                {!recolhida && (
                                    <span>{item.titulo}</span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="border-t border-slate-800 px-3 py-4">
                    <div className="space-y-1">
                        {itensInferiores.map((item) => {
                            const Icon = item.icon;
                            const ativo = itemAtivo(item.href);

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={fecharMobile}
                                    title={recolhida ? item.titulo : undefined}
                                    className={`
                                        flex items-center rounded-xl px-3 py-3 text-sm font-medium transition
                                        ${recolhida ? "justify-center" : "gap-3"}
                                        ${
                                            ativo
                                                ? "bg-slate-800 text-white"
                                                : "text-slate-400 hover:bg-slate-900 hover:text-white"
                                        }
                                    `}
                                >
                                    <Icon className="h-5 w-5 min-w-5" />

                                    {!recolhida && (
                                        <span>{item.titulo}</span>
                                    )}
                                </Link>
                            );
                        })}
                    </div>

                    <button
                        type="button"
                        onClick={alternarRecolhida}
                        className={`
                            mt-4 hidden w-full items-center rounded-xl border border-slate-800
                            px-3 py-3 text-sm text-slate-400 transition
                            hover:bg-slate-900 hover:text-white lg:flex
                            ${recolhida ? "justify-center" : "gap-3"}
                        `}
                    >
                        {recolhida ? (
                            <ChevronRight className="h-5 w-5" />
                        ) : (
                            <>
                                <ChevronLeft className="h-5 w-5" />
                                Recolher menu
                            </>
                        )}
                    </button>
                </div>
            </aside>
        </>
    );
}