import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToBackend } from './barrels/api-to-backend';
import { common } from './barrels/common';
import { constants } from './barrels/constants';
import { entities } from './barrels/entities';
import { helper } from './barrels/helper';
import { interfaces } from './barrels/interfaces';
import { repositories } from './barrels/repositories';

@Catch()
export class AppFilter implements ExceptionFilter {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private idempsRepository: repositories.IdempsRepository
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
              message: apiToBackend.ErEnum.BACKEND_UNAUTHORIZED,
              originalError: exception
            })
          : exception;

      let req: apiToBackend.ToBackendRequest = request.body;
      let user: entities.UserEntity = request.user;

      let resp = common.makeErrorResponse({
        e: e,
        body: req,
        request: request,
        duration: Date.now() - request.start_ts,
        skipLog: true,
        logResponseError: this.cs.get<
          interfaces.Config['backendLogResponseError']
        >('backendLogResponseError'),
        logOnResponser: this.cs.get<interfaces.Config['backendLogOnResponser']>(
          'backendLogOnResponser'
        ),
        logIsColor: this.cs.get<interfaces.Config['backendLogIsColor']>(
          'backendLogIsColor'
        )
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
          common.logToConsole(
            new common.ServerError({
              message: apiToBackend.ErEnum.BACKEND_APP_FILTER_SAVE_IDEMP_ERROR,
              originalError: er
            })
          );
        }
      }

      common.logResponse({
        response: resp,
        logResponseOk: this.cs.get<interfaces.Config['backendLogResponseOk']>(
          'backendLogResponseOk'
        ),
        logResponseError: this.cs.get<
          interfaces.Config['backendLogResponseError']
        >('backendLogResponseError'),
        logOnResponser: this.cs.get<interfaces.Config['backendLogOnResponser']>(
          'backendLogOnResponser'
        ),
        logIsColor: this.cs.get<interfaces.Config['backendLogIsColor']>(
          'backendLogIsColor'
        )
      });

      response.status(HttpStatus.CREATED).json(resp);
    } catch (err) {
      common.logToConsole(
        new common.ServerError({
          message: apiToBackend.ErEnum.BACKEND_APP_FILTER_ERROR,
          originalError: err
        })
      );
    }
  }
}
