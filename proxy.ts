import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { verificarToken } from "@/lib/auth";

const rotasPublicas = [
    "/",
    "/login",
];

export async function proxy(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    const rotaPublica = rotasPublicas.some((rota) => {
        return pathname === rota || pathname.startsWith(`${rota}/`);
    });

    const token = request.cookies.get("leadflow_token")?.value;

    const payload = token
        ? await verificarToken(token)
        : null;

    if (!rotaPublica && !payload) {
        const loginUrl = new URL("/login", request.url);

        return NextResponse.redirect(loginUrl);
    }

    if (pathname === "/login" && payload) {
        const dashboardUrl = new URL("/dashboard", request.url);

        return NextResponse.redirect(dashboardUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
    ],
};