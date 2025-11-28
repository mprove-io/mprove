import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import {
  ThrottlerGuard,
  ThrottlerModuleOptions,
  ThrottlerStorage
} from '@nestjs/throttler';
import { BackendConfig } from '~backend/config/backend-config';
import { logToConsoleBackend } from '~backend/functions/log-to-console-backend';
import { LogLevelEnum } from '~common/enums/log-level.enum';
import { isDefinedAndNotEmpty } from '~common/functions/is-defined-and-not-empty';

@Injectable()
export class ThrottlerIpGuard extends ThrottlerGuard {
  constructor(
    options: ThrottlerModuleOptions,
    storageService: ThrottlerStorage,
    reflector: Reflector,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger
  ) {
    super(options, storageService, reflector);
  }

  protected async shouldSkip(): Promise<boolean> {
    let isThrottleByIp = this.cs.get<
      BackendConfig['backendThrottlePublicRoutesByIp']
    >('backendThrottlePublicRoutesByIp');

    let isSkip = isThrottleByIp === false;

    return isSkip;
  }

  protected async getTracker(req: Record<string, any>): Promise<string> {
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

    let ipFromHeader = isDefinedAndNotEmpty(ipHeaderA)
      ? req.headers[ipHeaderA]
      : undefined;

    let ip = ipFromHeader || req.ip || req.ips?.[0] || 'unknownIp';

    let tracker = ip === 'unknownIp' ? `${ip}-${currentMinuteStartTs}` : ip;

    let isLogThrottleTracker = this.cs.get<
      BackendConfig['backendLogThrottleTracker']
    >('backendLogThrottleTracker');

    if (isLogThrottleTracker === true) {
      logToConsoleBackend({
        log: `ThrottlerIpGuard - ${req.originalUrl} - tracker: ${tracker}`,
        logLevel: LogLevelEnum.Info,
        logger: this.logger,
        cs: this.cs
      });
    }

    return tracker;
  }
}
