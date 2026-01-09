import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'groupmq';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import { BackendConfig } from '~backend/config/backend-config';
import { ErEnum } from '~common/enums/er.enum';
import { ResponseInfoStatusEnum } from '~common/enums/response-info-status.enum';
import { RpcNamespacesEnum } from '~common/enums/rpc-namespaces.enum';
import { isUndefined } from '~common/functions/is-undefined';
import { makeId } from '~common/functions/make-id';
import { MyResponse } from '~common/interfaces/to/my-response';
import { ServerError } from '~common/models/server-error';

@Injectable()
export class RpcService {
  queues = new Map<string, Queue>();

  redisClient: Redis;

  constructor(private cs: ConfigService<BackendConfig>) {
    let valkeyHost =
      this.cs.get<BackendConfig['backendValkeyHost']>('backendValkeyHost');

    let valkeyPassword = this.cs.get<BackendConfig['backendValkeyPassword']>(
      'backendValkeyPassword'
    );

    // the same as apps/backend/src/app.module.ts -> customThrottlerModule
    this.redisClient = new Redis({
      host: valkeyHost,
      port: 6379,
      password: valkeyPassword
      // , tls: { rejectUnauthorized: false }
    });
  }

  private getQueue(namespace: string): Queue {
    if (this.queues.has(namespace) === false) {
      let queue = new Queue({
        redis: this.redisClient,
        namespace: namespace,
        keepCompleted: 0,
        keepFailed: 0
      });

      this.queues.set(namespace, queue);
    }

    return this.queues.get(namespace);
  }

  async request<T extends MyResponse>(item: {
    namespace: string;
    repoId: string;
    payload: any;
    timeout?: number;
  }): Promise<T> {
    let { namespace, repoId, payload, timeout } = item;

    if (isUndefined(timeout)) {
      timeout = 30000;
    }

    let correlationId = uuidv4();

    let replyTo = `rpc:reply:${correlationId}`;

    let queue = this.getQueue(namespace);

    let sub = this.redisClient.duplicate();

    await sub.subscribe(replyTo);

    await queue.add({
      groupId: `repo:${repoId}`,
      data: {
        payload,
        correlationId,
        replyTo
      }
    });

    return new Promise<T>((resolve, reject) => {
      let timer = setTimeout(() => {
        sub.quit();
        reject(new Error(`RPC timeout after ${timeout}ms`));
      }, timeout);

      sub.on('message', (channel, message) => {
        if (channel === replyTo) {
          clearTimeout(timer);

          sub.quit();

          try {
            let response = JSON.parse(message) as T;
            resolve(response);
          } catch {
            reject(new Error('Invalid response format'));
          }
        }
      });
    });
  }

  async sendToDisk<T>(item: {
    routingKey: string;
    message: any;
    checkIsOk?: boolean;
  }) {
    let { routingKey, message, checkIsOk } = item;

    let diskPart = 'part-1'; // TODO: calculate based on ordId

    let repoId = makeId(); // TODO: concat - ordId/projectId/repoId

    let namespace = `${RpcNamespacesEnum.RpcDisk}-${diskPart}`;

    let response = await this.request<MyResponse>({
      namespace: namespace,
      repoId: repoId,
      payload: message,
      timeout: 30000
    });

    if (
      checkIsOk === true &&
      response.info?.status !== ResponseInfoStatusEnum.Ok
    ) {
      throw new ServerError({
        message: ErEnum.BACKEND_ERROR_RESPONSE_FROM_DISK,
        originalError: response.info?.error
      });
    }

    return response as unknown as T;
  }

  async sendToBlockml<T>(item: {
    message: any;
    checkIsOk?: boolean;
  }) {
    let { message, checkIsOk } = item;

    let repoId = makeId(); // TODO: concat - ordId/projectId/repoId

    let response = await this.request<MyResponse>({
      namespace: RpcNamespacesEnum.RpcBlockml.toString(),
      repoId: repoId,
      payload: message,
      timeout: 15000
    });

    if (
      checkIsOk === true &&
      response.info?.status !== ResponseInfoStatusEnum.Ok
    ) {
      throw new ServerError({
        message: ErEnum.BACKEND_ERROR_RESPONSE_FROM_BLOCKML,
        originalError: response.info?.error
      });
    }

    return response as unknown as T;
  }
}
