import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue, Worker } from 'groupmq';
import Redis from 'ioredis';
import { ChatConfig } from '#chat/config/chat-config';
import { RpcNamespacesEnum } from '#common/enums/rpc-namespaces.enum';
import { RpcRequestData } from '#common/interfaces/rpc-request-data';
import { MyResponse } from '#common/interfaces/to/my-response';
import { MessageService } from './message.service';

@Injectable()
export class ConsumerService {
  redisClient: Redis;
  worker: Worker;
  queue: Queue;

  constructor(
    private messageService: MessageService,
    private cs: ConfigService<ChatConfig>,
    private logger: Logger
  ) {
    let valkeyHost =
      this.cs.get<ChatConfig['chatValkeyHost']>('chatValkeyHost');

    let valkeyPassword =
      this.cs.get<ChatConfig['chatValkeyPassword']>('chatValkeyPassword');

    this.redisClient = new Redis({
      host: valkeyHost,
      port: 6379,
      password: valkeyPassword
    });
  }

  async onModuleInit() {
    this.queue = new Queue({
      redis: this.redisClient,
      namespace: RpcNamespacesEnum.RpcChat
    });

    let chatConcurrency =
      this.cs.get<ChatConfig['chatConcurrency']>('chatConcurrency');

    this.worker = new Worker({
      queue: this.queue,
      concurrency: chatConcurrency,
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
  }
}
