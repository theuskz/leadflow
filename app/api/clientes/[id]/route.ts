import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { verificarToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { clienteSchema } from "@/lib/validacoes/cliente";

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

function textoOuNull(valor?: string | null) {
    const texto = valor?.trim();

    return texto ? texto : null;
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

        const podeVisualizarTodos =
            usuario.nivel === "ADMIN" ||
            usuario.nivel === "GERENTE";

        const cliente = await prisma.cliente.findFirst({
            where: {
                id,

                ...(podeVisualizarTodos
                    ? {}
                    : {
                        responsavelId: usuario.usuarioId,
                    }),
            },
            include: {
                responsavel: {
                    select: {
                        id: true,
                        nome: true,
                        email: true,
                    },
                },

                oportunidades: {
                    orderBy: {
                        criadoEm: "desc",
                    },
                },

                tarefas: {
                    orderBy: {
                        criadoEm: "desc",
                    },
                },

                interacoes: {
                    orderBy: {
                        criadoEm: "desc",
                    },
                },
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

        return NextResponse.json({
            cliente,
        });
    } catch (erro) {
        console.error("Erro ao buscar cliente:", erro);

        return NextResponse.json(
            {
                erro: "Não foi possível carregar o cliente.",
            },
            {
                status: 500,
            },
        );
    }
}

export async function PATCH(
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

        const podeGerenciarTodos =
            usuario.nivel === "ADMIN" ||
            usuario.nivel === "GERENTE";

        const clienteExistente =
            await prisma.cliente.findFirst({
                where: {
                    id,

                    ...(podeGerenciarTodos
                        ? {}
                        : {
                            responsavelId: usuario.usuarioId,
                        }),
                },
            });

        if (!clienteExistente) {
            return NextResponse.json(
                {
                    erro: "Cliente não encontrado.",
                },
                {
                    status: 404,
                },
            );
        }

        const body = await request.json();

        const resultado = clienteSchema.partial().safeParse(body);

        if (!resultado.success) {
            return NextResponse.json(
                {
                    erro:
                        resultado.error.issues[0]?.message ??
                        "Dados inválidos.",
                    campos: resultado.error.flatten().fieldErrors,
                },
                {
                    status: 400,
                },
            );
        }

        const dados = resultado.data;

        let responsavelId = clienteExistente.responsavelId;

        if (
            dados.responsavelId !== undefined &&
            podeGerenciarTodos
        ) {
            if (dados.responsavelId === null) {
                responsavelId = null;
            } else {
                const responsavelExiste =
                    await prisma.usuario.findUnique({
                        where: {
                            id: dados.responsavelId,
                        },
                        select: {
                            id: true,
                            ativo: true,
                        },
                    });

                if (
                    !responsavelExiste ||
                    !responsavelExiste.ativo
                ) {
                    return NextResponse.json(
                        {
                            erro: "O responsável informado não existe ou está inativo.",
                        },
                        {
                            status: 400,
                        },
                    );
                }

                responsavelId = responsavelExiste.id;
            }
        }

        const cliente = await prisma.cliente.update({
            where: {
                id,
            },
            data: {
                ...(dados.nome !== undefined && {
                    nome: dados.nome.trim(),
                }),

                ...(dados.email !== undefined && {
                    email: textoOuNull(
                        dados.email,
                    )?.toLowerCase(),
                }),

                ...(dados.telefone !== undefined && {
                    telefone: textoOuNull(dados.telefone),
                }),

                ...(dados.empresa !== undefined && {
                    empresa: textoOuNull(dados.empresa),
                }),

                ...(dados.cargo !== undefined && {
                    cargo: textoOuNull(dados.cargo),
                }),

                ...(dados.documento !== undefined && {
                    documento: textoOuNull(dados.documento),
                }),

                ...(dados.status !== undefined && {
                    status: dados.status,
                }),

                ...(dados.origem !== undefined && {
                    origem: dados.origem,
                }),

                ...(dados.observacoes !== undefined && {
                    observacoes: textoOuNull(
                        dados.observacoes,
                    ),
                }),

                responsavelId,
            },
            include: {
                responsavel: {
                    select: {
                        id: true,
                        nome: true,
                        email: true,
                    },
                },
            },
        });

        return NextResponse.json({
            mensagem: "Cliente atualizado com sucesso.",
            cliente,
        });
    } catch (erro) {
        console.error("Erro ao atualizar cliente:", erro);

        return NextResponse.json(
            {
                erro: "Não foi possível atualizar o cliente.",
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

        const podeGerenciarTodos =
            usuario.nivel === "ADMIN" ||
            usuario.nivel === "GERENTE";

        const cliente = await prisma.cliente.findFirst({
            where: {
                id,

                ...(podeGerenciarTodos
                    ? {}
                    : {
                        responsavelId: usuario.usuarioId,
                    }),
            },
            select: {
                id: true,
                nome: true,
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

        await prisma.cliente.delete({
            where: {
                id,
            },
        });

        return NextResponse.json({
            mensagem: `Cliente ${cliente.nome} excluído com sucesso.`,
        });
    } catch (erro) {
        console.error("Erro ao excluir cliente:", erro);

        return NextResponse.json(
            {
                erro: "Não foi possível excluir o cliente. Verifique se existem registros relacionados.",
            },
            {
                status: 500,
            },
        );
    }
}