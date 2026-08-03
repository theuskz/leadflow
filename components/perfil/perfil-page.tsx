"use client";

import {
    type FormEvent,
    useEffect,
    useState,
} from "react";
import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import {
    EquipeUsuarios,
} from "@/components/perfil/equipe-usuarios";
import {
    AlertCircle,
    BriefcaseBusiness,
    CircleDollarSign,
    Eye,
    EyeOff,
    Loader2,
    LockKeyhole,
    Mail,
    Save,
    ShieldCheck,
    UserRound,
    UsersRound,
} from "lucide-react";
import { toast } from "sonner";

import {
    alterarSenha,
    atualizarPerfil,
    buscarPerfil,
} from "@/lib/perfil";

function formatarMoeda(valor: number) {
    return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
}

function formatarData(data: string) {
    return new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "long",
    }).format(new Date(data));
}

export function PerfilPage() {
    const queryClient = useQueryClient();

    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");

    const [senhaAtual, setSenhaAtual] =
        useState("");

    const [novaSenha, setNovaSenha] =
        useState("");

    const [
        confirmarSenha,
        setConfirmarSenha,
    ] = useState("");

    const [
        mostrarSenhas,
        setMostrarSenhas,
    ] = useState(false);

    const {
        data,
        isPending,
        isError,
        error,
    } = useQuery({
        queryKey: ["perfil"],
        queryFn: buscarPerfil,
    });

    useEffect(() => {
        if (!data) {
            return;
        }

        setNome(data.usuario.nome);
        setEmail(data.usuario.email);
    }, [data]);

    const mutationPerfil = useMutation({
        mutationFn: atualizarPerfil,

        onSuccess: async (resultado) => {
            toast.success(
                resultado.mensagem ??
                "Perfil atualizado com sucesso.",
            );

            await queryClient.invalidateQueries({
                queryKey: ["perfil"],
            });

            await queryClient.invalidateQueries({
                queryKey: ["usuario-autenticado"],
            });
        },

        onError: (erro) => {
            toast.error(
                erro instanceof Error
                    ? erro.message
                    : "Não foi possível atualizar o perfil.",
            );
        },
    });

    const mutationSenha = useMutation({
        mutationFn: alterarSenha,

        onSuccess: (resultado) => {
            toast.success(
                resultado.mensagem ??
                "Senha atualizada com sucesso.",
            );

            setSenhaAtual("");
            setNovaSenha("");
            setConfirmarSenha("");
        },

        onError: (erro) => {
            toast.error(
                erro instanceof Error
                    ? erro.message
                    : "Não foi possível atualizar a senha.",
            );
        },
    });

    function enviarPerfil(
        evento: FormEvent<HTMLFormElement>,
    ) {
        evento.preventDefault();

        mutationPerfil.mutate({
            nome: nome.trim(),
            email: email
                .trim()
                .toLowerCase(),
        });
    }

    function enviarSenha(
        evento: FormEvent<HTMLFormElement>,
    ) {
        evento.preventDefault();

        mutationSenha.mutate({
            senhaAtual,
            novaSenha,
            confirmarSenha,
        });
    }

    if (isPending) {
        return (
            <div className="flex min-h-[500px] items-center justify-center gap-3 text-slate-400">
                <Loader2
                    size={22}
                    className="animate-spin"
                />

                Carregando perfil...
            </div>
        );
    }

    if (isError || !data) {
        return (
            <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center">
                <AlertCircle
                    size={34}
                    className="text-red-400"
                />

                <h2 className="mt-4 font-semibold text-red-300">
                    Não foi possível carregar o perfil
                </h2>

                <p className="mt-2 text-sm text-slate-400">
                    {error instanceof Error
                        ? error.message
                        : "Ocorreu um erro inesperado."}
                </p>
            </div>
        );
    }

    const usuario = data.usuario;

    const iniciais = usuario.nome
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((parte) => parte[0])
        .join("")
        .toUpperCase();

    const metricas = [
        {
            titulo: "Clientes",
            valor: usuario.estatisticas.clientes,
            icone: UsersRound,
        },
        {
            titulo: "Oportunidades",
            valor: usuario.estatisticas.oportunidades,
            icone: BriefcaseBusiness,
        },
        {
            titulo: "Vendas fechadas",
            valor: usuario.estatisticas.vendasFechadas,
            icone: ShieldCheck,
        },
        {
            titulo: "Valor fechado",
            valor: formatarMoeda(
                usuario.estatisticas.valorFechado,
            ),
            icone: CircleDollarSign,
        },
    ];

    return (
        <div className="space-y-6">
            <header>
                <p className="text-sm font-medium text-cyan-400">
                    Conta
                </p>

                <h1 className="mt-2 text-3xl font-bold text-white">
                    Meu perfil
                </h1>

                <p className="mt-2 text-slate-400">
                    Gerencie seus dados pessoais e sua segurança.
                </p>
            </header>

            <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                    <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-600 text-2xl font-bold text-white shadow-lg shadow-cyan-950/30">
                        {iniciais}
                    </div>

                    <div className="min-w-0">
                        <h2 className="truncate text-2xl font-bold text-white">
                            {usuario.nome}
                        </h2>

                        <p className="mt-1 truncate text-slate-400">
                            {usuario.email}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-2">
                            <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                                {usuario.nivel}
                            </span>

                            <span className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs text-slate-400">
                                Membro desde{" "}
                                {formatarData(
                                    usuario.criadoEm,
                                )}
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {metricas.map((metrica) => {
                    const Icone = metrica.icone;

                    return (
                        <article
                            key={metrica.titulo}
                            className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5"
                        >
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                                <Icone size={21} />
                            </div>

                            <p className="mt-4 text-sm text-slate-400">
                                {metrica.titulo}
                            </p>

                            <strong className="mt-2 block text-2xl text-white">
                                {metrica.valor}
                            </strong>
                        </article>
                    );
                })}
            </section>

            <section className="grid gap-6 xl:grid-cols-2">
                <article className="rounded-2xl border border-slate-800 bg-slate-900/70">
                    <div className="border-b border-slate-800 px-6 py-5">
                        <h2 className="text-lg font-semibold text-white">
                            Dados pessoais
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Atualize seu nome e e-mail.
                        </p>
                    </div>

                    <form
                        onSubmit={enviarPerfil}
                        className="space-y-5 p-6"
                    >
                        <div>
                            <label
                                htmlFor="nome-perfil"
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
                                    id="nome-perfil"
                                    value={nome}
                                    onChange={(evento) =>
                                        setNome(
                                            evento.target.value,
                                        )
                                    }
                                    className="h-12 w-full rounded-xl border border-slate-700 bg-slate-950 pl-11 pr-4 text-sm text-white outline-none transition focus:border-cyan-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="email-perfil"
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
                                    id="email-perfil"
                                    type="email"
                                    value={email}
                                    onChange={(evento) =>
                                        setEmail(
                                            evento.target.value,
                                        )
                                    }
                                    className="h-12 w-full rounded-xl border border-slate-700 bg-slate-950 pl-11 pr-4 text-sm text-white outline-none transition focus:border-cyan-500"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={
                                mutationPerfil.isPending ||
                                nome.trim().length < 2 ||
                                !email.includes("@")
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {mutationPerfil.isPending ? (
                                <Loader2
                                    size={18}
                                    className="animate-spin"
                                />
                            ) : (
                                <Save size={18} />
                            )}

                            {mutationPerfil.isPending
                                ? "Salvando..."
                                : "Salvar alterações"}
                        </button>
                    </form>
                </article>

                <article className="rounded-2xl border border-slate-800 bg-slate-900/70">
                    <div className="border-b border-slate-800 px-6 py-5">
                        <h2 className="text-lg font-semibold text-white">
                            Alterar senha
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Use uma senha forte e exclusiva.
                        </p>
                    </div>

                    <form
                        onSubmit={enviarSenha}
                        className="space-y-5 p-6"
                    >
                        {[
                            {
                                id: "senha-atual",
                                rotulo: "Senha atual",
                                valor: senhaAtual,
                                alterar: setSenhaAtual,
                            },
                            {
                                id: "nova-senha",
                                rotulo: "Nova senha",
                                valor: novaSenha,
                                alterar: setNovaSenha,
                            },
                            {
                                id: "confirmar-senha",
                                rotulo: "Confirmar nova senha",
                                valor: confirmarSenha,
                                alterar: setConfirmarSenha,
                            },
                        ].map((campo) => (
                            <div key={campo.id}>
                                <label
                                    htmlFor={campo.id}
                                    className="mb-2 block text-sm font-medium text-slate-300"
                                >
                                    {campo.rotulo}
                                </label>

                                <div className="relative">
                                    <LockKeyhole
                                        size={18}
                                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                                    />

                                    <input
                                        id={campo.id}
                                        type={
                                            mostrarSenhas
                                                ? "text"
                                                : "password"
                                        }
                                        value={campo.valor}
                                        onChange={(evento) =>
                                            campo.alterar(
                                                evento.target
                                                    .value,
                                            )
                                        }
                                        className="h-12 w-full rounded-xl border border-slate-700 bg-slate-950 pl-11 pr-12 text-sm text-white outline-none transition focus:border-cyan-500"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setMostrarSenhas(
                                                (valor) =>
                                                    !valor,
                                            )
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 transition hover:bg-slate-800 hover:text-white"
                                    >
                                        {mostrarSenhas ? (
                                            <EyeOff size={18} />
                                        ) : (
                                            <Eye size={18} />
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}

                        <button
                            type="submit"
                            disabled={
                                mutationSenha.isPending ||
                                !senhaAtual ||
                                novaSenha.length < 6 ||
                                novaSenha !== confirmarSenha
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {mutationSenha.isPending ? (
                                <Loader2
                                    size={18}
                                    className="animate-spin"
                                />
                            ) : (
                                <LockKeyhole size={18} />
                            )}

                            {mutationSenha.isPending
                                ? "Atualizando..."
                                : "Atualizar senha"}
                        </button>
                    </form>
                </article>
            </section>

            <EquipeUsuarios
                nivelUsuarioAtual={usuario.nivel}
            />
        </div>
    );
}