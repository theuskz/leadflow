import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { verificarToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("leadflow_token")?.value;

        if (!token) {
            return NextResponse.json(
                {
                    erro: "Usuário não autenticado.",
                },
                {
                    status: 401,
                },
            );
        }

        const payload = await verificarToken(token);

        if (!payload) {
            return NextResponse.json(
                {
                    erro: "Sessão inválida ou expirada.",
                },
                {
                    status: 401,
                },
            );
        }

        const usuario = await prisma.usuario.findUnique({
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
            },
        });

        if (!usuario || !usuario.ativo) {
            return NextResponse.json(
                {
                    erro: "Usuário não encontrado.",
                },
                {
                    status: 401,
                },
            );
        }

        return NextResponse.json({
            usuario,
        });
    } catch (erro) {
        console.error("Erro ao buscar usuário autenticado:", erro);

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