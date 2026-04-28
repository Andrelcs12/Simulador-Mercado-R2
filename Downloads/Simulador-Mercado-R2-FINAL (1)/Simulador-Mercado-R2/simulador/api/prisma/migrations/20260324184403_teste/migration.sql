-- CreateTable
CREATE TABLE "DemoFinanceiro" (
    "id" TEXT NOT NULL,
    "responsavel" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "saldoAnterior" DOUBLE PRECISION NOT NULL,
    "valorGasto" DOUBLE PRECISION NOT NULL,
    "saldoAtual" DOUBLE PRECISION NOT NULL,
    "csatResult" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DemoFinanceiro_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DemoFinanceiro_responsavel_key" ON "DemoFinanceiro"("responsavel");
