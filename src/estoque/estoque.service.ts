import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { calcularStatus } from './status';

@Injectable()
export class EstoqueService {
  constructor(private readonly prisma: PrismaService) {}

  async listar() {
    const variacoes = await this.prisma.variacao.findMany({
      where: { ativo: true },
      include: {
        produto: true,
        // saldo atual = última contagem registrada
        contagens: { orderBy: { criadaEm: 'desc' }, take: 1 },
      },
      orderBy: [{ produtoId: 'asc' }, { id: 'asc' }],
    });

    return variacoes.map((v) => {
      const ultima = v.contagens[0] ?? null;
      const saldo = ultima?.quantidade ?? null;

      return {
        variacaoId: v.id,
        produto: v.produto.nome,
        rotulo: v.rotulo,
        unidade: v.unidade,
        saldo,
        estoqueMinimo: v.estoqueMinimo,
        status: calcularStatus(saldo, v.estoqueMinimo),
        ultimaContagemEm: ultima?.criadaEm ?? null,
      };
    });
  }

  async atualizarMinimo(variacaoId: number, estoqueMinimo: number) {
    return this.prisma.variacao.update({
      where: { id: variacaoId },
      data: { estoqueMinimo },
    });
  }
}
