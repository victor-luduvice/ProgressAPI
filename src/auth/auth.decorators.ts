import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';
import { Papel } from '@prisma/client';
import { UsuarioAutenticado } from './auth.types';

export const PUBLIC_ROUTE = 'publicRoute';
export const ROLES_KEY = 'roles';

export const Public = () => SetMetadata(PUBLIC_ROUTE, true);
export const Roles = (...roles: Papel[]) => SetMetadata(ROLES_KEY, roles);

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): UsuarioAutenticado =>
    context.switchToHttp().getRequest<{ user: UsuarioAutenticado }>().user,
);