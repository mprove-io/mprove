import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { BackendConfig } from '#backend/config/backend-config';
import { SSE_SESSION_EVENTS_PATH } from '#backend/controllers/sessions/get-session-events-sse/get-session-events-sse.controller';
import { makeTsNumber } from '#backend/functions/make-ts-number/make-ts-number';
import { logResponseBackend } from '#backend/functions/top/log-response-backend/log-response-backend';
import { logToConsoleBackend } from '#backend/functions/top/log-to-console-backend/log-to-console-backend';
import { makeErrorResponseBackend } from '#backend/functions/top/make-error-response-backend/make-error-response-backend';
import { RedisService } from '#backend/services/redis/redis.service';
import { ServerError } from '#common/classes/server-error/server-error';
import { UNK_ST_ID } from '#common/constants/top-backend';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { BackendUnauthorizedError } from '#common/types/backend/errors/backend-unauthorized-error';
import type { ToBackendRequest } from '#common/types/backend/request/to-backend-request';
import type { Er } from '#common/types/shared/errors/er';
import type { UserTab } from './drizzle/postgres/schema/_tabs';
import type { Idemp } from './interfaces/idemp';

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

      let unauthorizedError: BackendUnauthorizedError =
        (exception as any).message === 'Unauthorized'
          ? { code: 'BACKEND_UNAUTHORIZED' }
          : undefined;

      if (request?.url?.startsWith('/api/mcp')) {
        let errorMessage: string = isDefined(unauthorizedError)
          ? unauthorizedError.code
          : exception instanceof ServerError
            ? String(exception.message)
            : 'INTERNAL_ERROR';

        response.status(400).json({
          jsonrpc: '2.0',
          error: { code: -32600, message: errorMessage }
        });
        return;
      }

      if (request?.url?.startsWith('/' + SSE_SESSION_EVENTS_PATH)) {
        let status: number =
          exception instanceof HttpException
            ? exception.getStatus()
            : HttpStatus.INTERNAL_SERVER_ERROR;

        if (
          status !== HttpStatus.UNAUTHORIZED &&
          status !== HttpStatus.NOT_FOUND
        ) {
          status = HttpStatus.INTERNAL_SERVER_ERROR;

          logToConsoleBackend({
            log:
              exception instanceof HttpException
                ? (exception.cause ?? exception)
                : exception,
            logLevel: 'Error',
            logger: this.logger,
            cs: this.cs
          });
        }

        if (!response.headersSent) {
          response.status(status).json({
            statusCode: status,
            message:
              status === HttpStatus.UNAUTHORIZED
                ? 'Unauthorized'
                : status === HttpStatus.NOT_FOUND
                  ? 'Not Found'
                  : 'Internal Server Error'
          });
        } else if (!response.writableEnded) {
          response.end();
        }

        return;
      }

      let req: ToBackendRequest = request.body;

      let { resp, wrappedError } = makeErrorResponseBackend({
        e: exception,
        unauthorizedError: unauthorizedError,
        body: req,
        path: request.url,
        method: request.method,
        mproveVersion:
          this.cs.get<BackendConfig['mproveReleaseTag']>('mproveReleaseTag'),
        duration: Date.now() - request.start_ts,
        cs: this.cs,
        logger: this.logger
      });

      let iKey = req?.idempotencyKey;

      if (
        isDefined(iKey) &&
        req.operation === resp.operation &&
        resp.type === 'Failure' &&
        resp.error.code !== 'BACKEND_INVALID_REQUEST' &&
        resp.error.code !== 'BACKEND_IDEMP_USER_MISMATCH'
      ) {
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
            id: `backend-api:${req.operation}:${idemp.idempotencyKey}`,
            data: idemp
          });
        } catch (er) {
          logToConsoleBackend({
            log: {
              message: 'BACKEND_APP_FILTER_SAVE_IDEMP_ERROR' satisfies Er,
              originalError: er,
              originalErrorStack: (er as Error)?.stack?.split('\n')
            },
            logLevel: 'Error',
            logger: this.logger,
            cs: this.cs
          });
        }
      }

      logResponseBackend({
        response: resp,
        wrappedError: wrappedError,
        logLevel: 'Info',
        cs: this.cs,
        logger: this.logger
      });

      response.status(HttpStatus.CREATED).json(resp);
    } catch (err) {
      logToConsoleBackend({
        log: {
          message: 'BACKEND_APP_FILTER_ERROR' satisfies Er,
          originalError: err,
          originalErrorStack: (err as Error)?.stack?.split('\n')
        },
        logLevel: 'Error',
        logger: this.logger,
        cs: this.cs
      });
    }
  }
}
