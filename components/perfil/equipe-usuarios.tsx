"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    AlertCircle,
    Loader2,
    Plus,
    ShieldCheck,
    UserRound,
    UsersRound,
} from "lucide-react";

import {
    buscarUsuarios,
} from "@/lib/usuarios";

import {
    ModalUsuario,
} from "@/components/perfil/modal-usuario";

type Props = {
    nivelUsuarioAtual: string;
};

const nomesNivel = {
    ADMIN: "Administrador",
    GERENTE: "Gerente",
    VENDEDOR: "Vendedor",
};

export function EquipeUsuarios({
    nivelUsuarioAtual,
}: Props) {
    const [
        modalAberto,
        setModalAberto,
    ] = useState(false);

    const podeGerenciar =
        nivelUsuarioAtual === "ADMIN";

    const {
        data,
        isPending,
        isError,
        error,
    } = useQuery({
        queryKey: ["usuarios"],
        queryFn: buscarUsuarios,
        enabled: podeGerenciar,
    });

    if (!podeGerenciar) {
        return null;
    }

    return (
        <>
            <section className="rounded-2xl border border-slate-800 bg-slate-900/70">
                <div className="flex flex-col gap-4 border-b border-slate-800 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-white">
                            Equipe
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Gerencie os acessos ao CRM.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            setModalAberto(true)
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
                    >
                        <Plus size={17} />
                        Adicionar usuário
                    </button>
                </div>

                <div className="p-6">
                    {isPending ? (
                        <div className="flex min-h-[180px] items-center justify-center gap-3 text-slate-400">
                            <Loader2
                                size={20}
                                className="animate-spin"
                            />
                            Carregando equipe...
                        </div>
                    ) : isError ? (
                        <div className="flex min-h-[180px] items-center justify-center gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-5 text-red-300">
                            <AlertCircle
                                size={20}
                            />

                            {error instanceof Error
                                ? error.message
                                : "Não foi possível carregar a equipe."}
                        </div>
                    ) : data?.usuarios.length ===
                        0 ? (
                        <div className="flex min-h-[180px] flex-col items-center justify-center text-center">
                            <UsersRound
                                size={36}
                                className="text-slate-600"
                            />

                            <p className="mt-4 font-medium text-slate-300">
                                Nenhum usuário cadastrado
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {data?.usuarios.map(
                                (usuario) => (
                                    <article
                                        key={
                                            usuario.id
                                        }
                                        className="flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-950/70 p-4 sm:flex-row sm:items-center sm:justify-between"
                                    >
                                        <div className="flex min-w-0 items-center gap-3">
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                                                <UserRound
                                                    size={
                                                        20
                                                    }
                                                />
                                            </div>

                                            <div className="min-w-0">
                                                <p className="truncate font-medium text-white">
                                                    {
                                                        usuario.nome
                                                    }
                                                </p>

                                                <p className="mt-1 truncate text-sm text-slate-500">
                                                    {
                                                        usuario.email
                                                    }
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                                                <ShieldCheck
                                                    size={
                                                        13
                                                    }
                                                />

                                                {
                                                    nomesNivel[
                                                    usuario
                                                        .nivel
                                                    ]
                                                }
                                            </span>

                                            <span
                                                className={
                                                    usuario.ativo
                                                        ? "rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300"
                                                        : "rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-300"
                                                }
                                            >
                                                {usuario.ativo
                                                    ? "Ativo"
                                                    : "Inativo"}
                                            </span>

                                            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-400">
                                                {
                                                    usuario
                                                        ._count
                                                        .oportunidades
                                                }{" "}
                                                oportunidades
                                            </span>
                                        </div>
                                    </article>
                                ),
                            )}
                        </div>
                    )}
                </div>
            </section>

            <ModalUsuario
                aberto={modalAberto}
                aoFechar={() =>
                    setModalAberto(false)
                }
            />
        </>
    );
}