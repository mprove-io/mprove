import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const AttachUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  }
);
