import { UnauthorizedException } from '@nestjs/common';
import { Papel } from '@prisma/client';
import { hash } from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: { usuario: { findUnique: jest.Mock } };
  let jwt: { signAsync: jest.Mock };
  let senhaHash: string;

  beforeEach(async () => {
    senhaHash = await hash('senha-de-teste-forte', 4);
    prisma = {
      usuario: {
        findUnique: jest.fn().mockResolvedValue({
          id: 7,
          nome: 'Maria',
          email: 'estoque@exemplo.com',
          senhaHash,
          papel: Papel.ESTOQUE,
        }),
      },
    };
    jwt = { signAsync: jest.fn().mockResolvedValue('token-assinado') };
    service = new AuthService(
      prisma as unknown as PrismaService,
      jwt as unknown as JwtService,
    );
  });

  it('normalizes the email and returns only the safe user profile', async () => {
    const result = await service.login({
      email: 'ESTOQUE@EXEMPLO.COM',
      senha: 'senha-de-teste-forte',
    });

    expect(prisma.usuario.findUnique).toHaveBeenCalledWith({
      where: { email: 'estoque@exemplo.com' },
    });
    expect(result).toEqual({
      accessToken: 'token-assinado',
      user: {
        id: 7,
        nome: 'Maria',
        email: 'estoque@exemplo.com',
        papel: Papel.ESTOQUE,
      },
    });
    expect(JSON.stringify(result)).not.toContain(senhaHash);
  });

  it('rejects an incorrect password', async () => {
    await expect(
      service.login({ email: 'estoque@exemplo.com', senha: 'errada' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(jwt.signAsync).not.toHaveBeenCalled();
  });

  it('rejects an unknown email', async () => {
    prisma.usuario.findUnique.mockResolvedValue(null);

    await expect(
      service.login({ email: 'ausente@exemplo.com', senha: 'qualquer-senha' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(jwt.signAsync).not.toHaveBeenCalled();
  });
});