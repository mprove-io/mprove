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

// let keyConsumerNoProject = `0${TRIPLE_UNDERSCORE}`;
// let keyConsumer0 = `0${TRIPLE_UNDERSCORE}0`;
// let keyConsumer1 = `0${TRIPLE_UNDERSCORE}1`;
// let keyConsumer2 = `0${TRIPLE_UNDERSCORE}2`;
// let keyConsumer3 = `0${TRIPLE_UNDERSCORE}3`;
// let keyConsumer4 = `0${TRIPLE_UNDERSCORE}4`;
// let keyConsumer5 = `0${TRIPLE_UNDERSCORE}5`;
// let keyConsumer6 = `0${TRIPLE_UNDERSCORE}6`;
// let keyConsumer7 = `0${TRIPLE_UNDERSCORE}7`;

@Injectable()
export class ConsumerService {
  private redisClient: Redis;
  private worker?: Worker;
  private queue?: Queue;

  constructor(
    private messageService: MessageService,
    private cs: ConfigService<DiskConfig>,
    private logger: Logger
  ) {
    let valkeyHost =
      this.cs.get<DiskConfig['diskValkeyHost']>('diskValkeyHost');

    let valkeyPassword =
      this.cs.get<DiskConfig['diskValkeyPassword']>('diskValkeyPassword');

    // the same as apps/backend/src/app.module.ts -> customThrottlerModule
    this.redisClient = new Redis({
      host: valkeyHost,
      port: 6379,
      password: valkeyPassword
      // ,
      // tls: {
      //   rejectUnauthorized: false
      // }
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

  // @RabbitRPC({
  //   exchange: RabbitExchangesEnum.Disk.toString(),
  //   routingKey: keyConsumerNoProject,
  //   queue: keyConsumerNoProject
  // })
  // async consumerNoProject(request: any, context: any) {
  //   return await this.messageService.processMessage(request);
  // }

  // @RabbitRPC({
  //   exchange: RabbitExchangesEnum.Disk.toString(),
  //   routingKey: keyConsumer0,
  //   queue: keyConsumer0
  // })
  // async consumer0(request: any, context: any) {
  //   return await this.messageService.processMessage(request);
  // }

  // @RabbitRPC({
  //   exchange: RabbitExchangesEnum.Disk.toString(),
  //   routingKey: keyConsumer1,
  //   queue: keyConsumer1
  // })
  // async consumer1(request: any, context: any) {
  //   return await this.messageService.processMessage(request);
  // }

  // @RabbitRPC({
  //   exchange: RabbitExchangesEnum.Disk.toString(),
  //   routingKey: keyConsumer2,
  //   queue: keyConsumer2
  // })
  // async consumer2(request: any, context: any) {
  //   return await this.messageService.processMessage(request);
  // }

  // @RabbitRPC({
  //   exchange: RabbitExchangesEnum.Disk.toString(),
  //   routingKey: keyConsumer3,
  //   queue: keyConsumer3
  // })
  // async consumer3(request: any, context: any) {
  //   return await this.messageService.processMessage(request);
  // }

  // @RabbitRPC({
  //   exchange: RabbitExchangesEnum.Disk.toString(),
  //   routingKey: keyConsumer4,
  //   queue: keyConsumer4
  // })
  // async consumer4(request: any, context: any) {
  //   return await this.messageService.processMessage(request);
  // }

  // @RabbitRPC({
  //   exchange: RabbitExchangesEnum.Disk.toString(),
  //   routingKey: keyConsumer5,
  //   queue: keyConsumer5
  // })
  // async consumer5(request: any, context: any) {
  //   return await this.messageService.processMessage(request);
  // }

  // @RabbitRPC({
  //   exchange: RabbitExchangesEnum.Disk.toString(),
  //   routingKey: keyConsumer6,
  //   queue: keyConsumer6
  // })
  // async consumer6(request: any, context: any) {
  //   return await this.messageService.processMessage(request);
  // }
  // @RabbitRPC({
  //   exchange: RabbitExchangesEnum.Disk.toString(),
  //   routingKey: keyConsumer7,
  //   queue: keyConsumer7
  // })
  // async consumer7(request: any, context: any) {
  //   return await this.messageService.processMessage(request);
  // }
}
