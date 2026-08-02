"use client";

import {
    FormEvent,
    useEffect,
    useState,
} from "react";

import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

import {
    Loader2,
    X,
} from "lucide-react";

import {
    buscarClientesParaOportunidade,
    criarOportunidade,
    NovaOportunidadePayload,
} from "@/lib/oportunidades";

import {
    atualizarOportunidade,
    AtualizarOportunidadePayload,
} from "@/lib/oportunidade";

import { StatusOportunidade } from "@/types/oportunidade";

type OportunidadeParaEdicao = {
    id: string;
    titulo: string;
    descricao?: string | null;
    valor: number;
    status: StatusOportunidade;
    probabilidade: number;
    previsaoFechamento?: string | null;
    motivoPerda?: string | null;

    cliente: {
        id: string;
        nome?: string;
    };
};

type ModalOportunidadeProps = {
    aberto: boolean;
    fechar: () => void;

    modo?: "criar" | "editar";

    oportunidade?: OportunidadeParaEdicao | null;

    aoSalvar?: () => void;

    /*
     * Mantido para não quebrar a tela de listagem
     * que já usa a propriedade aoCriar.
     */
    aoCriar?: () => void;
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

const estadoInicial: AtualizarOportunidadePayload = {
    titulo: "",
    clienteId: "",
    descricao: "",
    valor: 0,
    status: "NOVO_LEAD",
    probabilidade: 10,
    previsaoFechamento: null,
    motivoPerda: null,
};

function formatarDataParaInput(
    data?: string | null,
) {
    if (!data) {
        return null;
    }

    const dataConvertida = new Date(data);

    if (Number.isNaN(dataConvertida.getTime())) {
        return null;
    }

    return dataConvertida
        .toISOString()
        .split("T")[0];
}

export function ModalOportunidade({
    aberto,
    fechar,
    modo = "criar",
    oportunidade,
    aoSalvar,
    aoCriar,
}: ModalOportunidadeProps) {
    const queryClient = useQueryClient();

    const editando =
        modo === "editar" &&
        Boolean(oportunidade);

    const [formulario, setFormulario] =
        useState<AtualizarOportunidadePayload>(
            estadoInicial,
        );

    const [
        erroFormulario,
        setErroFormulario,
    ] = useState("");

    const {
        data: clientes = [],
        isPending: carregandoClientes,
    } = useQuery({
        queryKey: [
            "clientes",
            "selecao-oportunidade",
        ],

        queryFn:
            buscarClientesParaOportunidade,

        enabled: aberto,
    });

    useEffect(() => {
        if (!aberto) {
            return;
        }

        if (editando && oportunidade) {
            setFormulario({
                titulo: oportunidade.titulo,

                clienteId:
                    oportunidade.cliente.id,

                descricao:
                    oportunidade.descricao ?? "",

                valor:
                    Number(
                        oportunidade.valor,
                    ) || 0,

                status:
                    oportunidade.status,

                probabilidade:
                    oportunidade.probabilidade,

                previsaoFechamento:
                    formatarDataParaInput(
                        oportunidade.previsaoFechamento,
                    ),

                motivoPerda:
                    oportunidade.motivoPerda ??
                    null,
            });

            return;
        }

        setFormulario(estadoInicial);
    }, [
        aberto,
        editando,
        oportunidade,
    ]);

    const mutation = useMutation({
        mutationFn: async (
            dados: AtualizarOportunidadePayload,
        ) => {
            if (
                editando &&
                oportunidade
            ) {
                return atualizarOportunidade({
                    id: oportunidade.id,
                    dados,
                });
            }

            return criarOportunidade(
                dados as NovaOportunidadePayload,
            );
        },

        onSuccess: async () => {
            setErroFormulario("");

            await queryClient.invalidateQueries({
                queryKey: ["oportunidades"],
            });

            if (oportunidade?.id) {
                await queryClient.invalidateQueries({
                    queryKey: [
                        "oportunidade",
                        oportunidade.id,
                    ],
                });
            }

            aoSalvar?.();

            if (!editando) {
                aoCriar?.();
            }

            fechar();
        },

        onError: (erro) => {
            setErroFormulario(
                erro instanceof Error
                    ? erro.message
                    : editando
                        ? "Não foi possível atualizar a oportunidade."
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
        function fecharComEscape(
            evento: KeyboardEvent,
        ) {
            if (
                evento.key === "Escape" &&
                !mutation.isPending
            ) {
                fechar();
            }
        }

        if (aberto) {
            document.addEventListener(
                "keydown",
                fecharComEscape,
            );

            document.body.style.overflow =
                "hidden";
        }

        return () => {
            document.removeEventListener(
                "keydown",
                fecharComEscape,
            );

            document.body.style.overflow =
                "";
        };
    }, [
        aberto,
        fechar,
        mutation.isPending,
    ]);

    function alterarCampo<
        Campo extends keyof AtualizarOportunidadePayload,
    >(
        campo: Campo,
        valor: AtualizarOportunidadePayload[Campo],
    ) {
        setFormulario((estadoAtual) => ({
            ...estadoAtual,
            [campo]: valor,
        }));
    }

    function alterarStatus(
        status: StatusOportunidade,
    ) {
        setFormulario((estadoAtual) => ({
            ...estadoAtual,
            status,

            probabilidade:
                probabilidadesPorStatus[
                status
                ],

            motivoPerda:
                status === "PERDIDO"
                    ? estadoAtual.motivoPerda
                    : null,
        }));
    }

    function enviarFormulario(
        evento: FormEvent,
    ) {
        evento.preventDefault();

        setErroFormulario("");

        if (
            formulario.titulo
                .trim()
                .length < 2
        ) {
            setErroFormulario(
                "Informe um título com pelo menos 2 caracteres.",
            );

            return;
        }

        if (!formulario.clienteId) {
            setErroFormulario(
                "Selecione um cliente.",
            );

            return;
        }

        if (
            formulario.valor < 0 ||
            !Number.isFinite(
                formulario.valor,
            )
        ) {
            setErroFormulario(
                "Informe um valor válido.",
            );

            return;
        }

        if (
            formulario.probabilidade < 0 ||
            formulario.probabilidade > 100
        ) {
            setErroFormulario(
                "A probabilidade deve estar entre 0 e 100.",
            );

            return;
        }

        if (
            formulario.status ===
            "PERDIDO" &&
            !formulario.motivoPerda?.trim()
        ) {
            setErroFormulario(
                "Informe o motivo da perda da oportunidade.",
            );

            return;
        }

        mutation.mutate({
            ...formulario,

            titulo:
                formulario.titulo.trim(),

            descricao:
                formulario.descricao?.trim() ||
                undefined,

            previsaoFechamento:
                formulario.previsaoFechamento ||
                null,

            motivoPerda:
                formulario.status ===
                    "PERDIDO"
                    ? formulario.motivoPerda?.trim() ||
                    null
                    : null,
        });
    }

    function fecharModal() {
        if (mutation.isPending) {
            return;
        }

        fechar();
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
                            {editando
                                ? "Editar oportunidade"
                                : "Nova oportunidade"}
                        </h2>

                        <p className="mt-1 text-sm text-slate-400">
                            {editando
                                ? "Atualize as informações desta negociação."
                                : "Adicione uma nova negociação ao pipeline."}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={fecharModal}
                        disabled={
                            mutation.isPending
                        }
                        className="
                            rounded-lg p-2
                            text-slate-400
                            transition
                            hover:bg-slate-800
                            hover:text-white
                            disabled:cursor-not-allowed
                            disabled:opacity-60
                        "
                        aria-label="Fechar modal"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form
                    onSubmit={
                        enviarFormulario
                    }
                    className="space-y-5 p-6"
                >
                    <div className="grid gap-5 md:grid-cols-2">
                        <div className="md:col-span-2">
                            <label
                                htmlFor="titulo-oportunidade"
                                className="mb-2 block text-sm font-medium text-slate-300"
                            >
                                Título
                            </label>

                            <input
                                id="titulo-oportunidade"
                                value={
                                    formulario.titulo
                                }
                                onChange={(
                                    evento,
                                ) =>
                                    alterarCampo(
                                        "titulo",
                                        evento
                                            .target
                                            .value,
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
                                htmlFor="cliente-oportunidade"
                                className="mb-2 block text-sm font-medium text-slate-300"
                            >
                                Cliente
                            </label>

                            <select
                                id="cliente-oportunidade"
                                value={
                                    formulario.clienteId
                                }
                                onChange={(
                                    evento,
                                ) =>
                                    alterarCampo(
                                        "clienteId",
                                        evento
                                            .target
                                            .value,
                                    )
                                }
                                disabled={
                                    carregandoClientes
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
                                    disabled:opacity-60
                                "
                            >
                                <option value="">
                                    {carregandoClientes
                                        ? "Carregando clientes..."
                                        : "Selecione um cliente"}
                                </option>

                                {clientes.map(
                                    (cliente) => (
                                        <option
                                            key={
                                                cliente.id
                                            }
                                            value={
                                                cliente.id
                                            }
                                        >
                                            {
                                                cliente.nome
                                            }

                                            {cliente.empresa
                                                ? ` — ${cliente.empresa}`
                                                : ""}
                                        </option>
                                    ),
                                )}
                            </select>
                        </div>

                        <div>
                            <label
                                htmlFor="valor-oportunidade"
                                className="mb-2 block text-sm font-medium text-slate-300"
                            >
                                Valor
                            </label>

                            <input
                                id="valor-oportunidade"
                                type="number"
                                min="0"
                                step="0.01"
                                value={
                                    formulario.valor ===
                                        0
                                        ? ""
                                        : formulario.valor
                                }
                                onChange={(
                                    evento,
                                ) =>
                                    alterarCampo(
                                        "valor",
                                        Number(
                                            evento
                                                .target
                                                .value ||
                                            0,
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
                                htmlFor="previsao-oportunidade"
                                className="mb-2 block text-sm font-medium text-slate-300"
                            >
                                Previsão de fechamento
                            </label>

                            <input
                                id="previsao-oportunidade"
                                type="date"
                                value={
                                    formulario.previsaoFechamento ??
                                    ""
                                }
                                onChange={(
                                    evento,
                                ) =>
                                    alterarCampo(
                                        "previsaoFechamento",
                                        evento
                                            .target
                                            .value ||
                                        null,
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
                                htmlFor="status-oportunidade"
                                className="mb-2 block text-sm font-medium text-slate-300"
                            >
                                Etapa
                            </label>

                            <select
                                id="status-oportunidade"
                                value={
                                    formulario.status
                                }
                                onChange={(
                                    evento,
                                ) =>
                                    alterarStatus(
                                        evento
                                            .target
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
                                {statusDisponiveis.map(
                                    (status) => (
                                        <option
                                            key={
                                                status.valor
                                            }
                                            value={
                                                status.valor
                                            }
                                        >
                                            {
                                                status.rotulo
                                            }
                                        </option>
                                    ),
                                )}
                            </select>
                        </div>

                        <div>
                            <div className="mb-2 flex items-center justify-between">
                                <label
                                    htmlFor="probabilidade-oportunidade"
                                    className="text-sm font-medium text-slate-300"
                                >
                                    Probabilidade
                                </label>

                                <span className="text-sm font-semibold text-cyan-400">
                                    {
                                        formulario.probabilidade
                                    }
                                    %
                                </span>
                            </div>

                            <input
                                id="probabilidade-oportunidade"
                                type="range"
                                min="0"
                                max="100"
                                step="5"
                                value={
                                    formulario.probabilidade
                                }
                                disabled={
                                    formulario.status ===
                                    "FECHADO" ||
                                    formulario.status ===
                                    "PERDIDO"
                                }
                                onChange={(
                                    evento,
                                ) =>
                                    alterarCampo(
                                        "probabilidade",
                                        Number(
                                            evento
                                                .target
                                                .value,
                                        ),
                                    )
                                }
                                className="
                                    h-11 w-full
                                    accent-cyan-500
                                    disabled:cursor-not-allowed
                                    disabled:opacity-60
                                "
                            />
                        </div>

                        {formulario.status ===
                            "PERDIDO" && (
                                <div className="md:col-span-2">
                                    <label
                                        htmlFor="motivo-perda"
                                        className="mb-2 block text-sm font-medium text-slate-300"
                                    >
                                        Motivo da perda
                                    </label>

                                    <textarea
                                        id="motivo-perda"
                                        rows={3}
                                        value={
                                            formulario.motivoPerda ??
                                            ""
                                        }
                                        onChange={(
                                            evento,
                                        ) =>
                                            alterarCampo(
                                                "motivoPerda",
                                                evento
                                                    .target
                                                    .value,
                                            )
                                        }
                                        placeholder="Informe por que esta oportunidade foi perdida..."
                                        className="
                                        w-full resize-none rounded-xl
                                        border border-red-500/40
                                        bg-slate-950
                                        px-4 py-3
                                        text-white
                                        outline-none
                                        transition
                                        placeholder:text-slate-600
                                        focus:border-red-400
                                    "
                                    />
                                </div>
                            )}

                        <div className="md:col-span-2">
                            <label
                                htmlFor="descricao-oportunidade"
                                className="mb-2 block text-sm font-medium text-slate-300"
                            >
                                Descrição
                            </label>

                            <textarea
                                id="descricao-oportunidade"
                                rows={4}
                                value={
                                    formulario.descricao ??
                                    ""
                                }
                                onChange={(
                                    evento,
                                ) =>
                                    alterarCampo(
                                        "descricao",
                                        evento
                                            .target
                                            .value,
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
                            onClick={
                                fecharModal
                            }
                            disabled={
                                mutation.isPending
                            }
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
                            disabled={
                                mutation.isPending
                            }
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
                                : editando
                                    ? "Salvar alterações"
                                    : "Criar oportunidade"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}