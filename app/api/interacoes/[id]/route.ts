import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { verificarToken } from "@/lib/auth";

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

function podeGerenciarTudo(nivel: string) {
    return (
        nivel === "ADMIN" ||
        nivel === "GERENTE"
    );
}

export async function GET(
    request: Request,
    contexto: ContextoRota,
) {}

export async function PUT(
    request: Request,
    contexto: ContextoRota,
) {}

export async function DELETE(
    request: Request,
    contexto: ContextoRota,
) {}