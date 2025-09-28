import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import {
  ThrottlerGuard,
  ThrottlerModuleOptions,
  ThrottlerStorage
} from '@nestjs/throttler';
import { BackendConfig } from '~backend/config/backend-config';
import { BoolEnum } from '~common/enums/bool.enum';
import { ErEnum } from '~common/enums/er.enum';
import { isUndefined } from '~common/functions/is-undefined';
import { ServerError } from '~common/models/server-error';

@Injectable()
export class ThrottlerUserIdGuard extends ThrottlerGuard {
  constructor(
    options: ThrottlerModuleOptions,
    storageService: ThrottlerStorage,
    reflector: Reflector,
    private cs: ConfigService<BackendConfig>
  ) {
    super(options, storageService, reflector);
  }

  protected async shouldSkip(): Promise<boolean> {
    let isThrottleByUserId = this.cs.get<
      BackendConfig['backendThrottlePrivateRoutesByUserId']
    >('backendThrottlePrivateRoutesByUserId');

    let isSkip = isThrottleByUserId === BoolEnum.FALSE;

    return isSkip;
  }

  protected async getTracker(req: Record<string, any>): Promise<string> {
    if (isUndefined(req.user?.userId)) {
      throw new ServerError({
        message: ErEnum.BACKEND_THROTTLER_USER_ID_IS_NOT_DEFINED
      });
    }

    return req.user.userId;
  }
}
