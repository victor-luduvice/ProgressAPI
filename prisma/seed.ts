import { PrismaClient, Papel } from '@prisma/client';

const prisma = new PrismaClient();


const catalogo: Record<string, string[]> = {
  'Bobina Plástica Padrão': ['P', 'M', 'G', 'GG'],
  'Bobina Plástica Eco': ['P', 'M', 'GG'],
  'Saco de Lixo': ['15 L', '30 L', '50 L', '100 L'],
};

async function main() {
  for (const [nome, rotulos] of Object.entries(catalogo)) {
    const produto = await prisma.produto.upsert({
      where: { nome },
      update: {},
      create: { nome },
    });

    for (const rotulo of rotulos) {
      await prisma.variacao.upsert({
        where: { produtoId_rotulo: { produtoId: produto.id, rotulo } },
        update: {},
        create: { produtoId: produto.id, rotulo },
      });
    }
  }

  // Usuários provisórios (a autenticação real entra depois)
  await prisma.usuario.upsert({
    where: { email: 'dona@exemplo.com' },
    update: {},
    create: { nome: 'Dona', email: 'dona@exemplo.com', senhaHash: 'TROCAR', papel: Papel.DONO },
  });
  await prisma.usuario.upsert({
    where: { email: 'estoque@exemplo.com' },
    update: {},
    create: { nome: 'Estoque', email: 'estoque@exemplo.com', senhaHash: 'TROCAR', papel: Papel.ESTOQUE },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());