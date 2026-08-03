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
    Eye,
    EyeOff,
    Loader2,
    Mail,
    Save,
    ShieldCheck,
    UserRound,
    X,
} from "lucide-react";
import { toast } from "sonner";

import {
    criarUsuario,
} from "@/lib/usuarios";

import type {
    CriarUsuarioPayload,
    NivelUsuario,
} from "@/types/usuario";

type Props = {
    aberto: boolean;
    aoFechar: () => void;
};

const niveis: {
    valor: NivelUsuario;
    rotulo: string;
    descricao: string;
}[] = [
        {
            valor: "ADMIN",
            rotulo: "Administrador",
            descricao:
                "Acesso completo ao sistema.",
        },
        {
            valor: "GERENTE",
            rotulo: "Gerente",
            descricao:
                "Visualiza e acompanha toda a operação.",
        },
        {
            valor: "VENDEDOR",
            rotulo: "Vendedor",
            descricao:
                "Acessa apenas seus próprios dados.",
        },
    ];

const estadoInicial: CriarUsuarioPayload = {
    nome: "",
    email: "",
    senha: "",
    nivel: "VENDEDOR",
};

export function ModalUsuario({
    aberto,
    aoFechar,
}: Props) {
    const queryClient = useQueryClient();

    const [formulario, setFormulario] =
        useState<CriarUsuarioPayload>(
            estadoInicial,
        );

    const [
        mostrarSenha,
        setMostrarSenha,
    ] = useState(false);

    const mutation = useMutation({
        mutationFn: criarUsuario,

        onSuccess: async (resultado) => {
            toast.success(
                resultado.mensagem ??
                "Usuário criado com sucesso.",
            );

            await queryClient.invalidateQueries({
                queryKey: ["usuarios"],
            });

            setFormulario(estadoInicial);
            setMostrarSenha(false);
            aoFechar();
        },

        onError: (erro) => {
            toast.error(
                erro instanceof Error
                    ? erro.message
                    : "Não foi possível criar o usuário.",
            );
        },
    });

    useEffect(() => {
        if (!aberto) {
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
        aoFechar,
        mutation.isPending,
    ]);

    function alterarCampo<
        Campo extends keyof CriarUsuarioPayload,
    >(
        campo: Campo,
        valor: CriarUsuarioPayload[Campo],
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

        mutation.mutate({
            nome: formulario.nome.trim(),
            email: formulario.email
                .trim()
                .toLowerCase(),
            senha: formulario.senha,
            nivel: formulario.nivel,
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
                <div className="flex items-start justify-between gap-4 border-b border-slate-800 px-6 py-5">
                    <div>
                        <h2 className="text-xl font-semibold text-white">
                            Adicionar usuário
                        </h2>

                        <p className="mt-1 text-sm text-slate-400">
                            Crie um novo acesso para sua equipe.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={fecharModal}
                        disabled={
                            mutation.isPending
                        }
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:opacity-50"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form
                    onSubmit={enviarFormulario}
                    className="space-y-5 p-6"
                >
                    <div>
                        <label
                            htmlFor="nome-usuario"
                            className="mb-2 block text-sm font-medium text-slate-300"
                        >
                            Nome
                        </label>

                        <div className="relative">
                            <UserRound
                                size={18}
                                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                            />

                            <input
                                id="nome-usuario"
                                value={formulario.nome}
                                onChange={(evento) =>
                                    alterarCampo(
                                        "nome",
                                        evento.target
                                            .value,
                                    )
                                }
                                placeholder="Nome completo"
                                className="h-12 w-full rounded-xl border border-slate-700 bg-slate-950 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="email-usuario"
                            className="mb-2 block text-sm font-medium text-slate-300"
                        >
                            E-mail
                        </label>

                        <div className="relative">
                            <Mail
                                size={18}
                                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                            />

                            <input
                                id="email-usuario"
                                type="email"
                                value={formulario.email}
                                onChange={(evento) =>
                                    alterarCampo(
                                        "email",
                                        evento.target
                                            .value,
                                    )
                                }
                                placeholder="usuario@empresa.com"
                                className="h-12 w-full rounded-xl border border-slate-700 bg-slate-950 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="senha-usuario"
                            className="mb-2 block text-sm font-medium text-slate-300"
                        >
                            Senha inicial
                        </label>

                        <div className="relative">
                            <ShieldCheck
                                size={18}
                                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                            />

                            <input
                                id="senha-usuario"
                                type={
                                    mostrarSenha
                                        ? "text"
                                        : "password"
                                }
                                value={formulario.senha}
                                onChange={(evento) =>
                                    alterarCampo(
                                        "senha",
                                        evento.target
                                            .value,
                                    )
                                }
                                placeholder="Mínimo de 6 caracteres"
                                className="h-12 w-full rounded-xl border border-slate-700 bg-slate-950 pl-11 pr-12 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-500"
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setMostrarSenha(
                                        (valor) =>
                                            !valor,
                                    )
                                }
                                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 transition hover:bg-slate-800 hover:text-white"
                            >
                                {mostrarSenha ? (
                                    <EyeOff size={18} />
                                ) : (
                                    <Eye size={18} />
                                )}
                            </button>
                        </div>
                    </div>

                    <div>
                        <p className="mb-3 text-sm font-medium text-slate-300">
                            Nível de acesso
                        </p>

                        <div className="space-y-3">
                            {niveis.map((nivel) => {
                                const selecionado =
                                    formulario.nivel ===
                                    nivel.valor;

                                return (
                                    <button
                                        key={
                                            nivel.valor
                                        }
                                        type="button"
                                        onClick={() =>
                                            alterarCampo(
                                                "nivel",
                                                nivel.valor,
                                            )
                                        }
                                        className={`
                                            w-full rounded-xl border
                                            p-4 text-left transition
                                            ${selecionado
                                                ? "border-cyan-500/50 bg-cyan-500/10"
                                                : "border-slate-700 bg-slate-950/50 hover:bg-slate-800"
                                            }
                                        `}
                                    >
                                        <p
                                            className={
                                                selecionado
                                                    ? "font-semibold text-cyan-300"
                                                    : "font-semibold text-slate-200"
                                            }
                                        >
                                            {
                                                nivel.rotulo
                                            }
                                        </p>

                                        <p className="mt-1 text-xs text-slate-500">
                                            {
                                                nivel.descricao
                                            }
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex flex-col-reverse gap-3 border-t border-slate-800 pt-5 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={fecharModal}
                            disabled={
                                mutation.isPending
                            }
                            className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            disabled={
                                mutation.isPending ||
                                formulario.nome
                                    .trim()
                                    .length < 2 ||
                                !formulario.email.includes(
                                    "@",
                                ) ||
                                formulario.senha.length <
                                6
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {mutation.isPending ? (
                                <Loader2
                                    size={18}
                                    className="animate-spin"
                                />
                            ) : (
                                <Save size={18} />
                            )}

                            {mutation.isPending
                                ? "Criando..."
                                : "Criar usuário"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}