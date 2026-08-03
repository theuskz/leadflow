import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import {
    NivelUsuario,
} from "@/generated/prisma/client";

import { verificarToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function obterUsuarioAutenticado() {
    const cookieStore = await cookies();

    const token =
        cookieStore.get("leadflow_token")?.value;

    if (!token) {
        return null;
    }

    return verificarToken(token);
}

function podeGerenciarUsuarios(
    nivel: string,
) {
    return nivel === "ADMIN";
}

export async function GET() {
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

        if (
            !podeGerenciarUsuarios(
                usuario.nivel,
            )
        ) {
            return NextResponse.json(
                {
                    erro: "Você não possui permissão para visualizar a equipe.",
                },
                {
                    status: 403,
                },
            );
        }

        const usuarios =
            await prisma.usuario.findMany({
                select: {
                    id: true,
                    nome: true,
                    email: true,
                    nivel: true,
                    ativo: true,
                    criadoEm: true,
                    atualizadoEm: true,

                    _count: {
                        select: {
                            clientes: true,
                            oportunidades: true,
                            tarefas: true,
                            interacoes: true,
                        },
                    },
                },

                orderBy: [
                    {
                        ativo: "desc",
                    },
                    {
                        nome: "asc",
                    },
                ],
            });

        return NextResponse.json({
            usuarios,
        });
    } catch (erro) {
        console.error(
            "Erro ao listar usuários:",
            erro,
        );

        return NextResponse.json(
            {
                erro: "Não foi possível carregar os usuários.",
            },
            {
                status: 500,
            },
        );
    }
}

export async function POST(
    request: Request,
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

        if (
            !podeGerenciarUsuarios(
                usuario.nivel,
            )
        ) {
            return NextResponse.json(
                {
                    erro: "Apenas administradores podem criar usuários.",
                },
                {
                    status: 403,
                },
            );
        }

        const body =
            await request.json();

        const nome =
            typeof body.nome === "string"
                ? body.nome.trim()
                : "";

        const email =
            typeof body.email === "string"
                ? body.email
                      .trim()
                      .toLowerCase()
                : "";

        const senha =
            typeof body.senha === "string"
                ? body.senha
                : "";

        const nivel =
            Object.values(
                NivelUsuario,
            ).includes(body.nivel)
                ? body.nivel
                : NivelUsuario.VENDEDOR;

        if (nome.length < 2) {
            return NextResponse.json(
                {
                    erro: "O nome deve ter pelo menos 2 caracteres.",
                },
                {
                    status: 400,
                },
            );
        }

        if (
            !email ||
            !email.includes("@")
        ) {
            return NextResponse.json(
                {
                    erro: "Informe um e-mail válido.",
                },
                {
                    status: 400,
                },
            );
        }

        if (senha.length < 6) {
            return NextResponse.json(
                {
                    erro: "A senha deve ter pelo menos 6 caracteres.",
                },
                {
                    status: 400,
                },
            );
        }

        const usuarioExistente =
            await prisma.usuario.findUnique({
                where: {
                    email,
                },

                select: {
                    id: true,
                },
            });

        if (usuarioExistente) {
            return NextResponse.json(
                {
                    erro: "Já existe um usuário com este e-mail.",
                },
                {
                    status: 409,
                },
            );
        }

        const senhaCriptografada =
            await bcrypt.hash(
                senha,
                12,
            );

        const novoUsuario =
            await prisma.usuario.create({
                data: {
                    nome,
                    email,
                    senha:
                        senhaCriptografada,
                    nivel,
                    ativo: true,
                },

                select: {
                    id: true,
                    nome: true,
                    email: true,
                    nivel: true,
                    ativo: true,
                    criadoEm: true,

                    _count: {
                        select: {
                            clientes: true,
                            oportunidades: true,
                            tarefas: true,
                            interacoes: true,
                        },
                    },
                },
            });

        return NextResponse.json(
            {
                mensagem:
                    "Usuário criado com sucesso.",

                usuario:
                    novoUsuario,
            },
            {
                status: 201,
            },
        );
    } catch (erro) {
        console.error(
            "Erro ao criar usuário:",
            erro,
        );

        return NextResponse.json(
            {
                erro: "Não foi possível criar o usuário.",
            },
            {
                status: 500,
            },
        );
    }
}