import { Papel } from '@prisma/client';

export type UsuarioAutenticado = {
  id: number;
  nome: string;
  email: string;
  papel: Papel;
};

export type TokenPayload = {
  sub: number;
  nome: string;
  email: string;
  papel: Papel;
};