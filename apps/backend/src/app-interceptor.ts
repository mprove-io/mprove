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
import { entities } from './barrels/entities';
import { helper } from './barrels/helper';
import { interfaces } from './barrels/interfaces';
import { repositories } from './barrels/repositories';
import { logResponseBackend } from './functions/log-response-backend';
import { logToConsoleBackend } from './functions/log-to-console-backend';
import { makeErrorResponseBackend } from './functions/make-error-response-backend';
import { makeOkResponseBackend } from './functions/make-ok-response-backend';

let retry = require('async-retry');

@Injectable()
export class AppInterceptor implements NestInterceptor {
  constructor(
    private idempsRepository: repositories.IdempsRepository,
    private cs: ConfigService<interfaces.Config>,
    private logger: Logger
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Promise<Observable<common.MyResponse>> {
    let request = context.switchToHttp().getRequest();

    request.start_ts = Date.now();

    let req: apiToBackend.ToBackendRequest = request.body;
    let user: entities.UserEntity = request.user;

    let iKey = req?.info?.idempotencyKey;
    let userId = common.isDefined(user?.user_id)
      ? user.user_id
      : constants.UNK_USER_ID;

    let idemp = common.isUndefined(iKey)
      ? undefined
      : await this.idempsRepository.findOne({
          where: {
            idempotency_key: iKey,
            user_id: userId
          }
        });

    if (common.isUndefined(idemp) && common.isDefined(iKey)) {
      let idempEntity: entities.IdempEntity = {
        idempotency_key: iKey,
        user_id: userId,
        req: req,
        resp: undefined,
        server_ts: helper.makeTs()
      };

      await this.idempsRepository.insert(idempEntity);
    }

    let respX;

    if (common.isDefined(idemp) && common.isUndefined(idemp.resp)) {
      try {
        await retry(
          async (bail: any, num: number) => {
            let idempX = await this.idempsRepository.findOne({
              where: {
                idempotency_key: iKey,
                user_id: userId
              }
            });

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

        let idempEntity: entities.IdempEntity = {
          idempotency_key: iKey,
          user_id: userId,
          req: req,
          resp: respX,
          server_ts: helper.makeTs()
        };

        await this.idempsRepository.save(idempEntity);
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
              let idempEntity: entities.IdempEntity = {
                idempotency_key: iKey,
                user_id: userId,
                req: req,
                resp: resp,
                server_ts: helper.makeTs()
              };

              await this.idempsRepository.save(idempEntity);
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
