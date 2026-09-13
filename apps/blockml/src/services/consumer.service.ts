import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue, Worker } from 'groupmq';
import Redis from 'ioredis';
import { BlockmlConfig } from '#blockml/config/blockml-config';
import { RpcNamespacesEnum } from '#common/enums/rpc-namespaces.enum';
import type { ToBlockmlInvalidRequestErrorResponse } from '#common/zod/blockml/response/to-blockml-invalid-request-error-response';
import type { ToBlockmlOperationResponse } from '#common/zod/blockml/response/to-blockml-operation-response';
import { MessageService } from './message.service';
@Injectable()
export class ConsumerService {
  redisClient: Redis;
  worker: Worker;
  queue: Queue;

  constructor(
    private messageService: MessageService,
    private cs: ConfigService<BlockmlConfig>
  ) {
    let valkeyHost =
      this.cs.get<BlockmlConfig['blockmlValkeyHost']>('blockmlValkeyHost');

    let valkeyPassword = this.cs.get<BlockmlConfig['blockmlValkeyPassword']>(
      'blockmlValkeyPassword'
    );

    this.redisClient = new Redis({
      host: valkeyHost,
      port: 6379,
      password: valkeyPassword
      // , tls: { rejectUnauthorized: false }
    });
  }

  async onModuleInit() {
    this.queue = new Queue({
      redis: this.redisClient,
      namespace: RpcNamespacesEnum.RpcBlockml
    });

    this.worker = new Worker({
      queue: this.queue,
      concurrency: 1,
      handler: async job => {
        await this.processJob({ data: job.data });
      }
    });

    this.worker.run();
  }

  async processJob(item: { data: unknown }): Promise<void> {
    let { data } = item;

    let message: unknown =
      typeof data === 'object' && data !== null && 'message' in data
        ? data.message
        : undefined;

    let replyTo: unknown =
      typeof data === 'object' && data !== null && 'replyTo' in data
        ? data.replyTo
        : undefined;

    let response:
      | ToBlockmlOperationResponse
      | ToBlockmlInvalidRequestErrorResponse =
      await this.messageService.handleMessage({
        message: message
      });

    if (typeof replyTo === 'string' && replyTo.length > 0) {
      await this.redisClient.publish(replyTo, JSON.stringify(response));
    }
  }

  async onModuleDestroy() {
    if (this.worker) {
      await this.worker.close();
    }
    this.redisClient.disconnect();
  }
}
