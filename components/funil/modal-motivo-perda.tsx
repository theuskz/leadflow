"use client";

import {
    type FormEvent,
    useEffect,
    useState,
} from "react";
import {
    AlertTriangle,
    Loader2,
    X,
} from "lucide-react";

type Props = {
    aberto: boolean;
    tituloOportunidade?: string;
    carregando?: boolean;
    erro?: string;
    aoFechar: () => void;
    aoConfirmar: (
        motivoPerda: string,
    ) => void;
};

export function ModalMotivoPerda({
    aberto,
    tituloOportunidade,
    carregando = false,
    erro,
    aoFechar,
    aoConfirmar,
}: Props) {
    const [
        motivoPerda,
        setMotivoPerda,
    ] = useState("");

    useEffect(() => {
        if (!aberto) {
            setMotivoPerda("");
            return;
        }

        function fecharComEscape(
            evento: KeyboardEvent,
        ) {
            if (
                evento.key === "Escape" &&
                !carregando
            ) {
                aoFechar();
            }
        }

        document.addEventListener(
            "keydown",
            fecharComEscape,
        );

        document.body.style.overflow =
            "hidden";

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
        carregando,
        aoFechar,
    ]);

    if (!aberto) {
        return null;
    }

    function enviarFormulario(
        evento: FormEvent<HTMLFormElement>,
    ) {
        evento.preventDefault();

        const motivo =
            motivoPerda.trim();

        if (motivo.length < 3) {
            return;
        }

        aoConfirmar(motivo);
    }

    function fecharModal() {
        if (carregando) {
            return;
        }

        aoFechar();
    }

    return (
        <div
            className="
                fixed inset-0 z-[100]
                flex items-center justify-center
                bg-slate-950/85
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
                    w-full max-w-lg
                    overflow-hidden
                    rounded-2xl
                    border border-red-500/20
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
                    <div className="flex items-start gap-3">
                        <div
                            className="
                                flex h-11 w-11
                                shrink-0 items-center
                                justify-center
                                rounded-xl
                                bg-red-500/10
                                text-red-400
                            "
                        >
                            <AlertTriangle
                                size={22}
                            />
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold text-white">
                                Marcar como perdida
                            </h2>

                            <p className="mt-1 text-sm text-slate-400">
                                Informe o motivo da perda desta oportunidade.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={fecharModal}
                        disabled={carregando}
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
                    className="space-y-5 p-6"
                >
                    {tituloOportunidade && (
                        <div
                            className="
                                rounded-xl
                                border border-slate-800
                                bg-slate-950/70
                                px-4 py-3
                            "
                        >
                            <p className="text-xs uppercase tracking-wide text-slate-600">
                                Oportunidade
                            </p>

                            <p className="mt-1 font-medium text-slate-200">
                                {
                                    tituloOportunidade
                                }
                            </p>
                        </div>
                    )}

                    <div>
                        <label
                            htmlFor="motivo-perda"
                            className="mb-2 block text-sm font-medium text-slate-300"
                        >
                            Motivo da perda
                        </label>

                        <textarea
                            id="motivo-perda"
                            autoFocus
                            rows={5}
                            value={motivoPerda}
                            disabled={carregando}
                            onChange={(evento) =>
                                setMotivoPerda(
                                    evento.target.value,
                                )
                            }
                            placeholder="Ex.: Cliente fechou com um concorrente..."
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
                                focus:border-red-400
                                focus:ring-2
                                focus:ring-red-500/10
                                disabled:opacity-60
                            "
                        />

                        <p className="mt-2 text-right text-xs text-slate-600">
                            {motivoPerda.length} caracteres
                        </p>
                    </div>

                    {erro && (
                        <div
                            className="
                                rounded-xl
                                border border-red-500/30
                                bg-red-500/10
                                px-4 py-3
                                text-sm text-red-300
                            "
                        >
                            {erro}
                        </div>
                    )}

                    <div
                        className="
                            flex flex-col-reverse gap-3
                            border-t border-slate-800
                            pt-5
                            sm:flex-row
                            sm:justify-end
                        "
                    >
                        <button
                            type="button"
                            onClick={fecharModal}
                            disabled={carregando}
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
                                carregando ||
                                motivoPerda
                                    .trim()
                                    .length < 3
                            }
                            className="
                                inline-flex
                                items-center
                                justify-center gap-2
                                rounded-xl
                                bg-red-500
                                px-5 py-3
                                text-sm font-semibold
                                text-white
                                transition
                                hover:bg-red-400
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                            "
                        >
                            {carregando ? (
                                <>
                                    <Loader2
                                        size={18}
                                        className="animate-spin"
                                    />

                                    Salvando...
                                </>
                            ) : (
                                <>
                                    <AlertTriangle
                                        size={18}
                                    />

                                    Confirmar perda
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}