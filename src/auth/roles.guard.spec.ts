import { Papel } from '@prisma/client';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  let allowedRoles: Papel[] | undefined;
  let guard: RolesGuard;
  let requestUser: { papel: Papel } | undefined;

  beforeEach(() => {
    allowedRoles = undefined;
    requestUser = undefined;
    const reflector = {
      getAllAndOverride: jest.fn(() => allowedRoles),
    } as unknown as Reflector;
    guard = new RolesGuard(reflector);
  });

  function context() {
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({ getRequest: () => ({ user: requestUser }) }),
    } as never;
  }

  it('allows an inventory user to register counts', () => {
    allowedRoles = [Papel.ESTOQUE];
    requestUser = { papel: Papel.ESTOQUE };

    expect(guard.canActivate(context())).toBe(true);
  });

  it('does not allow an owner to register counts', () => {
    allowedRoles = [Papel.ESTOQUE];
    requestUser = { papel: Papel.DONO };

    expect(guard.canActivate(context())).toBe(false);
  });

  it('does not allow an unauthenticated request on a role-restricted route', () => {
    allowedRoles = [Papel.DONO];

    expect(guard.canActivate(context())).toBe(false);
  });

  it('allows any authenticated role when the route declares no restriction', () => {
    requestUser = { papel: Papel.ESTOQUE };

    expect(guard.canActivate(context())).toBe(true);
  });
});