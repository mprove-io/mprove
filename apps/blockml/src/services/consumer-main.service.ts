import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue, Worker } from 'groupmq';
import Redis from 'ioredis';
import { BlockmlConfig } from '#blockml/config/blockml-config';
import { RebuildStructService } from '#blockml/controllers/rebuild-struct/rebuild-struct.service';
import { makeErrorResponseBlockml } from '#blockml/functions/extra/make-error-response-blockml';
import { makeOkResponseBlockml } from '#blockml/functions/extra/make-ok-response-blockml';
import { METHOD_RPC } from '#common/constants/top';
import { RpcNamespacesEnum } from '#common/enums/rpc-namespaces.enum';
import { RpcRequestData } from '#common/interfaces/rpc-request-data';
import { MyResponse } from '#common/interfaces/to/my-response';

@Injectable()
export class ConsumerMainService {
  redisClient: Redis;
  worker: Worker;
  queue: Queue;

  constructor(
    private rebuildStructService: RebuildStructService,
    private cs: ConfigService<BlockmlConfig>,
    private logger: Logger
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
        let { message, replyTo } = job.data as RpcRequestData;

        let response: MyResponse;

        try {
          let startTs = Date.now();

          try {
            let payload = await this.rebuildStructService.rebuild({
              body: message
            });

            response = makeOkResponseBlockml({
              payload: payload,
              body: message,
              path: RpcNamespacesEnum.RpcBlockml,
              method: METHOD_RPC,
              duration: Date.now() - startTs,
              cs: this.cs,
              logger: this.logger
            });
          } catch (e) {
            let { resp, wrappedError } = makeErrorResponseBlockml({
              e,
              body: message,
              path: RpcNamespacesEnum.RpcBlockml,
              method: METHOD_RPC,
              duration: Date.now() - startTs,
              cs: this.cs,
              logger: this.logger
            });

            response = resp;
          }
        } catch (error: any) {
          throw error;
        }

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
