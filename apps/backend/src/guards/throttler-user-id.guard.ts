import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import {
  ThrottlerGuard,
  ThrottlerModuleOptions,
  ThrottlerStorage
} from '@nestjs/throttler';
import { BackendConfig } from '~backend/config/backend-config';
import { RESTRICTED_USER_EMAIL } from '~common/constants/top';
import { ErEnum } from '~common/enums/er.enum';
import { isUndefined } from '~common/functions/is-undefined';
import { isUndefinedOrEmpty } from '~common/functions/is-undefined-or-empty';
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

    let isSkip = isThrottleByUserId === false;

    return isSkip;
  }

  protected async getTracker(req: Record<string, any>): Promise<string> {
    if (isUndefined(req.user?.userId)) {
      throw new ServerError({
        message: ErEnum.BACKEND_THROTTLER_USER_ID_IS_NOT_DEFINED
      });
    }

    if (req.user.email === RESTRICTED_USER_EMAIL) {
      let now = new Date();

      let utc = new Date(
        Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          now.getUTCDate(),
          now.getUTCHours(),
          now.getUTCMinutes(),
          0, // seconds
          0 // milliseconds
        )
      );

      let currentMinuteStartTs = Math.floor(utc.getTime() / 1000);

      let ip = req.ip || req.ips?.[0] || 'unknown';

      let suffix =
        isUndefinedOrEmpty(ip) || ip === 'unknown' ? currentMinuteStartTs : ip;

      return `${req.user.userId}-${suffix}`;
    } else {
      return req.user.userId;
    }
  }
}
