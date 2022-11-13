import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { interfaces } from '~backend/barrels/interfaces';

@Injectable()
export class ValidateRequestGuard implements CanActivate {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private pinoLogger: PinoLogger
  ) {}

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    let url: apiToBackend.ToBackendRequestInfoNameEnum =
      request.url?.substring(1);

    let classType: any = apiToBackend.nameToClass[url];

    if (common.isUndefined(classType)) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_WRONG_REQUEST_INFO_NAME
      });
    }

    common.transformValidSync({
      classType: classType,
      object: request.body,
      errorMessage: common.ErEnum.BACKEND_WRONG_REQUEST_PARAMS,
      logIsStringify: this.cs.get<interfaces.Config['backendLogIsStringify']>(
        'backendLogIsStringify'
      ),
      pinoLogger: this.pinoLogger
    });

    return true;
  }
}
