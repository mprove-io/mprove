import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import {
  ThrottlerGuard,
  ThrottlerModuleOptions,
  ThrottlerStorage
} from '@nestjs/throttler';
import { BackendConfig } from '~backend/config/backend-config';

@Injectable()
export class ThrottlerIpGuard extends ThrottlerGuard {
  constructor(
    options: ThrottlerModuleOptions,
    storageService: ThrottlerStorage,
    reflector: Reflector,
    private cs: ConfigService<BackendConfig>
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
    let ip = req.ip || req.ips?.[0] || 'unknown';

    return ip;
  }
}
