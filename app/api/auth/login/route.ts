import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

import { criarToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const loginSchema = z.object({
    email: z
        .string()
        .trim()
        .email("Informe um e-mail válido."),

    senha: z
        .string()
        .min(6, "A senha precisa ter pelo menos 6 caracteres."),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const resultado = loginSchema.safeParse(body);

        if (!resultado.success) {
            return NextResponse.json(
                {
                    erro: resultado.error.issues[0]?.message
                        ?? "Dados inválidos.",
                },
                {
                    status: 400,
                },
            );
        }

        const email = resultado.data.email.toLowerCase();
        const senha = resultado.data.senha;

        const usuario = await prisma.usuario.findUnique({
            where: {
                email,
            },
        });

        if (!usuario || !usuario.ativo) {
            return NextResponse.json(
                {
                    erro: "E-mail ou senha inválidos.",
                },
                {
                    status: 401,
                },
            );
        }

        const senhaCorreta = await bcrypt.compare(
            senha,
            usuario.senha,
        );

        if (!senhaCorreta) {
            return NextResponse.json(
                {
                    erro: "E-mail ou senha inválidos.",
                },
                {
                    status: 401,
                },
            );
        }

        const token = await criarToken({
            usuarioId: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            nivel: usuario.nivel,
        });

        const response = NextResponse.json({
            mensagem: "Login realizado com sucesso.",
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                nivel: usuario.nivel,
            },
        });

        response.cookies.set("leadflow_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7,
        });

        return response;
    } catch (erro) {
        console.error("Erro no login:", erro);

        return NextResponse.json(
            {
                erro: "Não foi possível realizar o login.",
            },
            {
                status: 500,
            },
        );
    }
}