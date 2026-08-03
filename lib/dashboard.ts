import type {
    DashboardResponse,
} from "@/types/dashboard";

async function obterMensagemErro(
    resposta: Response,
): Promise<string> {
    const dados = await resposta
        .json()
        .catch(() => null);

    return (
        dados?.erro ??
        "Não foi possível carregar o dashboard."
    );
}

export async function buscarDashboard(): Promise<DashboardResponse> {
    const resposta = await fetch(
        "/api/dashboard",
        {
            method: "GET",
            credentials: "include",
            cache: "no-store",
        },
    );

    if (!resposta.ok) {
        throw new Error(
            await obterMensagemErro(resposta),
        );
    }

    return resposta.json();
}