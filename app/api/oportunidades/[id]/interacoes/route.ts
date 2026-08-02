import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { TipoInteracao } from "@/generated/prisma/client";

import { verificarToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

function podeGerenciarTodos(nivel: string) {
    return (
        nivel === "ADMIN" ||
        nivel === "GERENTE"
    );
}

export async function POST(
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
            typeof body.descricao === "string"
                ? body.descricao.trim()
                : "";

        if (
            !Object.values(
                TipoInteracao,
            ).includes(body.tipo)
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
                    erro: "A descrição deve possuir pelo menos 3 caracteres.",
                },
                {
                    status: 400,
                },
            );
        }

        const oportunidade =
            await prisma.oportunidade.findFirst({
                where: {
                    id,

                    ...(podeGerenciarTodos(
                        usuario.nivel,
                    )
                        ? {}
                        : {
                              responsavelId:
                                  usuario.usuarioId,
                          }),
                },

                select: {
                    id: true,
                    clienteId: true,
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

        let dataInteracao = new Date();

        if (body.data) {
            dataInteracao = new Date(body.data);

            if (
                Number.isNaN(
                    dataInteracao.getTime(),
                )
            ) {
                return NextResponse.json(
                    {
                        erro: "A data da interação é inválida.",
                    },
                    {
                        status: 400,
                    },
                );
            }
        }

        const interacao =
            await prisma.interacao.create({
                data: {
                    tipo: body.tipo,
                    descricao,
                    data: dataInteracao,

                    clienteId:
                        oportunidade.clienteId,

                    oportunidadeId:
                        oportunidade.id,

                    usuarioId:
                        usuario.usuarioId,
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

        return NextResponse.json(
            {
                mensagem:
                    "Interação registrada com sucesso.",
                interacao,
            },
            {
                status: 201,
            },
        );
    } catch (erro) {
        console.error(
            "Erro ao registrar interação:",
            erro,
        );

        return NextResponse.json(
            {
                erro: "Não foi possível registrar a interação.",
            },
            {
                status: 500,
            },
        );
    }
}