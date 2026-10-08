import { Injectable, type OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { Queue } from 'groupmq';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import type { ZodSafeParseResult } from 'zod';
import type { BackendConfig } from '#backend/config/backend-config';
import { calculateDiskShardResult } from '#backend/functions/calculate-disk-shard-result/calculate-disk-shard-result';
import { ServerError } from '#common/classes/server-error/server-error';
import { CHANNEL_RPC_REPLY } from '#common/constants/top-backend';
import type { CalculateDiskShardResultError } from '#common/types/backend/function-errors/calculate-disk-shard-result-error';
import type { RequestResultError } from '#common/types/backend/function-errors/request-result-error';
import type { SendToBlockmlResultError } from '#common/types/backend/function-errors/send-to-blockml-result-error';
import type { SendToDiskResultError } from '#common/types/backend/function-errors/send-to-disk-result-error';
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
  }): Promise<T> {
    let result: Result.Result<T, RequestResultError> =
      await this.requestResult<T>(item);

    if (Result.isFailure(result)) {
      throw new ServerError({
        message: result.error.code,
        customData:
          result.error.code === 'BACKEND_RPC_TIMEOUT'
            ? { timeout: `${item.timeout} ms` }
            : undefined
      });
    }

    let response: T = result.value;

    return response;
  }

  async requestResult<T = unknown>(item: {
    namespace: string;
    groupId: string;
    message: any;
    timeout: number;
  }): Result.ResultAsync<T, RequestResultError> {
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

    let execution: Result.ResultAsync<T, RequestResultError> = new Promise(
      resolve => {
        let timer: NodeJS.Timeout = setTimeout(() => {
          sub.quit();
          resolve(Result.fail({ code: 'BACKEND_RPC_TIMEOUT' }));
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

  async sendToBlockmlUnwrapOutput<TRequest extends ToBlockmlRequest>(item: {
    request: TRequest;
    orgId: string;
    repoId: string;
  }): Promise<BlockmlSuccessOutput<TRequest>> {
    let result: Result.Result<
      BlockmlSuccessOutput<TRequest>,
      SendToBlockmlResultError
    > = await this.sendToBlockmlResult(item);

    if (Result.isFailure(result)) {
      throw new ServerError({
        message: result.error.code,
        displayData:
          result.error.code === 'BACKEND_INVALID_REQUEST'
            ? result.error.displayData
            : undefined,
        customData:
          result.error.code === 'BACKEND_RPC_TIMEOUT'
            ? { timeout: `${this.rpcBlockmlTimeoutMs} ms` }
            : undefined,
        originalError:
          result.error.code === 'BACKEND_ERROR_RESPONSE_FROM_BLOCKML' &&
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

    let output: BlockmlSuccessOutput<TRequest> = result.value;

    return output;
  }

  async sendToBlockmlResult<TRequest extends ToBlockmlRequest>(item: {
    request: TRequest;
    orgId: string;
    repoId: string;
  }): Result.ResultAsync<
    BlockmlSuccessOutput<TRequest>,
    SendToBlockmlResultError
  > {
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
      RequestResultError
    > = await this.requestResult<
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
      return Result.fail({
        code: 'BACKEND_ERROR_RESPONSE_FROM_BLOCKML',
        originalError:
          response.error.code === 'BLOCKML_INVALID_REQUEST'
            ? {
                code: response.error.code,
                displayData: response.error.displayData
              }
            : { code: response.error.code }
      });
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
      SendToDiskResultError
    > = await this.sendToDiskResult(item);

    if (Result.isFailure(result)) {
      throw new ServerError({
        message: result.error.code,
        displayData:
          result.error.code === 'BACKEND_INVALID_REQUEST'
            ? result.error.displayData
            : undefined,
        customData:
          result.error.code === 'BACKEND_RPC_TIMEOUT'
            ? { timeout: `${this.rpcDiskTimeoutMs} ms` }
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

  async sendToDiskResult<TRequest extends ToDiskRequest>(item: {
    request: TRequest;
  }): Result.ResultAsync<DiskSuccessOutput<TRequest>, SendToDiskResultError> {
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

    let diskShard: Result.Result<string, CalculateDiskShardResultError> =
      calculateDiskShardResult({
        shardKey: route.shardKey,
        totalDiskShards: this.totalDiskShards
      });

    if (Result.isFailure(diskShard)) {
      return diskShard;
    }

    let result: Result.Result<
      ToDiskResponseForOperation<TRequest['operation']>,
      RequestResultError
    > = await this.requestResult<
      ToDiskResponseForOperation<TRequest['operation']>
    >({
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
      // Match the legacy boundary: forward only public code/displayData fields,
      // never arbitrary worker response properties or diagnostic payloads.
      switch (response.error.code) {
        case 'DISK_INVALID_REQUEST':
          return Result.fail({
            code: 'BACKEND_ERROR_RESPONSE_FROM_DISK',
            originalError: {
              code: response.error.code,
              displayData: response.error.displayData
            }
          });
        case 'DISK_PATH_TRAVERSAL':
          return Result.fail({
            code: 'BACKEND_ERROR_RESPONSE_FROM_DISK',
            originalError: {
              code: response.error.code,
              displayData: response.error.displayData
            }
          });
        case 'DISK_REPO_IS_NOT_CLEAN_FOR_CHECKOUT_BRANCH':
          return Result.fail({
            code: 'BACKEND_ERROR_RESPONSE_FROM_DISK',
            originalError: {
              code: response.error.code,
              displayData: response.error.displayData
            }
          });
        case 'DISK_DEV_REPO_COMMIT_DOES_NOT_MATCH_LOCAL_COMMIT':
          return Result.fail({
            code: 'BACKEND_ERROR_RESPONSE_FROM_DISK',
            originalError: {
              code: response.error.code,
              displayData: response.error.displayData
            }
          });
        default:
          return Result.fail({
            code: 'BACKEND_ERROR_RESPONSE_FROM_DISK',
            originalError: { code: response.error.code }
          });
      }
    }

    return Result.succeed(response.output);
  }

  onModuleDestroy() {
    this.redisClient.disconnect();
  }
}
