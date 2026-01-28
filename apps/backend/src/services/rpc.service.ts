import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'groupmq';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import { ErEnum } from '#common/enums/er.enum';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { RpcNamespacesEnum } from '#common/enums/rpc-namespaces.enum';
import { RpcRequestData } from '#common/interfaces/rpc-request-data';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ServerError } from '#common/models/server-error';
import { BackendConfig } from '~backend/config/backend-config';
import { calculateDiskShard } from '~backend/functions/calculate-disk-shard';

@Injectable()
export class RpcService {
  totalDiskShards: number;
  rpcDiskTimeoutMs: number;
  rpcBlockmlTimeoutMs: number;

  queues = new Map<string, Queue>();

  redisClient: Redis;

  constructor(private cs: ConfigService<BackendConfig>) {
    this.totalDiskShards =
      this.cs.get<BackendConfig['totalDiskShards']>('totalDiskShards');

    this.rpcDiskTimeoutMs =
      this.cs.get<BackendConfig['rpcDiskTimeoutMs']>('rpcDiskTimeoutMs');

    this.rpcBlockmlTimeoutMs = this.cs.get<
      BackendConfig['rpcBlockmlTimeoutMs']
    >('rpcBlockmlTimeoutMs');

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
    orgId: string;
    projectId: string;
    repoId: string;
    message: any;
    timeout: number;
  }): Promise<T> {
    let { namespace, orgId, projectId, repoId, message, timeout } = item;

    let correlationId = uuidv4();

    let replyTo = `rpc:reply:${correlationId}`;

    let queue = this.getQueue(namespace);

    let sub = this.redisClient.duplicate();

    await sub.subscribe(replyTo);

    let data: RpcRequestData = {
      message: message,
      replyTo: replyTo
    };

    await queue.add({
      groupId: `repo:${repoId}-${projectId}-${orgId}`,
      data: data
    });

    return new Promise<T>((resolve, reject) => {
      let timer = setTimeout(() => {
        sub.quit();
        reject(
          new ServerError({
            message: ErEnum.BACKEND_RPC_TIMEOUT,
            customData: { timeout: `${timeout} ms` }
          })
        );
      }, timeout);

      sub.on('message', (channel, message) => {
        if (channel === replyTo) {
          clearTimeout(timer);

          sub.quit();

          try {
            let response = JSON.parse(message) as T;
            resolve(response);
          } catch {
            reject(
              new ServerError({
                message: ErEnum.BACKEND_RPC_INVALID_RESPONSE_FORMAT
              })
            );
          }
        }
      });
    });
  }

  async sendToBlockml<T>(item: {
    orgId: string;
    projectId: string;
    repoId: string;
    message: any;
    checkIsOk?: boolean;
  }) {
    let { message, orgId, projectId, repoId, checkIsOk } = item;

    let response = await this.request<MyResponse>({
      namespace: RpcNamespacesEnum.RpcBlockml.toString(),
      orgId: orgId,
      projectId: projectId,
      repoId: repoId,
      message: message,
      timeout: this.rpcBlockmlTimeoutMs
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

  async sendToDisk<T>(item: {
    orgId: string;
    projectId: string;
    repoId: string;
    message: any;
    checkIsOk?: boolean;
  }) {
    let { orgId, projectId, repoId, message, checkIsOk } = item;

    let diskShard = calculateDiskShard({
      orgId: orgId,
      totalDiskShards: this.totalDiskShards
    });

    let namespace = `${RpcNamespacesEnum.RpcDisk}-${diskShard}`;

    let response = await this.request<MyResponse>({
      namespace: namespace,
      orgId: orgId,
      projectId: projectId,
      repoId: repoId,
      message: message,
      timeout: this.rpcDiskTimeoutMs
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
}
