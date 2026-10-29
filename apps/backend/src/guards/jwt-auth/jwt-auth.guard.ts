import { type ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Result } from '@praha/byethrow';
import { eq } from 'drizzle-orm';
import type { Observable } from 'rxjs';
import { sessionsTable } from '#backend/drizzle/postgres/tables/sessions';
import type { UserTab } from '#backend/drizzle/postgres/tables/users';
import { usersTable } from '#backend/drizzle/postgres/tables/users';
import {
  type ParseApiKeyOutput,
  parseApiKey
} from '#backend/functions/api-key/parse-api-key/parse-api-key';
import { validateApiKeySecret } from '#backend/guards/jwt-auth/validate-api-key-secret/validate-api-key-secret';
import { DbService } from '#backend/services/db/db.service';
import { ServerError } from '#common/classes/server-error/server-error';
import { MCLI_SESSION_ALLOWED_REQUEST_NAMES } from '#common/constants/mcli-session-allowed-request-names';
import { MCLI_USER_ALLOWED_REQUEST_NAMES } from '#common/constants/mcli-user-allowed-request-names';
import { PROD_REPO_ID } from '#common/constants/top';
import { SKIP_JWT } from '#common/constants/top-backend';
import type { BackendApiKeyNotFoundError } from '#common/types/backend/errors/backend-api-key-not-found-error';
import type { AuthenticateApiKeyError } from '#common/types/backend/function-errors/authenticate-api-key-error';
import type { AuthenticatePersonalApiKeyError } from '#common/types/backend/function-errors/authenticate-personal-api-key-error';
import type { AuthenticateSessionApiKeyError } from '#common/types/backend/function-errors/authenticate-session-api-key-error';
import type { ApiKeyType } from '#common/types/backend/parts/api-key/api-key-type';
import type { McpApiKeyParsed } from '#common/types/backend/parts/api-key/mcp-api-key-parsed';
import { toBackendTelemetryRouteValues } from '#common/types/backend/request/to-backend-telemetry-route';

type ApiKeyAuthRequest = {
  url: string;
  headers: { authorization?: string };
  route?: { path?: string };
  body?: { input?: { repoId?: string; envId?: string; branchId?: string } };
  user?: UserTab;
  apiKeyParsed?: McpApiKeyParsed;
};

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    private db: DbService
  ) {
    super();
  }

  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    let request: ApiKeyAuthRequest = context
      .switchToHttp()
      .getRequest<ApiKeyAuthRequest>();

    let path: string = request.route?.path || request.url.split('?')[0];

    let isTelemetryRoute: boolean = toBackendTelemetryRouteValues.some(
      route => route === path.slice(1)
    );

    if (isTelemetryRoute && request.headers.authorization === 'Bearer null') {
      return true;
    }

    let skipJwt: boolean = this.reflector.getAllAndOverride<boolean>(SKIP_JWT, [
      context.getHandler(),
      context.getClass()
    ]);

    if (skipJwt === true) {
      return true;
    }

    let authHeader: string = request.headers.authorization;

    if (authHeader) {
      let bearer: string = authHeader.replace(/^Bearer\s+/i, '');

      if (
        bearer.startsWith(`${'PK' satisfies ApiKeyType}-`) ||
        bearer.startsWith(`${'SK' satisfies ApiKeyType}-`)
      ) {
        // Nest requires rejection here; domain helpers propagate typed failures.
        let isAuthenticated: Promise<boolean> = this.authenticateApiKey({
          request: request,
          fullKey: bearer
        }).then(result => {
          if (Result.isFailure(result)) {
            throw new ServerError({ message: result.error.code });
          }

          return result.value;
        });

        return isAuthenticated;
      }
    }

    let isAuthenticated: boolean | Promise<boolean> | Observable<boolean> =
      super.canActivate(context);

    return isAuthenticated;
  }

  private async authenticateApiKey(item: {
    request: ApiKeyAuthRequest;
    fullKey: string;
  }): Result.ResultAsync<boolean, AuthenticateApiKeyError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind('parsed', v => parseApiKey({ fullKey: v.fullKey })),
      Result.andThrough(v =>
        v.parsed.type !== 'PK' && v.parsed.type !== 'SK'
          ? Result.fail({ code: 'BACKEND_API_KEY_NOT_FOUND' })
          : Result.succeed()
      ),
      Result.andThen(v =>
        v.parsed.type === 'PK'
          ? this.authenticatePersonalApiKey({
              request: v.request,
              parsed: v.parsed
            })
          : this.authenticateSessionApiKey({
              request: v.request,
              parsed: v.parsed
            })
      )
    );
  }

  private async authenticatePersonalApiKey(item: {
    request: ApiKeyAuthRequest;
    parsed: ParseApiKeyOutput;
  }): Result.ResultAsync<boolean, AuthenticatePersonalApiKeyError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind('user', v =>
        this.db.users.findFirstCheckExists({
          where: eq(usersTable.apiKeyPrefix, v.parsed.prefix)
        })
      ),
      Result.mapError(v =>
        v.code === 'BACKEND_USER_DOES_NOT_EXIST'
          ? ({
              code: 'BACKEND_API_KEY_NOT_FOUND'
            } satisfies BackendApiKeyNotFoundError)
          : v
      ),
      Result.andThrough(v =>
        v.user.apiKeySecretHash
          ? Result.succeed()
          : Result.fail({ code: 'BACKEND_API_KEY_NOT_FOUND' })
      ),
      Result.andThrough(async v => {
        let isValid: boolean = await validateApiKeySecret({
          secret: v.parsed.secret,
          storedHash: v.user.apiKeySecretHash,
          storedSalt: v.user.apiKeySalt
        });

        return isValid
          ? Result.succeed()
          : Result.fail({ code: 'BACKEND_API_KEY_NOT_VALID' });
      }),
      Result.map(v => {
        v.request.user = v.user;
        v.request.apiKeyParsed = {
          apiKeyType: 'PK',
          userId: v.user.userId
        };
        return v;
      }),
      Result.bind('path', v => Result.succeed(v.request.url?.substring(1))),
      Result.andThen(v => {
        if (v.path === 'api/mcp' || v.path.startsWith('api/mcp/')) {
          return Result.succeed(true);
        }

        if (
          MCLI_USER_ALLOWED_REQUEST_NAMES.findIndex(route => route === v.path) <
          0
        ) {
          return Result.fail({
            code: 'BACKEND_USER_API_KEY_REQUEST_NOT_ALLOWED'
          });
        }

        let repoId: string = v.request.body?.input?.repoId;

        if (repoId && repoId !== v.parsed.entityId && repoId !== PROD_REPO_ID) {
          return Result.fail({ code: 'BACKEND_REPO_ID_DOES_NOT_MATCH_USER' });
        }

        return Result.succeed(true);
      })
    );
  }

  private async authenticateSessionApiKey(item: {
    request: ApiKeyAuthRequest;
    parsed: ParseApiKeyOutput;
  }): Result.ResultAsync<boolean, AuthenticateSessionApiKeyError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind('session', v =>
        this.db.sessions.findFirstCheckExists({
          where: eq(sessionsTable.apiKeyPrefix, v.parsed.prefix)
        })
      ),
      Result.mapError(v =>
        v.code === 'BACKEND_SESSION_NOT_FOUND'
          ? ({
              code: 'BACKEND_API_KEY_NOT_FOUND'
            } satisfies BackendApiKeyNotFoundError)
          : v
      ),
      Result.andThrough(v =>
        v.session.apiKeySecretHash
          ? Result.succeed()
          : Result.fail({ code: 'BACKEND_API_KEY_NOT_FOUND' })
      ),
      Result.andThrough(async v => {
        let isValid: boolean = await validateApiKeySecret({
          secret: v.parsed.secret,
          storedHash: v.session.apiKeySecretHash,
          storedSalt: v.session.apiKeySalt
        });

        return isValid
          ? Result.succeed()
          : Result.fail({ code: 'BACKEND_API_KEY_NOT_VALID' });
      }),
      Result.bind('user', v =>
        this.db.users.findFirstCheckExists({
          where: eq(usersTable.userId, v.session.userId)
        })
      ),
      Result.mapError(v =>
        v.code === 'BACKEND_USER_DOES_NOT_EXIST'
          ? ({
              code: 'BACKEND_API_KEY_NOT_FOUND'
            } satisfies BackendApiKeyNotFoundError)
          : v
      ),
      Result.map(v => {
        v.request.user = v.user;
        return v;
      }),
      Result.bind('path', v => Result.succeed(v.request.url?.substring(1))),
      Result.andThen(v => {
        if (v.path === 'api/mcp' || v.path.startsWith('api/mcp/')) {
          v.request.apiKeyParsed = {
            apiKeyType: 'SK',
            projectId: v.session.projectId,
            repoId: v.parsed.entityId,
            branchId: v.session.branchId,
            envId: v.session.envId
          };

          return Result.succeed(true);
        }

        if (
          MCLI_SESSION_ALLOWED_REQUEST_NAMES.findIndex(
            route => route === v.path
          ) < 0
        ) {
          return Result.fail({
            code: 'BACKEND_SESSION_API_KEY_REQUEST_NOT_ALLOWED'
          });
        }

        let repoId: string = v.request.body?.input?.repoId;

        if (repoId && repoId !== v.parsed.entityId && repoId !== PROD_REPO_ID) {
          return Result.fail({
            code: 'BACKEND_REPO_ID_DOES_NOT_MATCH_SESSION'
          });
        }

        let envId: string = v.request.body?.input?.envId;

        if (envId && v.session.envId && envId !== v.session.envId) {
          return Result.fail({
            code: 'BACKEND_ENV_ID_DOES_NOT_MATCH_SESSION'
          });
        }

        let branchId: string = v.request.body?.input?.branchId;

        if (branchId && v.session.branchId && branchId !== v.session.branchId) {
          return Result.fail({
            code: 'BACKEND_BRANCH_ID_DOES_NOT_MATCH_SESSION'
          });
        }

        return Result.succeed(true);
      })
    );
  }
}
