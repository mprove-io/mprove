import { type ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import {
  ThrottlerGuard,
  type ThrottlerModuleOptions,
  ThrottlerStorage
} from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import type { BackendConfig } from '#backend/config/backend-config';
import { logToConsoleBackend } from '#backend/functions/top/log-to-console-backend/log-to-console-backend';
import { ServerError } from '#common/classes/server-error/server-error';
import { RESTRICTED_USER_EMAIL } from '#common/constants/top';

import { isDefinedAndNotEmpty } from '#common/functions/is-defined-and-not-empty/is-defined-and-not-empty';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { GetUserIdTrackerError } from '#common/types/backend/function-errors/get-user-id-tracker-error';
import { toBackendTelemetryRouteValues } from '#common/types/backend/request/to-backend-telemetry-route';

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

    let isTelemetryRoute: boolean = toBackendTelemetryRouteValues.some(
      route => route === path.slice(1)
    );

    if (isTelemetryRoute && request.headers.authorization === 'Bearer null') {
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
    let result: Result.Result<string, GetUserIdTrackerError> =
      this.getUserIdTracker({ request: req });

    // The framework tracker callback requires a string or rejection.
    if (Result.isFailure(result)) {
      throw new ServerError({
        message: result.error.code
      });
    }

    let tracker: string = result.value;

    return tracker;
  }

  private getUserIdTracker(item: {
    request: Record<string, any>;
  }): Result.Result<string, GetUserIdTrackerError> {
    let { request } = item;

    if (isUndefined(request.user?.userId)) {
      return Result.fail({ code: 'BACKEND_THROTTLER_USER_ID_IS_NOT_DEFINED' });
    }

    let tracker: string;

    if (request.user.email === RESTRICTED_USER_EMAIL) {
      let now: Date = new Date();

      let utc: Date = new Date(
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

      let currentMinuteStartTs: number = Math.floor(utc.getTime() / 1000);

      let ipHeaderA: string = this.cs.get<
        BackendConfig['backendRequestIpHeaderA']
      >('backendRequestIpHeaderA');

      let ipHeaderB: string = this.cs.get<
        BackendConfig['backendRequestIpHeaderB']
      >('backendRequestIpHeaderB');

      let ipFromHeader: string =
        isDefinedAndNotEmpty(ipHeaderA) &&
        isDefinedAndNotEmpty(request.headers[ipHeaderA])
          ? request.headers[ipHeaderA]
          : isDefinedAndNotEmpty(ipHeaderB) &&
              isDefinedAndNotEmpty(request.headers[ipHeaderB])
            ? request.headers[ipHeaderB]
            : undefined;

      let ip: string =
        ipFromHeader || request.ip || request.ips?.[0] || 'unknownIp';

      let suffix: string | number =
        ip === 'unknownIp' ? currentMinuteStartTs : ip;

      tracker = `${request.user.userId}-${suffix}`;
    } else {
      tracker = request.user.userId;
    }

    let isLogThrottleTracker: boolean = this.cs.get<
      BackendConfig['backendLogThrottleTracker']
    >('backendLogThrottleTracker');

    if (isLogThrottleTracker === true) {
      logToConsoleBackend({
        log: `ThrottlerUserIdGuard - ${request.originalUrl} - tracker: ${tracker}`,
        logLevel: 'Info',
        logger: this.logger,
        cs: this.cs
      });
    }

    return Result.succeed(tracker);
  }
}
