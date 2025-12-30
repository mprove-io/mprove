import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { SKIP_JWT } from '~common/constants/top-backend';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    let request = context.switchToHttp().getRequest();

    let path = request.route?.path || request.url.split('?')[0];

    if (
      [
        ToBackendRequestInfoNameEnum.ToBackendTelemetryTraces,
        ToBackendRequestInfoNameEnum.ToBackendTelemetryMetrics,
        ToBackendRequestInfoNameEnum.ToBackendTelemetryLogs
      ].indexOf(path.slice(1)) > -1 &&
      request.headers.authorization === 'Bearer null'
    ) {
      // console.log('skip JwtAuthGuard');
      return true;
    }

    let skipJwt = this.reflector.getAllAndOverride<boolean>(SKIP_JWT, [
      context.getHandler(),
      context.getClass()
    ]);

    if (skipJwt === true) {
      return true;
    }

    return super.canActivate(context);
  }
}
