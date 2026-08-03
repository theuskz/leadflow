"use client";

import {
    type FormEvent,
    useEffect,
    useState,
} from "react";
import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";
import {
    CalendarDays,
    CheckCircle2,
    Loader2,
    Save,
    X,
} from "lucide-react";

import {
    criarTarefa,
    type NovaTarefaPayload,
} from "@/lib/tarefas";

import type {
    PrioridadeTarefa,
} from "@/types/oportunidade";

type Props = {
    oportunidadeId: string;
    aberto: boolean;
    aoFechar: () => void;
};

const prioridades: {
    valor: PrioridadeTarefa;
    rotulo: string;
    classes: string;
}[] = [
        {
            valor: "BAIXA",
            rotulo: "Baixa",
            classes:
                "border-slate-600 bg-slate-800/60 text-slate-300",
        },
        {
            valor: "MEDIA",
            rotulo: "Média",
            classes:
                "border-blue-500/40 bg-blue-500/10 text-blue-300",
        },
        {
            valor: "ALTA",
            rotulo: "Alta",
            classes:
                "border-orange-500/40 bg-orange-500/10 text-orange-300",
        },
        {
            valor: "URGENTE",
            rotulo: "Urgente",
            classes:
                "border-red-500/40 bg-red-500/10 text-red-300",
        },
    ];

const estadoInicial: NovaTarefaPayload = {
    titulo: "",
    descricao: "",
    prioridade: "MEDIA",
    status: "PENDENTE",
    dataLimite: null,
};

export function ModalTarefa({
    oportunidadeId,
    aberto,
    aoFechar,
}: Props) {
    const queryClient = useQueryClient();

    const [formulario, setFormulario] =
        useState<NovaTarefaPayload>(estadoInicial);

    const [erroFormulario, setErroFormulario] =
        useState("");

    const mutation = useMutation({
        mutationFn: (payload: NovaTarefaPayload) =>
            criarTarefa(
                oportunidadeId,
                payload,
            ),

        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: [
                    "oportunidade",
                    oportunidadeId,
                ],
            });

            await queryClient.invalidateQueries({
                queryKey: ["tarefas"],
            });

            setFormulario(estadoInicial);
            setErroFormulario("");
            aoFechar();
        },

        onError: (erro) => {
            setErroFormulario(
                erro instanceof Error
                    ? erro.message
                    : "Não foi possível criar a tarefa.",
            );
        },
    });

    useEffect(() => {
        if (!aberto) {
            setErroFormulario("");
            return;
        }

        function fecharComEscape(
            evento: KeyboardEvent,
        ) {
            if (
                evento.key === "Escape" &&
                !mutation.isPending
            ) {
                aoFechar();
            }
        }

        document.addEventListener(
            "keydown",
            fecharComEscape,
        );

        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener(
                "keydown",
                fecharComEscape,
            );

            document.body.style.overflow = "";
        };
    }, [
        aberto,
        aoFechar,
        mutation.isPending,
    ]);

    function alterarCampo<
        Campo extends keyof NovaTarefaPayload,
    >(
        campo: Campo,
        valor: NovaTarefaPayload[Campo],
    ) {
        setFormulario((estadoAtual) => ({
            ...estadoAtual,
            [campo]: valor,
        }));
    }

    function enviarFormulario(
        evento: FormEvent<HTMLFormElement>,
    ) {
        evento.preventDefault();
        setErroFormulario("");

        if (
            formulario.titulo
                .trim()
                .length < 2
        ) {
            setErroFormulario(
                "O título deve ter pelo menos 2 caracteres.",
            );

            return;
        }

        mutation.mutate({
            ...formulario,
            titulo: formulario.titulo.trim(),
            descricao:
                formulario.descricao?.trim() ||
                undefined,
            dataLimite:
                formulario.dataLimite || null,
        });
    }

    function fecharModal() {
        if (mutation.isPending) {
            return;
        }

        aoFechar();
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
                if (
                    evento.target ===
                    evento.currentTarget
                ) {
                    fecharModal();
                }
            }}
        >
            <div
                className="
                    max-h-[90vh] w-full max-w-xl
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
                        flex items-start justify-between
                        gap-4
                        border-b border-slate-800
                        bg-slate-900/95
                        px-6 py-5
                        backdrop-blur
                    "
                >
                    <div>
                        <h2 className="text-xl font-semibold text-white">
                            Nova tarefa
                        </h2>

                        <p className="mt-1 text-sm text-slate-400">
                            Crie uma atividade vinculada a esta oportunidade.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={fecharModal}
                        disabled={mutation.isPending}
                        aria-label="Fechar modal"
                        className="
                            rounded-lg p-2
                            text-slate-400
                            transition
                            hover:bg-slate-800
                            hover:text-white
                            disabled:opacity-50
                        "
                    >
                        <X size={20} />
                    </button>
                </div>

                <form
                    onSubmit={enviarFormulario}
                    className="space-y-6 p-6"
                >
                    <div>
                        <label
                            htmlFor="titulo-tarefa"
                            className="mb-2 block text-sm font-medium text-slate-300"
                        >
                            Título
                        </label>

                        <input
                            id="titulo-tarefa"
                            value={formulario.titulo}
                            onChange={(evento) =>
                                alterarCampo(
                                    "titulo",
                                    evento.target.value,
                                )
                            }
                            placeholder="Ex.: Ligar para o cliente"
                            className="
                                w-full rounded-xl
                                border border-slate-700
                                bg-slate-950
                                px-4 py-3
                                text-sm text-white
                                outline-none
                                transition
                                placeholder:text-slate-600
                                focus:border-cyan-500
                            "
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="descricao-tarefa"
                            className="mb-2 block text-sm font-medium text-slate-300"
                        >
                            Descrição
                        </label>

                        <textarea
                            id="descricao-tarefa"
                            rows={4}
                            value={
                                formulario.descricao ??
                                ""
                            }
                            onChange={(evento) =>
                                alterarCampo(
                                    "descricao",
                                    evento.target.value,
                                )
                            }
                            placeholder="Descreva o que precisa ser feito..."
                            className="
                                w-full resize-none rounded-xl
                                border border-slate-700
                                bg-slate-950
                                px-4 py-3
                                text-sm text-white
                                outline-none
                                transition
                                placeholder:text-slate-600
                                focus:border-cyan-500
                            "
                        />
                    </div>

                    <div>
                        <p className="mb-3 text-sm font-medium text-slate-300">
                            Prioridade
                        </p>

                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            {prioridades.map(
                                (prioridade) => {
                                    const selecionada =
                                        formulario.prioridade ===
                                        prioridade.valor;

                                    return (
                                        <button
                                            key={
                                                prioridade.valor
                                            }
                                            type="button"
                                            onClick={() =>
                                                alterarCampo(
                                                    "prioridade",
                                                    prioridade.valor,
                                                )
                                            }
                                            className={`
                                                rounded-xl border
                                                px-3 py-3
                                                text-sm font-semibold
                                                transition
                                                ${selecionada
                                                    ? prioridade.classes
                                                    : "border-slate-700 bg-slate-950/60 text-slate-400 hover:bg-slate-800"
                                                }
                                            `}
                                        >
                                            {
                                                prioridade.rotulo
                                            }
                                        </button>
                                    );
                                },
                            )}
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="data-limite-tarefa"
                            className="mb-2 block text-sm font-medium text-slate-300"
                        >
                            Prazo
                        </label>

                        <div className="relative">
                            <CalendarDays
                                size={18}
                                className="
                                    pointer-events-none
                                    absolute left-4 top-1/2
                                    -translate-y-1/2
                                    text-slate-500
                                "
                            />

                            <input
                                id="data-limite-tarefa"
                                type="datetime-local"
                                value={
                                    formulario.dataLimite ??
                                    ""
                                }
                                onChange={(evento) =>
                                    alterarCampo(
                                        "dataLimite",
                                        evento.target.value ||
                                        null,
                                    )
                                }
                                className="
                                    w-full rounded-xl
                                    border border-slate-700
                                    bg-slate-950
                                    py-3 pl-11 pr-4
                                    text-sm text-white
                                    outline-none
                                    transition
                                    focus:border-cyan-500
                                "
                            />
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                        <div className="flex items-start gap-3">
                            <CheckCircle2
                                size={19}
                                className="mt-0.5 shrink-0 text-emerald-400"
                            />

                            <div>
                                <p className="text-sm font-medium text-slate-200">
                                    Vinculação automática
                                </p>

                                <p className="mt-1 text-xs leading-5 text-slate-500">
                                    Esta tarefa será vinculada à oportunidade e ao cliente relacionados.
                                </p>
                            </div>
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
                            onClick={fecharModal}
                            disabled={mutation.isPending}
                            className="
                                rounded-xl
                                border border-slate-700
                                px-5 py-3
                                text-sm font-semibold
                                text-slate-300
                                transition
                                hover:bg-slate-800
                                disabled:opacity-50
                            "
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            disabled={
                                mutation.isPending ||
                                formulario.titulo
                                    .trim()
                                    .length < 2
                            }
                            className="
                                inline-flex
                                items-center justify-center gap-2
                                rounded-xl
                                bg-cyan-500
                                px-5 py-3
                                text-sm font-semibold
                                text-slate-950
                                transition
                                hover:bg-cyan-400
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                            "
                        >
                            {mutation.isPending ? (
                                <>
                                    <Loader2
                                        size={18}
                                        className="animate-spin"
                                    />

                                    Salvando...
                                </>
                            ) : (
                                <>
                                    <Save size={18} />

                                    Criar tarefa
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}