import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";

import type {
    RelatoriosResponse,
} from "@/types/relatorio";

function formatarMoeda(valor: number) {
    return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
}

function formatarPercentual(valor: number) {
    return `${valor.toFixed(1)}%`;
}

function obterDataArquivo() {
    return new Intl.DateTimeFormat("pt-BR")
        .format(new Date())
        .replaceAll("/", "-");
}

export function exportarRelatoriosExcel(
    dados: RelatoriosResponse,
) {
    const resumo = [
        {
            Indicador: "Faturamento fechado",
            Valor: dados.resumo.faturamentoFechado,
        },
        {
            Indicador: "Pipeline aberto",
            Valor: dados.resumo.valorPipeline,
        },
        {
            Indicador: "Taxa de conversão",
            Valor: dados.resumo.taxaConversao / 100,
        },
        {
            Indicador: "Ticket médio",
            Valor: dados.resumo.ticketMedio,
        },
        {
            Indicador: "Oportunidades abertas",
            Valor: dados.resumo.oportunidadesAbertas,
        },
        {
            Indicador: "Oportunidades fechadas",
            Valor: dados.resumo.oportunidadesFechadas,
        },
        {
            Indicador: "Oportunidades perdidas",
            Valor: dados.resumo.oportunidadesPerdidas,
        },
    ];

    const pipeline =
        dados.oportunidadesPorStatus.map(
            (item) => ({
                Etapa: item.nome,
                Quantidade: item.quantidade,
                Valor: item.valor,
            }),
        );

    const vendas = dados.vendasPorMes.map(
        (item) => ({
            Mês: item.mes,
            Quantidade: item.quantidade,
            Faturamento: item.valor,
        }),
    );

    const ranking = dados.ranking.map(
        (item, indice) => ({
            Posição: indice + 1,
            Vendedor: item.nome,
            Vendas: item.quantidade,
            Faturamento: item.valor,
        }),
    );

    const origens = dados.origens.map(
        (item) => ({
            Origem: item.nome,
            Quantidade: item.quantidade,
        }),
    );

    const workbook =
        XLSX.utils.book_new();

    const planilhaResumo =
        XLSX.utils.json_to_sheet(resumo);

    const planilhaPipeline =
        XLSX.utils.json_to_sheet(pipeline);

    const planilhaVendas =
        XLSX.utils.json_to_sheet(vendas);

    const planilhaRanking =
        XLSX.utils.json_to_sheet(ranking);

    const planilhaOrigens =
        XLSX.utils.json_to_sheet(origens);

    planilhaResumo["!cols"] = [
        { wch: 28 },
        { wch: 20 },
    ];

    planilhaPipeline["!cols"] = [
        { wch: 24 },
        { wch: 14 },
        { wch: 18 },
    ];

    planilhaVendas["!cols"] = [
        { wch: 16 },
        { wch: 14 },
        { wch: 20 },
    ];

    planilhaRanking["!cols"] = [
        { wch: 10 },
        { wch: 28 },
        { wch: 12 },
        { wch: 20 },
    ];

    planilhaOrigens["!cols"] = [
        { wch: 20 },
        { wch: 14 },
    ];

    XLSX.utils.book_append_sheet(
        workbook,
        planilhaResumo,
        "Resumo",
    );

    XLSX.utils.book_append_sheet(
        workbook,
        planilhaPipeline,
        "Pipeline",
    );

    XLSX.utils.book_append_sheet(
        workbook,
        planilhaVendas,
        "Vendas por mês",
    );

    XLSX.utils.book_append_sheet(
        workbook,
        planilhaRanking,
        "Ranking",
    );

    XLSX.utils.book_append_sheet(
        workbook,
        planilhaOrigens,
        "Origens",
    );

    XLSX.writeFile(
        workbook,
        `relatorios-leadflow-${obterDataArquivo()}.xlsx`,
    );
}

export function exportarRelatoriosPDF(
    dados: RelatoriosResponse,
) {
    const documento = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
    });

    const larguraPagina =
        documento.internal.pageSize.getWidth();

    documento.setFillColor(2, 6, 23);
    documento.rect(
        0,
        0,
        larguraPagina,
        35,
        "F",
    );

    documento.setTextColor(255, 255, 255);
    documento.setFontSize(20);
    documento.text(
        "LeadFlow CRM",
        14,
        15,
    );

    documento.setFontSize(11);
    documento.setTextColor(148, 163, 184);
    documento.text(
        "Relatório de desempenho comercial",
        14,
        23,
    );

    documento.setFontSize(9);
    documento.text(
        `Gerado em ${new Intl.DateTimeFormat(
            "pt-BR",
            {
                dateStyle: "medium",
                timeStyle: "short",
            },
        ).format(new Date())}`,
        14,
        30,
    );

    documento.setTextColor(15, 23, 42);
    documento.setFontSize(15);
    documento.text(
        "Resumo geral",
        14,
        46,
    );

    autoTable(documento, {
        startY: 51,

        head: [
            [
                "Indicador",
                "Valor",
            ],
        ],

        body: [
            [
                "Faturamento fechado",
                formatarMoeda(
                    dados.resumo
                        .faturamentoFechado,
                ),
            ],
            [
                "Pipeline aberto",
                formatarMoeda(
                    dados.resumo
                        .valorPipeline,
                ),
            ],
            [
                "Taxa de conversão",
                formatarPercentual(
                    dados.resumo
                        .taxaConversao,
                ),
            ],
            [
                "Ticket médio",
                formatarMoeda(
                    dados.resumo
                        .ticketMedio,
                ),
            ],
            [
                "Oportunidades abertas",
                String(
                    dados.resumo
                        .oportunidadesAbertas,
                ),
            ],
            [
                "Oportunidades fechadas",
                String(
                    dados.resumo
                        .oportunidadesFechadas,
                ),
            ],
            [
                "Oportunidades perdidas",
                String(
                    dados.resumo
                        .oportunidadesPerdidas,
                ),
            ],
        ],

        theme: "grid",

        headStyles: {
            fillColor: [8, 145, 178],
            textColor: [255, 255, 255],
        },

        styles: {
            fontSize: 9,
            cellPadding: 3,
        },
    });

    const finalResumo =
        documento.lastAutoTable.finalY;

    documento.setFontSize(15);
    documento.text(
        "Pipeline por etapa",
        14,
        finalResumo + 12,
    );

    autoTable(documento, {
        startY: finalResumo + 17,

        head: [
            [
                "Etapa",
                "Quantidade",
                "Valor",
            ],
        ],

        body:
            dados.oportunidadesPorStatus.map(
                (item) => [
                    item.nome,
                    String(item.quantidade),
                    formatarMoeda(
                        item.valor,
                    ),
                ],
            ),

        theme: "striped",

        headStyles: {
            fillColor: [37, 99, 235],
        },

        styles: {
            fontSize: 9,
        },
    });

    documento.addPage();

    documento.setFontSize(15);
    documento.text(
        "Vendas por mês",
        14,
        18,
    );

    autoTable(documento, {
        startY: 23,

        head: [
            [
                "Mês",
                "Vendas",
                "Faturamento",
            ],
        ],

        body: dados.vendasPorMes.map(
            (item) => [
                item.mes,
                String(item.quantidade),
                formatarMoeda(
                    item.valor,
                ),
            ],
        ),

        headStyles: {
            fillColor: [8, 145, 178],
        },
    });

    const finalVendas =
        documento.lastAutoTable.finalY;

    documento.setFontSize(15);
    documento.text(
        "Ranking de vendedores",
        14,
        finalVendas + 12,
    );

    autoTable(documento, {
        startY: finalVendas + 17,

        head: [
            [
                "Posição",
                "Vendedor",
                "Vendas",
                "Faturamento",
            ],
        ],

        body: dados.ranking.map(
            (item, indice) => [
                String(indice + 1),
                item.nome,
                String(item.quantidade),
                formatarMoeda(
                    item.valor,
                ),
            ],
        ),

        headStyles: {
            fillColor: [124, 58, 237],
        },
    });

    const finalRanking =
        documento.lastAutoTable.finalY;

    documento.setFontSize(15);
    documento.text(
        "Origem dos leads",
        14,
        finalRanking + 12,
    );

    autoTable(documento, {
        startY: finalRanking + 17,

        head: [
            [
                "Origem",
                "Quantidade",
            ],
        ],

        body: dados.origens.map(
            (item) => [
                item.nome,
                String(item.quantidade),
            ],
        ),

        headStyles: {
            fillColor: [245, 158, 11],
        },
    });

    documento.save(
        `relatorios-leadflow-${obterDataArquivo()}.pdf`,
    );
}