import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BackendConfig } from '#backend/config/backend-config';
import { SSE_SESSION_EVENTS_PATH } from '#backend/controllers/sessions/get-session-events-sse/get-session-events-sse.controller';
import { UNK_ST_ID } from '#common/constants/top-backend';
import { ErEnum } from '#common/enums/er.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { isDefined } from '#common/functions/is-defined';
import { ServerError } from '#common/models/server-error';
import type { ToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import type { UserTab } from './drizzle/postgres/schema/_tabs';
import { logResponseBackend } from './functions/log-response-backend';
import { logToConsoleBackend } from './functions/log-to-console-backend';
import { makeErrorResponseBackend } from './functions/make-error-response-backend';
import { makeTsNumber } from './functions/make-ts-number';
import { Idemp } from './interfaces/idemp';
import { RedisService } from './services/redis.service';

@Catch()
export class AppFilter implements ExceptionFilter {
  constructor(
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    private redisService: RedisService
  ) {}

  async catch(exception: unknown, host: ArgumentsHost) {
    try {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse();
      const request = ctx.getRequest();

      let e =
        (exception as any).message === 'Unauthorized'
          ? new ServerError({
              message: ErEnum.BACKEND_UNAUTHORIZED,
              originalError: exception
            })
          : exception;

      if (request?.url?.startsWith('/api/mcp')) {
        let errorMessage =
          e instanceof ServerError ? String(e.message) : 'INTERNAL_ERROR';

        response.status(400).json({
          jsonrpc: '2.0',
          error: { code: -32600, message: errorMessage }
        });
        return;
      }

      if (request?.url?.startsWith('/' + SSE_SESSION_EVENTS_PATH)) {
        if (!response.headersSent) {
          response.status(401).json({ message: 'Unauthorized' });
        }
        return;
      }

      let req: ToBackendRequest = request.body;

      let { resp, wrappedError } = makeErrorResponseBackend({
        e: e,
        body: req,
        path: request.url,
        method: request.method,
        mproveVersion:
          this.cs.get<BackendConfig['mproveReleaseTag']>('mproveReleaseTag'),
        duration: Date.now() - request.start_ts,
        cs: this.cs,
        logger: this.logger
      });

      let iKey = req?.info?.idempotencyKey;

      if (isDefined(iKey)) {
        try {
          let user: UserTab = request.user;

          let idemp: Idemp = {
            idempotencyKey: iKey,
            stId: isDefined(user?.userId) ? user.userId : UNK_ST_ID,
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
            log: new ServerError({
              message: ErEnum.BACKEND_APP_FILTER_SAVE_IDEMP_ERROR,
              originalError: er
            }),
            logLevel: LogLevelEnum.Error,
            logger: this.logger,
            cs: this.cs
          });
        }
      }

      logResponseBackend({
        response: resp,
        wrappedError: wrappedError,
        logLevel: LogLevelEnum.Info,
        cs: this.cs,
        logger: this.logger
      });

      response.status(HttpStatus.CREATED).json(resp);
    } catch (err) {
      logToConsoleBackend({
        log: new ServerError({
          message: ErEnum.BACKEND_APP_FILTER_ERROR,
          originalError: err
        }),
        logLevel: LogLevelEnum.Error,
        logger: this.logger,
        cs: this.cs
      });
    }
  }
}
