import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import retry from 'async-retry';
import { Observable, of } from 'rxjs';
import { map, mergeMap, tap } from 'rxjs/operators';
import { BackendConfig } from '#backend/config/backend-config';
import { SSE_SESSION_EVENTS_PATH } from '#backend/controllers/sessions/get-session-events-sse/get-session-events-sse.controller';
import { makeTsNumber } from '#backend/functions/make-ts-number/make-ts-number';
import { makeBackendResultResponse } from '#backend/functions/temp/make-backend-result-response/make-backend-result-response';
import { logResponseBackend } from '#backend/functions/top/log-response-backend/log-response-backend';
import { logToConsoleBackend } from '#backend/functions/top/log-to-console-backend/log-to-console-backend';
import { makeErrorResponseBackend } from '#backend/functions/top/make-error-response-backend/make-error-response-backend';
import { makeOkResponseBackend } from '#backend/functions/top/make-ok-response-backend/make-ok-response-backend';
import { validateToBackendRequest } from '#backend/functions/top/validate-to-backend-request/validate-to-backend-request';
import { RedisService } from '#backend/services/redis/redis.service';
import { ServerError } from '#common/classes/server-error/server-error';
import { UNK_ST_ID } from '#common/constants/top-backend';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { ToBackendRequest } from '#common/types/backend/request/to-backend-request';
import { toBackendTelemetryRouteValues } from '#common/types/backend/request/to-backend-telemetry-route';
import type { ToBackendResponse } from '#common/types/backend/response/to-backend-response';
import {
  type WrappedError,
  wrapError
} from '#node-common/functions/wrap-error/wrap-error';
import type { UserTab } from './drizzle/postgres/schema/_tabs';
import { Idemp } from './interfaces/idemp';

@Injectable()
export class AppInterceptor implements NestInterceptor {
  constructor(
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    private redisService: RedisService
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Promise<Observable<ToBackendResponse>> {
    let request = context.switchToHttp().getRequest();

    let isTelemetryRoute: boolean = toBackendTelemetryRouteValues.some(
      route => route === request?.originalUrl.substring(1)
    );

    if (
      request?.originalUrl?.startsWith('/api/mcp') ||
      request?.originalUrl?.startsWith('/api/full-mcp.json') ||
      request?.originalUrl?.startsWith('/' + SSE_SESSION_EVENTS_PATH) ||
      isTelemetryRoute
    ) {
      return next.handle();
    }

    request.start_ts = Date.now();

    let req: ToBackendRequest = validateToBackendRequest({
      path: request.url,
      body: request.body
    });
    let user: UserTab = request.user;

    let iKey = req?.idempotencyKey;
    let stId = isDefined(user?.userId) ? user.userId : UNK_ST_ID;

    let idemp = isUndefined(iKey)
      ? undefined
      : await this.redisService.find({
          id: `backend-api:${req.operation}:${iKey}`
        });

    if (isDefined(idemp) && !!idemp.stId && idemp.stId !== stId) {
      throw new ServerError({
        message: 'BACKEND_IDEMP_USER_MISMATCH'
      });
    }

    if (isUndefined(idemp) && isDefined(iKey)) {
      let idempWr: Idemp = {
        idempotencyKey: iKey,
        stId: stId,
        req: req,
        resp: undefined,
        serverTs: makeTsNumber()
      };

      await this.redisService.write({
        id: `backend-api:${req.operation}:${idempWr.idempotencyKey}`,
        data: idempWr
      });
    }

    let wrappedError: WrappedError;
    let respX;

    if (isDefined(idemp) && isUndefined(idemp.resp)) {
      try {
        await retry(
          async (bail: any, num: number) => {
            let idempX = await this.redisService.find({
              id: `backend-api:${req.operation}:${iKey}`
            });

            if (isUndefined(idempX.resp)) {
              bail(new Error(`Idemp resp is still empty, attempt ${num}`));
            }

            respX = idempX.resp;
          },
          {
            retries: 2, // (default 10)
            minTimeout: 3000, // ms (default 1000)
            factor: 1, // (default 2)
            randomize: false, // 1 to 2 (default true)
            onRetry: (e: any) => {
              logToConsoleBackend({
                log: new ServerError({
                  message: 'BACKEND_GET_IDEMP_RESP_RETRY',
                  originalError: e
                }),
                logLevel: 'Error',
                logger: this.logger,
                cs: this.cs
              });
            }
          }
        );
      } catch (e) {
        let err = new ServerError({
          message: 'BACKEND_GET_IDEMP_RESP_RETRY_FAILED',
          originalError: e
        });

        let resultX = makeErrorResponseBackend({
          e: err,
          body: req,
          path: request.url,
          method: request.method,
          mproveVersion:
            this.cs.get<BackendConfig['mproveReleaseTag']>('mproveReleaseTag'),
          duration: Date.now() - request.start_ts,
          cs: this.cs,
          logger: this.logger
        });

        respX = resultX.resp;
        wrappedError = resultX.wrappedError;

        let idempA: Idemp = {
          idempotencyKey: iKey,
          stId: stId,
          req: req,
          resp: respX,
          serverTs: makeTsNumber()
        };

        await this.redisService.write({
          id: `backend-api:${req.operation}:${idempA.idempotencyKey}`,
          data: idempA
        });
      }
    }

    // Explicit operation cutover: other endpoints retain their payload path.
    // Do not infer the transport mode from the shape of the returned value.
    let execution: Observable<ToBackendResponse>;

    if (isUndefined(idemp)) {
      if (req.operation === 'setProjectInfo') {
        execution = makeBackendResultResponse({
          operation: 'setProjectInfo',
          execution: next.handle(),
          traceId: req.traceId,
          method: request.method,
          cs: this.cs,
          startTs: request.start_ts,
          onUnexpectedError: error => {
            wrappedError = error;
          }
        });
      } else if (req.operation === 'setProjectSandboxProvider') {
        execution = makeBackendResultResponse({
          operation: 'setProjectSandboxProvider',
          execution: next.handle(),
          traceId: req.traceId,
          method: request.method,
          cs: this.cs,
          startTs: request.start_ts,
          onUnexpectedError: error => {
            wrappedError = error;
          }
        });
      } else if (req.operation === 'createProject') {
        execution = makeBackendResultResponse({
          operation: 'createProject',
          execution: next.handle(),
          traceId: req.traceId,
          method: request.method,
          cs: this.cs,
          startTs: request.start_ts,
          onUnexpectedError: error => {
            wrappedError = error;
          }
        });
      } else if (req.operation === 'deleteProject') {
        execution = makeBackendResultResponse({
          operation: 'deleteProject',
          execution: next.handle(),
          traceId: req.traceId,
          method: request.method,
          cs: this.cs,
          startTs: request.start_ts,
          onUnexpectedError: error => {
            wrappedError = error;
          }
        });
      } else if (req.operation === 'generateProjectRemoteKey') {
        execution = makeBackendResultResponse({
          operation: 'generateProjectRemoteKey',
          execution: next.handle(),
          traceId: req.traceId,
          method: request.method,
          cs: this.cs,
          startTs: request.start_ts,
          onUnexpectedError: error => {
            wrappedError = error;
          }
        });
      } else if (req.operation === 'getProject') {
        execution = makeBackendResultResponse({
          operation: 'getProject',
          execution: next.handle(),
          traceId: req.traceId,
          method: request.method,
          cs: this.cs,
          startTs: request.start_ts,
          onUnexpectedError: error => {
            wrappedError = error;
          }
        });
      } else if (req.operation === 'getProjectsList') {
        execution = makeBackendResultResponse({
          operation: 'getProjectsList',
          execution: next.handle(),
          traceId: req.traceId,
          method: request.method,
          cs: this.cs,
          startTs: request.start_ts,
          onUnexpectedError: error => {
            wrappedError = error;
          }
        });
      } else if (req.operation === 'isProjectExist') {
        execution = makeBackendResultResponse({
          operation: 'isProjectExist',
          execution: next.handle(),
          traceId: req.traceId,
          method: request.method,
          cs: this.cs,
          startTs: request.start_ts,
          onUnexpectedError: error => {
            wrappedError = error;
          }
        });
      } else if (req.operation === 'createOrg') {
        execution = makeBackendResultResponse({
          operation: 'createOrg',
          execution: next.handle(),
          traceId: req.traceId,
          method: request.method,
          cs: this.cs,
          startTs: request.start_ts,
          onUnexpectedError: error => {
            wrappedError = error;
          }
        });
      } else if (req.operation === 'deleteOrg') {
        execution = makeBackendResultResponse({
          operation: 'deleteOrg',
          execution: next.handle(),
          traceId: req.traceId,
          method: request.method,
          cs: this.cs,
          startTs: request.start_ts,
          onUnexpectedError: error => {
            wrappedError = error;
          }
        });
      } else if (req.operation === 'getOrg') {
        execution = makeBackendResultResponse({
          operation: 'getOrg',
          execution: next.handle(),
          traceId: req.traceId,
          method: request.method,
          cs: this.cs,
          startTs: request.start_ts,
          onUnexpectedError: error => {
            wrappedError = error;
          }
        });
      } else if (req.operation === 'getOrgsList') {
        execution = makeBackendResultResponse({
          operation: 'getOrgsList',
          execution: next.handle(),
          traceId: req.traceId,
          method: request.method,
          cs: this.cs,
          startTs: request.start_ts,
          onUnexpectedError: error => {
            wrappedError = error;
          }
        });
      } else if (req.operation === 'isOrgExist') {
        execution = makeBackendResultResponse({
          operation: 'isOrgExist',
          execution: next.handle(),
          traceId: req.traceId,
          method: request.method,
          cs: this.cs,
          startTs: request.start_ts,
          onUnexpectedError: error => {
            wrappedError = error;
          }
        });
      } else if (req.operation === 'setOrgInfo') {
        execution = makeBackendResultResponse({
          operation: 'setOrgInfo',
          execution: next.handle(),
          traceId: req.traceId,
          method: request.method,
          cs: this.cs,
          startTs: request.start_ts,
          onUnexpectedError: error => {
            wrappedError = error;
          }
        });
      } else if (req.operation === 'setOrgOwner') {
        execution = makeBackendResultResponse({
          operation: 'setOrgOwner',
          execution: next.handle(),
          traceId: req.traceId,
          method: request.method,
          cs: this.cs,
          startTs: request.start_ts,
          onUnexpectedError: error => {
            wrappedError = error;
          }
        });
      } else if (req.operation === 'createProvider') {
        execution = makeBackendResultResponse({
          operation: 'createProvider',
          execution: next.handle(),
          traceId: req.traceId,
          method: request.method,
          cs: this.cs,
          startTs: request.start_ts,
          onUnexpectedError: error => {
            wrappedError = error;
          }
        });
      } else if (req.operation === 'deleteProvider') {
        execution = makeBackendResultResponse({
          operation: 'deleteProvider',
          execution: next.handle(),
          traceId: req.traceId,
          method: request.method,
          cs: this.cs,
          startTs: request.start_ts,
          onUnexpectedError: error => {
            wrappedError = error;
          }
        });
      } else if (req.operation === 'editProvider') {
        execution = makeBackendResultResponse({
          operation: 'editProvider',
          execution: next.handle(),
          traceId: req.traceId,
          method: request.method,
          cs: this.cs,
          startTs: request.start_ts,
          onUnexpectedError: error => {
            wrappedError = error;
          }
        });
      } else if (req.operation === 'getProviders') {
        execution = makeBackendResultResponse({
          operation: 'getProviders',
          execution: next.handle(),
          traceId: req.traceId,
          method: request.method,
          cs: this.cs,
          startTs: request.start_ts,
          onUnexpectedError: error => {
            wrappedError = error;
          }
        });
      } else if (req.operation === 'toggleProvider') {
        execution = makeBackendResultResponse({
          operation: 'toggleProvider',
          execution: next.handle(),
          traceId: req.traceId,
          method: request.method,
          cs: this.cs,
          startTs: request.start_ts,
          onUnexpectedError: error => {
            wrappedError = error;
          }
        });
      } else if (req.operation === 'createEnv') {
        execution = makeBackendResultResponse({
          operation: 'createEnv',
          execution: next.handle(),
          traceId: req.traceId,
          method: request.method,
          cs: this.cs,
          startTs: request.start_ts,
          onUnexpectedError: error => {
            wrappedError = error;
          }
        });
      } else if (req.operation === 'deleteEnv') {
        execution = makeBackendResultResponse({
          operation: 'deleteEnv',
          execution: next.handle(),
          traceId: req.traceId,
          method: request.method,
          cs: this.cs,
          startTs: request.start_ts,
          onUnexpectedError: error => {
            wrappedError = error;
          }
        });
      } else if (req.operation === 'createEnvUser') {
        execution = makeBackendResultResponse({
          operation: 'createEnvUser',
          execution: next.handle(),
          traceId: req.traceId,
          method: request.method,
          cs: this.cs,
          startTs: request.start_ts,
          onUnexpectedError: error => {
            wrappedError = error;
          }
        });
      } else if (req.operation === 'deleteEnvUser') {
        execution = makeBackendResultResponse({
          operation: 'deleteEnvUser',
          execution: next.handle(),
          traceId: req.traceId,
          method: request.method,
          cs: this.cs,
          startTs: request.start_ts,
          onUnexpectedError: error => {
            wrappedError = error;
          }
        });
      } else if (req.operation === 'createEnvVar') {
        execution = makeBackendResultResponse({
          operation: 'createEnvVar',
          execution: next.handle(),
          traceId: req.traceId,
          method: request.method,
          cs: this.cs,
          startTs: request.start_ts,
          onUnexpectedError: error => {
            wrappedError = error;
          }
        });
      } else if (req.operation === 'deleteEnvVar') {
        execution = makeBackendResultResponse({
          operation: 'deleteEnvVar',
          execution: next.handle(),
          traceId: req.traceId,
          method: request.method,
          cs: this.cs,
          startTs: request.start_ts,
          onUnexpectedError: error => {
            wrappedError = error;
          }
        });
      } else if (req.operation === 'editEnvVar') {
        execution = makeBackendResultResponse({
          operation: 'editEnvVar',
          execution: next.handle(),
          traceId: req.traceId,
          method: request.method,
          cs: this.cs,
          startTs: request.start_ts,
          onUnexpectedError: error => {
            wrappedError = error;
          }
        });
      } else if (req.operation === 'editEnvFallbacks') {
        execution = makeBackendResultResponse({
          operation: 'editEnvFallbacks',
          execution: next.handle(),
          traceId: req.traceId,
          method: request.method,
          cs: this.cs,
          startTs: request.start_ts,
          onUnexpectedError: error => {
            wrappedError = error;
          }
        });
      } else if (req.operation === 'getEnvs') {
        execution = makeBackendResultResponse({
          operation: 'getEnvs',
          execution: next.handle(),
          traceId: req.traceId,
          method: request.method,
          cs: this.cs,
          startTs: request.start_ts,
          onUnexpectedError: error => {
            wrappedError = error;
          }
        });
      } else if (req.operation === 'getEnvsList') {
        execution = makeBackendResultResponse({
          operation: 'getEnvsList',
          execution: next.handle(),
          traceId: req.traceId,
          method: request.method,
          cs: this.cs,
          startTs: request.start_ts,
          onUnexpectedError: error => {
            wrappedError = error;
          }
        });
      } else if (req.operation === 'getAvatarBig') {
        execution = makeBackendResultResponse({
          operation: 'getAvatarBig',
          execution: next.handle(),
          traceId: req.traceId,
          method: request.method,
          cs: this.cs,
          startTs: request.start_ts,
          onUnexpectedError: error => {
            wrappedError = error;
          }
        });
      } else if (req.operation === 'setAvatar') {
        execution = makeBackendResultResponse({
          operation: 'setAvatar',
          execution: next.handle(),
          traceId: req.traceId,
          method: request.method,
          cs: this.cs,
          startTs: request.start_ts,
          onUnexpectedError: error => {
            wrappedError = error;
          }
        });
      } else if (req.operation === 'createRole') {
        execution = makeBackendResultResponse({
          operation: 'createRole',
          execution: next.handle(),
          traceId: req.traceId,
          method: request.method,
          cs: this.cs,
          startTs: request.start_ts,
          onUnexpectedError: error => {
            wrappedError = error;
          }
        });
      } else if (req.operation === 'deleteRole') {
        execution = makeBackendResultResponse({
          operation: 'deleteRole',
          execution: next.handle(),
          traceId: req.traceId,
          method: request.method,
          cs: this.cs,
          startTs: request.start_ts,
          onUnexpectedError: error => {
            wrappedError = error;
          }
        });
      } else if (req.operation === 'createRoleGiven') {
        execution = makeBackendResultResponse({
          operation: 'createRoleGiven',
          execution: next.handle(),
          traceId: req.traceId,
          method: request.method,
          cs: this.cs,
          startTs: request.start_ts,
          onUnexpectedError: error => {
            wrappedError = error;
          }
        });
      } else if (req.operation === 'deleteRoleGiven') {
        execution = makeBackendResultResponse({
          operation: 'deleteRoleGiven',
          execution: next.handle(),
          traceId: req.traceId,
          method: request.method,
          cs: this.cs,
          startTs: request.start_ts,
          onUnexpectedError: error => {
            wrappedError = error;
          }
        });
      } else if (req.operation === 'editRoleGiven') {
        execution = makeBackendResultResponse({
          operation: 'editRoleGiven',
          execution: next.handle(),
          traceId: req.traceId,
          method: request.method,
          cs: this.cs,
          startTs: request.start_ts,
          onUnexpectedError: error => {
            wrappedError = error;
          }
        });
      } else if (req.operation === 'getRoles') {
        execution = makeBackendResultResponse({
          operation: 'getRoles',
          execution: next.handle(),
          traceId: req.traceId,
          method: request.method,
          cs: this.cs,
          startTs: request.start_ts,
          onUnexpectedError: error => {
            wrappedError = error;
          }
        });
      } else if (req.operation === 'createGiven') {
        execution = makeBackendResultResponse({
          operation: 'createGiven',
          execution: next.handle(),
          traceId: req.traceId,
          method: request.method,
          cs: this.cs,
          startTs: request.start_ts,
          onUnexpectedError: error => {
            wrappedError = error;
          }
        });
      } else if (req.operation === 'deleteGiven') {
        execution = makeBackendResultResponse({
          operation: 'deleteGiven',
          execution: next.handle(),
          traceId: req.traceId,
          method: request.method,
          cs: this.cs,
          startTs: request.start_ts,
          onUnexpectedError: error => {
            wrappedError = error;
          }
        });
      } else if (req.operation === 'editGiven') {
        execution = makeBackendResultResponse({
          operation: 'editGiven',
          execution: next.handle(),
          traceId: req.traceId,
          method: request.method,
          cs: this.cs,
          startTs: request.start_ts,
          onUnexpectedError: error => {
            wrappedError = error;
          }
        });
      } else if (req.operation === 'getGivens') {
        execution = makeBackendResultResponse({
          operation: 'getGivens',
          execution: next.handle(),
          traceId: req.traceId,
          method: request.method,
          cs: this.cs,
          startTs: request.start_ts,
          onUnexpectedError: error => {
            wrappedError = error;
          }
        });
      } else if (req.operation === 'createFolder') {
        execution = makeBackendResultResponse({
          operation: 'createFolder',
          execution: next.handle(),
          traceId: req.traceId,
          method: request.method,
          cs: this.cs,
          startTs: request.start_ts,
          onUnexpectedError: error => {
            wrappedError = error;
          }
        });
      } else if (req.operation === 'deleteFolder') {
        execution = makeBackendResultResponse({
          operation: 'deleteFolder',
          execution: next.handle(),
          traceId: req.traceId,
          method: request.method,
          cs: this.cs,
          startTs: request.start_ts,
          onUnexpectedError: error => {
            wrappedError = error;
          }
        });
      } else if (req.operation === 'moveCatalogNode') {
        execution = makeBackendResultResponse({
          operation: 'moveCatalogNode',
          execution: next.handle(),
          traceId: req.traceId,
          method: request.method,
          cs: this.cs,
          startTs: request.start_ts,
          onUnexpectedError: error => {
            wrappedError = error;
          }
        });
      } else if (req.operation === 'renameCatalogNode') {
        execution = makeBackendResultResponse({
          operation: 'renameCatalogNode',
          execution: next.handle(),
          traceId: req.traceId,
          method: request.method,
          cs: this.cs,
          startTs: request.start_ts,
          onUnexpectedError: error => {
            wrappedError = error;
          }
        });
      } else if (req.operation === 'getSkills') {
        execution = makeBackendResultResponse({
          operation: 'getSkills',
          execution: next.handle(),
          traceId: req.traceId,
          method: request.method,
          cs: this.cs,
          startTs: request.start_ts,
          onUnexpectedError: error => {
            wrappedError = error;
          }
        });
      } else if (req.operation === 'createBranch') {
        execution = makeBackendResultResponse({
          operation: 'createBranch',
          execution: next.handle(),
          traceId: req.traceId,
          method: request.method,
          cs: this.cs,
          startTs: request.start_ts,
          onUnexpectedError: error => {
            wrappedError = error;
          }
        });
      } else if (req.operation === 'deleteBranch') {
        execution = makeBackendResultResponse({
          operation: 'deleteBranch',
          execution: next.handle(),
          traceId: req.traceId,
          method: request.method,
          cs: this.cs,
          startTs: request.start_ts,
          onUnexpectedError: error => {
            wrappedError = error;
          }
        });
      } else if (req.operation === 'getBranchesList') {
        execution = makeBackendResultResponse({
          operation: 'getBranchesList',
          execution: next.handle(),
          traceId: req.traceId,
          method: request.method,
          cs: this.cs,
          startTs: request.start_ts,
          onUnexpectedError: error => {
            wrappedError = error;
          }
        });
      } else if (req.operation === 'isBranchExist') {
        execution = makeBackendResultResponse({
          operation: 'isBranchExist',
          execution: next.handle(),
          traceId: req.traceId,
          method: request.method,
          cs: this.cs,
          startTs: request.start_ts,
          onUnexpectedError: error => {
            wrappedError = error;
          }
        });
      } else if (req.operation === 'getStruct') {
        execution = makeBackendResultResponse({
          operation: 'getStruct',
          execution: next.handle(),
          traceId: req.traceId,
          method: request.method,
          cs: this.cs,
          startTs: request.start_ts,
          onUnexpectedError: error => {
            wrappedError = error;
          }
        });
      } else if (req.operation === 'getModel') {
        execution = makeBackendResultResponse({
          operation: 'getModel',
          execution: next.handle(),
          traceId: req.traceId,
          method: request.method,
          cs: this.cs,
          startTs: request.start_ts,
          onUnexpectedError: error => {
            wrappedError = error;
          }
        });
      } else if (req.operation === 'getModels') {
        execution = makeBackendResultResponse({
          operation: 'getModels',
          execution: next.handle(),
          traceId: req.traceId,
          method: request.method,
          cs: this.cs,
          startTs: request.start_ts,
          onUnexpectedError: error => {
            wrappedError = error;
          }
        });
      } else if (req.operation === 'getSuggestFields') {
        execution = makeBackendResultResponse({
          operation: 'getSuggestFields',
          execution: next.handle(),
          traceId: req.traceId,
          method: request.method,
          cs: this.cs,
          startTs: request.start_ts,
          onUnexpectedError: error => {
            wrappedError = error;
          }
        });
      } else if (req.operation === 'createLlmModel') {
        execution = makeBackendResultResponse({
          operation: 'createLlmModel',
          execution: next.handle(),
          traceId: req.traceId,
          method: request.method,
          cs: this.cs,
          startTs: request.start_ts,
          onUnexpectedError: error => {
            wrappedError = error;
          }
        });
      } else if (req.operation === 'editLlmModel') {
        execution = makeBackendResultResponse({
          operation: 'editLlmModel',
          execution: next.handle(),
          traceId: req.traceId,
          method: request.method,
          cs: this.cs,
          startTs: request.start_ts,
          onUnexpectedError: error => {
            wrappedError = error;
          }
        });
      } else if (req.operation === 'deleteLlmModel') {
        execution = makeBackendResultResponse({
          operation: 'deleteLlmModel',
          execution: next.handle(),
          traceId: req.traceId,
          method: request.method,
          cs: this.cs,
          startTs: request.start_ts,
          onUnexpectedError: error => {
            wrappedError = error;
          }
        });
      } else if (req.operation === 'getLlmModelParts') {
        execution = makeBackendResultResponse({
          operation: 'getLlmModelParts',
          execution: next.handle(),
          traceId: req.traceId,
          method: request.method,
          cs: this.cs,
          startTs: request.start_ts,
          onUnexpectedError: error => {
            wrappedError = error;
          }
        });
      } else if (req.operation === 'getLlmModelsWithProvider') {
        execution = makeBackendResultResponse({
          operation: 'getLlmModelsWithProvider',
          execution: next.handle(),
          traceId: req.traceId,
          method: request.method,
          cs: this.cs,
          startTs: request.start_ts,
          onUnexpectedError: error => {
            wrappedError = error;
          }
        });
      } else if (req.operation === 'checkSignUp') {
        execution = makeBackendResultResponse({
          operation: 'checkSignUp',
          execution: next.handle(),
          traceId: req.traceId,
          method: request.method,
          cs: this.cs,
          startTs: request.start_ts,
          onUnexpectedError: error => {
            wrappedError = error;
          }
        });
      } else if (req.operation === 'setFavorite') {
        execution = makeBackendResultResponse({
          operation: 'setFavorite',
          execution: next.handle(),
          traceId: req.traceId,
          method: request.method,
          cs: this.cs,
          startTs: request.start_ts,
          onUnexpectedError: error => {
            wrappedError = error;
          }
        });
      } else if (req.operation === 'commitRepo') {
        execution = makeBackendResultResponse({
          operation: 'commitRepo',
          execution: next.handle(),
          traceId: req.traceId,
          method: request.method,
          cs: this.cs,
          startTs: request.start_ts,
          onUnexpectedError: error => {
            wrappedError = error;
          }
        });
      } else if (req.operation === 'getRepo') {
        execution = makeBackendResultResponse({
          operation: 'getRepo',
          execution: next.handle(),
          traceId: req.traceId,
          method: request.method,
          cs: this.cs,
          startTs: request.start_ts,
          onUnexpectedError: error => {
            wrappedError = error;
          }
        });
      } else if (req.operation === 'mergeRepo') {
        execution = makeBackendResultResponse({
          operation: 'mergeRepo',
          execution: next.handle(),
          traceId: req.traceId,
          method: request.method,
          cs: this.cs,
          startTs: request.start_ts,
          onUnexpectedError: error => {
            wrappedError = error;
          }
        });
      } else if (req.operation === 'pullRepo') {
        execution = makeBackendResultResponse({
          operation: 'pullRepo',
          execution: next.handle(),
          traceId: req.traceId,
          method: request.method,
          cs: this.cs,
          startTs: request.start_ts,
          onUnexpectedError: error => {
            wrappedError = error;
          }
        });
      } else if (req.operation === 'pushRepo') {
        execution = makeBackendResultResponse({
          operation: 'pushRepo',
          execution: next.handle(),
          traceId: req.traceId,
          method: request.method,
          cs: this.cs,
          startTs: request.start_ts,
          onUnexpectedError: error => {
            wrappedError = error;
          }
        });
      } else if (req.operation === 'revertRepoToLastCommit') {
        execution = makeBackendResultResponse({
          operation: 'revertRepoToLastCommit',
          execution: next.handle(),
          traceId: req.traceId,
          method: request.method,
          cs: this.cs,
          startTs: request.start_ts,
          onUnexpectedError: error => {
            wrappedError = error;
          }
        });
      } else if (req.operation === 'revertRepoToRemote') {
        execution = makeBackendResultResponse({
          operation: 'revertRepoToRemote',
          execution: next.handle(),
          traceId: req.traceId,
          method: request.method,
          cs: this.cs,
          startTs: request.start_ts,
          onUnexpectedError: error => {
            wrappedError = error;
          }
        });
      } else if (req.operation === 'syncRepo') {
        execution = makeBackendResultResponse({
          operation: 'syncRepo',
          execution: next.handle(),
          traceId: req.traceId,
          method: request.method,
          cs: this.cs,
          startTs: request.start_ts,
          onUnexpectedError: error => {
            wrappedError = error;
          }
        });
      } else if (req.operation === 'createFile') {
        execution = makeBackendResultResponse({
          operation: 'createFile',
          execution: next.handle(),
          traceId: req.traceId,
          method: request.method,
          cs: this.cs,
          startTs: request.start_ts,
          onUnexpectedError: error => {
            wrappedError = error;
          }
        });
      } else if (req.operation === 'deleteFile') {
        execution = makeBackendResultResponse({
          operation: 'deleteFile',
          execution: next.handle(),
          traceId: req.traceId,
          method: request.method,
          cs: this.cs,
          startTs: request.start_ts,
          onUnexpectedError: error => {
            wrappedError = error;
          }
        });
      } else if (req.operation === 'getFile') {
        execution = makeBackendResultResponse({
          operation: 'getFile',
          execution: next.handle(),
          traceId: req.traceId,
          method: request.method,
          cs: this.cs,
          startTs: request.start_ts,
          onUnexpectedError: error => {
            wrappedError = error;
          }
        });
      } else if (req.operation === 'saveFile') {
        execution = makeBackendResultResponse({
          operation: 'saveFile',
          execution: next.handle(),
          traceId: req.traceId,
          method: request.method,
          cs: this.cs,
          startTs: request.start_ts,
          onUnexpectedError: error => {
            wrappedError = error;
          }
        });
      } else if (req.operation === 'createMember') {
        execution = makeBackendResultResponse({
          operation: 'createMember',
          execution: next.handle(),
          traceId: req.traceId,
          method: request.method,
          cs: this.cs,
          startTs: request.start_ts,
          onUnexpectedError: error => {
            wrappedError = error;
          }
        });
      } else if (req.operation === 'deleteMember') {
        execution = makeBackendResultResponse({
          operation: 'deleteMember',
          execution: next.handle(),
          traceId: req.traceId,
          method: request.method,
          cs: this.cs,
          startTs: request.start_ts,
          onUnexpectedError: error => {
            wrappedError = error;
          }
        });
      } else if (req.operation === 'editMember') {
        execution = makeBackendResultResponse({
          operation: 'editMember',
          execution: next.handle(),
          traceId: req.traceId,
          method: request.method,
          cs: this.cs,
          startTs: request.start_ts,
          onUnexpectedError: error => {
            wrappedError = error;
          }
        });
      } else if (req.operation === 'getMembers') {
        execution = makeBackendResultResponse({
          operation: 'getMembers',
          execution: next.handle(),
          traceId: req.traceId,
          method: request.method,
          cs: this.cs,
          startTs: request.start_ts,
          onUnexpectedError: error => {
            wrappedError = error;
          }
        });
      } else if (req.operation === 'getMembersList') {
        execution = makeBackendResultResponse({
          operation: 'getMembersList',
          execution: next.handle(),
          traceId: req.traceId,
          method: request.method,
          cs: this.cs,
          startTs: request.start_ts,
          onUnexpectedError: error => {
            wrappedError = error;
          }
        });
      } else if (req.operation === 'getMemberGivens') {
        execution = makeBackendResultResponse({
          operation: 'getMemberGivens',
          execution: next.handle(),
          traceId: req.traceId,
          method: request.method,
          cs: this.cs,
          startTs: request.start_ts,
          onUnexpectedError: error => {
            wrappedError = error;
          }
        });
      } else if (req.operation === 'getNav') {
        execution = makeBackendResultResponse({
          operation: 'getNav',
          execution: next.handle(),
          traceId: req.traceId,
          method: request.method,
          cs: this.cs,
          startTs: request.start_ts,
          onUnexpectedError: error => {
            wrappedError = error;
          }
        });
      } else if (req.operation === 'checkLastNav') {
        execution = makeBackendResultResponse({
          operation: 'checkLastNav',
          execution: next.handle(),
          traceId: req.traceId,
          method: request.method,
          cs: this.cs,
          startTs: request.start_ts,
          onUnexpectedError: error => {
            wrappedError = error;
          }
        });
      } else if (req.operation === 'validateFiles') {
        execution = makeBackendResultResponse({
          operation: 'validateFiles',
          execution: next.handle(),
          traceId: req.traceId,
          method: request.method,
          cs: this.cs,
          startTs: request.start_ts,
          onUnexpectedError: error => {
            wrappedError = error;
          }
        });
      } else {
        execution = next.handle().pipe(
          map(payload =>
            makeOkResponseBackend({
              payload: payload,
              path: request.url,
              method: request.method,
              mproveVersion:
                this.cs.get<BackendConfig['mproveReleaseTag']>(
                  'mproveReleaseTag'
                ),
              duration: Date.now() - request.start_ts,
              body: req,
              cs: this.cs,
              logger: this.logger
            })
          )
        );
      }
    }

    return isUndefined(idemp)
      ? execution.pipe(
          mergeMap(async resp => {
            if (
              isDefined(iKey) &&
              req.operation === resp.operation &&
              (resp.type === 'Success' ||
                (resp.error.code !== 'BACKEND_INVALID_REQUEST' &&
                  resp.error.code !== 'BACKEND_IDEMP_USER_MISMATCH'))
            ) {
              let idempB: Idemp = {
                idempotencyKey: iKey,
                stId: stId,
                req: req,
                resp: resp,
                serverTs: makeTsNumber()
              };

              if (resp.type === 'Failure') {
                try {
                  await this.redisService.write({
                    id: `backend-api:${req.operation}:${idempB.idempotencyKey}`,
                    data: idempB
                  });
                } catch (e) {
                  // Match AppFilter: a failure-cache outage must not replace the
                  // original API failure. Keep diagnostics out of the envelope.
                  logToConsoleBackend({
                    log: {
                      event: 'backend-failure-cache-write',
                      error: wrapError(e)
                    },
                    logLevel: 'Error',
                    logger: this.logger,
                    cs: this.cs
                  });
                }
              } else {
                await this.redisService.write({
                  id: `backend-api:${req.operation}:${idempB.idempotencyKey}`,
                  data: idempB
                });
              }
            }

            resp.duration = Date.now() - request.start_ts; // update

            return resp;
          }),
          tap(x =>
            logResponseBackend({
              response: x,
              wrappedError: wrappedError,
              logLevel: 'Info',
              cs: this.cs,
              logger: this.logger
            })
          )
        )
      : isDefined(idemp.resp)
        ? of(idemp.resp).pipe(
            map(x => {
              (x as ToBackendResponse).duration = Date.now() - request.start_ts; // update

              return x as unknown as ToBackendResponse;
            }),
            tap(x =>
              logResponseBackend({
                response: x,
                logLevel: 'Info',
                cs: this.cs,
                logger: this.logger
              })
            )
          )
        : of({ respX: respX, wrappedError: wrappedError }).pipe(
            map(x => {
              x.respX.duration = Date.now() - request.start_ts; // update
              return x.respX;
            }),
            tap(y =>
              logResponseBackend({
                response: y,
                wrappedError: wrappedError,
                logLevel: 'Info',
                cs: this.cs,
                logger: this.logger
              })
            )
          );
  }
}
