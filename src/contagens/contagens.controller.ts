import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Papel } from '@prisma/client';
import { CurrentUser, Roles } from '../auth/auth.decorators';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { UsuarioAutenticado } from '../auth/auth.types';
import { RolesGuard } from '../auth/roles.guard';
import { ContagensService } from './contagens.service';
import { CriarContagemDto } from './criar-contagem.dto';

@Controller('contagens')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Papel.ESTOQUE)
export class ContagensController {
  constructor(private readonly contagens: ContagensService) {}

  @Post()
  criar(
    @Body() dto: CriarContagemDto,
    @CurrentUser() user: UsuarioAutenticado,
  ) {
    return this.contagens.criar(dto, user.id);
  }

  @Get()
  @Roles(Papel.DONO)
  listarRecentes(
    @Query('limite', new DefaultValuePipe(20), ParseIntPipe) limite: number,
  ) {
    return this.contagens.listarRecentes(Math.min(Math.max(limite, 1), 100));
  }
}
