import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { calcularStatus } from '../estoque/status';
import { CriarContagemDto } from './criar-contagem.dto';

@Injectable()
export class ContagensService {
  constructor(private readonly prisma: PrismaService) {}

  async criar(dto: CriarContagemDto, usuarioId: number) {
    const variacao = await this.prisma.variacao.findUnique({
      where: { id: dto.variacaoId },
      include: { produto: true },
    });
    if (!variacao) throw new NotFoundException('Variação não encontrada');

    // Contagem nunca é editada: sempre cria um registro novo (histórico)
    const contagem = await this.prisma.contagem.create({
      data: { variacaoId: dto.variacaoId, quantidade: dto.quantidade, usuarioId },
    });

    return {
      ...contagem,
      produto: variacao.produto.nome,
      rotulo: variacao.rotulo,
      status: calcularStatus(contagem.quantidade, variacao.estoqueMinimo),
    };
  }

  async listarRecentes(limite = 20) {
    const contagens = await this.prisma.contagem.findMany({
      take: limite,
      orderBy: { criadaEm: 'desc' },
      include: {
        variacao: { include: { produto: true } },
        usuario: { select: { id: true, nome: true, papel: true } },
      },
    });

    return contagens.map((contagem) => ({
      id: contagem.id,
      variacaoId: contagem.variacaoId,
      produto: contagem.variacao.produto.nome,
      rotulo: contagem.variacao.rotulo,
      quantidade: contagem.quantidade,
      criadaEm: contagem.criadaEm,
      usuario: contagem.usuario,
    }));
  }
}
