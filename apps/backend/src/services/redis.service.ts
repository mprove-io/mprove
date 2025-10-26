import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import { BackendConfig } from '~backend/config/backend-config';
import { IDEMP_EXPIRE_SECONDS } from '~common/constants/top-backend';
import { isDefined } from '~common/functions/is-defined';

@Injectable()
export class RedisService {
  private client: Redis;

  constructor(private cs: ConfigService<BackendConfig>) {
    let valkeyHost =
      this.cs.get<BackendConfig['backendValkeyHost']>('backendValkeyHost');

    let valkeyPassword = this.cs.get<BackendConfig['backendValkeyPassword']>(
      'backendValkeyPassword'
    );

    // the same as apps/backend/src/app.module.ts -> customThrottlerModule
    this.client = new Redis({
      host: valkeyHost,
      port: 6379,
      password: valkeyPassword
      // ,
      // tls: {
      //   rejectUnauthorized: false
      // }
    });
  }

  async write(item: { id: string; data: any }): Promise<void> {
    let { id, data } = item;

    await this.client.set(id, JSON.stringify(data), 'EX', IDEMP_EXPIRE_SECONDS);
  }

  async find(item: { id: string }): Promise<any> {
    let { id } = item;

    const data = await this.client.get(id);

    return isDefined(data) ? JSON.parse(data) : undefined;
  }
}
