import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
    OrigemLead,
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

const nomesOrigem: Record<OrigemLead, string> = {
    SITE: "Site",
    INSTAGRAM: "Instagram",
    FACEBOOK: "Facebook",
    WHATSAPP: "WhatsApp",
    INDICACAO: "Indicação",
    EVENTO: "Evento",
    LIGACAO: "Ligação",
    OUTRO: "Outro",
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

        const filtroResponsavel =
            podeVisualizarTodos(usuario.nivel)
                ? {}
                : {
                    responsavelId:
                        usuario.usuarioId,
                };

        const inicioPeriodo =
            obterInicioMeses(6);

        const [
            oportunidades,
            clientesPorOrigem,
            usuarios,
        ] = await Promise.all([
            prisma.oportunidade.findMany({
                where: filtroResponsavel,

                select: {
                    id: true,
                    valor: true,
                    status: true,
                    atualizadoEm: true,
                    criadoEm: true,

                    responsavel: {
                        select: {
                            id: true,
                            nome: true,
                        },
                    },
                },
            }),

            prisma.cliente.groupBy({
                by: ["origem"],

                where:
                    podeVisualizarTodos(
                        usuario.nivel,
                    )
                        ? {}
                        : {
                            responsavelId:
                                usuario.usuarioId,
                        },

                _count: {
                    _all: true,
                },
            }),

            prisma.usuario.findMany({
                where: {
                    ativo: true,
                },

                select: {
                    id: true,
                    nome: true,
                },

                orderBy: {
                    nome: "asc",
                },
            }),
        ]);

        const oportunidadesFechadas =
            oportunidades.filter(
                (oportunidade) =>
                    oportunidade.status ===
                    StatusOportunidade.FECHADO,
            );

        const oportunidadesPerdidas =
            oportunidades.filter(
                (oportunidade) =>
                    oportunidade.status ===
                    StatusOportunidade.PERDIDO,
            );

        const oportunidadesAbertas =
            oportunidades.filter(
                (oportunidade) =>
                    oportunidade.status !==
                    StatusOportunidade.FECHADO &&
                    oportunidade.status !==
                    StatusOportunidade.PERDIDO,
            );

        const faturamentoFechado =
            oportunidadesFechadas.reduce(
                (total, oportunidade) =>
                    total +
                    Number(
                        oportunidade.valor,
                    ),
                0,
            );

        const valorPipeline =
            oportunidadesAbertas.reduce(
                (total, oportunidade) =>
                    total +
                    Number(
                        oportunidade.valor,
                    ),
                0,
            );

        const totalFinalizadas =
            oportunidadesFechadas.length +
            oportunidadesPerdidas.length;

        const taxaConversao =
            totalFinalizadas > 0
                ? (oportunidadesFechadas.length /
                    totalFinalizadas) *
                100
                : 0;

        const ticketMedio =
            oportunidadesFechadas.length > 0
                ? faturamentoFechado /
                oportunidadesFechadas.length
                : 0;

        const oportunidadesPorStatus =
            Object.values(
                StatusOportunidade,
            ).map((status) => {
                const itens =
                    oportunidades.filter(
                        (oportunidade) =>
                            oportunidade.status ===
                            status,
                    );

                return {
                    status,
                    nome: nomesStatus[status],
                    quantidade: itens.length,
                    valor: itens.reduce(
                        (total, oportunidade) =>
                            total +
                            Number(
                                oportunidade.valor,
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

        oportunidadesFechadas
            .filter(
                (oportunidade) =>
                    oportunidade.atualizadoEm >=
                    inicioPeriodo,
            )
            .forEach((oportunidade) => {
                const chave = obterChaveMes(
                    oportunidade.atualizadoEm,
                );

                const item =
                    mapaMeses.get(chave);

                if (!item) {
                    return;
                }

                item.valor += Number(
                    oportunidade.valor,
                );

                item.quantidade += 1;
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

        usuarios.forEach((usuarioItem) => {
            rankingMapa.set(
                usuarioItem.id,
                {
                    id: usuarioItem.id,
                    nome: usuarioItem.nome,
                    quantidade: 0,
                    valor: 0,
                },
            );
        });

        oportunidadesFechadas.forEach(
            (oportunidade) => {
                if (
                    !oportunidade.responsavel
                ) {
                    return;
                }

                const item =
                    rankingMapa.get(
                        oportunidade
                            .responsavel.id,
                    );

                if (!item) {
                    return;
                }

                item.quantidade += 1;
                item.valor += Number(
                    oportunidade.valor,
                );
            },
        );

        const ranking = Array.from(
            rankingMapa.values(),
        )
            .filter(
                (item) =>
                    item.quantidade > 0 ||
                    item.valor > 0,
            )
            .sort(
                (a, b) =>
                    b.valor - a.valor,
            );

        const origens = Object.values(
            OrigemLead,
        ).map((origem) => {
            const item =
                clientesPorOrigem.find(
                    (grupo) =>
                        grupo.origem === origem,
                );

            return {
                origem,
                nome: nomesOrigem[origem],
                quantidade:
                    item?._count._all ?? 0,
            };
        });

        return NextResponse.json({
            resumo: {
                faturamentoFechado,
                valorPipeline,
                taxaConversao,
                ticketMedio,
                oportunidadesAbertas:
                    oportunidadesAbertas.length,
                oportunidadesFechadas:
                    oportunidadesFechadas.length,
                oportunidadesPerdidas:
                    oportunidadesPerdidas.length,
            },

            oportunidadesPorStatus,

            vendasPorMes: Array.from(
                mapaMeses.values(),
            ),

            ranking,

            origens,
        });
    } catch (erro) {
        console.error(
            "Erro ao carregar relatórios:",
            erro,
        );

        return NextResponse.json(
            {
                erro: "Não foi possível carregar os relatórios.",
            },
            {
                status: 500,
            },
        );
    }
}