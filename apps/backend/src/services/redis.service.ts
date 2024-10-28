import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import { common } from '~backend/barrels/common';
import { interfaces } from '~backend/barrels/interfaces';
import { IDEMP_EXPIRE_SECONDS } from '~backend/constants/top';

@Injectable()
export class RedisService {
  private client: Redis;

  constructor(private cs: ConfigService<interfaces.Config>) {
    let redisHost =
      this.cs.get<interfaces.Config['backendRedisHost']>('backendRedisHost');

    let redisPassword = this.cs.get<interfaces.Config['backendRedisPassword']>(
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

    return common.isDefined(data) ? JSON.parse(data) : undefined;
  }
}
