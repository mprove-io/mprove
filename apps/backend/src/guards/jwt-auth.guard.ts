import { ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { eq } from 'drizzle-orm';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import { sessionsTable } from '#backend/drizzle/postgres/schema/sessions';
import { usersTable } from '#backend/drizzle/postgres/schema/users';
import { parseApiKey } from '#backend/functions/api-key/parse-api-key';
import { validateApiKeySecret } from '#backend/functions/api-key/validate-api-key-secret';
import { TabService } from '#backend/services/tab.service';
import { ServerError } from '#common/classes/server-error/server-error';
import { MCLI_SESSION_ALLOWED_REQUEST_NAMES } from '#common/constants/mcli-session-allowed-request-names';
import { MCLI_USER_ALLOWED_REQUEST_NAMES } from '#common/constants/mcli-user-allowed-request-names';
import { PROD_REPO_ID } from '#common/constants/top';
import { SKIP_JWT } from '#common/constants/top-backend';
import type { ApiKeyType } from '#common/types/backend/parts/api-key/api-key-type';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    private tabService: TabService,
    @Inject(DRIZZLE) private db: Db
  ) {
    super();
  }

  canActivate(context: ExecutionContext) {
    let request = context.switchToHttp().getRequest();

    let path = request.route?.path || request.url.split('?')[0];

    if (
      [
        'api/ToBackendTelemetryTraces',
        'api/ToBackendTelemetryMetrics',
        'api/ToBackendTelemetryLogs'
      ].indexOf(path.slice(1)) > -1 &&
      request.headers.authorization === 'Bearer null'
    ) {
      return true;
    }

    let skipJwt = this.reflector.getAllAndOverride<boolean>(SKIP_JWT, [
      context.getHandler(),
      context.getClass()
    ]);

    if (skipJwt === true) {
      return true;
    }

    let authHeader: string = request.headers.authorization;

    if (authHeader) {
      let bearer = authHeader.replace(/^Bearer\s+/i, '');

      if (
        bearer.startsWith(`${'PK' satisfies ApiKeyType}-`) ||
        bearer.startsWith(`${'SK' satisfies ApiKeyType}-`)
      ) {
        return this.validateApiKey(request, bearer);
      }
    }

    return super.canActivate(context);
  }

  async validateApiKey(request: any, fullKey: string): Promise<boolean> {
    let parsed = parseApiKey({ fullKey: fullKey });

    if (parsed.type !== 'PK' && parsed.type !== 'SK') {
      throw new ServerError({
        message: 'BACKEND_API_KEY_NOT_FOUND'
      });
    }

    request.apiKeyType = parsed.type;

    if (parsed.type === 'PK') {
      let user = await this.db.drizzle.query.usersTable
        .findFirst({
          where: eq(usersTable.apiKeyPrefix, parsed.prefix)
        })
        .then(x => this.tabService.userEntToTab(x));

      if (!user) {
        throw new ServerError({
          message: 'BACKEND_API_KEY_NOT_FOUND'
        });
      }

      if (!user.apiKeySecretHash) {
        throw new ServerError({
          message: 'BACKEND_API_KEY_NOT_FOUND'
        });
      }

      let isValid = await validateApiKeySecret({
        secret: parsed.secret,
        storedHash: user.apiKeySecretHash,
        storedSalt: user.apiKeySalt
      });

      if (!isValid) {
        throw new ServerError({
          message: 'BACKEND_API_KEY_NOT_VALID'
        });
      }

      request.user = user;

      let path = request.url?.substring(1);

      let isMcpRequest = path === 'api/mcp' || path.startsWith('api/mcp/');

      if (isMcpRequest === true) {
        return true;
      }

      if (MCLI_USER_ALLOWED_REQUEST_NAMES.indexOf(path) < 0) {
        throw new ServerError({
          message: 'BACKEND_USER_API_KEY_REQUEST_NOT_ALLOWED'
        });
      }

      let repoId = request.body?.input?.repoId;

      if (repoId && repoId !== parsed.entityId && repoId !== PROD_REPO_ID) {
        throw new ServerError({
          message: 'BACKEND_REPO_ID_DOES_NOT_MATCH_USER'
        });
      }

      return true;
    } else if (parsed.type === 'SK') {
      let session = await this.db.drizzle.query.sessionsTable
        .findFirst({
          where: eq(sessionsTable.apiKeyPrefix, parsed.prefix)
        })
        .then(x => this.tabService.sessionEntToTab(x));

      if (!session) {
        throw new ServerError({
          message: 'BACKEND_API_KEY_NOT_FOUND'
        });
      }

      if (!session.apiKeySecretHash) {
        throw new ServerError({
          message: 'BACKEND_API_KEY_NOT_FOUND'
        });
      }

      let isValid = await validateApiKeySecret({
        secret: parsed.secret,
        storedHash: session.apiKeySecretHash,
        storedSalt: session.apiKeySalt
      });

      if (!isValid) {
        throw new ServerError({
          message: 'BACKEND_API_KEY_NOT_VALID'
        });
      }

      let user = await this.db.drizzle.query.usersTable
        .findFirst({
          where: eq(usersTable.userId, session.userId)
        })
        .then(x => this.tabService.userEntToTab(x));

      if (!user) {
        throw new ServerError({
          message: 'BACKEND_API_KEY_NOT_FOUND'
        });
      }

      request.user = user;

      let url = request.url?.substring(1);

      let isMcpRequest = url === 'api/mcp' || url.startsWith('api/mcp/');

      if (isMcpRequest === true) {
        request.apiKeyToValidateSessionId = parsed.entityId;
        request.apiKeyToValidateProjectId = session.projectId;
        request.apiKeyToValidateEnvId = session.envId;
        request.apiKeyToValidateBranchId = session.branchId;
        return true;
      }

      if (MCLI_SESSION_ALLOWED_REQUEST_NAMES.indexOf(url) < 0) {
        throw new ServerError({
          message: 'BACKEND_SESSION_API_KEY_REQUEST_NOT_ALLOWED'
        });
      }

      let repoId = request.body?.input?.repoId;

      if (repoId && repoId !== parsed.entityId && repoId !== PROD_REPO_ID) {
        throw new ServerError({
          message: 'BACKEND_REPO_ID_DOES_NOT_MATCH_SESSION'
        });
      }

      let envId = request.body?.input?.envId;

      if (envId && session.envId && envId !== session.envId) {
        throw new ServerError({
          message: 'BACKEND_ENV_ID_DOES_NOT_MATCH_SESSION'
        });
      }

      let branchId = request.body?.input?.branchId;

      if (branchId && session.branchId && branchId !== session.branchId) {
        throw new ServerError({
          message: 'BACKEND_BRANCH_ID_DOES_NOT_MATCH_SESSION'
        });
      }

      return true;
    }
  }
}
