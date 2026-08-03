import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
    StatusCliente,
    StatusOportunidade,
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

function podeVisualizarTodos(nivel: string) {
    return (
        nivel === "ADMIN" ||
        nivel === "GERENTE"
    );
}

const nomesStatus: Record<
    StatusOportunidade,
    string
> = {
    NOVO_LEAD: "Novo lead",
    PRIMEIRO_CONTATO: "Primeiro contato",
    QUALIFICADO: "Qualificado",
    PROPOSTA_ENVIADA: "Proposta enviada",
    NEGOCIACAO: "Negociação",
    FECHADO: "Fechado",
    PERDIDO: "Perdido",
};

function obterInicioMeses(
    quantidadeMeses: number,
) {
    const data = new Date();

    data.setDate(1);
    data.setHours(0, 0, 0, 0);

    data.setMonth(
        data.getMonth() -
        (quantidadeMeses - 1),
    );

    return data;
}

function obterChaveMes(data: Date) {
    return `${data.getFullYear()}-${String(
        data.getMonth() + 1,
    ).padStart(2, "0")}`;
}

function obterNomeMes(data: Date) {
    return new Intl.DateTimeFormat(
        "pt-BR",
        {
            month: "short",
            year: "2-digit",
        },
    )
        .format(data)
        .replace(".", "");
}

function diferencaEmDias(data: Date) {
    const agora = new Date();

    const diferenca =
        agora.getTime() -
        data.getTime();

    return Math.floor(
        diferenca /
        (1000 * 60 * 60 * 24),
    );
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

        const podeVerTodos =
            podeVisualizarTodos(
                usuario.nivel,
            );

        const filtroResponsavel =
            podeVerTodos
                ? {}
                : {
                    responsavelId:
                        usuario.usuarioId,
                };

        const inicioPeriodo =
            obterInicioMeses(6);

        const [
            totalClientes,
            oportunidades,
            ultimasOportunidades,
        ] = await Promise.all([
            prisma.cliente.count({
                where: {
                    ...(podeVerTodos
                        ? {}
                        : {
                            responsavelId:
                                usuario.usuarioId,
                        }),

                    status: {
                        not:
                            StatusCliente.INATIVO,
                    },
                },
            }),

            prisma.oportunidade.findMany({
                where: filtroResponsavel,

                select: {
                    id: true,
                    titulo: true,
                    valor: true,
                    status: true,
                    probabilidade: true,
                    atualizadoEm: true,
                    criadoEm: true,

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
                        },
                    },
                },
            }),

            prisma.oportunidade.findMany({
                where: filtroResponsavel,

                take: 5,

                orderBy: {
                    atualizadoEm: "desc",
                },

                select: {
                    id: true,
                    titulo: true,
                    valor: true,
                    status: true,
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
                        },
                    },
                },
            }),
        ]);

        const abertas =
            oportunidades.filter(
                (item) =>
                    item.status !==
                    StatusOportunidade.FECHADO &&
                    item.status !==
                    StatusOportunidade.PERDIDO,
            );

        const fechadas =
            oportunidades.filter(
                (item) =>
                    item.status ===
                    StatusOportunidade.FECHADO,
            );

        const perdidas =
            oportunidades.filter(
                (item) =>
                    item.status ===
                    StatusOportunidade.PERDIDO,
            );

        const valorPipeline =
            abertas.reduce(
                (total, item) =>
                    total +
                    Number(item.valor),
                0,
            );

        const totalFinalizadas =
            fechadas.length +
            perdidas.length;

        const taxaConversao =
            totalFinalizadas > 0
                ? (fechadas.length /
                    totalFinalizadas) *
                100
                : 0;

        const funil =
            Object.values(
                StatusOportunidade,
            ).map((status) => {
                const itens =
                    oportunidades.filter(
                        (item) =>
                            item.status ===
                            status,
                    );

                return {
                    status,
                    nome:
                        nomesStatus[status],
                    quantidade:
                        itens.length,
                    valor: itens.reduce(
                        (total, item) =>
                            total +
                            Number(
                                item.valor,
                            ),
                        0,
                    ),
                };
            });

        const mapaMeses = new Map<
            string,
            {
                mes: string;
                valor: number;
                quantidade: number;
            }
        >();

        for (
            let indice = 0;
            indice < 6;
            indice++
        ) {
            const data = new Date(
                inicioPeriodo,
            );

            data.setMonth(
                inicioPeriodo.getMonth() +
                indice,
            );

            mapaMeses.set(
                obterChaveMes(data),
                {
                    mes: obterNomeMes(data),
                    valor: 0,
                    quantidade: 0,
                },
            );
        }

        fechadas
            .filter(
                (item) =>
                    item.atualizadoEm >=
                    inicioPeriodo,
            )
            .forEach((item) => {
                const chave =
                    obterChaveMes(
                        item.atualizadoEm,
                    );

                const mes =
                    mapaMeses.get(chave);

                if (!mes) {
                    return;
                }

                mes.valor += Number(
                    item.valor,
                );

                mes.quantidade += 1;
            });

        const rankingMapa = new Map<
            string,
            {
                id: string;
                nome: string;
                quantidade: number;
                valor: number;
            }
        >();

        fechadas.forEach((item) => {
            if (!item.responsavel) {
                return;
            }

            const atual =
                rankingMapa.get(
                    item.responsavel.id,
                ) ?? {
                    id:
                        item.responsavel.id,
                    nome:
                        item.responsavel
                            .nome,
                    quantidade: 0,
                    valor: 0,
                };

            atual.quantidade += 1;
            atual.valor += Number(
                item.valor,
            );

            rankingMapa.set(
                item.responsavel.id,
                atual,
            );
        });

        const melhorVendedor =
            Array.from(
                rankingMapa.values(),
            ).sort(
                (a, b) =>
                    b.valor - a.valor,
            )[0] ?? null;

        const oportunidadesAtencao =
            abertas
                .filter(
                    (item) =>
                        diferencaEmDias(
                            item.atualizadoEm,
                        ) >= 7,
                )
                .sort(
                    (a, b) =>
                        a.atualizadoEm.getTime() -
                        b.atualizadoEm.getTime(),
                )
                .slice(0, 5)
                .map((item) => ({
                    id: item.id,
                    titulo: item.titulo,
                    cliente:
                        item.cliente,
                    status: item.status,
                    diasSemAtualizacao:
                        diferencaEmDias(
                            item.atualizadoEm,
                        ),
                    valor: Number(
                        item.valor,
                    ),
                }));

        return NextResponse.json({
            resumo: {
                totalClientes,
                oportunidadesAbertas:
                    abertas.length,
                valorPipeline,
                taxaConversao,
                oportunidadesFechadas:
                    fechadas.length,
                oportunidadesPerdidas:
                    perdidas.length,
            },

            vendasPorMes: Array.from(
                mapaMeses.values(),
            ),

            funil,

            ultimasOportunidades:
                ultimasOportunidades.map(
                    (item) => ({
                        ...item,
                        valor: Number(
                            item.valor,
                        ),
                    }),
                ),

            melhorVendedor,

            oportunidadesAtencao,
        });
    } catch (erro) {
        console.error(
            "Erro ao carregar dashboard:",
            erro,
        );

        return NextResponse.json(
            {
                erro: "Não foi possível carregar o dashboard.",
            },
            {
                status: 500,
            },
        );
    }
}