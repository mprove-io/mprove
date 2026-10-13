import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import retry from 'async-retry';
import { Observable, of } from 'rxjs';
import { map, mergeMap, tap } from 'rxjs/operators';
import type { BackendConfig } from '#backend/config/backend-config';
import { SSE_SESSION_EVENTS_PATH } from '#backend/controllers/sessions/get-session-events-sse/get-session-events-sse.controller';
import { makeTsNumber } from '#backend/functions/make-ts-number/make-ts-number';
import { logResponseBackend } from '#backend/functions/top/log-response-backend/log-response-backend';
import { logToConsoleBackend } from '#backend/functions/top/log-to-console-backend/log-to-console-backend';
import { makeBackendResultResponse } from '#backend/functions/top/make-backend-result-response/make-backend-result-response';
import { makeErrorResponseBackend } from '#backend/functions/top/make-error-response-backend/make-error-response-backend';
import { validateToBackendRequestResult } from '#backend/functions/top/validate-to-backend-request/validate-to-backend-request';
import { RedisService } from '#backend/services/redis/redis.service';
import { ServerError } from '#common/classes/server-error/server-error';
import { UNK_ST_ID } from '#common/constants/top-backend';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { ValidateToBackendRequestError } from '#common/types/backend/function-errors/validate-to-backend-request-error';
import type { ToBackendRequest } from '#common/types/backend/request/to-backend-request';
import { toBackendTelemetryRouteValues } from '#common/types/backend/request/to-backend-telemetry-route';
import type { ToBackendResponse } from '#common/types/backend/response/to-backend-response';
import {
  type WrappedError,
  wrapError
} from '#node-common/functions/wrap-error/wrap-error';
import type { UserTab } from './drizzle/postgres/schema/_tabs';
import { Idemp } from './interfaces/idemp';

type ResponseWithWrappedError = {
  response: ToBackendResponse;
  wrappedError?: WrappedError;
};

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

    let requestResult: Result.Result<
      ToBackendRequest,
      ValidateToBackendRequestError
    > = validateToBackendRequestResult({
      path: request.url,
      body: request.body
    });

    // Nest rejection remains outside domain validation and before idempotency lookup.
    if (Result.isFailure(requestResult)) {
      throw new ServerError({
        message: requestResult.error.code,
        displayData: requestResult.error.displayData
      });
    }

    let req: ToBackendRequest = requestResult.value;

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

    let idempResponseOutput: ResponseWithWrappedError;

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

            idempResponseOutput = { response: idempX.resp };
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

        let resultX: ReturnType<typeof makeErrorResponseBackend> =
          makeErrorResponseBackend({
            e: err,
            body: req,
            path: request.url,
            method: request.method,
            mproveVersion:
              this.cs.get<BackendConfig['mproveReleaseTag']>(
                'mproveReleaseTag'
              ),
            duration: Date.now() - request.start_ts,
            cs: this.cs,
            logger: this.logger
          });

        idempResponseOutput = {
          response: resultX.resp,
          wrappedError: resultX.wrappedError
        };

        let idempA: Idemp = {
          idempotencyKey: iKey,
          stId: stId,
          req: req,
          resp: idempResponseOutput.response,
          serverTs: makeTsNumber()
        };

        await this.redisService.write({
          id: `backend-api:${req.operation}:${idempA.idempotencyKey}`,
          data: idempA
        });
      }
    }

    let execution: Observable<ResponseWithWrappedError>;

    if (isUndefined(idemp)) {
      execution = makeBackendResultResponse({
        operation: req.operation,
        execution: next.handle(),
        traceId: req.traceId,
        method: request.method,
        cs: this.cs,
        startTs: request.start_ts
      });
    }

    let responseExecution: Observable<ToBackendResponse> = isUndefined(idemp)
      ? execution.pipe(
          mergeMap(async responseOutput => {
            let { response: resp } = responseOutput;

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

            return responseOutput;
          }),
          tap(x =>
            logResponseBackend({
              response: x.response,
              wrappedError: x.wrappedError,
              logLevel: 'Info',
              cs: this.cs,
              logger: this.logger
            })
          ),
          map(x => x.response)
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
        : of(idempResponseOutput).pipe(
            map(x => {
              x.response.duration = Date.now() - request.start_ts; // update

              return x;
            }),
            tap(y =>
              logResponseBackend({
                response: y.response,
                wrappedError: y.wrappedError,
                logLevel: 'Info',
                cs: this.cs,
                logger: this.logger
              })
            ),
            map(x => x.response)
          );

    return responseExecution;
  }
}
