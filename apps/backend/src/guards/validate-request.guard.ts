import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BackendConfig } from '~backend/config/backend-config';
import {
  NoCheckParamsSchema,
  nameToClass
} from '~common/constants/name-to-class';
import { ErEnum } from '~common/enums/er.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { isUndefined } from '~common/functions/is-undefined';
import { ServerError } from '~common/models/server-error';
import { transformValidSync } from '~node-common/functions/transform-valid-sync';

@Injectable()
export class ValidateRequestGuard implements CanActivate {
  constructor(
    private cs: ConfigService<BackendConfig>,
    private logger: Logger
  ) {}

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    let url: ToBackendRequestInfoNameEnum = request.url?.substring(1);

    let classType = nameToClass[url];

    if (isUndefined(classType)) {
      throw new ServerError({
        message: ErEnum.BACKEND_WRONG_REQUEST_INFO_NAME
      });
    }

    if (classType === NoCheckParamsSchema) {
      // console.log('classType is NoCheckParamsSchema');
      return true;
    }

    transformValidSync({
      classType: classType,
      object: request.body,
      errorMessage: ErEnum.BACKEND_WRONG_REQUEST_PARAMS,
      logIsJson:
        this.cs.get<BackendConfig['backendLogIsJson']>('backendLogIsJson'),
      logger: this.logger
    });

    return true;
  }
}
