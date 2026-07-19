import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { verificarToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { clienteSchema } from "@/lib/validacoes/cliente";

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

export async function GET(request: NextRequest) {
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

        const parametros = request.nextUrl.searchParams;

        const busca = parametros.get("busca")?.trim() ?? "";
        const status = parametros.get("status")?.trim() ?? "";
        const origem = parametros.get("origem")?.trim() ?? "";

        const paginaInformada = Number(parametros.get("pagina") ?? 1);
        const limiteInformado = Number(parametros.get("limite") ?? 10);

        const pagina =
            Number.isInteger(paginaInformada) && paginaInformada > 0
                ? paginaInformada
                : 1;

        const limite =
            Number.isInteger(limiteInformado) &&
                limiteInformado > 0 &&
                limiteInformado <= 100
                ? limiteInformado
                : 10;

        const podeVisualizarTodos =
            usuario.nivel === "ADMIN" ||
            usuario.nivel === "GERENTE";

        const where = {
            ...(podeVisualizarTodos
                ? {}
                : {
                    responsavelId: usuario.usuarioId,
                }),

            ...(status
                ? {
                    status: status as never,
                }
                : {}),

            ...(origem
                ? {
                    origem: origem as never,
                }
                : {}),

            ...(busca
                ? {
                    OR: [
                        {
                            nome: {
                                contains: busca,
                                mode: "insensitive" as const,
                            },
                        },
                        {
                            email: {
                                contains: busca,
                                mode: "insensitive" as const,
                            },
                        },
                        {
                            telefone: {
                                contains: busca,
                                mode: "insensitive" as const,
                            },
                        },
                        {
                            empresa: {
                                contains: busca,
                                mode: "insensitive" as const,
                            },
                        },
                        {
                            documento: {
                                contains: busca,
                                mode: "insensitive" as const,
                            },
                        },
                    ],
                }
                : {}),
        };

        const [clientes, total] = await Promise.all([
            prisma.cliente.findMany({
                where,
                select: {
                    id: true,
                    nome: true,
                    email: true,
                    telefone: true,
                    empresa: true,
                    cargo: true,
                    documento: true,
                    status: true,
                    origem: true,
                    observacoes: true,
                    criadoEm: true,
                    atualizadoEm: true,

                    responsavel: {
                        select: {
                            id: true,
                            nome: true,
                            email: true,
                        },
                    },

                    _count: {
                        select: {
                            oportunidades: true,
                            tarefas: true,
                            interacoes: true,
                        },
                    },
                },
                orderBy: {
                    criadoEm: "desc",
                },
                skip: (pagina - 1) * limite,
                take: limite,
            }),

            prisma.cliente.count({
                where,
            }),
        ]);

        return NextResponse.json({
            clientes,
            paginacao: {
                pagina,
                limite,
                total,
                totalPaginas: Math.max(
                    1,
                    Math.ceil(total / limite),
                ),
            },
        });
    } catch (erro) {
        console.error("Erro ao listar clientes:", erro);

        return NextResponse.json(
            {
                erro: "Não foi possível carregar os clientes.",
            },
            {
                status: 500,
            },
        );
    }
}

export async function POST(request: Request) {
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

        const body = await request.json();
        const resultado = clienteSchema.safeParse(body);

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

        const podeDefinirResponsavel =
            usuario.nivel === "ADMIN" ||
            usuario.nivel === "GERENTE";

        let responsavelId = usuario.usuarioId;

        if (
            podeDefinirResponsavel &&
            dados.responsavelId
        ) {
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

            if (!responsavelExiste || !responsavelExiste.ativo) {
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

        const cliente = await prisma.cliente.create({
            data: {
                nome: dados.nome.trim(),
                email: textoOuNull(dados.email)?.toLowerCase(),
                telefone: textoOuNull(dados.telefone),
                empresa: textoOuNull(dados.empresa),
                cargo: textoOuNull(dados.cargo),
                documento: textoOuNull(dados.documento),
                status: dados.status,
                origem: dados.origem,
                observacoes: textoOuNull(dados.observacoes),
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

        return NextResponse.json(
            {
                mensagem: "Cliente cadastrado com sucesso.",
                cliente,
            },
            {
                status: 201,
            },
        );
    } catch (erro) {
        console.error("Erro ao cadastrar cliente:", erro);

        return NextResponse.json(
            {
                erro: "Não foi possível cadastrar o cliente.",
            },
            {
                status: 500,
            },
        );
    }
}