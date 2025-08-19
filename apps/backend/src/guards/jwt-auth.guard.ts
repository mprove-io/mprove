import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { SKIP_JWT } from '~common/constants/top-backend';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const skipJwt = this.reflector.getAllAndOverride<boolean>(SKIP_JWT, [
      context.getHandler(),
      context.getClass()
    ]);
    if (skipJwt === true) {
      return true;
    }
    return super.canActivate(context);
  }
}
