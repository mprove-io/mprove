import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { constants } from '~backend/barrels/constants';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const skipJwt = this.reflector.getAllAndOverride<boolean>(
      constants.SKIP_JWT,
      [context.getHandler(), context.getClass()]
    );
    if (skipJwt === true) {
      return true;
    }
    return super.canActivate(context);
  }
}
