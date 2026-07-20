"use client";

import { FormEvent, useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2, X } from "lucide-react";

import {
    buscarClientesParaOportunidade,
    criarOportunidade,
    NovaOportunidadePayload,
} from "@/lib/oportunidades";

import { StatusOportunidade } from "@/types/oportunidade";

type ModalOportunidadeProps = {
    aberto: boolean;
    fechar: () => void;
    aoCriar: () => void;
};

const statusDisponiveis: {
    valor: StatusOportunidade;
    rotulo: string;
}[] = [
    {
        valor: "NOVO_LEAD",
        rotulo: "Novo lead",
    },
    {
        valor: "PRIMEIRO_CONTATO",
        rotulo: "Primeiro contato",
    },
    {
        valor: "QUALIFICADO",
        rotulo: "Qualificado",
    },
    {
        valor: "PROPOSTA_ENVIADA",
        rotulo: "Proposta enviada",
    },
    {
        valor: "NEGOCIACAO",
        rotulo: "Negociação",
    },
    {
        valor: "FECHADO",
        rotulo: "Fechado",
    },
    {
        valor: "PERDIDO",
        rotulo: "Perdido",
    },
];

const probabilidadesPorStatus: Record<
    StatusOportunidade,
    number
> = {
    NOVO_LEAD: 10,
    PRIMEIRO_CONTATO: 20,
    QUALIFICADO: 40,
    PROPOSTA_ENVIADA: 60,
    NEGOCIACAO: 80,
    FECHADO: 100,
    PERDIDO: 0,
};

const estadoInicial: NovaOportunidadePayload = {
    titulo: "",
    clienteId: "",
    descricao: "",
    valor: 0,
    status: "NOVO_LEAD",
    probabilidade: 10,
    previsaoFechamento: null,
};

export function ModalOportunidade({
    aberto,
    fechar,
    aoCriar,
}: ModalOportunidadeProps) {
    const [formulario, setFormulario] =
        useState<NovaOportunidadePayload>(estadoInicial);

    const [erroFormulario, setErroFormulario] = useState("");

    const {
        data: clientes = [],
        isPending: carregandoClientes,
    } = useQuery({
        queryKey: ["clientes", "selecao-oportunidade"],
        queryFn: buscarClientesParaOportunidade,
        enabled: aberto,
    });

    const mutation = useMutation({
        mutationFn: criarOportunidade,

        onSuccess: () => {
            setFormulario(estadoInicial);
            setErroFormulario("");
            aoCriar();
            fechar();
        },

        onError: (erro) => {
            setErroFormulario(
                erro instanceof Error
                    ? erro.message
                    : "Não foi possível criar a oportunidade.",
            );
        },
    });

    useEffect(() => {
        if (!aberto) {
            setErroFormulario("");
        }
    }, [aberto]);

    useEffect(() => {
        function fecharComEscape(evento: KeyboardEvent) {
            if (evento.key === "Escape") {
                fechar();
            }
        }

        if (aberto) {
            document.addEventListener(
                "keydown",
                fecharComEscape,
            );

            document.body.style.overflow = "hidden";
        }

        return () => {
            document.removeEventListener(
                "keydown",
                fecharComEscape,
            );

            document.body.style.overflow = "";
        };
    }, [aberto, fechar]);

    function alterarCampo<
        Campo extends keyof NovaOportunidadePayload,
    >(
        campo: Campo,
        valor: NovaOportunidadePayload[Campo],
    ) {
        setFormulario((estadoAtual) => ({
            ...estadoAtual,
            [campo]: valor,
        }));
    }

    function alterarStatus(status: StatusOportunidade) {
        setFormulario((estadoAtual) => ({
            ...estadoAtual,
            status,
            probabilidade: probabilidadesPorStatus[status],
        }));
    }

    function enviarFormulario(evento: FormEvent) {
        evento.preventDefault();
        setErroFormulario("");

        if (formulario.titulo.trim().length < 2) {
            setErroFormulario(
                "Informe um título com pelo menos 2 caracteres.",
            );
            return;
        }

        if (!formulario.clienteId) {
            setErroFormulario("Selecione um cliente.");
            return;
        }

        if (
            formulario.valor < 0 ||
            !Number.isFinite(formulario.valor)
        ) {
            setErroFormulario("Informe um valor válido.");
            return;
        }

        mutation.mutate({
            ...formulario,
            titulo: formulario.titulo.trim(),
            descricao:
                formulario.descricao?.trim() || undefined,
            previsaoFechamento:
                formulario.previsaoFechamento || null,
        });
    }

    if (!aberto) {
        return null;
    }

    return (
        <div
            className="
                fixed inset-0 z-50
                flex items-center justify-center
                bg-slate-950/80
                p-4
                backdrop-blur-sm
            "
            onMouseDown={(evento) => {
                if (evento.target === evento.currentTarget) {
                    fechar();
                }
            }}
        >
            <div
                className="
                    max-h-[90vh] w-full max-w-2xl
                    overflow-y-auto
                    rounded-2xl
                    border border-slate-800
                    bg-slate-900
                    shadow-2xl
                "
            >
                <div
                    className="
                        sticky top-0 z-10
                        flex items-center justify-between
                        border-b border-slate-800
                        bg-slate-900/95
                        px-6 py-5
                        backdrop-blur
                    "
                >
                    <div>
                        <h2 className="text-xl font-bold text-white">
                            Nova oportunidade
                        </h2>

                        <p className="mt-1 text-sm text-slate-400">
                            Adicione uma nova negociação ao pipeline.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={fechar}
                        className="
                            rounded-lg p-2
                            text-slate-400
                            transition
                            hover:bg-slate-800
                            hover:text-white
                        "
                        aria-label="Fechar modal"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form
                    onSubmit={enviarFormulario}
                    className="space-y-5 p-6"
                >
                    <div className="grid gap-5 md:grid-cols-2">
                        <div className="md:col-span-2">
                            <label
                                htmlFor="titulo"
                                className="mb-2 block text-sm font-medium text-slate-300"
                            >
                                Título
                            </label>

                            <input
                                id="titulo"
                                value={formulario.titulo}
                                onChange={(evento) =>
                                    alterarCampo(
                                        "titulo",
                                        evento.target.value,
                                    )
                                }
                                placeholder="Ex.: Venda de plano empresarial"
                                className="
                                    w-full rounded-xl
                                    border border-slate-700
                                    bg-slate-950
                                    px-4 py-3
                                    text-white
                                    outline-none
                                    transition
                                    placeholder:text-slate-600
                                    focus:border-cyan-500
                                "
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label
                                htmlFor="cliente"
                                className="mb-2 block text-sm font-medium text-slate-300"
                            >
                                Cliente
                            </label>

                            <select
                                id="cliente"
                                value={formulario.clienteId}
                                onChange={(evento) =>
                                    alterarCampo(
                                        "clienteId",
                                        evento.target.value,
                                    )
                                }
                                disabled={carregandoClientes}
                                className="
                                    w-full rounded-xl
                                    border border-slate-700
                                    bg-slate-950
                                    px-4 py-3
                                    text-white
                                    outline-none
                                    transition
                                    focus:border-cyan-500
                                    disabled:opacity-60
                                "
                            >
                                <option value="">
                                    {carregandoClientes
                                        ? "Carregando clientes..."
                                        : "Selecione um cliente"}
                                </option>

                                {clientes.map((cliente) => (
                                    <option
                                        key={cliente.id}
                                        value={cliente.id}
                                    >
                                        {cliente.nome}
                                        {cliente.empresa
                                            ? ` — ${cliente.empresa}`
                                            : ""}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label
                                htmlFor="valor"
                                className="mb-2 block text-sm font-medium text-slate-300"
                            >
                                Valor
                            </label>

                            <input
                                id="valor"
                                type="number"
                                min="0"
                                step="0.01"
                                value={
                                    formulario.valor === 0
                                        ? ""
                                        : formulario.valor
                                }
                                onChange={(evento) =>
                                    alterarCampo(
                                        "valor",
                                        Number(
                                            evento.target.value || 0,
                                        ),
                                    )
                                }
                                placeholder="0,00"
                                className="
                                    w-full rounded-xl
                                    border border-slate-700
                                    bg-slate-950
                                    px-4 py-3
                                    text-white
                                    outline-none
                                    transition
                                    placeholder:text-slate-600
                                    focus:border-cyan-500
                                "
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="previsaoFechamento"
                                className="mb-2 block text-sm font-medium text-slate-300"
                            >
                                Previsão de fechamento
                            </label>

                            <input
                                id="previsaoFechamento"
                                type="date"
                                value={
                                    formulario.previsaoFechamento ?? ""
                                }
                                onChange={(evento) =>
                                    alterarCampo(
                                        "previsaoFechamento",
                                        evento.target.value || null,
                                    )
                                }
                                className="
                                    w-full rounded-xl
                                    border border-slate-700
                                    bg-slate-950
                                    px-4 py-3
                                    text-white
                                    outline-none
                                    transition
                                    focus:border-cyan-500
                                "
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="status"
                                className="mb-2 block text-sm font-medium text-slate-300"
                            >
                                Etapa
                            </label>

                            <select
                                id="status"
                                value={formulario.status}
                                onChange={(evento) =>
                                    alterarStatus(
                                        evento.target
                                            .value as StatusOportunidade,
                                    )
                                }
                                className="
                                    w-full rounded-xl
                                    border border-slate-700
                                    bg-slate-950
                                    px-4 py-3
                                    text-white
                                    outline-none
                                    transition
                                    focus:border-cyan-500
                                "
                            >
                                {statusDisponiveis.map((status) => (
                                    <option
                                        key={status.valor}
                                        value={status.valor}
                                    >
                                        {status.rotulo}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <div className="mb-2 flex items-center justify-between">
                                <label
                                    htmlFor="probabilidade"
                                    className="text-sm font-medium text-slate-300"
                                >
                                    Probabilidade
                                </label>

                                <span className="text-sm font-semibold text-cyan-400">
                                    {formulario.probabilidade}%
                                </span>
                            </div>

                            <input
                                id="probabilidade"
                                type="range"
                                min="0"
                                max="100"
                                step="5"
                                value={formulario.probabilidade}
                                onChange={(evento) =>
                                    alterarCampo(
                                        "probabilidade",
                                        Number(evento.target.value),
                                    )
                                }
                                className="h-11 w-full accent-cyan-500"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label
                                htmlFor="descricao"
                                className="mb-2 block text-sm font-medium text-slate-300"
                            >
                                Descrição
                            </label>

                            <textarea
                                id="descricao"
                                rows={4}
                                value={formulario.descricao ?? ""}
                                onChange={(evento) =>
                                    alterarCampo(
                                        "descricao",
                                        evento.target.value,
                                    )
                                }
                                placeholder="Informações relevantes sobre esta oportunidade..."
                                className="
                                    w-full resize-none rounded-xl
                                    border border-slate-700
                                    bg-slate-950
                                    px-4 py-3
                                    text-white
                                    outline-none
                                    transition
                                    placeholder:text-slate-600
                                    focus:border-cyan-500
                                "
                            />
                        </div>
                    </div>

                    {erroFormulario && (
                        <div
                            className="
                                rounded-xl
                                border border-red-500/30
                                bg-red-500/10
                                px-4 py-3
                                text-sm text-red-300
                            "
                        >
                            {erroFormulario}
                        </div>
                    )}

                    <div
                        className="
                            flex flex-col-reverse gap-3
                            border-t border-slate-800
                            pt-5
                            sm:flex-row sm:justify-end
                        "
                    >
                        <button
                            type="button"
                            onClick={fechar}
                            disabled={mutation.isPending}
                            className="
                                rounded-xl
                                border border-slate-700
                                px-5 py-3
                                font-medium text-slate-300
                                transition
                                hover:bg-slate-800
                                hover:text-white
                                disabled:cursor-not-allowed
                                disabled:opacity-60
                            "
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            disabled={mutation.isPending}
                            className="
                                flex items-center justify-center gap-2
                                rounded-xl
                                bg-cyan-500
                                px-5 py-3
                                font-semibold text-slate-950
                                transition
                                hover:bg-cyan-400
                                disabled:cursor-not-allowed
                                disabled:opacity-60
                            "
                        >
                            {mutation.isPending && (
                                <Loader2
                                    size={18}
                                    className="animate-spin"
                                />
                            )}

                            {mutation.isPending
                                ? "Salvando..."
                                : "Criar oportunidade"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}