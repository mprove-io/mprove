import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import type { ThrottlerModuleOptions } from '@nestjs/throttler';
import { ThrottlerGuard, ThrottlerStorage } from '@nestjs/throttler';
import { BackendConfig } from '#backend/config/backend-config';
import { logToConsoleBackend } from '#backend/functions/log-to-console-backend';
import { RESTRICTED_USER_EMAIL } from '#common/constants/top';
import { ErEnum } from '#common/enums/er.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isDefinedAndNotEmpty } from '#common/functions/is-defined-and-not-empty';
import { isUndefined } from '#common/functions/is-undefined';
import { ServerError } from '#common/models/server-error';

@Injectable()
export class ThrottlerUserIdGuard extends ThrottlerGuard {
  constructor(
    options: ThrottlerModuleOptions,
    storageService: ThrottlerStorage,
    reflector: Reflector,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger
  ) {
    super(options, storageService, reflector);
  }

  protected async shouldSkip(context: ExecutionContext): Promise<boolean> {
    let request = context.switchToHttp().getRequest();

    let path = request.route?.path || request.url.split('?')[0]; // Get clean path

    if (
      [
        ToBackendRequestInfoNameEnum.ToBackendTelemetryTraces,
        ToBackendRequestInfoNameEnum.ToBackendTelemetryMetrics,
        ToBackendRequestInfoNameEnum.ToBackendTelemetryLogs
      ].indexOf(path.slice(1)) > -1 &&
      request.headers.authorization === 'Bearer null'
    ) {
      // console.log('skip ThrottlerUserIdGuard');
      return true;
    }

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

    let tracker;

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

      let ipHeaderA = this.cs.get<BackendConfig['backendRequestIpHeaderA']>(
        'backendRequestIpHeaderA'
      );

      let ipHeaderB = this.cs.get<BackendConfig['backendRequestIpHeaderB']>(
        'backendRequestIpHeaderB'
      );

      let ipFromHeader =
        isDefinedAndNotEmpty(ipHeaderA) &&
        isDefinedAndNotEmpty(req.headers[ipHeaderA])
          ? req.headers[ipHeaderA]
          : isDefinedAndNotEmpty(ipHeaderB) &&
              isDefinedAndNotEmpty(req.headers[ipHeaderB])
            ? req.headers[ipHeaderB]
            : undefined;

      let ip = ipFromHeader || req.ip || req.ips?.[0] || 'unknownIp';

      let suffix = ip === 'unknownIp' ? currentMinuteStartTs : ip;

      tracker = `${req.user.userId}-${suffix}`;
    } else {
      tracker = req.user.userId;
    }

    let isLogThrottleTracker = this.cs.get<
      BackendConfig['backendLogThrottleTracker']
    >('backendLogThrottleTracker');

    if (isLogThrottleTracker === true) {
      logToConsoleBackend({
        log: `ThrottlerUserIdGuard - ${req.originalUrl} - tracker: ${tracker}`,
        logLevel: LogLevelEnum.Info,
        logger: this.logger,
        cs: this.cs
      });
    }

    return tracker;
  }
}
