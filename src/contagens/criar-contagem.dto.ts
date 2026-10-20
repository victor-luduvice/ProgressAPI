import { IsInt, Min } from 'class-validator';

export class CriarContagemDto {
  @IsInt()
  variacaoId!: number;

  @IsInt()
  @Min(0)
  quantidade!: number;

}
