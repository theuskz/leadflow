-- CreateEnum
CREATE TYPE "NivelUsuario" AS ENUM ('ADMIN', 'GERENTE', 'VENDEDOR');

-- CreateEnum
CREATE TYPE "StatusCliente" AS ENUM ('LEAD', 'PROSPECT', 'CLIENTE', 'INATIVO');

-- CreateEnum
CREATE TYPE "OrigemLead" AS ENUM ('SITE', 'INSTAGRAM', 'FACEBOOK', 'WHATSAPP', 'INDICACAO', 'EVENTO', 'LIGACAO', 'OUTRO');

-- CreateEnum
CREATE TYPE "StatusOportunidade" AS ENUM ('NOVO_LEAD', 'PRIMEIRO_CONTATO', 'QUALIFICADO', 'PROPOSTA_ENVIADA', 'NEGOCIACAO', 'FECHADO', 'PERDIDO');

-- CreateEnum
CREATE TYPE "PrioridadeTarefa" AS ENUM ('BAIXA', 'MEDIA', 'ALTA', 'URGENTE');

-- CreateEnum
CREATE TYPE "StatusTarefa" AS ENUM ('PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "TipoInteracao" AS ENUM ('LIGACAO', 'EMAIL', 'WHATSAPP', 'REUNIAO', 'VISITA', 'ANOTACAO');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "nivel" "NivelUsuario" NOT NULL DEFAULT 'VENDEDOR',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT,
    "telefone" TEXT,
    "empresa" TEXT,
    "cargo" TEXT,
    "documento" TEXT,
    "status" "StatusCliente" NOT NULL DEFAULT 'LEAD',
    "origem" "OrigemLead" NOT NULL DEFAULT 'OUTRO',
    "observacoes" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    "responsavelId" TEXT,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "oportunidades" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "valor" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "status" "StatusOportunidade" NOT NULL DEFAULT 'NOVO_LEAD',
    "probabilidade" INTEGER NOT NULL DEFAULT 0,
    "previsaoFechamento" TIMESTAMP(3),
    "motivoPerda" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    "clienteId" TEXT NOT NULL,
    "responsavelId" TEXT,

    CONSTRAINT "oportunidades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tarefas" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "prioridade" "PrioridadeTarefa" NOT NULL DEFAULT 'MEDIA',
    "status" "StatusTarefa" NOT NULL DEFAULT 'PENDENTE',
    "dataLimite" TIMESTAMP(3),
    "concluidaEm" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    "clienteId" TEXT,
    "oportunidadeId" TEXT,
    "responsavelId" TEXT,

    CONSTRAINT "tarefas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interacoes" (
    "id" TEXT NOT NULL,
    "tipo" "TipoInteracao" NOT NULL,
    "descricao" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clienteId" TEXT NOT NULL,
    "oportunidadeId" TEXT,
    "usuarioId" TEXT,

    CONSTRAINT "interacoes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "clientes_responsavelId_idx" ON "clientes"("responsavelId");

-- CreateIndex
CREATE INDEX "clientes_status_idx" ON "clientes"("status");

-- CreateIndex
CREATE INDEX "clientes_origem_idx" ON "clientes"("origem");

-- CreateIndex
CREATE INDEX "oportunidades_clienteId_idx" ON "oportunidades"("clienteId");

-- CreateIndex
CREATE INDEX "oportunidades_responsavelId_idx" ON "oportunidades"("responsavelId");

-- CreateIndex
CREATE INDEX "oportunidades_status_idx" ON "oportunidades"("status");

-- CreateIndex
CREATE INDEX "tarefas_clienteId_idx" ON "tarefas"("clienteId");

-- CreateIndex
CREATE INDEX "tarefas_oportunidadeId_idx" ON "tarefas"("oportunidadeId");

-- CreateIndex
CREATE INDEX "tarefas_responsavelId_idx" ON "tarefas"("responsavelId");

-- CreateIndex
CREATE INDEX "tarefas_status_idx" ON "tarefas"("status");

-- CreateIndex
CREATE INDEX "tarefas_dataLimite_idx" ON "tarefas"("dataLimite");

-- CreateIndex
CREATE INDEX "interacoes_clienteId_idx" ON "interacoes"("clienteId");

-- CreateIndex
CREATE INDEX "interacoes_oportunidadeId_idx" ON "interacoes"("oportunidadeId");

-- CreateIndex
CREATE INDEX "interacoes_usuarioId_idx" ON "interacoes"("usuarioId");

-- CreateIndex
CREATE INDEX "interacoes_data_idx" ON "interacoes"("data");

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "oportunidades" ADD CONSTRAINT "oportunidades_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "oportunidades" ADD CONSTRAINT "oportunidades_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tarefas" ADD CONSTRAINT "tarefas_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tarefas" ADD CONSTRAINT "tarefas_oportunidadeId_fkey" FOREIGN KEY ("oportunidadeId") REFERENCES "oportunidades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tarefas" ADD CONSTRAINT "tarefas_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interacoes" ADD CONSTRAINT "interacoes_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interacoes" ADD CONSTRAINT "interacoes_oportunidadeId_fkey" FOREIGN KEY ("oportunidadeId") REFERENCES "oportunidades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interacoes" ADD CONSTRAINT "interacoes_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
