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

export async function PATCH(
    request: Request,
    contexto: ContextoRota,
) {
    try {
        const usuario = await obterUsuarioAutenticado();

        if (!usuario) {
            return NextResponse.json(
                { erro: "Usuário não autenticado." },
                { status: 401 },
            );
        }

        const { id } = await contexto.params;
        const body = await request.json();

        if (!Object.values(StatusOportunidade).includes(body.status)) {
            return NextResponse.json(
                {
                    erro: "Status da oportunidade inválido.",
                },
                {
                    status: 400,
                },
            );
        }

        const podeGerenciarTodos =
            usuario.nivel === "ADMIN" ||
            usuario.nivel === "GERENTE";

        const oportunidade = await prisma.oportunidade.findFirst({
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

        const oportunidadeAtualizada =
            await prisma.oportunidade.update({
                where: {
                    id,
                },

                data: {
                    status: body.status,

                    probabilidade:
                        body.status === StatusOportunidade.FECHADO
                            ? 100
                            : body.status ===
                                StatusOportunidade.PERDIDO
                                ? 0
                                : undefined,
                },

                select: {
                    id: true,
                    status: true,
                    probabilidade: true,
                    atualizadoEm: true,
                },
            });

        return NextResponse.json({
            mensagem: "Etapa atualizada com sucesso.",
            oportunidade: oportunidadeAtualizada,
        });
    } catch (erro) {
        console.error(
            "Erro ao atualizar etapa da oportunidade:",
            erro,
        );

        return NextResponse.json(
            {
                erro: "Não foi possível atualizar a etapa.",
            },
            {
                status: 500,
            },
        );
    }
}