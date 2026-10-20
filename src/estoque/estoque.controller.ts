import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import { IsInt, Min } from 'class-validator';
import { EstoqueService } from './estoque.service';

class AtualizarMinimoDto {
  @IsInt()
  @Min(0)
  estoqueMinimo!: number;
}

@Controller()
export class EstoqueController {
  constructor(private readonly estoque: EstoqueService) {}

  @Get('estoque')
  listar() {
    return this.estoque.listar();
  }

  @Patch('variacoes/:id')
  atualizarMinimo(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AtualizarMinimoDto,
  ) {
    return this.estoque.atualizarMinimo(id, dto.estoqueMinimo);
  }
}
