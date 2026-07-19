"use client";

import { useRouter } from "next/navigation";
import {
    Bell,
    ChevronDown,
    LogOut,
    Menu,
    Search,
    UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Usuario = {
    id: string;
    nome: string;
    email: string;
    nivel: string;
};

type HeaderProps = {
    abrirMenu: () => void;
};

export function Header({ abrirMenu }: HeaderProps) {
    const router = useRouter();

    const [usuario, setUsuario] = useState<Usuario | null>(null);
    const [saindo, setSaindo] = useState(false);

    useEffect(() => {
        async function buscarUsuario() {
            try {
                const response = await fetch("/api/auth/me");

                if (!response.ok) {
                    return;
                }

                const data = await response.json();

                setUsuario(data.usuario);
            } catch {
                setUsuario(null);
            }
        }

        buscarUsuario();
    }, []);

    async function fazerLogout() {
        try {
            setSaindo(true);

            const response = await fetch("/api/auth/logout", {
                method: "POST",
            });

            if (!response.ok) {
                throw new Error("Não foi possível sair.");
            }

            toast.success("Logout realizado com sucesso.");

            router.replace("/login");
            router.refresh();
        } catch (erro) {
            toast.error(
                erro instanceof Error
                    ? erro.message
                    : "Não foi possível sair.",
            );
        } finally {
            setSaindo(false);
        }
    }

    const iniciais =
        usuario?.nome
            .split(" ")
            .slice(0, 2)
            .map((parte) => parte[0])
            .join("")
            .toUpperCase() ?? "US";

    return (
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-800 bg-slate-950/85 px-5 backdrop-blur-xl lg:px-8">
            <div className="flex items-center gap-4">
                <button
                    type="button"
                    onClick={abrirMenu}
                    className="rounded-xl border border-slate-800 p-2.5 text-slate-400 transition hover:bg-slate-900 hover:text-white lg:hidden"
                >
                    <Menu className="h-5 w-5" />
                </button>

                <div className="hidden w-80 items-center rounded-xl border border-slate-800 bg-slate-900/70 px-3 lg:flex">
                    <Search className="h-5 w-5 text-slate-500" />

                    <input
                        type="text"
                        placeholder="Pesquisar no CRM..."
                        className="h-11 w-full bg-transparent px-3 text-sm text-white outline-none placeholder:text-slate-600"
                    />
                </div>
            </div>

            <div className="flex items-center gap-3">
                <button
                    type="button"
                    className="relative rounded-xl border border-slate-800 p-2.5 text-slate-400 transition hover:bg-slate-900 hover:text-white"
                >
                    <Bell className="h-5 w-5" />

                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-blue-500 ring-2 ring-slate-950" />
                </button>

                <DropdownMenu>
                    <DropdownMenuTrigger
                        render={
                            <button
                                type="button"
                                className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 transition hover:bg-slate-900"
                            />
                        }
                    >
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-sm font-semibold text-white">
                            {iniciais}
                        </div>

                        <div className="hidden text-left sm:block">
                            <p className="max-w-36 truncate text-sm font-medium text-white">
                                {usuario?.nome ?? "Carregando..."}
                            </p>

                            <p className="text-xs text-slate-500">
                                {usuario?.nivel ?? "Usuário"}
                            </p>
                        </div>

                        <ChevronDown className="hidden h-4 w-4 text-slate-500 sm:block" />
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                        align="end"
                        className="w-64 border-slate-800 bg-slate-950 text-slate-200"
                    >
                        <DropdownMenuLabel>
                            <p className="font-medium text-white">
                                {usuario?.nome ?? "Usuário"}
                            </p>

                            <p className="mt-1 truncate text-xs font-normal text-slate-500">
                                {usuario?.email ?? ""}
                            </p>
                        </DropdownMenuLabel>

                        <DropdownMenuSeparator className="bg-slate-800" />

                        <DropdownMenuItem
                            onClick={() => router.push("/perfil")}
                            className="cursor-pointer focus:bg-slate-900 focus:text-white"
                        >
                            <UserRound className="mr-2 h-4 w-4" />
                            Meu perfil
                        </DropdownMenuItem>

                        <DropdownMenuSeparator className="bg-slate-800" />

                        <DropdownMenuItem
                            onClick={fazerLogout}
                            disabled={saindo}
                            className="cursor-pointer text-red-400 focus:bg-red-500/10 focus:text-red-400"
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            {saindo ? "Saindo..." : "Sair"}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}