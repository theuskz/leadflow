"use client";

import { useState } from "react";
import {
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import {
    AlertCircle,
    Plus,
    Search,
} from "lucide-react";

import { buscarOportunidades } from "@/lib/oportunidades";

import { CardsOportunidades } from "./cards-oportunidades";
import { ModalOportunidade } from "./modal-oportunidade";
import { TabelaOportunidades } from "./tabela-oportunidades";

export function OportunidadesPage() {
    const queryClient = useQueryClient();

    const [busca, setBusca] = useState("");
    const [modalAberto, setModalAberto] = useState(false);

    const {
        data,
        isPending,
        isError,
        error,
    } = useQuery({
        queryKey: ["oportunidades", busca],
        queryFn: () => buscarOportunidades(busca),
    });

    const oportunidades = data?.oportunidades ?? [];

    function atualizarLista() {
        queryClient.invalidateQueries({
            queryKey: ["oportunidades"],
        });
    }

    return (
        <>
            <div className="space-y-8">
                <div
                    className="
                        flex flex-col gap-4
                        lg:flex-row
                        lg:items-center
                        lg:justify-between
                    "
                >
                    <div>
                        <h1 className="text-3xl font-bold text-white">
                            Oportunidades
                        </h1>

                        <p className="mt-1 text-slate-400">
                            Gerencie negociações e acompanhe seu
                            pipeline de vendas.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setModalAberto(true)}
                        className="
                            flex items-center justify-center gap-2
                            rounded-xl
                            bg-cyan-500
                            px-5 py-3
                            font-semibold text-slate-950
                            transition
                            hover:bg-cyan-400
                        "
                    >
                        <Plus size={18} />

                        Nova oportunidade
                    </button>
                </div>

                <CardsOportunidades
                    oportunidades={oportunidades}
                />

                <div
                    className="
                        rounded-2xl
                        border border-slate-800
                        bg-slate-900
                        p-4
                    "
                >
                    <div className="relative">
                        <Search
                            size={18}
                            className="
                                absolute left-3 top-1/2
                                -translate-y-1/2
                                text-slate-500
                            "
                        />

                        <input
                            value={busca}
                            onChange={(evento) =>
                                setBusca(evento.target.value)
                            }
                            placeholder="Pesquisar por oportunidade ou cliente..."
                            className="
                                w-full rounded-xl
                                border border-slate-700
                                bg-slate-950
                                py-3 pl-10 pr-4
                                text-white
                                outline-none
                                transition
                                placeholder:text-slate-600
                                focus:border-cyan-500
                            "
                        />
                    </div>
                </div>

                {isPending && (
                    <div
                        className="
                            rounded-2xl
                            border border-slate-800
                            bg-slate-900
                            py-20
                            text-center text-slate-400
                        "
                    >
                        Carregando oportunidades...
                    </div>
                )}

                {isError && (
                    <div
                        className="
                            flex items-center gap-3
                            rounded-2xl
                            border border-red-500/30
                            bg-red-500/10
                            p-5 text-red-300
                        "
                    >
                        <AlertCircle size={20} />

                        <span>
                            {error instanceof Error
                                ? error.message
                                : "Não foi possível carregar as oportunidades."}
                        </span>
                    </div>
                )}

                {!isPending && !isError && oportunidades.length > 0 && (
                    <TabelaOportunidades
                        oportunidades={oportunidades}
                    />
                )}

                {!isPending &&
                    !isError &&
                    oportunidades.length === 0 && (
                        <div
                            className="
                                rounded-2xl
                                border border-dashed border-slate-700
                                bg-slate-900/50
                                px-6 py-20
                                text-center
                            "
                        >
                            <h2 className="text-lg font-semibold text-white">
                                Nenhuma oportunidade encontrada
                            </h2>

                            <p className="mt-2 text-sm text-slate-400">
                                Cadastre sua primeira oportunidade ou
                                altere o termo da pesquisa.
                            </p>

                            <button
                                type="button"
                                onClick={() =>
                                    setModalAberto(true)
                                }
                                className="
                                    mt-5 inline-flex
                                    items-center gap-2
                                    rounded-xl
                                    bg-cyan-500
                                    px-4 py-2.5
                                    font-semibold text-slate-950
                                    transition
                                    hover:bg-cyan-400
                                "
                            >
                                <Plus size={17} />

                                Nova oportunidade
                            </button>
                        </div>
                    )}
            </div>

            <ModalOportunidade
                aberto={modalAberto}
                fechar={() => setModalAberto(false)}
                aoCriar={atualizarLista}
            />
        </>
    );
}