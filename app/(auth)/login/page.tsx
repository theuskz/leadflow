"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowRight,
    Eye,
    EyeOff,
    LoaderCircle,
    LockKeyhole,
    Mail,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [carregando, setCarregando] = useState(false);

    async function fazerLogin(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!email.trim() || !senha.trim()) {
            toast.error("Preencha o e-mail e a senha.");
            return;
        }

        try {
            setCarregando(true);

            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    senha,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.erro ?? "Não foi possível entrar.",
                );
            }

            toast.success("Login realizado com sucesso.");

            router.replace("/dashboard");
            router.refresh();
        } catch (erro) {
            toast.error(
                erro instanceof Error
                    ? erro.message
                    : "Não foi possível entrar.",
            );
        } finally {
            setCarregando(false);
        }
    }

    return (
        <main className="grid min-h-screen bg-slate-950 lg:grid-cols-2">
            <section className="hidden border-r border-slate-800 bg-slate-900/50 p-12 lg:flex lg:flex-col lg:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 font-bold text-white">
                        LF
                    </div>

                    <div>
                        <p className="font-semibold text-white">
                            LeadFlow
                        </p>

                        <p className="text-sm text-slate-400">
                            CRM Comercial
                        </p>
                    </div>
                </div>

                <div className="max-w-xl">
                    <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-400">
                        Gestão comercial inteligente
                    </p>

                    <h1 className="mt-5 text-5xl font-bold leading-tight tracking-tight text-white">
                        Transforme contatos em oportunidades reais.
                    </h1>

                    <p className="mt-6 max-w-lg text-lg leading-8 text-slate-400">
                        Organize leads, acompanhe negociações e tenha uma
                        visão completa do seu processo comercial.
                    </p>
                </div>

                <p className="text-sm text-slate-500">
                    © 2026 LeadFlow CRM
                </p>
            </section>

            <section className="flex items-center justify-center px-6 py-12">
                <div className="w-full max-w-md">
                    <div className="mb-10 lg:hidden">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 font-bold text-white">
                                LF
                            </div>

                            <div>
                                <p className="font-semibold text-white">
                                    LeadFlow
                                </p>

                                <p className="text-sm text-slate-400">
                                    CRM Comercial
                                </p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-white">
                            Bem-vindo de volta
                        </h2>

                        <p className="mt-3 text-slate-400">
                            Entre com seus dados para acessar o CRM.
                        </p>
                    </div>

                    <form
                        onSubmit={fazerLogin}
                        className="mt-8 space-y-5"
                    >
                        <div>
                            <label
                                htmlFor="email"
                                className="mb-2 block text-sm font-medium text-slate-300"
                            >
                                E-mail
                            </label>

                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />

                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(event) => {
                                        setEmail(event.target.value);
                                    }}
                                    placeholder="admin@leadflow.com"
                                    autoComplete="email"
                                    className="h-12 border-slate-800 bg-slate-900 pl-11 text-white placeholder:text-slate-600"
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="senha"
                                className="mb-2 block text-sm font-medium text-slate-300"
                            >
                                Senha
                            </label>

                            <div className="relative">
                                <LockKeyhole className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />

                                <Input
                                    id="senha"
                                    type={mostrarSenha ? "text" : "password"}
                                    value={senha}
                                    onChange={(event) => {
                                        setSenha(event.target.value);
                                    }}
                                    placeholder="Digite sua senha"
                                    autoComplete="current-password"
                                    className="h-12 border-slate-800 bg-slate-900 px-11 text-white placeholder:text-slate-600"
                                />

                                <button
                                    type="button"
                                    onClick={() => {
                                        setMostrarSenha((valor) => !valor);
                                    }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-300"
                                    aria-label={
                                        mostrarSenha
                                            ? "Ocultar senha"
                                            : "Mostrar senha"
                                    }
                                >
                                    {mostrarSenha ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={carregando}
                            className="h-12 w-full bg-blue-600 font-semibold hover:bg-blue-700"
                        >
                            {carregando ? (
                                <>
                                    <LoaderCircle className="h-5 w-5 animate-spin" />
                                    Entrando...
                                </>
                            ) : (
                                <>
                                    Entrar no CRM
                                    <ArrowRight className="h-5 w-5" />
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                        <p className="text-sm text-slate-400">
                            Acesso inicial
                        </p>

                        <p className="mt-2 text-sm text-slate-300">
                            E-mail:{" "}
                            <strong>admin@leadflow.com</strong>
                        </p>

                        <p className="mt-1 text-sm text-slate-300">
                            Senha: <strong>123456</strong>
                        </p>
                    </div>
                </div>
            </section>
        </main>
    );
}