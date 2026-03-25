import { ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { eq } from 'drizzle-orm';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import { sessionsTable } from '#backend/drizzle/postgres/schema/sessions';
import { usersTable } from '#backend/drizzle/postgres/schema/users';
import { ApiKeyService } from '#backend/services/api-key.service';
import { TabService } from '#backend/services/tab.service';
import { MCLI_SESSION_ALLOWED_REQUEST_NAMES } from '#common/constants/mcli-session-allowed-request-names';
import { MCLI_USER_ALLOWED_REQUEST_NAMES } from '#common/constants/mcli-user-allowed-request-names';
import { PROD_REPO_ID } from '#common/constants/top';
import { SKIP_JWT } from '#common/constants/top-backend';
import { ApiKeyTypeEnum } from '#common/enums/api-key-type.enum';
import { ErEnum } from '#common/enums/er.enum';
import { RepoTypeEnum } from '#common/enums/repo-type.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { ServerError } from '#common/models/server-error';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    private apiKeyService: ApiKeyService,
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
        ToBackendRequestInfoNameEnum.ToBackendTelemetryTraces,
        ToBackendRequestInfoNameEnum.ToBackendTelemetryMetrics,
        ToBackendRequestInfoNameEnum.ToBackendTelemetryLogs
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
        bearer.startsWith(`${ApiKeyTypeEnum.PK}-`) ||
        bearer.startsWith(`${ApiKeyTypeEnum.SK}-`)
      ) {
        return this.validateApiKey(request, bearer);
      }
    }

    return super.canActivate(context);
  }

  async validateApiKey(request: any, fullKey: string): Promise<boolean> {
    let parsed = this.apiKeyService.parseApiKey(fullKey);

    if (
      parsed.type !== ApiKeyTypeEnum.PK &&
      parsed.type !== ApiKeyTypeEnum.SK
    ) {
      throw new ServerError({
        message: ErEnum.BACKEND_API_KEY_NOT_FOUND
      });
    }

    request.apiKeyType = parsed.type;

    if (parsed.type === ApiKeyTypeEnum.PK) {
      let user = await this.db.drizzle.query.usersTable
        .findFirst({
          where: eq(usersTable.apiKeyPrefix, parsed.prefix)
        })
        .then(x => this.tabService.userEntToTab(x));

      if (!user) {
        throw new ServerError({
          message: ErEnum.BACKEND_API_KEY_NOT_FOUND
        });
      }

      if (!user.apiKeySecretHash) {
        throw new ServerError({
          message: ErEnum.BACKEND_API_KEY_NOT_FOUND
        });
      }

      let isValid = await this.apiKeyService.validateApiKeySecret({
        secret: parsed.secret,
        storedHash: user.apiKeySecretHash,
        salt: user.apiKeySalt
      });

      if (!isValid) {
        throw new ServerError({
          message: ErEnum.BACKEND_API_KEY_NOT_VALID
        });
      }

      request.user = user;

      let path = request.url?.substring(1);

      let isMcpRequest = path === 'mcp' || path.startsWith('mcp/');

      if (isMcpRequest === true) {
        return true;
      }

      if (MCLI_USER_ALLOWED_REQUEST_NAMES.indexOf(path) < 0) {
        throw new ServerError({
          message: ErEnum.BACKEND_USER_API_KEY_REQUEST_NOT_ALLOWED
        });
      }

      let repoId = request.body?.payload?.repoId;

      if (repoId && repoId !== parsed.entityId && repoId !== PROD_REPO_ID) {
        throw new ServerError({
          message: ErEnum.BACKEND_REPO_ID_DOES_NOT_MATCH_USER
        });
      }

      request.apiKeyRepoType =
        repoId === PROD_REPO_ID ? RepoTypeEnum.Production : RepoTypeEnum.Dev;

      return true;
    } else if (parsed.type === ApiKeyTypeEnum.SK) {
      let session = await this.db.drizzle.query.sessionsTable
        .findFirst({
          where: eq(sessionsTable.apiKeyPrefix, parsed.prefix)
        })
        .then(x => this.tabService.sessionEntToTab(x));

      if (!session) {
        throw new ServerError({
          message: ErEnum.BACKEND_API_KEY_NOT_FOUND
        });
      }

      if (!session.apiKeySecretHash) {
        throw new ServerError({
          message: ErEnum.BACKEND_API_KEY_NOT_FOUND
        });
      }

      let isValid = await this.apiKeyService.validateApiKeySecret({
        secret: parsed.secret,
        storedHash: session.apiKeySecretHash,
        salt: session.apiKeySalt
      });

      if (!isValid) {
        throw new ServerError({
          message: ErEnum.BACKEND_API_KEY_NOT_VALID
        });
      }

      let user = await this.db.drizzle.query.usersTable
        .findFirst({
          where: eq(usersTable.userId, session.userId)
        })
        .then(x => this.tabService.userEntToTab(x));

      if (!user) {
        throw new ServerError({
          message: ErEnum.BACKEND_API_KEY_NOT_FOUND
        });
      }

      request.user = user;

      let url = request.url?.substring(1);

      let isMcpRequest = url === 'mcp' || url.startsWith('mcp/');

      if (isMcpRequest === true) {
        request.apiKeyToValidateSessionId = parsed.entityId;
        request.apiKeyToValidateEnvId = session.envId;
        return true;
      }

      if (MCLI_SESSION_ALLOWED_REQUEST_NAMES.indexOf(url) < 0) {
        throw new ServerError({
          message: ErEnum.BACKEND_SESSION_API_KEY_REQUEST_NOT_ALLOWED
        });
      }

      let repoId = request.body?.payload?.repoId;

      if (repoId && repoId !== parsed.entityId && repoId !== PROD_REPO_ID) {
        throw new ServerError({
          message: ErEnum.BACKEND_REPO_ID_DOES_NOT_MATCH_SESSION
        });
      }

      let envId = request.body?.payload?.envId;

      if (envId && session.envId && envId !== session.envId) {
        throw new ServerError({
          message: ErEnum.BACKEND_ENV_ID_DOES_NOT_MATCH_SESSION
        });
      }

      request.apiKeyRepoType =
        repoId === PROD_REPO_ID
          ? RepoTypeEnum.Production
          : RepoTypeEnum.Session;

      request.apiKeySessionId = session.sessionId;

      return true;
    }
  }
}
