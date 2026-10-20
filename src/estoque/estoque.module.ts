import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { EstoqueController } from './estoque.controller';
import { EstoqueService } from './estoque.service';

@Module({
  imports: [AuthModule],
  controllers: [EstoqueController],
  providers: [EstoqueService],
})
export class EstoqueModule {}
