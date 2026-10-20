import { PrismaClient, Papel } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();


const catalogo: Record<string, string[]> = {
  'Bobina Plástica Padrão': ['P', 'M', 'G', 'GG'],
  'Bobina Plástica Eco': ['P', 'M', 'GG'],
  'Saco de Lixo': ['15 L', '30 L', '50 L', '100 L'],
};

async function main() {
  const senhaLuana = process.env.LUANA_PASSWORD;
  const senhaMaria = process.env.MARIA_PASSWORD;
  if (!senhaLuana || senhaLuana.length < 12 || !senhaMaria || senhaMaria.length < 12) {
    throw new Error('Defina LUANA_PASSWORD e MARIA_PASSWORD com pelo menos 12 caracteres no .env');
  }

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

  const [luanaExistente, mariaExistente] = await Promise.all([
    prisma.usuario.findUnique({ where: { email: 'dona@exemplo.com' } }),
    prisma.usuario.findUnique({ where: { email: 'estoque@exemplo.com' } }),
  ]);
  const [hashLuana, hashMaria] = await Promise.all([
    !luanaExistente || luanaExistente.senhaHash === 'TROCAR'
      ? hash(senhaLuana, 12)
      : null,
    !mariaExistente || mariaExistente.senhaHash === 'TROCAR'
      ? hash(senhaMaria, 12)
      : null,
  ]);

  if (!luanaExistente) {
    await prisma.usuario.create({
      data: {
        nome: 'Luana',
        email: 'dona@exemplo.com',
        senhaHash: hashLuana!,
        papel: Papel.DONO,
      },
    });
  } else if (luanaExistente.senhaHash === 'TROCAR') {
    await prisma.usuario.update({
      where: { id: luanaExistente.id },
      data: { nome: 'Luana', senhaHash: hashLuana!, papel: Papel.DONO },
    });
  }
  if (!mariaExistente) {
    await prisma.usuario.create({
      data: {
        nome: 'Maria',
        email: 'estoque@exemplo.com',
        senhaHash: hashMaria!,
        papel: Papel.ESTOQUE,
      },
    });
  } else if (mariaExistente.senhaHash === 'TROCAR') {
    await prisma.usuario.update({
      where: { id: mariaExistente.id },
      data: { nome: 'Maria', senhaHash: hashMaria!, papel: Papel.ESTOQUE },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());