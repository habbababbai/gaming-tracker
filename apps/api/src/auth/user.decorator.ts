import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AuthUserPayload } from '@repo/types';

export type { AuthUserPayload } from '@repo/types';

export const AuthUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): AuthUserPayload => {
    const request = ctx.switchToHttp().getRequest<{ user: AuthUserPayload }>();
    return request.user;
  },
);
