import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { TipoInteracao } from "@/generated/prisma/client";

import { prisma } from "@/lib/prisma";
import { verificarToken } from "@/lib/auth";

type ContextoRota = {
    params: Promise<{
        id: string;
    }>;
};

async function obterUsuarioAutenticado() {
    const cookieStore = await cookies();

    const token =
        cookieStore.get("leadflow_token")?.value;

    if (!token) {
        return null;
    }

    return verificarToken(token);
}

function podeGerenciarTudo(nivel: string) {
    return (
        nivel === "ADMIN" ||
        nivel === "GERENTE"
    );
}

function obterDescricao(valor: unknown) {
    if (typeof valor !== "string") {
        return "";
    }

    return valor.trim();
}

function obterData(valor: unknown) {
    if (!valor) {
        return new Date();
    }

    const data = new Date(String(valor));

    if (Number.isNaN(data.getTime())) {
        return null;
    }

    return data;
}

export async function GET(
    _request: Request,
    contexto: ContextoRota,
) {
    try {
        const usuario =
            await obterUsuarioAutenticado();

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

        const interacao =
            await prisma.interacao.findFirst({
                where: {
                    id,

                    oportunidade: podeGerenciarTudo(
                        usuario.nivel,
                    )
                        ? {
                            isNot: null,
                        }
                        : {
                            is: {
                                responsavelId:
                                    usuario.usuarioId,
                            },
                        },
                },

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

                    cliente: {
                        select: {
                            id: true,
                            nome: true,
                            empresa: true,
                        },
                    },

                    oportunidade: {
                        select: {
                            id: true,
                            titulo: true,
                        },
                    },
                },
            });

        if (!interacao) {
            return NextResponse.json(
                {
                    erro: "Interação não encontrada.",
                },
                {
                    status: 404,
                },
            );
        }

        return NextResponse.json({
            interacao,
        });
    } catch (erro) {
        console.error(
            "Erro ao buscar interação:",
            erro,
        );

        return NextResponse.json(
            {
                erro: "Não foi possível carregar a interação.",
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
        const usuario =
            await obterUsuarioAutenticado();

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

        const descricao =
            obterDescricao(body.descricao);

        if (
            !Object.values(TipoInteracao).includes(
                body.tipo,
            )
        ) {
            return NextResponse.json(
                {
                    erro: "Tipo de interação inválido.",
                },
                {
                    status: 400,
                },
            );
        }

        if (descricao.length < 3) {
            return NextResponse.json(
                {
                    erro: "A descrição deve ter pelo menos 3 caracteres.",
                },
                {
                    status: 400,
                },
            );
        }

        const data = obterData(body.data);

        if (!data) {
            return NextResponse.json(
                {
                    erro: "A data da interação é inválida.",
                },
                {
                    status: 400,
                },
            );
        }

        const interacaoExistente =
            await prisma.interacao.findFirst({
                where: {
                    id,

                    oportunidade: podeGerenciarTudo(
                        usuario.nivel,
                    )
                        ? {
                            isNot: null,
                        }
                        : {
                            is: {
                                responsavelId:
                                    usuario.usuarioId,
                            },
                        },
                },

                select: {
                    id: true,
                },
            });

        if (!interacaoExistente) {
            return NextResponse.json(
                {
                    erro: "Interação não encontrada.",
                },
                {
                    status: 404,
                },
            );
        }

        const interacaoAtualizada =
            await prisma.interacao.update({
                where: {
                    id,
                },

                data: {
                    tipo: body.tipo,
                    descricao,
                    data,
                },

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
            });

        return NextResponse.json({
            mensagem:
                "Interação atualizada com sucesso.",
            interacao: interacaoAtualizada,
        });
    } catch (erro) {
        console.error(
            "Erro ao atualizar interação:",
            erro,
        );

        return NextResponse.json(
            {
                erro: "Não foi possível atualizar a interação.",
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
        const usuario =
            await obterUsuarioAutenticado();

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

        const interacao =
            await prisma.interacao.findFirst({
                where: {
                    id,

                    oportunidade: podeGerenciarTudo(
                        usuario.nivel,
                    )
                        ? {
                            isNot: null,
                        }
                        : {
                            is: {
                                responsavelId:
                                    usuario.usuarioId,
                            },
                        },
                },

                select: {
                    id: true,
                },
            });

        if (!interacao) {
            return NextResponse.json(
                {
                    erro: "Interação não encontrada.",
                },
                {
                    status: 404,
                },
            );
        }

        await prisma.interacao.delete({
            where: {
                id,
            },
        });

        return NextResponse.json({
            mensagem:
                "Interação excluída com sucesso.",
        });
    } catch (erro) {
        console.error(
            "Erro ao excluir interação:",
            erro,
        );

        return NextResponse.json(
            {
                erro: "Não foi possível excluir a interação.",
            },
            {
                status: 500,
            },
        );
    }
}