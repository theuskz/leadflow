"use client";

import {
    ReactNode,
    useEffect,
    useState,
} from "react";

import {
    Header,
} from "@/components/layout/header";

import {
    Sidebar,
} from "@/components/layout/sidebar";

import {
    buscarConfiguracoes,
} from "@/lib/configuracoes";

type DashboardShellProps = {
    children: ReactNode;
};

export function DashboardShell({
    children,
}: DashboardShellProps) {
    const [
        menuMobileAberto,
        setMenuMobileAberto,
    ] = useState(false);

    const [
        sidebarRecolhida,
        setSidebarRecolhida,
    ] = useState(false);

    useEffect(() => {
        const configuracoes =
            buscarConfiguracoes();

        setSidebarRecolhida(
            configuracoes.sidebarRecolhida,
        );

        function atualizarConfiguracoes(
            evento: Event,
        ) {
            const eventoPersonalizado =
                evento as CustomEvent<{
                    sidebarRecolhida?: boolean;
                }>;

            if (
                typeof eventoPersonalizado
                    .detail
                    ?.sidebarRecolhida ===
                "boolean"
            ) {
                setSidebarRecolhida(
                    eventoPersonalizado
                        .detail
                        .sidebarRecolhida,
                );
            }
        }

        window.addEventListener(
            "leadflow-configuracoes-alteradas",
            atualizarConfiguracoes,
        );

        return () => {
            window.removeEventListener(
                "leadflow-configuracoes-alteradas",
                atualizarConfiguracoes,
            );
        };
    }, []);

    return (
        <div className="min-h-screen bg-slate-950">
            <Sidebar
                abertaMobile={
                    menuMobileAberto
                }
                fecharMobile={() =>
                    setMenuMobileAberto(
                        false,
                    )
                }
                recolhida={
                    sidebarRecolhida
                }
                alternarRecolhida={() =>
                    setSidebarRecolhida(
                        (valor) => !valor,
                    )
                }
            />

            <div
                className={`
                    min-h-screen
                    transition-all
                    duration-300
                    ${sidebarRecolhida
                        ? "lg:pl-20"
                        : "lg:pl-72"
                    }
                `}
            >
                <Header
                    abrirMenu={() =>
                        setMenuMobileAberto(
                            true,
                        )
                    }
                />

                <main className="px-5 py-8 lg:px-8">
                    {children}
                </main>
            </div>
        </div>
    );
}