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
import { helper } from './barrels/helper';
import { interfaces } from './barrels/interfaces';
import { repositories } from './barrels/repositories';
import { logToConsoleBackend } from './functions/log-to-console-backend';
import { makeErrorResponseBackend } from './functions/make-error-response-backend';

@Catch()
export class AppFilter implements ExceptionFilter {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private idempsRepository: repositories.IdempsRepository,
    private logger: Logger
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
      let user: entities.UserEntity = request.user;

      let resp = makeErrorResponseBackend({
        e: e,
        body: req,
        request: request,
        duration: Date.now() - request.start_ts,
        skipLog: true,
        cs: this.cs,
        logger: this.logger
      });

      let iKey = req?.info?.idempotencyKey;

      if (common.isDefined(iKey)) {
        try {
          let idempEntity: entities.IdempEntity = {
            idempotency_key: iKey,
            user_id: common.isDefined(user?.user_id)
              ? user.user_id
              : constants.UNK_USER_ID,
            req: req,
            resp: resp,
            server_ts: helper.makeTs()
          };

          await this.idempsRepository.save(idempEntity);
        } catch (er) {
          logToConsoleBackend({
            log: new common.ServerError({
              message: common.ErEnum.BACKEND_APP_FILTER_SAVE_IDEMP_ERROR,
              originalError: er
            }),
            logLevel: common.LogLevelEnum.Error,
            logger: this.logger
          });
        }
      }

      common.logResponse({
        response: resp,
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
        logger: this.logger
      });
    }
  }
}
