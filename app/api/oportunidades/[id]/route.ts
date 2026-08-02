import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { StatusOportunidade } from "@/generated/prisma/client";

import { verificarToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type ContextoRota = {
    params: Promise<{
        id: string;
    }>;
};

async function obterUsuarioAutenticado() {
    const cookieStore = await cookies();
    const token = cookieStore.get("leadflow_token")?.value;

    if (!token) {
        return null;
    }

    return verificarToken(token);
}

function podeGerenciarTudo(nivel: string) {
    return nivel === "ADMIN" || nivel === "GERENTE";
}

function textoOuNull(valor: unknown) {
    if (typeof valor !== "string") {
        return null;
    }

    const texto = valor.trim();

    return texto || null;
}

export async function GET(
    _request: Request,
    contexto: ContextoRota,
) {
    try {
        const usuario = await obterUsuarioAutenticado();

        if (!usuario) {
            return NextResponse.json(
                {
                    erro: "Usuário não autenticado.",
                },
                {
                    status: 401,
                },
            );
        }

        const { id } = await contexto.params;

        const oportunidade =
            await prisma.oportunidade.findFirst({
                where: {
                    id,

                    ...(podeGerenciarTudo(usuario.nivel)
                        ? {}
                        : {
                              responsavelId: usuario.usuarioId,
                          }),
                },

                select: {
                    id: true,
                    titulo: true,
                    descricao: true,
                    valor: true,
                    status: true,
                    probabilidade: true,
                    previsaoFechamento: true,
                    motivoPerda: true,
                    criadoEm: true,
                    atualizadoEm: true,

                    cliente: {
                        select: {
                            id: true,
                            nome: true,
                            email: true,
                            telefone: true,
                            empresa: true,
                            cargo: true,
                            status: true,
                            origem: true,
                        },
                    },

                    responsavel: {
                        select: {
                            id: true,
                            nome: true,
                            email: true,
                        },
                    },

                    tarefas: {
                        select: {
                            id: true,
                            titulo: true,
                            descricao: true,
                            prioridade: true,
                            status: true,
                            dataLimite: true,
                            concluidaEm: true,
                            criadoEm: true,

                            responsavel: {
                                select: {
                                    id: true,
                                    nome: true,
                                },
                            },
                        },

                        orderBy: [
                            {
                                status: "asc",
                            },
                            {
                                dataLimite: "asc",
                            },
                        ],
                    },

                    interacoes: {
                        select: {
                            id: true,
                            tipo: true,
                            descricao: true,
                            data: true,
                            criadoEm: true,

                            usuario: {
                                select: {
                                    id: true,
                                    nome: true,
                                },
                            },
                        },

                        orderBy: {
                            data: "desc",
                        },
                    },

                    _count: {
                        select: {
                            tarefas: true,
                            interacoes: true,
                        },
                    },
                },
            });

        if (!oportunidade) {
            return NextResponse.json(
                {
                    erro: "Oportunidade não encontrada.",
                },
                {
                    status: 404,
                },
            );
        }

        return NextResponse.json({
            oportunidade: {
                ...oportunidade,
                valor: Number(oportunidade.valor),
            },
        });
    } catch (erro) {
        console.error(
            "Erro ao buscar oportunidade:",
            erro,
        );

        return NextResponse.json(
            {
                erro: "Não foi possível carregar a oportunidade.",
            },
            {
                status: 500,
            },
        );
    }
}

export async function PUT(
    request: Request,
    contexto: ContextoRota,
) {
    try {
        const usuario = await obterUsuarioAutenticado();

        if (!usuario) {
            return NextResponse.json(
                {
                    erro: "Usuário não autenticado.",
                },
                {
                    status: 401,
                },
            );
        }

        const { id } = await contexto.params;
        const body = await request.json();

        const titulo =
            typeof body.titulo === "string"
                ? body.titulo.trim()
                : "";

        const clienteId =
            typeof body.clienteId === "string"
                ? body.clienteId.trim()
                : "";

        const valor = Number(body.valor);
        const probabilidade = Number(body.probabilidade);

        const statusValido =
            Object.values(StatusOportunidade).includes(
                body.status,
            );

        if (titulo.length < 2) {
            return NextResponse.json(
                {
                    erro: "O título deve ter pelo menos 2 caracteres.",
                },
                {
                    status: 400,
                },
            );
        }

        if (!clienteId) {
            return NextResponse.json(
                {
                    erro: "Selecione um cliente.",
                },
                {
                    status: 400,
                },
            );
        }

        if (!Number.isFinite(valor) || valor < 0) {
            return NextResponse.json(
                {
                    erro: "Informe um valor válido.",
                },
                {
                    status: 400,
                },
            );
        }

        if (
            !Number.isInteger(probabilidade) ||
            probabilidade < 0 ||
            probabilidade > 100
        ) {
            return NextResponse.json(
                {
                    erro: "A probabilidade deve estar entre 0 e 100.",
                },
                {
                    status: 400,
                },
            );
        }

        if (!statusValido) {
            return NextResponse.json(
                {
                    erro: "Status da oportunidade inválido.",
                },
                {
                    status: 400,
                },
            );
        }

        const oportunidadeExistente =
            await prisma.oportunidade.findFirst({
                where: {
                    id,

                    ...(podeGerenciarTudo(usuario.nivel)
                        ? {}
                        : {
                              responsavelId: usuario.usuarioId,
                          }),
                },

                select: {
                    id: true,
                    responsavelId: true,
                },
            });

        if (!oportunidadeExistente) {
            return NextResponse.json(
                {
                    erro: "Oportunidade não encontrada.",
                },
                {
                    status: 404,
                },
            );
        }

        const cliente = await prisma.cliente.findUnique({
            where: {
                id: clienteId,
            },

            select: {
                id: true,
                responsavelId: true,
            },
        });

        if (!cliente) {
            return NextResponse.json(
                {
                    erro: "Cliente não encontrado.",
                },
                {
                    status: 404,
                },
            );
        }

        let responsavelId =
            oportunidadeExistente.responsavelId ??
            cliente.responsavelId ??
            usuario.usuarioId;

        if (
            podeGerenciarTudo(usuario.nivel) &&
            typeof body.responsavelId === "string" &&
            body.responsavelId.trim()
        ) {
            const responsavel =
                await prisma.usuario.findUnique({
                    where: {
                        id: body.responsavelId.trim(),
                    },

                    select: {
                        id: true,
                        ativo: true,
                    },
                });

            if (!responsavel || !responsavel.ativo) {
                return NextResponse.json(
                    {
                        erro: "O responsável informado não existe ou está inativo.",
                    },
                    {
                        status: 400,
                    },
                );
            }

            responsavelId = responsavel.id;
        }

        let previsaoFechamento: Date | null = null;

        if (body.previsaoFechamento) {
            previsaoFechamento = new Date(
                body.previsaoFechamento,
            );

            if (
                Number.isNaN(
                    previsaoFechamento.getTime(),
                )
            ) {
                return NextResponse.json(
                    {
                        erro: "A previsão de fechamento é inválida.",
                    },
                    {
                        status: 400,
                    },
                );
            }
        }

        const status =
            body.status as StatusOportunidade;

        const probabilidadeFinal =
            status === StatusOportunidade.FECHADO
                ? 100
                : status === StatusOportunidade.PERDIDO
                  ? 0
                  : probabilidade;

        const oportunidadeAtualizada =
            await prisma.oportunidade.update({
                where: {
                    id,
                },

                data: {
                    titulo,
                    descricao: textoOuNull(body.descricao),
                    valor,
                    status,
                    probabilidade: probabilidadeFinal,
                    previsaoFechamento,
                    motivoPerda:
                        status === StatusOportunidade.PERDIDO
                            ? textoOuNull(body.motivoPerda)
                            : null,
                    clienteId,
                    responsavelId,
                },

                select: {
                    id: true,
                    titulo: true,
                    descricao: true,
                    valor: true,
                    status: true,
                    probabilidade: true,
                    previsaoFechamento: true,
                    motivoPerda: true,
                    criadoEm: true,
                    atualizadoEm: true,

                    cliente: {
                        select: {
                            id: true,
                            nome: true,
                            empresa: true,
                        },
                    },

                    responsavel: {
                        select: {
                            id: true,
                            nome: true,
                            email: true,
                        },
                    },

                    _count: {
                        select: {
                            tarefas: true,
                            interacoes: true,
                        },
                    },
                },
            });

        return NextResponse.json({
            mensagem: "Oportunidade atualizada com sucesso.",

            oportunidade: {
                ...oportunidadeAtualizada,
                valor: Number(
                    oportunidadeAtualizada.valor,
                ),
            },
        });
    } catch (erro) {
        console.error(
            "Erro ao atualizar oportunidade:",
            erro,
        );

        return NextResponse.json(
            {
                erro: "Não foi possível atualizar a oportunidade.",
            },
            {
                status: 500,
            },
        );
    }
}

export async function DELETE(
    _request: Request,
    contexto: ContextoRota,
) {
    try {
        const usuario = await obterUsuarioAutenticado();

        if (!usuario) {
            return NextResponse.json(
                {
                    erro: "Usuário não autenticado.",
                },
                {
                    status: 401,
                },
            );
        }

        const { id } = await contexto.params;

        const oportunidade =
            await prisma.oportunidade.findFirst({
                where: {
                    id,

                    ...(podeGerenciarTudo(usuario.nivel)
                        ? {}
                        : {
                              responsavelId: usuario.usuarioId,
                          }),
                },

                select: {
                    id: true,
                },
            });

        if (!oportunidade) {
            return NextResponse.json(
                {
                    erro: "Oportunidade não encontrada.",
                },
                {
                    status: 404,
                },
            );
        }

        await prisma.oportunidade.delete({
            where: {
                id,
            },
        });

        return NextResponse.json({
            mensagem: "Oportunidade excluída com sucesso.",
        });
    } catch (erro) {
        console.error(
            "Erro ao excluir oportunidade:",
            erro,
        );

        return NextResponse.json(
            {
                erro: "Não foi possível excluir a oportunidade.",
            },
            {
                status: 500,
            },
        );
    }
}