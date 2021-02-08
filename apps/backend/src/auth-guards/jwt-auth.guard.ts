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
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      constants.IS_PUBLIC_KEY,
      [context.getHandler(), context.getClass()]
    );
    if (isPublic) {
      return true;
    }
    return super.canActivate(context);
  }
}
