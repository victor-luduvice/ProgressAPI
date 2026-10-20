import { Body, Controller, Post } from '@nestjs/common';
import { ContagensService } from './contagens.service';
import { CriarContagemDto } from './criar-contagem.dto';

@Controller('contagens')
export class ContagensController {
  constructor(private readonly contagens: ContagensService) {}

  @Post()
  criar(@Body() dto: CriarContagemDto) {
    return this.contagens.criar(dto);
  }
}
