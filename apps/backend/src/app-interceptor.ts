import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable, of } from 'rxjs';
import { map, mergeMap, tap } from 'rxjs/operators';
import { UNK_ST_ID } from '~common/constants/top-backend';
import { ErEnum } from '~common/enums/er.enum';
import { LogLevelEnum } from '~common/enums/log-level.enum';
import { BackendConfig } from '~common/interfaces/backend/backend-config';
import { MyResponse } from '~common/interfaces/to/my-response';
import { ServerError } from '~common/models/server-error';
import { logResponseBackend } from './functions/log-response-backend';
import { logToConsoleBackend } from './functions/log-to-console-backend';
import { makeErrorResponseBackend } from './functions/make-error-response-backend';
import { makeOkResponseBackend } from './functions/make-ok-response-backend';
import { makeTsNumber } from './functions/make-ts-number';
import { Idemp } from './interfaces/idemp';
import { RedisService } from './services/redis.service';

import { isDefined } from '~common/functions/is-defined';
import { isUndefined } from '~common/functions/is-undefined';
import { ToBackendRequest } from '~common/interfaces/to-backend/to-backend-request';
import { UserEnt } from './drizzle/postgres/schema/users';

let retry = require('async-retry');

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
  ): Promise<Observable<MyResponse>> {
    let request = context.switchToHttp().getRequest();

    // if (ToBackendRequestInfoNameEnum.ToBackendWebhookAnalyticsEvents) {
    //   return next.handle();
    // }

    request.start_ts = Date.now();

    let req: ToBackendRequest = request.body;
    let user: UserEnt = request.user;
    // let sessionStId: string = request.session?.getUserId();

    let iKey = req?.info?.idempotencyKey;
    let stId = isDefined(user?.userId) ? user.userId : UNK_ST_ID;
    // let stId = isDefined(sessionStId)
    // ? sessionStId
    // : ST_ID_UNK;

    let idemp = isUndefined(iKey)
      ? undefined
      : await this.redisService.find({ id: iKey }); // stId
    if (isUndefined(idemp) && isDefined(iKey)) {
      let idempWr: Idemp = {
        idempotencyKey: iKey,
        stId: stId,
        req: req,
        resp: undefined,
        serverTs: makeTsNumber()
      };

      await this.redisService.write({
        id: idempWr.idempotencyKey,
        data: idempWr
      });
    }

    let respX;

    if (isDefined(idemp) && isUndefined(idemp.resp)) {
      try {
        await retry(
          async (bail: any, num: number) => {
            let idempX = await this.redisService.find({ id: iKey }); // stId

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
                  message: ErEnum.BACKEND_GET_IDEMP_RESP_RETRY,
                  originalError: e
                }),
                logLevel: LogLevelEnum.Error,
                logger: this.logger,
                cs: this.cs
              });
            }
          }
        );
      } catch (e) {
        let err = new ServerError({
          message: ErEnum.BACKEND_GET_IDEMP_RESP_RETRY_FAILED,
          originalError: e
        });

        respX = makeErrorResponseBackend({
          e: err,
          body: req,
          path: request.url,
          method: request.method,
          duration: Date.now() - request.start_ts,
          skipLog: true,
          cs: this.cs,
          logger: this.logger
        });

        let idempA: Idemp = {
          idempotencyKey: iKey,
          stId: stId,
          req: req,
          resp: respX,
          serverTs: makeTsNumber()
        };

        await this.redisService.write({
          id: idempA.idempotencyKey,
          data: idempA
        });
      }
    }

    return isUndefined(idemp)
      ? next.handle().pipe(
          mergeMap(async payload => {
            let resp = makeOkResponseBackend({
              payload: payload,
              path: request.url,
              method: request.method,
              duration: Date.now() - request.start_ts,
              body: req,
              skipLog: true,
              cs: this.cs,
              logger: this.logger
            });

            if (isDefined(iKey)) {
              let idempB: Idemp = {
                idempotencyKey: iKey,
                stId: stId,
                req: req,
                resp: resp,
                serverTs: makeTsNumber()
              };

              await this.redisService.write({
                id: idempB.idempotencyKey,
                data: idempB
              });
            }

            resp.info.duration = Date.now() - request.start_ts; // update

            return resp;
          }),
          tap(x =>
            logResponseBackend({
              response: x,
              logLevel: LogLevelEnum.Info,
              cs: this.cs,
              logger: this.logger
            })
          )
        )
      : isDefined(idemp.resp)
        ? of(idemp.resp).pipe(
            map(x => {
              (x as MyResponse).info.duration = Date.now() - request.start_ts; // update

              return x as unknown as MyResponse;
            }),
            tap(x =>
              logResponseBackend({
                response: x,
                logLevel: LogLevelEnum.Info,
                cs: this.cs,
                logger: this.logger
              })
            )
          )
        : of(respX).pipe(
            map(x => {
              x.info.duration = Date.now() - request.start_ts; // update
              return x;
            }),
            tap(x =>
              logResponseBackend({
                response: x,
                logLevel: LogLevelEnum.Info,
                cs: this.cs,
                logger: this.logger
              })
            )
          );
  }
}
