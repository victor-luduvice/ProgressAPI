import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { EstoqueModule } from './estoque/estoque.module';
import { ContagensModule } from './contagens/contagens.module';

@Module({
  imports: [PrismaModule, AuthModule, EstoqueModule, ContagensModule],
})
export class AppModule {}
