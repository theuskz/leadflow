"use client";

import { ReactNode, useState } from "react";

import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";

type DashboardShellProps = {
    children: ReactNode;
};

export function DashboardShell({
    children,
}: DashboardShellProps) {
    const [menuMobileAberto, setMenuMobileAberto] = useState(false);
    const [sidebarRecolhida, setSidebarRecolhida] = useState(false);

    return (
        <div className="min-h-screen bg-slate-950">
            <Sidebar
                abertaMobile={menuMobileAberto}
                fecharMobile={() => setMenuMobileAberto(false)}
                recolhida={sidebarRecolhida}
                alternarRecolhida={() =>
                    setSidebarRecolhida((valor) => !valor)
                }
            />

            <div
                className={`
                    min-h-screen transition-all duration-300
                    ${sidebarRecolhida ? "lg:pl-20" : "lg:pl-72"}
                `}
            >
                <Header
                    abrirMenu={() => setMenuMobileAberto(true)}
                />

                <main className="px-5 py-8 lg:px-8">
                    {children}
                </main>
            </div>
        </div>
    );
}