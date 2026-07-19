import { NextResponse } from "next/server";

export async function POST() {
    const response = NextResponse.json({
        mensagem: "Logout realizado com sucesso.",
    });

    response.cookies.set("leadflow_token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
    });

    return response;
}