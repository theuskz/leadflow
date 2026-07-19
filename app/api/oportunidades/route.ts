import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { StatusOportunidade } from "@/generated/prisma/client";

import { verificarToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function obterUsuarioAutenticado() {
    const cookieStore = await cookies();
    const token = cookieStore.get("leadflow_token")?.value;

    if (!token) {
        return null;
    }

    return verificarToken(token);
}

export async function GET(request: NextRequest) {
    try {
        const usuario = await obterUsuarioAutenticado();

        if (!usuario) {
            return NextResponse.json(
                { erro: "Usuário não autenticado." },
                { status: 401 },
            );
        }

        const busca =
            request.nextUrl.searchParams.get("busca")?.trim() ?? "";

        const podeVisualizarTodos =
            usuario.nivel === "ADMIN" ||
            usuario.nivel === "GERENTE";

        const oportunidades = await prisma.oportunidade.findMany({
            where: {
                ...(podeVisualizarTodos
                    ? {}
                    : {
                        responsavelId: usuario.usuarioId,
                    }),

                ...(busca
                    ? {
                        OR: [
                            {
                                titulo: {
                                    contains: busca,
                                    mode: "insensitive",
                                },
                            },
                            {
                                cliente: {
                                    nome: {
                                        contains: busca,
                                        mode: "insensitive",
                                    },
                                },
                            },
                        ],
                    }
                    : {}),
            },

            select: {
                id: true,
                titulo: true,
                descricao: true,
                valor: true,
                status: true,
                probabilidade: true,
                previsaoFechamento: true,
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

            orderBy: {
                atualizadoEm: "desc",
            },
        });

        return NextResponse.json({
            oportunidades: oportunidades.map((oportunidade) => ({
                ...oportunidade,
                valor: Number(oportunidade.valor),
            })),
        });
    } catch (erro) {
        console.error("Erro ao listar oportunidades:", erro);

        return NextResponse.json(
            { erro: "Não foi possível carregar as oportunidades." },
            { status: 500 },
        );
    }
}

export async function POST(request: Request) {
    try {
        const usuario = await obterUsuarioAutenticado();

        if (!usuario) {
            return NextResponse.json(
                { erro: "Usuário não autenticado." },
                { status: 401 },
            );
        }

        const body = await request.json();

        const titulo =
            typeof body.titulo === "string" ? body.titulo.trim() : "";

        const clienteId =
            typeof body.clienteId === "string"
                ? body.clienteId.trim()
                : "";

        const descricao =
            typeof body.descricao === "string"
                ? body.descricao.trim()
                : null;

        const valor = Number(body.valor ?? 0);
        const probabilidade = Number(body.probabilidade ?? 0);

        const status = Object.values(StatusOportunidade).includes(
            body.status,
        )
            ? body.status
            : StatusOportunidade.NOVO_LEAD;

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

        const oportunidade = await prisma.oportunidade.create({
            data: {
                titulo,
                descricao: descricao || null,
                valor,
                status,
                probabilidade,

                previsaoFechamento: body.previsaoFechamento
                    ? new Date(body.previsaoFechamento)
                    : null,

                clienteId,
                responsavelId:
                    cliente.responsavelId ?? usuario.usuarioId,
            },

            include: {
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
            },
        });

        return NextResponse.json(
            {
                mensagem: "Oportunidade criada com sucesso.",
                oportunidade: {
                    ...oportunidade,
                    valor: Number(oportunidade.valor),
                },
            },
            {
                status: 201,
            },
        );
    } catch (erro) {
        console.error("Erro ao criar oportunidade:", erro);

        return NextResponse.json(
            {
                erro: "Não foi possível criar a oportunidade.",
            },
            {
                status: 500,
            },
        );
    }
}