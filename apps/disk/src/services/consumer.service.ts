import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue, Worker } from 'groupmq';
import Redis from 'ioredis';
import { RpcNamespacesEnum } from '~common/enums/rpc-namespaces.enum';
import { MyResponse } from '~common/interfaces/to/my-response';
import { DiskConfig } from '~disk/config/disk-config';
import { MessageService } from './message.service';

interface RpcRequest {
  payload: any;
  correlationId: string;
  replyTo: string;
}

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
    let diskPart = this.cs.get<DiskConfig['diskPart']>('diskPart');

    this.queue = new Queue({
      redis: this.redisClient,
      namespace: `${RpcNamespacesEnum.RpcDisk}-${diskPart}`
    });

    this.worker = new Worker({
      queue: this.queue,
      concurrency: 1,
      handler: async job => {
        let {
          payload: request,
          correlationId,
          replyTo
        } = job.data as RpcRequest;

        let response: MyResponse =
          await this.messageService.processMessage(request);

        if (replyTo && correlationId) {
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
  }
}
