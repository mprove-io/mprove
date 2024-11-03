import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToBackend } from './barrels/api-to-backend';
import { common } from './barrels/common';
import { constants } from './barrels/constants';
import { entities } from './barrels/entities';
import { interfaces } from './barrels/interfaces';
import { logResponseBackend } from './functions/log-response-backend';
import { logToConsoleBackend } from './functions/log-to-console-backend';
import { makeErrorResponseBackend } from './functions/make-error-response-backend';
import { makeTsNumber } from './functions/make-ts-number';
import { Idemp } from './interfaces/idemp';
import { RedisService } from './services/redis.service';

@Catch()
export class AppFilter implements ExceptionFilter {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private logger: Logger,
    private redisService: RedisService
  ) {}

  async catch(exception: unknown, host: ArgumentsHost) {
    try {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse();
      const request = ctx.getRequest();

      // const status =
      //   exception instanceof HttpException
      //     ? exception.getStatus()
      //     : HttpStatus.INTERNAL_SERVER_ERROR;

      let e =
        (exception as any).message === 'Unauthorized'
          ? new common.ServerError({
              message: common.ErEnum.BACKEND_UNAUTHORIZED,
              originalError: exception
            })
          : exception;

      let req: apiToBackend.ToBackendRequest = request.body;

      let resp = makeErrorResponseBackend({
        e: e,
        body: req,
        path: request.url,
        method: request.method,
        duration: Date.now() - request.start_ts,
        skipLog: true,
        cs: this.cs,
        logger: this.logger
      });

      let iKey = req?.info?.idempotencyKey;

      if (common.isDefined(iKey)) {
        try {
          let user: entities.UserEntity = request.user;
          // let sessionStId: string = request.session?.getUserId();

          let idemp: Idemp = {
            idempotencyKey: iKey,
            stId: common.isDefined(user?.user_id)
              ? user.user_id
              : constants.UNK_ST_ID,
            // stId: common.isDefined(sessionStId)
            //   ? sessionStId
            //   : constants.UNK_ST_ID,
            req: req,
            resp: resp,
            serverTs: makeTsNumber()
          };

          await this.redisService.write({
            id: idemp.idempotencyKey,
            data: idemp
          });
        } catch (er) {
          logToConsoleBackend({
            log: new common.ServerError({
              message: common.ErEnum.BACKEND_APP_FILTER_SAVE_IDEMP_ERROR,
              originalError: er
            }),
            logLevel: common.LogLevelEnum.Error,
            logger: this.logger,
            cs: this.cs
          });
        }
      }

      logResponseBackend({
        response: resp,
        logLevel: common.LogLevelEnum.Info,
        cs: this.cs,
        logger: this.logger
      });

      response.status(HttpStatus.CREATED).json(resp);
    } catch (err) {
      logToConsoleBackend({
        log: new common.ServerError({
          message: common.ErEnum.BACKEND_APP_FILTER_ERROR,
          originalError: err
        }),
        logLevel: common.LogLevelEnum.Error,
        logger: this.logger,
        cs: this.cs
      });
    }
  }
}
