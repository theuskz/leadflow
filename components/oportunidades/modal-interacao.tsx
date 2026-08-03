"use client";

import {
    useEffect,
    useState,
    type FormEvent,
} from "react";
import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";
import {
    CalendarDays,
    FileText,
    LoaderCircle,
    Mail,
    MessageCircle,
    Phone,
    Save,
    UserRound,
    X,
    Building2,
} from "lucide-react";

import {
    atualizarInteracao,
    criarInteracao,
    type AtualizarInteracaoPayload,
    type NovaInteracaoPayload,
} from "@/lib/interacoes";

import type {
    TipoInteracao,
} from "@/types/oportunidade";

import type {
    InteracaoOportunidade,
} from "@/types/oportunidade";

type Props = {
    oportunidadeId: string;

    aberto: boolean;

    aoFechar: () => void;

    modo?: "criar" | "editar";

    interacao?: InteracaoOportunidade | null;
};

type OpcaoTipo = {
    valor: TipoInteracao;
    rotulo: string;
    icone: typeof Phone;
};

const tiposInteracao: OpcaoTipo[] = [
    {
        valor: "LIGACAO",
        rotulo: "Ligação",
        icone: Phone,
    },
    {
        valor: "WHATSAPP",
        rotulo: "WhatsApp",
        icone: MessageCircle,
    },
    {
        valor: "EMAIL",
        rotulo: "E-mail",
        icone: Mail,
    },
    {
        valor: "REUNIAO",
        rotulo: "Reunião",
        icone: UserRound,
    },
    {
        valor: "VISITA",
        rotulo: "Visita",
        icone: Building2,
    },
    {
        valor: "ANOTACAO",
        rotulo: "Anotação",
        icone: FileText,
    },
];

function obterDataHoraLocal() {
    const data = new Date();

    const compensacao =
        data.getTimezoneOffset() * 60_000;

    return new Date(
        data.getTime() - compensacao,
    )
        .toISOString()
        .slice(0, 16);
}

export function ModalInteracao({
    oportunidadeId,
    aberto,
    aoFechar,
    modo = "criar",
    interacao,
}: Props) {
    const queryClient = useQueryClient();

    const [tipo, setTipo] =
        useState<TipoInteracao>("LIGACAO");

    const [descricao, setDescricao] =
        useState("");

    const [data, setData] = useState(
        obterDataHoraLocal(),
    );

    const mutation = useMutation({

        mutationFn: (
            payload:
                | NovaInteracaoPayload
                | AtualizarInteracaoPayload,
        ) => {

            if (
                modo === "editar" &&
                interacao
            ) {
                return atualizarInteracao(
                    interacao.id,
                    payload,
                );
            }

            return criarInteracao(
                oportunidadeId,
                payload,
            );
        },

        onSuccess: async () => {

            await queryClient.invalidateQueries({
                queryKey: [
                    "oportunidade",
                    oportunidadeId,
                ],
            });

            setTipo("LIGACAO");
            setDescricao("");
            setData(obterDataHoraLocal());

            aoFechar();
        },
    });

    useEffect(() => {

        if (
            !aberto ||
            modo !== "editar" ||
            !interacao
        ) {
            return;
        }

        setTipo(interacao.tipo);

        setDescricao(
            interacao.descricao,
        );

        setData(
            new Date(interacao.data)
                .toISOString()
                .slice(0, 16),
        );

    }, [
        aberto,
        modo,
        interacao,
    ]);

    if (!aberto) {
        return null;
    }

    function salvar(
        evento: FormEvent<HTMLFormElement>,
    ) {
        evento.preventDefault();

        mutation.mutate({
            tipo,
            descricao: descricao.trim(),
            data: data
                ? new Date(data).toISOString()
                : undefined,
        });
    }

    return (
        <div
            className="
                fixed inset-0 z-50
                flex items-center justify-center
                bg-slate-950/80
                p-4 backdrop-blur-sm
            "
            onMouseDown={(evento) => {
                if (
                    evento.target ===
                    evento.currentTarget
                ) {
                    aoFechar();
                }
            }}
        >
            <div
                className="
                    max-h-[90vh] w-full
                    max-w-2xl overflow-y-auto
                    rounded-2xl
                    border border-slate-800
                    bg-slate-900
                    shadow-2xl
                "
            >
                <div
                    className="
                        flex items-start
                        justify-between gap-4
                        border-b border-slate-800
                        px-6 py-5
                    "
                >
                    <div>
                        <h2 className="text-xl font-semibold text-white">
                            {
                                modo === "editar"
                                    ? "Editar interação"
                                    : "Nova interação"
                            }
                        </h2>

                        <p className="mt-1 text-sm text-slate-400">
                            {
                                modo === "editar"

                                    ? "Atualize os dados da interação."

                                    : "Registre uma atividade realizada com o cliente."
                            }
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={aoFechar}
                        disabled={mutation.isPending}
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
                    onSubmit={salvar}
                    className="space-y-6 p-6"
                >
                    <div>
                        <label className="mb-3 block text-sm font-medium text-slate-300">
                            Tipo da interação
                        </label>

                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                            {tiposInteracao.map(
                                (opcao) => {
                                    const Icone =
                                        opcao.icone;

                                    const selecionado =
                                        tipo ===
                                        opcao.valor;

                                    return (
                                        <button
                                            key={
                                                opcao.valor
                                            }
                                            type="button"
                                            onClick={() =>
                                                setTipo(
                                                    opcao.valor,
                                                )
                                            }
                                            className={`
                                                flex items-center
                                                gap-3 rounded-xl
                                                border px-4 py-3
                                                text-left text-sm
                                                font-medium
                                                transition

                                                ${selecionado
                                                    ? `
                                                            border-cyan-500/60
                                                            bg-cyan-500/10
                                                            text-cyan-300
                                                        `
                                                    : `
                                                            border-slate-700
                                                            bg-slate-950/50
                                                            text-slate-300
                                                            hover:border-slate-600
                                                            hover:bg-slate-800
                                                        `
                                                }
                                            `}
                                        >
                                            <Icone
                                                size={18}
                                            />

                                            {opcao.rotulo}
                                        </button>
                                    );
                                },
                            )}
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="descricao-interacao"
                            className="mb-2 block text-sm font-medium text-slate-300"
                        >
                            Descrição
                        </label>

                        <textarea
                            id="descricao-interacao"
                            value={descricao}
                            onChange={(evento) =>
                                setDescricao(
                                    evento.target
                                        .value,
                                )
                            }
                            required
                            minLength={3}
                            rows={5}
                            placeholder="Exemplo: Cliente demonstrou interesse e pediu o envio de uma proposta..."
                            className="
                                w-full resize-none
                                rounded-xl
                                border border-slate-700
                                bg-slate-950
                                px-4 py-3
                                text-sm text-white
                                outline-none
                                transition
                                placeholder:text-slate-600
                                focus:border-cyan-500
                                focus:ring-2
                                focus:ring-cyan-500/10
                            "
                        />

                        <p className="mt-2 text-right text-xs text-slate-600">
                            {descricao.length} caracteres
                        </p>
                    </div>

                    <div>
                        <label
                            htmlFor="data-interacao"
                            className="mb-2 block text-sm font-medium text-slate-300"
                        >
                            Data e horário
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
                                id="data-interacao"
                                type="datetime-local"
                                value={data}
                                onChange={(evento) =>
                                    setData(
                                        evento.target
                                            .value,
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
                                    focus:ring-2
                                    focus:ring-cyan-500/10
                                "
                            />
                        </div>
                    </div>

                    {mutation.isError && (
                        <div
                            className="
                                rounded-xl
                                border border-red-500/30
                                bg-red-500/10
                                px-4 py-3
                                text-sm text-red-300
                            "
                        >
                            {mutation.error instanceof
                                Error
                                ? mutation.error.message
                                : "Não foi possível registrar a interação."}
                        </div>
                    )}

                    <div
                        className="
                            flex flex-col-reverse gap-3
                            border-t border-slate-800
                            pt-5 sm:flex-row
                            sm:justify-end
                        "
                    >
                        <button
                            type="button"
                            onClick={aoFechar}
                            disabled={
                                mutation.isPending
                            }
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
                                descricao.trim()
                                    .length < 3
                            }
                            className="
                                inline-flex
                                items-center
                                justify-center gap-2
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
                                    <LoaderCircle
                                        size={18}
                                        className="animate-spin"
                                    />

                                    Salvando...
                                </>
                            ) : (
                                <>
                                    <Save size={18} />

                                    {modo === "editar"
                                        ? "Salvar alterações"
                                        : "Registrar interação"}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}