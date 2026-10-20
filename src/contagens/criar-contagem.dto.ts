import { IsInt, Min } from 'class-validator';

export class CriarContagemDto {
  @IsInt()
  variacaoId!: number;

  @IsInt()
  @Min(0)
  quantidade!: number;

  // TEMPORÁRIO: quando a autenticação (JWT) entrar, isso sai do body
  // e passa a vir do usuário logado.
  @IsInt()
  usuarioId!: number;
}
