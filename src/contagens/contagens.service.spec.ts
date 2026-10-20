import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { PrismaService } from '../prisma/prisma.service';
import { ContagensService } from './contagens.service';

describe('ContagensService', () => {
  let service: ContagensService;
  let create: jest.Mock;

  beforeEach(() => {
    create = jest.fn().mockResolvedValue({
      id: 1,
      variacaoId: 3,
      usuarioId: 7,
      quantidade: 40,
      criadaEm: new Date('2026-10-20T12:00:00.000Z'),
    });
    const prisma = {
      variacao: {
        findUnique: jest.fn().mockResolvedValue({
          id: 3,
          rotulo: 'P',
          estoqueMinimo: 50,
          produto: { nome: 'Bobina Plástica Padrão' },
        }),
      },
      contagem: { create },
    } as unknown as PrismaService;
    service = new ContagensService(prisma);
  });

  it('attributes the count to the authenticated user id', async () => {
    const result = await service.criar({ variacaoId: 3, quantidade: 40 }, 7);

    expect(create).toHaveBeenCalledWith({
      data: { variacaoId: 3, quantidade: 40, usuarioId: 7 },
    });
    expect(result).toMatchObject({
      usuarioId: 7,
      produto: 'Bobina Plástica Padrão',
      rotulo: 'P',
      status: 'CRITICO',
    });
  });
});