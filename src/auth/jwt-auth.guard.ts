import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { PUBLIC_ROUTE } from './auth.decorators';
import type { TokenPayload, UsuarioAutenticado } from './auth.types';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwt: JwtService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_ROUTE, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<
      Request & { user?: UsuarioAutenticado }
    >();
    const [scheme, bearerToken] = request.headers.authorization?.split(' ') ?? [];
    const cookieToken = request.headers.cookie
      ?.split(';')
      .map((cookie) => cookie.trim())
      .find((cookie) => cookie.startsWith('estoque_session='))
      ?.slice('estoque_session='.length);
    const token = scheme === 'Bearer' ? bearerToken : cookieToken;
    if (!token) {
      throw new UnauthorizedException('Autenticação necessária');
    }

    try {
      const payload = await this.jwt.verifyAsync<TokenPayload>(token);
      request.user = {
        id: payload.sub,
        nome: payload.nome,
        email: payload.email,
        papel: payload.papel,
      };
      return true;
    } catch {
      throw new UnauthorizedException('Sessão inválida ou expirada');
    }
  }
}