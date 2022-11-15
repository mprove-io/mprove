import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { interfaces } from '~backend/barrels/interfaces';
import { nodeCommon } from '~backend/barrels/node-common';

@Injectable()
export class ValidateRequestGuard implements CanActivate {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private logger: Logger
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

    nodeCommon.transformValidSync({
      classType: classType,
      object: request.body,
      errorMessage: common.ErEnum.BACKEND_WRONG_REQUEST_PARAMS,
      logIsJson:
        this.cs.get<interfaces.Config['backendLogIsJson']>('backendLogIsJson'),
      logger: this.logger
    });

    return true;
  }
}
