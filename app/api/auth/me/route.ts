import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { verificarToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function obterUsuarioAutenticado() {
    const cookieStore = await cookies();
    const token =
        cookieStore.get("leadflow_token")?.value;

    if (!token) {
        return null;
    }

    const payload =
        await verificarToken(token);

    if (!payload) {
        return null;
    }

    return payload;
}

export async function GET() {
    try {
        const payload =
            await obterUsuarioAutenticado();

        if (!payload) {
            return NextResponse.json(
                {
                    erro: "Usuário não autenticado.",
                },
                {
                    status: 401,
                },
            );
        }

        const usuario =
            await prisma.usuario.findUnique({
                where: {
                    id: payload.usuarioId,
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

        if (
            !usuario ||
            !usuario.ativo
        ) {
            return NextResponse.json(
                {
                    erro: "Usuário não encontrado.",
                },
                {
                    status: 401,
                },
            );
        }

        const vendasFechadas =
            await prisma.oportunidade.count({
                where: {
                    responsavelId:
                        usuario.id,

                    status: "FECHADO",
                },
            });

        const valorFechado =
            await prisma.oportunidade.aggregate({
                where: {
                    responsavelId:
                        usuario.id,

                    status: "FECHADO",
                },

                _sum: {
                    valor: true,
                },
            });

        return NextResponse.json({
            usuario: {
                ...usuario,

                estatisticas: {
                    clientes:
                        usuario._count
                            .clientes,

                    oportunidades:
                        usuario._count
                            .oportunidades,

                    tarefas:
                        usuario._count
                            .tarefas,

                    interacoes:
                        usuario._count
                            .interacoes,

                    vendasFechadas,

                    valorFechado:
                        Number(
                            valorFechado
                                ._sum.valor ??
                                0,
                        ),
                },
            },
        });
    } catch (erro) {
        console.error(
            "Erro ao buscar usuário autenticado:",
            erro,
        );

        return NextResponse.json(
            {
                erro: "Não foi possível verificar a sessão.",
            },
            {
                status: 500,
            },
        );
    }
}

export async function PATCH(
    request: Request,
) {
    try {
        const payload =
            await obterUsuarioAutenticado();

        if (!payload) {
            return NextResponse.json(
                {
                    erro: "Usuário não autenticado.",
                },
                {
                    status: 401,
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

        const emailEmUso =
            await prisma.usuario.findFirst({
                where: {
                    email,

                    id: {
                        not:
                            payload.usuarioId,
                    },
                },

                select: {
                    id: true,
                },
            });

        if (emailEmUso) {
            return NextResponse.json(
                {
                    erro: "Este e-mail já está sendo utilizado.",
                },
                {
                    status: 409,
                },
            );
        }

        const usuarioAtualizado =
            await prisma.usuario.update({
                where: {
                    id:
                        payload.usuarioId,
                },

                data: {
                    nome,
                    email,
                },

                select: {
                    id: true,
                    nome: true,
                    email: true,
                    nivel: true,
                    criadoEm: true,
                },
            });

        return NextResponse.json({
            mensagem:
                "Perfil atualizado com sucesso.",

            usuario:
                usuarioAtualizado,
        });
    } catch (erro) {
        console.error(
            "Erro ao atualizar perfil:",
            erro,
        );

        return NextResponse.json(
            {
                erro: "Não foi possível atualizar o perfil.",
            },
            {
                status: 500,
            },
        );
    }
}

export async function PUT(
    request: Request,
) {
    try {
        const payload =
            await obterUsuarioAutenticado();

        if (!payload) {
            return NextResponse.json(
                {
                    erro: "Usuário não autenticado.",
                },
                {
                    status: 401,
                },
            );
        }

        const body =
            await request.json();

        const senhaAtual =
            typeof body.senhaAtual ===
            "string"
                ? body.senhaAtual
                : "";

        const novaSenha =
            typeof body.novaSenha ===
            "string"
                ? body.novaSenha
                : "";

        const confirmarSenha =
            typeof body.confirmarSenha ===
            "string"
                ? body.confirmarSenha
                : "";

        if (!senhaAtual) {
            return NextResponse.json(
                {
                    erro: "Informe sua senha atual.",
                },
                {
                    status: 400,
                },
            );
        }

        if (
            novaSenha.length < 6
        ) {
            return NextResponse.json(
                {
                    erro: "A nova senha deve ter pelo menos 6 caracteres.",
                },
                {
                    status: 400,
                },
            );
        }

        if (
            novaSenha !==
            confirmarSenha
        ) {
            return NextResponse.json(
                {
                    erro: "A confirmação da senha não corresponde.",
                },
                {
                    status: 400,
                },
            );
        }

        const usuario =
            await prisma.usuario.findUnique({
                where: {
                    id:
                        payload.usuarioId,
                },

                select: {
                    id: true,
                    senha: true,
                },
            });

        if (!usuario) {
            return NextResponse.json(
                {
                    erro: "Usuário não encontrado.",
                },
                {
                    status: 404,
                },
            );
        }

        const senhaCorreta =
            await bcrypt.compare(
                senhaAtual,
                usuario.senha,
            );

        if (!senhaCorreta) {
            return NextResponse.json(
                {
                    erro: "A senha atual está incorreta.",
                },
                {
                    status: 400,
                },
            );
        }

        const novaSenhaCriptografada =
            await bcrypt.hash(
                novaSenha,
                12,
            );

        await prisma.usuario.update({
            where: {
                id:
                    payload.usuarioId,
            },

            data: {
                senha:
                    novaSenhaCriptografada,
            },
        });

        return NextResponse.json({
            mensagem:
                "Senha atualizada com sucesso.",
        });
    } catch (erro) {
        console.error(
            "Erro ao atualizar senha:",
            erro,
        );

        return NextResponse.json(
            {
                erro: "Não foi possível atualizar a senha.",
            },
            {
                status: 500,
            },
        );
    }
}