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
import { apiToBackend } from './barrels/api-to-backend';
import { common } from './barrels/common';
import { constants } from './barrels/constants';
import { interfaces } from './barrels/interfaces';
import { schemaPostgres } from './barrels/schema-postgres';
import { logResponseBackend } from './functions/log-response-backend';
import { logToConsoleBackend } from './functions/log-to-console-backend';
import { makeErrorResponseBackend } from './functions/make-error-response-backend';
import { makeOkResponseBackend } from './functions/make-ok-response-backend';
import { makeTsNumber } from './functions/make-ts-number';
import { Idemp } from './interfaces/idemp';
import { RedisService } from './services/redis.service';

let retry = require('async-retry');

@Injectable()
export class AppInterceptor implements NestInterceptor {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private logger: Logger,
    private redisService: RedisService
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Promise<Observable<common.MyResponse>> {
    let request = context.switchToHttp().getRequest();

    // if (common.ToBackendRequestInfoNameEnum.ToBackendWebhookAnalyticsEvents) {
    //   return next.handle();
    // }

    request.start_ts = Date.now();

    let req: apiToBackend.ToBackendRequest = request.body;
    let user: schemaPostgres.UserEnt = request.user;
    // let sessionStId: string = request.session?.getUserId();

    let iKey = req?.info?.idempotencyKey;
    let stId = common.isDefined(user?.userId)
      ? user.userId
      : constants.UNK_ST_ID;
    // let stId = common.isDefined(sessionStId)
    // ? sessionStId
    // : constants.ST_ID_UNK;

    let idemp = common.isUndefined(iKey)
      ? undefined
      : await this.redisService.find({ id: iKey }); // stId
    if (common.isUndefined(idemp) && common.isDefined(iKey)) {
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

    if (common.isDefined(idemp) && common.isUndefined(idemp.resp)) {
      try {
        await retry(
          async (bail: any, num: number) => {
            let idempX = await this.redisService.find({ id: iKey }); // stId

            if (common.isUndefined(idempX.resp)) {
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
                log: new common.ServerError({
                  message: common.ErEnum.BACKEND_GET_IDEMP_RESP_RETRY,
                  originalError: e
                }),
                logLevel: common.LogLevelEnum.Error,
                logger: this.logger,
                cs: this.cs
              });
            }
          }
        );
      } catch (e) {
        let err = new common.ServerError({
          message: common.ErEnum.BACKEND_GET_IDEMP_RESP_RETRY_FAILED,
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

    return common.isUndefined(idemp)
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

            if (common.isDefined(iKey)) {
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
              logLevel: common.LogLevelEnum.Info,
              cs: this.cs,
              logger: this.logger
            })
          )
        )
      : common.isDefined(idemp.resp)
      ? of(idemp.resp).pipe(
          map(x => {
            (x as common.MyResponse).info.duration =
              Date.now() - request.start_ts; // update

            return x as unknown as common.MyResponse;
          }),
          tap(x =>
            logResponseBackend({
              response: x,
              logLevel: common.LogLevelEnum.Info,
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
              logLevel: common.LogLevelEnum.Info,
              cs: this.cs,
              logger: this.logger
            })
          )
        );
  }
}
