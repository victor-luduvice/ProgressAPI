import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { EstoqueModule } from './estoque/estoque.module';
import { ContagensModule } from './contagens/contagens.module';

@Module({
  imports: [PrismaModule, EstoqueModule, ContagensModule],
})
export class AppModule {}
