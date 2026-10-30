import { Injectable, type OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { Queue } from 'groupmq';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import type { ZodSafeParseResult } from 'zod';
import type { BackendConfig } from '#backend/config/backend-config';
import { calculateDiskShard } from '#backend/services/rpc/calculate-disk-shard/calculate-disk-shard';
import { ServerError } from '#common/classes/server-error/server-error';
import { CHANNEL_RPC_REPLY } from '#common/constants/top-backend';
import {
  type BackendErrorResponseFromBlockmlError,
  zBackendErrorResponseFromBlockmlError
} from '#common/types/backend/errors/backend-error-response-from-blockml-error';
import {
  type BackendErrorResponseFromDiskError,
  zBackendErrorResponseFromDiskError
} from '#common/types/backend/errors/backend-error-response-from-disk-error';
import type { CalculateDiskShardError } from '#common/types/backend/function-errors/calculate-disk-shard-error';
import type { RequestError } from '#common/types/backend/function-errors/request-error';
import type { SendToBlockmlError } from '#common/types/backend/function-errors/send-to-blockml-error';
import type { SendToDiskError } from '#common/types/backend/function-errors/send-to-disk-error';
import { zToBlockmlOperationRegistry } from '#common/types/blockml/request/to-blockml-operation-registry';
import type { ToBlockmlRequest } from '#common/types/blockml/request/to-blockml-request';
import type { ToBlockmlResponseForOperation } from '#common/types/blockml/response/to-blockml-response-for-operation';
import { zToDiskOperationRegistry } from '#common/types/disk/request/to-disk-operation-registry';
import type { ToDiskRequest } from '#common/types/disk/request/to-disk-request';
import type { ToDiskResponseForOperation } from '#common/types/disk/response/to-disk-response-for-operation';
import type { RpcNamespace } from '#common/types/node-common/rpc/rpc-namespace';
import type { RpcRequestData } from '#common/types/node-common/rpc-request-data';

type BlockmlSuccessOutput<TRequest extends ToBlockmlRequest> = Extract<
  ToBlockmlResponseForOperation<TRequest['operation']>,
  { type: 'Success' }
>['output'];

type DiskRoute = {
  shardKey: string;
  groupId: string;
};

type DiskSuccessOutput<TRequest extends ToDiskRequest> = Extract<
  ToDiskResponseForOperation<TRequest['operation']>,
  { type: 'Success' }
>['output'];

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
  }): Result.ResultAsync<T, RequestError> {
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

    let execution: Result.ResultAsync<T, RequestError> = new Promise(
      resolve => {
        let timer: NodeJS.Timeout = setTimeout(() => {
          sub.quit();
          resolve(
            Result.fail({
              code: 'BACKEND_RPC_TIMEOUT',
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
              resolve(Result.succeed(response));
            } catch {
              resolve(
                Result.fail({ code: 'BACKEND_RPC_INVALID_RESPONSE_FORMAT' })
              );
            }
          }
        });
      }
    );

    return execution;
  }

  async sendToBlockml<TRequest extends ToBlockmlRequest>(item: {
    request: TRequest;
    orgId: string;
    repoId: string;
  }): Result.ResultAsync<BlockmlSuccessOutput<TRequest>, SendToBlockmlError> {
    let { request, orgId, repoId } = item;

    let validation: ZodSafeParseResult<ToBlockmlRequest>;

    try {
      validation =
        zToBlockmlOperationRegistry[request.operation].request.safeParse(
          request
        );
    } catch {
      return Result.fail({ code: 'BACKEND_INVALID_REQUEST', displayData: [] });
    }

    if (validation.success === false) {
      return Result.fail({ code: 'BACKEND_INVALID_REQUEST', displayData: [] });
    }

    let result: Result.Result<
      ToBlockmlResponseForOperation<TRequest['operation']>,
      RequestError
    > = await this.request<
      ToBlockmlResponseForOperation<TRequest['operation']>
    >({
      namespace: 'rpc-blockml' satisfies RpcNamespace,
      groupId: `repo:${repoId}-${request.input.projectId}-${orgId}`,
      message: request,
      timeout: this.rpcBlockmlTimeoutMs
    });

    if (Result.isFailure(result)) {
      return result;
    }

    let response: ToBlockmlResponseForOperation<TRequest['operation']> =
      result.value;

    if (response.type === 'Failure') {
      // Public schemas validate code-specific details and strip private fields.
      let errorValidation: ZodSafeParseResult<BackendErrorResponseFromBlockmlError> =
        zBackendErrorResponseFromBlockmlError.safeParse({
          code: 'BACKEND_ERROR_RESPONSE_FROM_BLOCKML',
          originalError: response.error
        });

      if (errorValidation.success === false) {
        return Result.fail({ code: 'BACKEND_RPC_INVALID_RESPONSE_FORMAT' });
      }

      return Result.fail(errorValidation.data);
    }

    return Result.succeed(response.output);
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

  async sendToDiskUnwrapOutput<TRequest extends ToDiskRequest>(item: {
    request: TRequest;
  }): Promise<DiskSuccessOutput<TRequest>> {
    let result: Result.Result<
      DiskSuccessOutput<TRequest>,
      SendToDiskError
    > = await this.sendToDisk(item);

    if (Result.isFailure(result)) {
      throw new ServerError({
        message: result.error.code,
        displayData:
          result.error.code === 'BACKEND_INVALID_REQUEST'
            ? result.error.displayData
            : undefined,
        customData:
          result.error.code === 'BACKEND_RPC_TIMEOUT'
            ? result.error.customData
            : undefined,
        originalError:
          result.error.code === 'BACKEND_ERROR_RESPONSE_FROM_DISK' &&
          result.error.originalError
            ? Object.assign(new Error(result.error.originalError.code), {
                displayData:
                  'displayData' in result.error.originalError
                    ? result.error.originalError.displayData
                    : undefined
              })
            : undefined
      });
    }

    let output: DiskSuccessOutput<TRequest> = result.value;

    return output;
  }

  async sendToDisk<TRequest extends ToDiskRequest>(item: {
    request: TRequest;
  }): Result.ResultAsync<DiskSuccessOutput<TRequest>, SendToDiskError> {
    let { request } = item;

    let validation: ZodSafeParseResult<ToDiskRequest>;

    try {
      validation =
        zToDiskOperationRegistry[request.operation].request.safeParse(request);
    } catch {
      return Result.fail({ code: 'BACKEND_INVALID_REQUEST', displayData: [] });
    }

    if (validation.success === false) {
      return Result.fail({ code: 'BACKEND_INVALID_REQUEST', displayData: [] });
    }

    let route: DiskRoute = this.getDiskRoute({ request: request });

    let diskShard: Result.Result<string, CalculateDiskShardError> =
      calculateDiskShard({
        shardKey: route.shardKey,
        totalDiskShards: this.totalDiskShards
      });

    if (Result.isFailure(diskShard)) {
      return diskShard;
    }

    let result: Result.Result<
      ToDiskResponseForOperation<TRequest['operation']>,
      RequestError
    > = await this.request<ToDiskResponseForOperation<TRequest['operation']>>({
      namespace: `${'rpc-disk' satisfies RpcNamespace}-${diskShard.value}`,
      groupId: route.groupId,
      message: request,
      timeout: this.rpcDiskTimeoutMs
    });

    if (Result.isFailure(result)) {
      return result;
    }

    let response: ToDiskResponseForOperation<TRequest['operation']> =
      result.value;

    if (response.type === 'Failure') {
      // Public schemas validate code-specific details and strip private fields.
      let errorValidation: ZodSafeParseResult<BackendErrorResponseFromDiskError> =
        zBackendErrorResponseFromDiskError.safeParse({
          code: 'BACKEND_ERROR_RESPONSE_FROM_DISK',
          originalError: response.error
        });

      if (errorValidation.success === false) {
        return Result.fail({ code: 'BACKEND_RPC_INVALID_RESPONSE_FORMAT' });
      }

      return Result.fail(errorValidation.data);
    }

    return Result.succeed(response.output);
  }

  async onModuleDestroy(): Promise<void> {
    await this.redisClient.quit();
  }
}
