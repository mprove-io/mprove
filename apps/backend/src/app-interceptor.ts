import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import { Observable, of } from 'rxjs';
import { map, mergeMap, tap } from 'rxjs/operators';
import { apiToBackend } from './barrels/api-to-backend';
import { common } from './barrels/common';
import { constants } from './barrels/constants';
import { entities } from './barrels/entities';
import { helper } from './barrels/helper';
import { interfaces } from './barrels/interfaces';
import { repositories } from './barrels/repositories';
import { logToConsoleBackend } from './functions/log-to-console-backend';
import { makeErrorResponseBackend } from './functions/make-error-response-backend';
import { makeOkResponseBackend } from './functions/make-ok-response-backend';

let retry = require('async-retry');

@Injectable()
export class AppInterceptor implements NestInterceptor {
  constructor(
    private idempsRepository: repositories.IdempsRepository,
    private cs: ConfigService<interfaces.Config>,
    private pinoLogger: Logger
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
                pinoLogger: this.pinoLogger
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
          request: request,
          skipLog: true,
          cs: this.cs,
          pinoLogger: this.pinoLogger
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
              request: request,
              body: req,
              skipLog: true,
              cs: this.cs,
              pinoLogger: this.pinoLogger
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

            resp.info.duration = Date.now() - request.start_ts;

            return resp;
          }),
          tap(x =>
            common.logResponse({
              response: x,
              logResponseOk: common.enumToBoolean(
                this.cs.get<interfaces.Config['backendLogResponseOk']>(
                  'backendLogResponseOk'
                )
              ),
              logResponseError: common.enumToBoolean(
                this.cs.get<interfaces.Config['backendLogResponseError']>(
                  'backendLogResponseError'
                )
              ),
              logOnResponser: common.enumToBoolean(
                this.cs.get<interfaces.Config['backendLogOnResponser']>(
                  'backendLogOnResponser'
                )
              ),
              logIsStringify: common.enumToBoolean(
                this.cs.get<interfaces.Config['backendLogIsStringify']>(
                  'backendLogIsStringify'
                )
              ),
              logLevel: common.LogLevelEnum.Info,
              logger: this.pinoLogger
            })
          )
        )
      : common.isDefined(idemp.resp)
      ? of(idemp.resp).pipe(
          map(x => {
            x.info.duration = Date.now() - request.start_ts;
            return x;
          }),
          tap(x =>
            common.logResponse({
              response: x,
              logResponseOk: common.enumToBoolean(
                this.cs.get<interfaces.Config['backendLogResponseOk']>(
                  'backendLogResponseOk'
                )
              ),
              logResponseError: common.enumToBoolean(
                this.cs.get<interfaces.Config['backendLogResponseError']>(
                  'backendLogResponseError'
                )
              ),
              logOnResponser: common.enumToBoolean(
                this.cs.get<interfaces.Config['backendLogOnResponser']>(
                  'backendLogOnResponser'
                )
              ),
              logIsStringify: common.enumToBoolean(
                this.cs.get<interfaces.Config['backendLogIsStringify']>(
                  'backendLogIsStringify'
                )
              ),
              logLevel: common.LogLevelEnum.Info,
              logger: this.pinoLogger
            })
          )
        )
      : of(respX).pipe(
          map(x => {
            x.info.duration = Date.now() - request.start_ts;
            return x;
          }),
          tap(x =>
            common.logResponse({
              response: x,
              logResponseOk: common.enumToBoolean(
                this.cs.get<interfaces.Config['backendLogResponseOk']>(
                  'backendLogResponseOk'
                )
              ),
              logResponseError: common.enumToBoolean(
                this.cs.get<interfaces.Config['backendLogResponseError']>(
                  'backendLogResponseError'
                )
              ),
              logOnResponser: common.enumToBoolean(
                this.cs.get<interfaces.Config['backendLogOnResponser']>(
                  'backendLogOnResponser'
                )
              ),
              logIsStringify: common.enumToBoolean(
                this.cs.get<interfaces.Config['backendLogIsStringify']>(
                  'backendLogIsStringify'
                )
              ),
              logLevel: common.LogLevelEnum.Info,
              logger: this.pinoLogger
            })
          )
        );
  }
}
