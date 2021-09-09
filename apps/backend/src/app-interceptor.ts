import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { apiToBackend } from './barrels/api-to-backend';
import { common } from './barrels/common';
import { constants } from './barrels/constants';
import { entities } from './barrels/entities';
import { helper } from './barrels/helper';
import { interfaces } from './barrels/interfaces';
import { repositories } from './barrels/repositories';

let retry = require('async-retry');

@Injectable()
export class AppInterceptor implements NestInterceptor {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private idempsRepository: repositories.IdempsRepository
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Promise<Observable<common.MyResponse>> {
    let request = context.switchToHttp().getRequest();

    let req: apiToBackend.ToBackendRequest = request.body;
    let user: entities.UserEntity = request.user;

    let iKey = req?.info?.idempotencyKey;
    let userId = common.isDefined(user?.user_id)
      ? user.user_id
      : constants.UNK_USER_ID;

    let idemp = common.isUndefined(iKey)
      ? undefined
      : await this.idempsRepository.findOne({
          idempotency_key: iKey,
          user_id: userId
        });

    if (common.isUndefined(idemp)) {
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
              idempotency_key: iKey,
              user_id: userId
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
              let serverError = new common.ServerError({
                message: apiToBackend.ErEnum.BACKEND_GET_IDEMP_RESP_RETRY,
                originalError: e
              });

              common.logToConsole(serverError);
            }
          }
        );
      } catch (e) {
        let err = new common.ServerError({
          message: apiToBackend.ErEnum.BACKEND_GET_IDEMP_RESP_RETRY_FAILED,
          originalError: e
        });

        respX = common.makeErrorResponse({ e: err, cs: this.cs, req: request });

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
            let resp = common.makeOkResponse({
              payload: payload,
              cs: this.cs,
              req: req
            });

            let idempEntity: entities.IdempEntity = {
              idempotency_key: iKey,
              user_id: userId,
              req: req,
              resp: resp,
              server_ts: helper.makeTs()
            };

            await this.idempsRepository.save(idempEntity);

            return resp;
          })
        )
      : common.isDefined(idemp.resp)
      ? of(idemp.resp)
      : of(respX);
  }
}
