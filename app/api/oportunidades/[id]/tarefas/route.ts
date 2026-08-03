import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
    PrioridadeTarefa,
    StatusTarefa,
} from "@/generated/prisma/client";

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

function podeGerenciarTodos(nivel: string) {
    return nivel === "ADMIN" || nivel === "GERENTE";
}

function textoOuNull(valor: unknown) {
    if (typeof valor !== "string") {
        return null;
    }

    const texto = valor.trim();

    return texto || null;
}

export async function POST(
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

        const prioridade = Object.values(
            PrioridadeTarefa,
        ).includes(body.prioridade)
            ? body.prioridade
            : PrioridadeTarefa.MEDIA;

        const status = Object.values(
            StatusTarefa,
        ).includes(body.status)
            ? body.status
            : StatusTarefa.PENDENTE;

        let dataLimite: Date | null = null;

        if (body.dataLimite) {
            dataLimite = new Date(body.dataLimite);

            if (Number.isNaN(dataLimite.getTime())) {
                return NextResponse.json(
                    {
                        erro: "A data limite é inválida.",
                    },
                    {
                        status: 400,
                    },
                );
            }
        }

        const oportunidade =
            await prisma.oportunidade.findFirst({
                where: {
                    id,

                    ...(podeGerenciarTodos(usuario.nivel)
                        ? {}
                        : {
                              responsavelId:
                                  usuario.usuarioId,
                          }),
                },

                select: {
                    id: true,
                    clienteId: true,
                    responsavelId: true,
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

        let responsavelId =
            oportunidade.responsavelId ??
            usuario.usuarioId;

        if (
            podeGerenciarTodos(usuario.nivel) &&
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

        const tarefa = await prisma.tarefa.create({
            data: {
                titulo,
                descricao: textoOuNull(body.descricao),
                prioridade,
                status,
                dataLimite,
                clienteId: oportunidade.clienteId,
                oportunidadeId: oportunidade.id,
                responsavelId,
            },

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
        });

        return NextResponse.json(
            {
                mensagem: "Tarefa criada com sucesso.",
                tarefa,
            },
            {
                status: 201,
            },
        );
    } catch (erro) {
        console.error("Erro ao criar tarefa:", erro);

        return NextResponse.json(
            {
                erro: "Não foi possível criar a tarefa.",
            },
            {
                status: 500,
            },
        );
    }
}