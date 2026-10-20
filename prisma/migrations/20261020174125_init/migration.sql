-- CreateEnum
CREATE TYPE "Papel" AS ENUM ('DONO', 'ESTOQUE');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "papel" "Papel" NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Produto" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "Produto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Variacao" (
    "id" SERIAL NOT NULL,
    "produtoId" INTEGER NOT NULL,
    "rotulo" TEXT NOT NULL,
    "unidade" TEXT NOT NULL DEFAULT 'caixa',
    "estoqueMinimo" INTEGER NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Variacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contagem" (
    "id" SERIAL NOT NULL,
    "variacaoId" INTEGER NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "criadaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Contagem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Produto_nome_key" ON "Produto"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "Variacao_produtoId_rotulo_key" ON "Variacao"("produtoId", "rotulo");

-- CreateIndex
CREATE INDEX "Contagem_variacaoId_criadaEm_idx" ON "Contagem"("variacaoId", "criadaEm");

-- AddForeignKey
ALTER TABLE "Variacao" ADD CONSTRAINT "Variacao_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contagem" ADD CONSTRAINT "Contagem_variacaoId_fkey" FOREIGN KEY ("variacaoId") REFERENCES "Variacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contagem" ADD CONSTRAINT "Contagem_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
