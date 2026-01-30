import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue, Worker } from 'groupmq';
import Redis from 'ioredis';
import { RpcNamespacesEnum } from '#common/enums/rpc-namespaces.enum';
import { RpcRequestData } from '#common/interfaces/rpc-request-data';
import { MyResponse } from '#common/interfaces/to/my-response';
import { DiskConfig } from '#disk/config/disk-config';
import { MessageService } from './message.service';

@Injectable()
export class ConsumerService {
  redisClient: Redis;
  worker: Worker;
  queue: Queue;

  constructor(
    private messageService: MessageService,
    private cs: ConfigService<DiskConfig>,
    private logger: Logger
  ) {
    let valkeyHost =
      this.cs.get<DiskConfig['diskValkeyHost']>('diskValkeyHost');

    let valkeyPassword =
      this.cs.get<DiskConfig['diskValkeyPassword']>('diskValkeyPassword');

    this.redisClient = new Redis({
      host: valkeyHost,
      port: 6379,
      password: valkeyPassword
      // , tls: { rejectUnauthorized: false }
    });
  }

  async onModuleInit() {
    let diskShard = this.cs.get<DiskConfig['diskShard']>('diskShard');

    this.queue = new Queue({
      redis: this.redisClient,
      namespace: `${RpcNamespacesEnum.RpcDisk}-${diskShard}`
    });

    let diskConcurrency =
      this.cs.get<DiskConfig['diskConcurrency']>('diskConcurrency');

    this.worker = new Worker({
      queue: this.queue,
      concurrency: diskConcurrency,
      handler: async job => {
        let { message, replyTo } = job.data as RpcRequestData;

        let response: MyResponse =
          await this.messageService.processMessage(message);

        if (replyTo) {
          await this.redisClient.publish(replyTo, JSON.stringify(response));
        }
      }
    });

    this.worker.run();
  }

  async onModuleDestroy() {
    if (this.worker) {
      await this.worker.close();
    }
    this.redisClient.disconnect();
  }
}
