"use client";

import {
    Building2,
    ChevronLeft,
    ChevronRight,
    Edit3,
    LoaderCircle,
    Mail,
    MoreHorizontal,
    Phone,
    Plus,
    Search,
    Trash2,
    UserRound,
    UsersRound,
    X,
} from "lucide-react";
import {
    FormEvent,
    useCallback,
    useEffect,
    useState,
} from "react";
import { toast } from "sonner";

type StatusCliente =
    | "LEAD"
    | "PROSPECT"
    | "CLIENTE"
    | "INATIVO";

type OrigemLead =
    | "SITE"
    | "INSTAGRAM"
    | "FACEBOOK"
    | "WHATSAPP"
    | "INDICACAO"
    | "EVENTO"
    | "LIGACAO"
    | "OUTRO";

type Responsavel = {
    id: string;
    nome: string;
    email: string;
};

type Cliente = {
    id: string;
    nome: string;
    email: string | null;
    telefone: string | null;
    empresa: string | null;
    cargo: string | null;
    documento: string | null;
    status: StatusCliente;
    origem: OrigemLead;
    observacoes: string | null;
    criadoEm: string;
    atualizadoEm: string;
    responsavel: Responsavel | null;
    _count: {
        oportunidades: number;
        tarefas: number;
        interacoes: number;
    };
};

type Paginacao = {
    pagina: number;
    limite: number;
    total: number;
    totalPaginas: number;
};

type RespostaClientes = {
    clientes: Cliente[];
    paginacao: Paginacao;
};

type FormularioCliente = {
    nome: string;
    email: string;
    telefone: string;
    empresa: string;
    cargo: string;
    documento: string;
    status: StatusCliente;
    origem: OrigemLead;
    observacoes: string;
};

const formularioInicial: FormularioCliente = {
    nome: "",
    email: "",
    telefone: "",
    empresa: "",
    cargo: "",
    documento: "",
    status: "LEAD",
    origem: "OUTRO",
    observacoes: "",
};

const statusOpcoes: Array<{
    valor: StatusCliente;
    nome: string;
}> = [
        {
            valor: "LEAD",
            nome: "Lead",
        },
        {
            valor: "PROSPECT",
            nome: "Prospect",
        },
        {
            valor: "CLIENTE",
            nome: "Cliente",
        },
        {
            valor: "INATIVO",
            nome: "Inativo",
        },
    ];

const origemOpcoes: Array<{
    valor: OrigemLead;
    nome: string;
}> = [
        {
            valor: "SITE",
            nome: "Site",
        },
        {
            valor: "INSTAGRAM",
            nome: "Instagram",
        },
        {
            valor: "FACEBOOK",
            nome: "Facebook",
        },
        {
            valor: "WHATSAPP",
            nome: "WhatsApp",
        },
        {
            valor: "INDICACAO",
            nome: "Indicação",
        },
        {
            valor: "EVENTO",
            nome: "Evento",
        },
        {
            valor: "LIGACAO",
            nome: "Ligação",
        },
        {
            valor: "OUTRO",
            nome: "Outro",
        },
    ];

function formatarData(data: string) {
    return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(new Date(data));
}

function obterNomeStatus(status: StatusCliente) {
    return (
        statusOpcoes.find((item) => item.valor === status)?.nome ??
        status
    );
}

function obterNomeOrigem(origem: OrigemLead) {
    return (
        origemOpcoes.find((item) => item.valor === origem)?.nome ??
        origem
    );
}

function classeStatus(status: StatusCliente) {
    const classes: Record<StatusCliente, string> = {
        LEAD: "bg-blue-500/10 text-blue-400",
        PROSPECT: "bg-amber-500/10 text-amber-400",
        CLIENTE: "bg-emerald-500/10 text-emerald-400",
        INATIVO: "bg-slate-500/10 text-slate-400",
    };

    return classes[status];
}

export function ClientesPage() {
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [paginacao, setPaginacao] = useState<Paginacao>({
        pagina: 1,
        limite: 10,
        total: 0,
        totalPaginas: 1,
    });

    const [busca, setBusca] = useState("");
    const [buscaAplicada, setBuscaAplicada] = useState("");
    const [status, setStatus] = useState("");
    const [origem, setOrigem] = useState("");

    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [excluindoId, setExcluindoId] = useState<string | null>(
        null,
    );

    const [modalAberto, setModalAberto] = useState(false);
    const [clienteEditando, setClienteEditando] =
        useState<Cliente | null>(null);

    const [menuAbertoId, setMenuAbertoId] = useState<
        string | null
    >(null);

    const [formulario, setFormulario] =
        useState<FormularioCliente>(formularioInicial);

    const carregarClientes = useCallback(async () => {
        try {
            setCarregando(true);

            const parametros = new URLSearchParams({
                pagina: String(paginacao.pagina),
                limite: String(paginacao.limite),
            });

            if (buscaAplicada) {
                parametros.set("busca", buscaAplicada);
            }

            if (status) {
                parametros.set("status", status);
            }

            if (origem) {
                parametros.set("origem", origem);
            }

            const response = await fetch(
                `/api/clientes?${parametros.toString()}`,
                {
                    cache: "no-store",
                },
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.erro ??
                    "Não foi possível carregar os clientes.",
                );
            }

            const resposta = data as RespostaClientes;

            setClientes(resposta.clientes);
            setPaginacao(resposta.paginacao);
        } catch (erro) {
            toast.error(
                erro instanceof Error
                    ? erro.message
                    : "Não foi possível carregar os clientes.",
            );
        } finally {
            setCarregando(false);
        }
    }, [
        buscaAplicada,
        origem,
        paginacao.limite,
        paginacao.pagina,
        status,
    ]);

    useEffect(() => {
        carregarClientes();
    }, [carregarClientes]);

    function abrirCadastro() {
        setClienteEditando(null);
        setFormulario(formularioInicial);
        setModalAberto(true);
    }

    function abrirEdicao(cliente: Cliente) {
        setClienteEditando(cliente);

        setFormulario({
            nome: cliente.nome,
            email: cliente.email ?? "",
            telefone: cliente.telefone ?? "",
            empresa: cliente.empresa ?? "",
            cargo: cliente.cargo ?? "",
            documento: cliente.documento ?? "",
            status: cliente.status,
            origem: cliente.origem,
            observacoes: cliente.observacoes ?? "",
        });

        setMenuAbertoId(null);
        setModalAberto(true);
    }

    function fecharModal() {
        if (salvando) {
            return;
        }

        setModalAberto(false);
        setClienteEditando(null);
        setFormulario(formularioInicial);
    }

    function atualizarCampo<
        Campo extends keyof FormularioCliente,
    >(campo: Campo, valor: FormularioCliente[Campo]) {
        setFormulario((estadoAtual) => ({
            ...estadoAtual,
            [campo]: valor,
        }));
    }

    async function salvarCliente(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        if (formulario.nome.trim().length < 2) {
            toast.error(
                "Informe um nome com pelo menos 2 caracteres.",
            );
            return;
        }

        try {
            setSalvando(true);

            const url = clienteEditando
                ? `/api/clientes/${clienteEditando.id}`
                : "/api/clientes";

            const response = await fetch(url, {
                method: clienteEditando ? "PATCH" : "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formulario),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.erro ??
                    "Não foi possível salvar o cliente.",
                );
            }

            toast.success(data.mensagem);

            setModalAberto(false);
            setClienteEditando(null);
            setFormulario(formularioInicial);

            if (!clienteEditando) {
                setPaginacao((estadoAtual) => ({
                    ...estadoAtual,
                    pagina: 1,
                }));
            }

            await carregarClientes();
        } catch (erro) {
            toast.error(
                erro instanceof Error
                    ? erro.message
                    : "Não foi possível salvar o cliente.",
            );
        } finally {
            setSalvando(false);
        }
    }

    async function excluirCliente(cliente: Cliente) {
        const confirmou = window.confirm(
            `Deseja realmente excluir o cliente "${cliente.nome}"?`,
        );

        if (!confirmou) {
            return;
        }

        try {
            setExcluindoId(cliente.id);
            setMenuAbertoId(null);

            const response = await fetch(
                `/api/clientes/${cliente.id}`,
                {
                    method: "DELETE",
                },
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.erro ??
                    "Não foi possível excluir o cliente.",
                );
            }

            toast.success(data.mensagem);

            if (
                clientes.length === 1 &&
                paginacao.pagina > 1
            ) {
                setPaginacao((estadoAtual) => ({
                    ...estadoAtual,
                    pagina: estadoAtual.pagina - 1,
                }));

                return;
            }

            await carregarClientes();
        } catch (erro) {
            toast.error(
                erro instanceof Error
                    ? erro.message
                    : "Não foi possível excluir o cliente.",
            );
        } finally {
            setExcluindoId(null);
        }
    }

    function pesquisar(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setPaginacao((estadoAtual) => ({
            ...estadoAtual,
            pagina: 1,
        }));

        setBuscaAplicada(busca.trim());
    }

    function alterarFiltroStatus(valor: string) {
        setStatus(valor);

        setPaginacao((estadoAtual) => ({
            ...estadoAtual,
            pagina: 1,
        }));
    }

    function alterarFiltroOrigem(valor: string) {
        setOrigem(valor);

        setPaginacao((estadoAtual) => ({
            ...estadoAtual,
            pagina: 1,
        }));
    }

    return (
        <>
            <div>
                <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
                    <div>
                        <p className="text-sm font-medium text-blue-400">
                            Gestão de contatos
                        </p>

                        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">
                            Clientes
                        </h1>

                        <p className="mt-2 text-slate-400">
                            Gerencie leads, prospects e clientes da
                            sua operação comercial.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={abrirCadastro}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                        <Plus className="h-5 w-5" />
                        Novo cliente
                    </button>
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                    <ResumoCard
                        titulo="Total de registros"
                        valor={paginacao.total}
                        icon={UsersRound}
                    />

                    <ResumoCard
                        titulo="Exibidos na página"
                        valor={clientes.length}
                        icon={UserRound}
                    />

                    <ResumoCard
                        titulo="Página atual"
                        valor={`${paginacao.pagina} de ${paginacao.totalPaginas}`}
                        icon={Building2}
                    />
                </div>

                <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/60">
                    <div className="flex flex-col gap-4 border-b border-slate-800 p-5 xl:flex-row xl:items-center xl:justify-between">
                        <form
                            onSubmit={pesquisar}
                            className="flex w-full max-w-xl items-center rounded-xl border border-slate-800 bg-slate-950 px-3"
                        >
                            <Search className="h-5 w-5 text-slate-500" />

                            <input
                                type="text"
                                value={busca}
                                onChange={(event) =>
                                    setBusca(event.target.value)
                                }
                                placeholder="Buscar por nome, empresa, e-mail ou telefone..."
                                className="h-11 w-full bg-transparent px-3 text-sm text-white outline-none placeholder:text-slate-600"
                            />

                            <button
                                type="submit"
                                className="rounded-lg bg-slate-800 px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-slate-700 hover:text-white"
                            >
                                Buscar
                            </button>
                        </form>

                        <div className="flex flex-col gap-3 sm:flex-row">
                            <select
                                value={status}
                                onChange={(event) =>
                                    alterarFiltroStatus(
                                        event.target.value,
                                    )
                                }
                                className="h-11 rounded-xl border border-slate-800 bg-slate-950 px-4 text-sm text-slate-300 outline-none"
                            >
                                <option value="">
                                    Todos os status
                                </option>

                                {statusOpcoes.map((opcao) => (
                                    <option
                                        key={opcao.valor}
                                        value={opcao.valor}
                                    >
                                        {opcao.nome}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={origem}
                                onChange={(event) =>
                                    alterarFiltroOrigem(
                                        event.target.value,
                                    )
                                }
                                className="h-11 rounded-xl border border-slate-800 bg-slate-950 px-4 text-sm text-slate-300 outline-none"
                            >
                                <option value="">
                                    Todas as origens
                                </option>

                                {origemOpcoes.map((opcao) => (
                                    <option
                                        key={opcao.valor}
                                        value={opcao.valor}
                                    >
                                        {opcao.nome}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {carregando ? (
                        <div className="flex min-h-80 items-center justify-center">
                            <div className="flex flex-col items-center gap-3 text-slate-500">
                                <LoaderCircle className="h-8 w-8 animate-spin" />

                                <p className="text-sm">
                                    Carregando clientes...
                                </p>
                            </div>
                        </div>
                    ) : clientes.length === 0 ? (
                        <div className="flex min-h-80 flex-col items-center justify-center px-6 text-center">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
                                <UsersRound className="h-7 w-7" />
                            </div>

                            <h2 className="mt-5 text-lg font-semibold text-white">
                                Nenhum cliente encontrado
                            </h2>

                            <p className="mt-2 max-w-md text-sm text-slate-500">
                                Cadastre o primeiro cliente ou altere os
                                filtros utilizados.
                            </p>

                            <button
                                type="button"
                                onClick={abrirCadastro}
                                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                            >
                                <Plus className="h-4 w-4" />
                                Cadastrar cliente
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-5xl">
                                    <thead>
                                        <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wider text-slate-500">
                                            <th className="px-6 py-4 font-medium">
                                                Cliente
                                            </th>

                                            <th className="px-6 py-4 font-medium">
                                                Contato
                                            </th>

                                            <th className="px-6 py-4 font-medium">
                                                Status
                                            </th>

                                            <th className="px-6 py-4 font-medium">
                                                Origem
                                            </th>

                                            <th className="px-6 py-4 font-medium">
                                                Responsável
                                            </th>

                                            <th className="px-6 py-4 font-medium">
                                                Cadastro
                                            </th>

                                            <th className="px-6 py-4 text-right font-medium">
                                                Ações
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {clientes.map((cliente) => (
                                            <tr
                                                key={cliente.id}
                                                className="border-b border-slate-800/70 transition last:border-0 hover:bg-slate-800/20"
                                            >
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 min-w-10 items-center justify-center rounded-xl bg-blue-500/10 text-sm font-semibold text-blue-400">
                                                            {cliente.nome
                                                                .slice(
                                                                    0,
                                                                    2,
                                                                )
                                                                .toUpperCase()}
                                                        </div>

                                                        <div>
                                                            <p className="font-medium text-white">
                                                                {
                                                                    cliente.nome
                                                                }
                                                            </p>

                                                            <p className="mt-1 text-xs text-slate-500">
                                                                {cliente.empresa ??
                                                                    "Sem empresa"}
                                                                {cliente.cargo
                                                                    ? ` · ${cliente.cargo}`
                                                                    : ""}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-5">
                                                    <div className="space-y-1.5">
                                                        <p className="flex items-center gap-2 text-sm text-slate-300">
                                                            <Mail className="h-3.5 w-3.5 text-slate-500" />

                                                            {cliente.email ??
                                                                "Sem e-mail"}
                                                        </p>

                                                        <p className="flex items-center gap-2 text-sm text-slate-500">
                                                            <Phone className="h-3.5 w-3.5" />

                                                            {cliente.telefone ??
                                                                "Sem telefone"}
                                                        </p>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-5">
                                                    <span
                                                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${classeStatus(
                                                            cliente.status,
                                                        )}`}
                                                    >
                                                        {obterNomeStatus(
                                                            cliente.status,
                                                        )}
                                                    </span>
                                                </td>

                                                <td className="px-6 py-5 text-sm text-slate-400">
                                                    {obterNomeOrigem(
                                                        cliente.origem,
                                                    )}
                                                </td>

                                                <td className="px-6 py-5 text-sm text-slate-400">
                                                    {cliente.responsavel
                                                        ?.nome ??
                                                        "Sem responsável"}
                                                </td>

                                                <td className="px-6 py-5 text-sm text-slate-500">
                                                    {formatarData(
                                                        cliente.criadoEm,
                                                    )}
                                                </td>

                                                <td className="relative px-6 py-5 text-right">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setMenuAbertoId(
                                                                (
                                                                    estadoAtual,
                                                                ) =>
                                                                    estadoAtual ===
                                                                        cliente.id
                                                                        ? null
                                                                        : cliente.id,
                                                            )
                                                        }
                                                        className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-800 hover:text-white"
                                                    >
                                                        <MoreHorizontal className="h-5 w-5" />
                                                    </button>

                                                    {menuAbertoId ===
                                                        cliente.id && (
                                                            <div className="absolute right-6 top-14 z-20 w-44 overflow-hidden rounded-xl border border-slate-800 bg-slate-950 p-1.5 text-left shadow-2xl">
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        abrirEdicao(
                                                                            cliente,
                                                                        )
                                                                    }
                                                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-slate-300 transition hover:bg-slate-900 hover:text-white"
                                                                >
                                                                    <Edit3 className="h-4 w-4" />
                                                                    Editar
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    disabled={
                                                                        excluindoId ===
                                                                        cliente.id
                                                                    }
                                                                    onClick={() =>
                                                                        excluirCliente(
                                                                            cliente,
                                                                        )
                                                                    }
                                                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
                                                                >
                                                                    {excluindoId ===
                                                                        cliente.id ? (
                                                                        <LoaderCircle className="h-4 w-4 animate-spin" />
                                                                    ) : (
                                                                        <Trash2 className="h-4 w-4" />
                                                                    )}

                                                                    Excluir
                                                                </button>
                                                            </div>
                                                        )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex flex-col gap-4 border-t border-slate-800 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-sm text-slate-500">
                                    Mostrando {clientes.length} de{" "}
                                    {paginacao.total} registros
                                </p>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        disabled={
                                            paginacao.pagina <= 1
                                        }
                                        onClick={() =>
                                            setPaginacao(
                                                (estadoAtual) => ({
                                                    ...estadoAtual,
                                                    pagina:
                                                        estadoAtual.pagina -
                                                        1,
                                                }),
                                            )
                                        }
                                        className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-800 px-3 text-sm text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        Anterior
                                    </button>

                                    <span className="px-2 text-sm text-slate-400">
                                        {paginacao.pagina} /{" "}
                                        {paginacao.totalPaginas}
                                    </span>

                                    <button
                                        type="button"
                                        disabled={
                                            paginacao.pagina >=
                                            paginacao.totalPaginas
                                        }
                                        onClick={() =>
                                            setPaginacao(
                                                (estadoAtual) => ({
                                                    ...estadoAtual,
                                                    pagina:
                                                        estadoAtual.pagina +
                                                        1,
                                                }),
                                            )
                                        }
                                        className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-800 px-3 text-sm text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        Próxima
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </section>
            </div>

            {modalAberto && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <button
                        type="button"
                        aria-label="Fechar formulário"
                        onClick={fecharModal}
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                    />

                    <div className="relative z-10 max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl">
                        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-800 bg-slate-950 px-6 py-5">
                            <div>
                                <h2 className="text-xl font-semibold text-white">
                                    {clienteEditando
                                        ? "Editar cliente"
                                        : "Novo cliente"}
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Preencha as informações do
                                    contato.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={fecharModal}
                                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-800 hover:text-white"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={salvarCliente}>
                            <div className="grid gap-5 p-6 md:grid-cols-2">
                                <CampoFormulario
                                    label="Nome"
                                    obrigatorio
                                    value={formulario.nome}
                                    onChange={(valor) =>
                                        atualizarCampo(
                                            "nome",
                                            valor,
                                        )
                                    }
                                    placeholder="Nome do cliente"
                                />

                                <CampoFormulario
                                    label="E-mail"
                                    type="email"
                                    value={formulario.email}
                                    onChange={(valor) =>
                                        atualizarCampo(
                                            "email",
                                            valor,
                                        )
                                    }
                                    placeholder="cliente@email.com"
                                />

                                <CampoFormulario
                                    label="Telefone"
                                    value={formulario.telefone}
                                    onChange={(valor) =>
                                        atualizarCampo(
                                            "telefone",
                                            valor,
                                        )
                                    }
                                    placeholder="(35) 99999-9999"
                                />

                                <CampoFormulario
                                    label="Documento"
                                    value={formulario.documento}
                                    onChange={(valor) =>
                                        atualizarCampo(
                                            "documento",
                                            valor,
                                        )
                                    }
                                    placeholder="CPF ou CNPJ"
                                />

                                <CampoFormulario
                                    label="Empresa"
                                    value={formulario.empresa}
                                    onChange={(valor) =>
                                        atualizarCampo(
                                            "empresa",
                                            valor,
                                        )
                                    }
                                    placeholder="Nome da empresa"
                                />

                                <CampoFormulario
                                    label="Cargo"
                                    value={formulario.cargo}
                                    onChange={(valor) =>
                                        atualizarCampo(
                                            "cargo",
                                            valor,
                                        )
                                    }
                                    placeholder="Cargo do contato"
                                />

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-300">
                                        Status
                                    </label>

                                    <select
                                        value={formulario.status}
                                        onChange={(event) =>
                                            atualizarCampo(
                                                "status",
                                                event.target
                                                    .value as StatusCliente,
                                            )
                                        }
                                        className="h-11 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 text-sm text-white outline-none transition focus:border-blue-500"
                                    >
                                        {statusOpcoes.map(
                                            (opcao) => (
                                                <option
                                                    key={
                                                        opcao.valor
                                                    }
                                                    value={
                                                        opcao.valor
                                                    }
                                                >
                                                    {opcao.nome}
                                                </option>
                                            ),
                                        )}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-300">
                                        Origem
                                    </label>

                                    <select
                                        value={formulario.origem}
                                        onChange={(event) =>
                                            atualizarCampo(
                                                "origem",
                                                event.target
                                                    .value as OrigemLead,
                                            )
                                        }
                                        className="h-11 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 text-sm text-white outline-none transition focus:border-blue-500"
                                    >
                                        {origemOpcoes.map(
                                            (opcao) => (
                                                <option
                                                    key={
                                                        opcao.valor
                                                    }
                                                    value={
                                                        opcao.valor
                                                    }
                                                >
                                                    {opcao.nome}
                                                </option>
                                            ),
                                        )}
                                    </select>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="mb-2 block text-sm font-medium text-slate-300">
                                        Observações
                                    </label>

                                    <textarea
                                        value={
                                            formulario.observacoes
                                        }
                                        onChange={(event) =>
                                            atualizarCampo(
                                                "observacoes",
                                                event.target.value,
                                            )
                                        }
                                        rows={5}
                                        placeholder="Informações adicionais sobre o cliente..."
                                        className="w-full resize-none rounded-xl border border-slate-800 bg-slate-900 px-3 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 border-t border-slate-800 px-6 py-5">
                                <button
                                    type="button"
                                    onClick={fecharModal}
                                    disabled={salvando}
                                    className="h-11 rounded-xl border border-slate-800 px-5 text-sm font-medium text-slate-300 transition hover:bg-slate-900 hover:text-white disabled:opacity-50"
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    disabled={salvando}
                                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {salvando && (
                                        <LoaderCircle className="h-4 w-4 animate-spin" />
                                    )}

                                    {salvando
                                        ? "Salvando..."
                                        : clienteEditando
                                            ? "Salvar alterações"
                                            : "Cadastrar cliente"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

type ResumoCardProps = {
    titulo: string;
    valor: string | number;
    icon: typeof UsersRound;
};

function ResumoCard({
    titulo,
    valor,
    icon: Icon,
}: ResumoCardProps) {
    return (
        <article className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-slate-500">
                        {titulo}
                    </p>

                    <p className="mt-2 text-2xl font-bold text-white">
                        {valor}
                    </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                    <Icon className="h-5 w-5" />
                </div>
            </div>
        </article>
    );
}

type CampoFormularioProps = {
    label: string;
    value: string;
    onChange: (valor: string) => void;
    placeholder?: string;
    type?: "text" | "email";
    obrigatorio?: boolean;
};

function CampoFormulario({
    label,
    value,
    onChange,
    placeholder,
    type = "text",
    obrigatorio = false,
}: CampoFormularioProps) {
    return (
        <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
                {label}

                {obrigatorio && (
                    <span className="ml-1 text-red-400">*</span>
                )}
            </label>

            <input
                type={type}
                value={value}
                required={obrigatorio}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                className="h-11 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
            />
        </div>
    );
}