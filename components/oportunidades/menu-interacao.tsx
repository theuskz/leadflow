"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
    MoreVertical,
    Pencil,
    Trash2,
} from "lucide-react";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
    excluirInteracao,
} from "@/lib/interacoes";

import type {
    InteracaoOportunidade,
} from "@/types/oportunidade";

import {
    ModalInteracao,
} from "@/components/oportunidades/modal-interacao";

type Props = {
    oportunidadeId: string;
    interacao: InteracaoOportunidade;
};

export function MenuInteracao({
    oportunidadeId,
    interacao,
}: Props) {
    const queryClient = useQueryClient();

    const [modalEditarAberto, setModalEditarAberto] =
        useState(false);

    const mutationExcluir = useMutation({
        mutationFn: () =>
            excluirInteracao(interacao.id),

        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: [
                    "oportunidade",
                    oportunidadeId,
                ],
            });
        },
    });

    function confirmarExclusao() {
        const confirmou = window.confirm(
            "Tem certeza que deseja excluir esta interação?",
        );

        if (confirmou) {
            mutationExcluir.mutate();
        }
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger
                    render={
                        <button
                            type="button"
                            aria-label="Ações da interação"
                            className="
                                inline-flex h-9 w-9
                                items-center justify-center
                                rounded-lg
                                text-slate-500
                                transition
                                hover:bg-slate-800
                                hover:text-white
                            "
                        />
                    }
                >
                    <MoreVertical size={18} />
                </DropdownMenuTrigger>

                <DropdownMenuContent
                    align="end"
                    className="
                        w-40 rounded-xl
                        border-slate-800
                        bg-slate-950
                        p-1
                        text-slate-200
                    "
                >
                    <DropdownMenuGroup>
                        <DropdownMenuItem
                            onClick={() =>
                                setModalEditarAberto(true)
                            }
                            className="
                                cursor-pointer rounded-lg
                                focus:bg-slate-900
                                focus:text-white
                            "
                        >
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                        </DropdownMenuItem>

                        <DropdownMenuItem
                            onClick={confirmarExclusao}
                            disabled={mutationExcluir.isPending}
                            className="
                                cursor-pointer rounded-lg
                                text-red-400
                                focus:bg-red-500/10
                                focus:text-red-400
                            "
                        >
                            <Trash2 className="mr-2 h-4 w-4" />

                            {mutationExcluir.isPending
                                ? "Excluindo..."
                                : "Excluir"}
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>

            <ModalInteracao
                oportunidadeId={oportunidadeId}
                aberto={modalEditarAberto}
                aoFechar={() =>
                    setModalEditarAberto(false)
                }
                modo="editar"
                interacao={interacao}
            />
        </>
    );
}