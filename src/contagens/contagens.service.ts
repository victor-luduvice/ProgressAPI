import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { calcularStatus } from '../estoque/status';
import { CriarContagemDto } from './criar-contagem.dto';

@Injectable()
export class ContagensService {
  constructor(private readonly prisma: PrismaService) {}

  async criar(dto: CriarContagemDto) {
    const variacao = await this.prisma.variacao.findUnique({
      where: { id: dto.variacaoId },
      include: { produto: true },
    });
    if (!variacao) throw new NotFoundException('Variação não encontrada');

    // Contagem nunca é editada: sempre cria um registro novo (histórico)
    const contagem = await this.prisma.contagem.create({ data: dto });

    return {
      ...contagem,
      produto: variacao.produto.nome,
      rotulo: variacao.rotulo,
      status: calcularStatus(contagem.quantidade, variacao.estoqueMinimo),
    };
  }
}
