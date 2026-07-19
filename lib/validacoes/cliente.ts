import { OrigemLead, StatusCliente } from "@/generated/prisma/client";
import { z } from "zod";

export const clienteSchema = z.object({
    nome: z
        .string()
        .trim()
        .min(2, "O nome precisa ter pelo menos 2 caracteres.")
        .max(120, "O nome pode ter no máximo 120 caracteres."),

    email: z
        .string()
        .trim()
        .email("Informe um e-mail válido.")
        .optional()
        .or(z.literal("")),

    telefone: z
        .string()
        .trim()
        .max(30, "O telefone pode ter no máximo 30 caracteres.")
        .optional()
        .or(z.literal("")),

    empresa: z
        .string()
        .trim()
        .max(120, "A empresa pode ter no máximo 120 caracteres.")
        .optional()
        .or(z.literal("")),

    cargo: z
        .string()
        .trim()
        .max(100, "O cargo pode ter no máximo 100 caracteres.")
        .optional()
        .or(z.literal("")),

    documento: z
        .string()
        .trim()
        .max(30, "O documento pode ter no máximo 30 caracteres.")
        .optional()
        .or(z.literal("")),

    status: z.nativeEnum(StatusCliente).default(StatusCliente.LEAD),

    origem: z.nativeEnum(OrigemLead).default(OrigemLead.OUTRO),

    observacoes: z
        .string()
        .trim()
        .max(2000, "As observações podem ter no máximo 2000 caracteres.")
        .optional()
        .or(z.literal("")),

    responsavelId: z
        .string()
        .trim()
        .optional()
        .nullable(),
});

export type ClienteInput = z.infer<typeof clienteSchema>;