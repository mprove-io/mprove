import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'groupmq';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import type { ZodSafeParseResult } from 'zod';
import { BackendConfig } from '#backend/config/backend-config';
import { calculateDiskShard } from '#backend/functions/calculate-disk-shard';
import { CHANNEL_RPC_REPLY } from '#common/constants/top-backend';
import { ErEnum } from '#common/enums/er.enum';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { RpcNamespacesEnum } from '#common/enums/rpc-namespaces.enum';
import { ServerError } from '#common/models/server-error';
import type { RpcRequestData } from '#common/zod/rpc-request-data';
import type { MyResponse } from '#common/zod/to/my-response';
import { toDiskOperationRegistry } from '#common/zod/to-disk/to-disk-operation-registry';
import type { ToDiskRequest } from '#common/zod/to-disk/to-disk-request';
import type { ToDiskResponseForOperation } from '#common/zod/to-disk/to-disk-response-for-operation';

type DiskSendItem<TRequest extends ToDiskRequest> = {
  request: TRequest;
};

type DiskRoute = {
  shardKey: string;
  groupId: string;
};

type DiskSuccessOutput<TRequest extends ToDiskRequest> = Extract<
  ToDiskResponseForOperation<TRequest['operation']>['result'],
  { type: 'Success' }
>['value'];

@Injectable()
export class RpcService implements OnModuleDestroy {
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

    let valkeyHost: string =
      this.cs.get<BackendConfig['backendValkeyHost']>('backendValkeyHost');

    let valkeyPassword: string = this.cs.get<
      BackendConfig['backendValkeyPassword']
    >('backendValkeyPassword');

    // the same as apps/backend/src/app.module.ts -> customThrottlerModule
    this.redisClient = new Redis({
      host: valkeyHost,
      port: 6379,
      password: valkeyPassword
      // , tls: { rejectUnauthorized: false }
    });
  }

  private getQueue(namespace: string): Queue {
    let hasQueue: boolean = this.queues.has(namespace);

    if (hasQueue === false) {
      let queue: Queue = new Queue({
        redis: this.redisClient,
        namespace: namespace,
        keepCompleted: 0,
        keepFailed: 0
      });

      this.queues.set(namespace, queue);
    }

    return this.queues.get(namespace);
  }

  async request<T = unknown>(item: {
    namespace: string;
    groupId: string;
    message: any;
    timeout: number;
  }): Promise<T> {
    let { namespace, groupId, message, timeout } = item;

    let correlationId: string = uuidv4();

    let replyTo: string = `${CHANNEL_RPC_REPLY}:${correlationId}`;

    let queue: Queue = this.getQueue(namespace);

    let sub: Redis = this.redisClient.duplicate();

    await sub.subscribe(replyTo);

    let data: RpcRequestData = {
      message: message,
      replyTo: replyTo
    };

    await queue.add({
      groupId: groupId,
      data: data
    });

    return new Promise<T>((resolve, reject) => {
      let timer: NodeJS.Timeout = setTimeout(() => {
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
            let response: T = JSON.parse(message) as T;
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
  }): Promise<T> {
    let { message, orgId, projectId, repoId, checkIsOk } = item;

    let groupId: string = `repo:${repoId}-${projectId}-${orgId}`;

    let response: MyResponse = await this.request<MyResponse>({
      namespace: RpcNamespacesEnum.RpcBlockml.toString(),
      groupId: groupId,
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

  private validateDiskRequest<TRequest extends ToDiskRequest>(item: {
    request: TRequest;
  }): TRequest {
    let { request: sourceRequest } = item;

    let validationResult: ZodSafeParseResult<ToDiskRequest>;

    try {
      validationResult =
        toDiskOperationRegistry[sourceRequest.operation].request.safeParse(
          sourceRequest
        );
    } catch {
      throw new ServerError({
        message: ErEnum.BACKEND_WRONG_REQUEST_PARAMS
      });
    }

    if (validationResult.success === false) {
      throw new ServerError({
        message: ErEnum.BACKEND_WRONG_REQUEST_PARAMS
      });
    }

    return sourceRequest;
  }

  private getDiskRoute(item: { request: ToDiskRequest }): DiskRoute {
    let { request } = item;

    switch (request.operation) {
      case 'createOrg':
      case 'deleteOrg':
      case 'isOrgExist': {
        let route: DiskRoute = {
          shardKey: request.input.orgId,
          groupId: `org:${request.input.orgId}`
        };

        return route;
      }

      case 'createProject':
      case 'seedProject': {
        let route: DiskRoute = {
          shardKey: request.input.baseProject.orgId,
          groupId: `project:${request.input.baseProject.projectId}-${request.input.baseProject.orgId}`
        };

        return route;
      }

      case 'deleteProject':
      case 'isProjectExist': {
        let route: DiskRoute = {
          shardKey: request.input.orgId,
          groupId: `project:${request.input.projectId}-${request.input.orgId}`
        };

        return route;
      }

      case 'createDevRepo':
      case 'deleteDevRepo': {
        let route: DiskRoute = {
          shardKey: request.input.baseProject.orgId,
          groupId: `repo:${request.input.devRepoId}-${request.input.baseProject.projectId}-${request.input.baseProject.orgId}`
        };

        return route;
      }

      case 'cloneTestRepo': {
        let route: DiskRoute = {
          shardKey: 'test',
          groupId: `test-repo:${request.input.testId}`
        };

        return route;
      }

      case 'commitRepo':
      case 'mergeRepo':
      case 'pullRepo':
      case 'pushRepo':
      case 'revertRepoToLastCommit':
      case 'revertRepoToRemote':
      case 'syncRepo':
      case 'getCatalogFiles':
      case 'getCatalogNodes':
      case 'moveCatalogNode':
      case 'renameCatalogNode':
      case 'createBranch':
      case 'deleteBranch':
      case 'isBranchExist':
      case 'createFolder':
      case 'deleteFolder':
      case 'createFile':
      case 'deleteFile':
      case 'getFile':
      case 'saveFile': {
        let route: DiskRoute = {
          shardKey: request.input.baseProject.orgId,
          groupId: `repo:${request.input.repoId}-${request.input.baseProject.projectId}-${request.input.baseProject.orgId}`
        };

        return route;
      }
    }

    let exhaustiveRequest: never = request;

    return exhaustiveRequest;
  }

  private async sendToDisk<TRequest extends ToDiskRequest>(item: {
    request: TRequest;
    shardKey: string;
    groupId: string;
  }): Promise<ToDiskResponseForOperation<TRequest['operation']>> {
    let { request, shardKey, groupId } = item;

    let diskShard: string = calculateDiskShard({
      shardKey: shardKey,
      totalDiskShards: this.totalDiskShards
    });

    let rawResponse: unknown = await this.request<unknown>({
      namespace: `${RpcNamespacesEnum.RpcDisk}-${diskShard}`,
      groupId: groupId,
      message: request,
      timeout: this.rpcDiskTimeoutMs
    });

    let response: ToDiskResponseForOperation<TRequest['operation']>;

    try {
      response =
        toDiskOperationRegistry[request.operation].response.parse(rawResponse);
    } catch {
      throw new ServerError({
        message: ErEnum.BACKEND_RPC_INVALID_RESPONSE_FORMAT
      });
    }

    return response;
  }

  async sendToDiskUnwrapOutput<TRequest extends ToDiskRequest>(
    item: DiskSendItem<TRequest>
  ): Promise<DiskSuccessOutput<TRequest>> {
    let request: TRequest = this.validateDiskRequest({
      request: item.request
    });

    let route: DiskRoute = this.getDiskRoute({
      request: request
    });

    let response: ToDiskResponseForOperation<TRequest['operation']> =
      await this.sendToDisk({
        request: request,
        shardKey: route.shardKey,
        groupId: route.groupId
      });

    if (response.result.type === 'InvalidRequest') {
      throw new ServerError({
        message: ErEnum.BACKEND_ERROR_RESPONSE_FROM_DISK,
        originalError: new ServerError({
          message: ErEnum.DISK_WRONG_REQUEST_PARAMS,
          displayData: response.result.issues
        })
      });
    }

    if (response.result.type === 'InternalFailure') {
      throw new ServerError({
        message: ErEnum.BACKEND_ERROR_RESPONSE_FROM_DISK,
        originalError: { incidentId: response.result.incidentId }
      });
    }

    if (response.result.type === 'Failure') {
      let error: { code: string; displayData?: unknown } =
        response.result.error;

      throw new ServerError({
        message: ErEnum.BACKEND_ERROR_RESPONSE_FROM_DISK,
        originalError: new ServerError({
          message: error.code,
          displayData: error.displayData
        })
      });
    }

    let output: DiskSuccessOutput<TRequest> = response.result.value;

    return output;
  }

  onModuleDestroy() {
    this.redisClient.disconnect();
  }
}
