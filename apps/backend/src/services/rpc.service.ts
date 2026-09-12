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
import {
  getToDiskOperationName,
  getToDiskRequestSchema,
  getToDiskWireResponseSchema,
  type ToDiskNameForRequest,
  type ToDiskRequest,
  type ToDiskWireResponseFor
} from '#common/zod/to-disk/to-disk-operation-contract';
import type {
  ToDiskDomainResponse,
  ToDiskSuccessResponse
} from '#common/zod/to-disk/to-disk-response';

type DiskSendItem<TRequest extends ToDiskRequest> = {
  request: TRequest;
};

type DiskRoute = {
  shardKey: string;
  groupId: string;
};

type DiskDomainResponse<TRequest extends ToDiskRequest> = ToDiskDomainResponse<
  ToDiskWireResponseFor<ToDiskNameForRequest<TRequest>>
>;

type DiskSuccessResponse<TRequest extends ToDiskRequest> =
  ToDiskSuccessResponse<ToDiskWireResponseFor<ToDiskNameForRequest<TRequest>>>;

type DiskSuccessOutput<TRequest extends ToDiskRequest> =
  DiskSuccessResponse<TRequest>['result']['value'];

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
      let name: ToDiskNameForRequest<TRequest> = getToDiskOperationName({
        request: sourceRequest
      });

      validationResult = getToDiskRequestSchema({ name: name }).safeParse(
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

  private async sendToDiskRoutedResult<TRequest extends ToDiskRequest>(item: {
    request: TRequest;
    shardKey: string;
    groupId: string;
  }): Promise<DiskDomainResponse<TRequest>> {
    let { request, shardKey, groupId } = item;

    let name: ToDiskNameForRequest<TRequest> = getToDiskOperationName({
      request: request
    });

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

    let response: ToDiskWireResponseFor<ToDiskNameForRequest<TRequest>>;

    try {
      response = getToDiskWireResponseSchema({
        name: name
      }).parse(rawResponse);
    } catch {
      throw new ServerError({
        message: ErEnum.BACKEND_RPC_INVALID_RESPONSE_FORMAT
      });
    }

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

    // The schema preserves request correlation; the guards exclude boundary results.
    // TypeScript cannot lift nested result narrowing into a generic mapped envelope.
    let domainResponse: DiskDomainResponse<TRequest> =
      response as DiskDomainResponse<TRequest>;

    return domainResponse;
  }

  private unwrapDiskResponse<TRequest extends ToDiskRequest>(item: {
    response: DiskDomainResponse<TRequest>;
  }): DiskSuccessResponse<TRequest> {
    let { response } = item;

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

    // The guard proves success, but TypeScript cannot narrow the generic envelope.
    let successResponse: DiskSuccessResponse<TRequest> =
      response as DiskSuccessResponse<TRequest>;

    return successResponse;
  }

  async sendToDiskResult<TRequest extends ToDiskRequest>(
    item: DiskSendItem<TRequest>
  ): Promise<DiskDomainResponse<TRequest>> {
    let request: TRequest = this.validateDiskRequest({
      request: item.request
    });

    let route: DiskRoute = this.getDiskRoute({
      request: request
    });

    let response: DiskDomainResponse<TRequest> =
      await this.sendToDiskRoutedResult({
        request: request,
        shardKey: route.shardKey,
        groupId: route.groupId
      });

    return response;
  }

  async sendToDiskUnwrapResponse<TRequest extends ToDiskRequest>(
    item: DiskSendItem<TRequest>
  ): Promise<DiskSuccessResponse<TRequest>> {
    let domainResponse: DiskDomainResponse<TRequest> =
      await this.sendToDiskResult<TRequest>(item);

    let response: DiskSuccessResponse<TRequest> = this.unwrapDiskResponse({
      response: domainResponse
    });

    return response;
  }

  async sendToDiskUnwrapOutput<TRequest extends ToDiskRequest>(
    item: DiskSendItem<TRequest>
  ): Promise<DiskSuccessOutput<TRequest>> {
    let response: DiskSuccessResponse<TRequest> =
      await this.sendToDiskUnwrapResponse<TRequest>(item);

    let output: DiskSuccessOutput<TRequest> = response.result.value;

    return output;
  }

  onModuleDestroy() {
    this.redisClient.disconnect();
  }
}
