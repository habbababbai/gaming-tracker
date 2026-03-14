import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface AuthUserPayload {
  id: string;
  email: string;
  createdAt: Date;
}

export const AuthUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): AuthUserPayload => {
    const request = ctx.switchToHttp().getRequest<{ user: AuthUserPayload }>();
    return request.user;
  },
);
