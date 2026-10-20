import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { Papel } from '@prisma/client';
import { Roles } from '../auth/auth.decorators';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { IsInt, Min } from 'class-validator';
import { EstoqueService } from './estoque.service';

class AtualizarMinimoDto {
  @IsInt()
  @Min(0)
  estoqueMinimo!: number;
}

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Papel.DONO, Papel.ESTOQUE)
export class EstoqueController {
  constructor(private readonly estoque: EstoqueService) {}

  @Get('estoque')
  listar() {
    return this.estoque.listar();
  }

  @Patch('variacoes/:id')
  @Roles(Papel.DONO)
  atualizarMinimo(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AtualizarMinimoDto,
  ) {
    return this.estoque.atualizarMinimo(id, dto.estoqueMinimo);
  }
}
