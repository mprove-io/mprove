import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

import { IDEMP_EXPIRE_SECONDS } from '~backend/constants/top';

@Injectable()
export class RedisService {
  private client: Redis;

  constructor(private cs: ConfigService<BackendConfig>) {
    let redisHost =
      this.cs.get<BackendConfig['backendRedisHost']>('backendRedisHost');

    let redisPassword = this.cs.get<BackendConfig['backendRedisPassword']>(
      'backendRedisPassword'
    );

    this.client = new Redis({
      host: redisHost,
      port: 6379,
      password: redisPassword
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
