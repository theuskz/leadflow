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

const probabilidadesPorStatus: Record<
    StatusOportunidade,
    number
> = {
    NOVO_LEAD: 10,
    PRIMEIRO_CONTATO: 20,
    QUALIFICADO: 40,
    PROPOSTA_ENVIADA: 60,
    NEGOCIACAO: 80,
    FECHADO: 100,
    PERDIDO: 0,
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

function textoOuNull(valor: unknown) {
    if (typeof valor !== "string") {
        return null;
    }

    const texto = valor.trim();

    return texto || null;
}

export async function PATCH(
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

        if (
            !Object.values(
                StatusOportunidade,
            ).includes(body.status)
        ) {
            return NextResponse.json(
                {
                    erro: "Status da oportunidade inválido.",
                },
                {
                    status: 400,
                },
            );
        }

        const novoStatus =
            body.status as StatusOportunidade;

        const motivoPerda =
            textoOuNull(body.motivoPerda);

        if (
            novoStatus ===
            StatusOportunidade.PERDIDO &&
            !motivoPerda
        ) {
            return NextResponse.json(
                {
                    erro: "Informe o motivo da perda da oportunidade.",
                },
                {
                    status: 400,
                },
            );
        }

        const podeGerenciarTodos =
            usuario.nivel === "ADMIN" ||
            usuario.nivel === "GERENTE";

        const oportunidade =
            await prisma.oportunidade.findFirst({
                where: {
                    id,

                    ...(podeGerenciarTodos
                        ? {}
                        : {
                            responsavelId:
                                usuario.usuarioId,
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
                    status: novoStatus,

                    probabilidade:
                        probabilidadesPorStatus[
                        novoStatus
                        ],

                    motivoPerda:
                        novoStatus ===
                            StatusOportunidade.PERDIDO
                            ? motivoPerda
                            : null,
                },

                select: {
                    id: true,
                    status: true,
                    probabilidade: true,
                    motivoPerda: true,
                    atualizadoEm: true,
                },
            });

        return NextResponse.json({
            mensagem:
                novoStatus ===
                    StatusOportunidade.PERDIDO
                    ? "Oportunidade marcada como perdida."
                    : "Etapa atualizada com sucesso.",

            oportunidade:
                oportunidadeAtualizada,
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