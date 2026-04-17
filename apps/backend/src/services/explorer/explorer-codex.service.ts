import os from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import retry from 'async-retry';
import fse from 'fs-extra';
import { BackendConfig } from '#backend/config/backend-config';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import { getRetryOption } from '#backend/functions/get-retry-option';
import { UsersService } from '#backend/services/db/users.service';
import { ErEnum } from '#common/enums/er.enum';
import { isUndefined } from '#common/functions/is-undefined';
import { ServerError } from '#common/models/server-error';
import type { CodexAuthOpenai } from '#common/zod/backend/codex-auth';

// Reference: external/opencode/packages/opencode/src/plugin/codex.ts
const CODEX_CLIENT_ID = 'app_EMoamEEZ73f0CkXaXp7hrann';
const CODEX_ISSUER = 'https://auth.openai.com';
const CODEX_API_ENDPOINT = 'https://chatgpt.com/backend-api/codex/responses';

// Reference: external/opencode/packages/opencode/src/plugin/codex.ts lines 589-594
const CODEX_ORIGINATOR = 'mprove';

let __dirname = dirname(fileURLToPath(import.meta.url));

let backendPackageJson = fse.readJsonSync(
  resolve(__dirname, '../../../package.json')
);

const CODEX_USER_AGENT_VERSION: string = backendPackageJson.version;

interface CodexTokenState {
  access: string;
  refresh: string;
  expires: number;
  accountId?: string;
}

interface CodexTokenResponse {
  id_token: string;
  access_token: string;
  refresh_token: string;
  expires_in?: number;
}

@Injectable()
export class ExplorerCodexService {
  constructor(
    private usersService: UsersService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  async prewarmCodexAuth(item: { userId: string }): Promise<void> {
    let { userId } = item;

    let auth = await this.loadAuth({ userId: userId });

    let isFresh = auth.access && auth.expires > Date.now();

    if (isFresh) {
      return;
    }

    let tokens = await this.refreshAccessToken({
      refreshToken: auth.refresh
    });

    let newAccountId =
      this.extractAccountId({ tokens: tokens }) || auth.accountId;

    let newState: CodexTokenState = {
      access: tokens.access_token,
      refresh: tokens.refresh_token,
      expires: Date.now() + (tokens.expires_in ?? 3600) * 1000,
      accountId: newAccountId
    };

    await this.persistRefreshedTokens({
      userId: userId,
      newState: newState
    });
  }

  async buildCodexFetch(item: {
    userId: string;
    sessionId: string;
  }): Promise<typeof fetch> {
    let { userId, sessionId } = item;

    let auth = await this.loadAuth({ userId: userId });

    let accessToken = auth.access;
    let accountId = auth.accountId;

    // Reference: external/opencode/packages/opencode/src/plugin/codex.ts lines 589-594
    let userAgent = `mprove/${CODEX_USER_AGENT_VERSION} (${os.platform()} ${os.release()}; ${os.arch()})`;

    // Reference: external/opencode/packages/opencode/src/plugin/codex.ts lines 389-466
    return async function codexFetch(
      requestInput: RequestInfo | URL,
      init?: RequestInit
    ): Promise<Response> {
      // Strip dummy authorization header
      if (init?.headers) {
        if (init.headers instanceof Headers) {
          init.headers.delete('authorization');
          init.headers.delete('Authorization');
        } else if (Array.isArray(init.headers)) {
          init.headers = init.headers.filter(
            ([key]) => key.toLowerCase() !== 'authorization'
          );
        } else {
          delete init.headers['authorization'];
          delete init.headers['Authorization'];
        }
      }

      // Build headers
      let headers = new Headers();

      if (init?.headers) {
        if (init.headers instanceof Headers) {
          init.headers.forEach((value, key) => headers.set(key, value));
        } else if (Array.isArray(init.headers)) {
          init.headers.forEach(([key, value]) => {
            if (value !== undefined) {
              headers.set(key, String(value));
            }
          });
        } else {
          Object.entries(init.headers).forEach(([key, value]) => {
            if (value !== undefined) {
              headers.set(key, String(value));
            }
          });
        }
      }

      headers.set('authorization', `Bearer ${accessToken}`);

      if (accountId) {
        headers.set('ChatGPT-Account-Id', accountId);
      }

      headers.set('originator', CODEX_ORIGINATOR);
      headers.set('session_id', sessionId);
      headers.set('User-Agent', userAgent);

      // Rewrite URL to Codex endpoint
      let parsedUrl =
        requestInput instanceof URL
          ? requestInput
          : new URL(
              typeof requestInput === 'string' ? requestInput : requestInput.url
            );

      let shouldRewrite =
        parsedUrl.pathname.includes('/v1/responses') ||
        parsedUrl.pathname.includes('/chat/completions');

      let url = shouldRewrite ? new URL(CODEX_API_ENDPOINT) : parsedUrl;

      return fetch(url, {
        ...init,
        headers: headers
      });
    };
  }

  private async loadAuth(item: { userId: string }): Promise<CodexAuthOpenai> {
    let { userId } = item;

    // Always read fresh user data from DB (multi-pod safe)
    let user = await this.usersService.getUserCheckExists({
      userId: userId
    });

    if (isUndefined(user.codexAuth)) {
      throw new ServerError({
        message: ErEnum.BACKEND_USER_PROFILE_CODEX_AUTH_NOT_SET
      });
    }

    return user.codexAuth.openai;
  }

  // Reference: external/opencode/packages/opencode/src/plugin/codex.ts lines 131-145
  private async refreshAccessToken(item: {
    refreshToken: string;
  }): Promise<CodexTokenResponse> {
    let { refreshToken } = item;

    let response = await fetch(`${CODEX_ISSUER}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: CODEX_CLIENT_ID
      }).toString()
    });

    if (!response.ok) {
      throw new ServerError({
        message: ErEnum.BACKEND_PROMPT_FAILED,
        originalError: new Error(
          `Codex token refresh failed: ${response.status}`
        )
      });
    }

    return response.json();
  }

  // Reference: external/opencode/packages/opencode/src/plugin/codex.ts lines 59-88
  private extractAccountId(item: {
    tokens: CodexTokenResponse;
  }): string | undefined {
    let { tokens } = item;

    if (tokens.id_token) {
      let claims = this.parseJwtClaims({ token: tokens.id_token });
      let accountId = claims
        ? this.extractAccountIdFromClaims({ claims: claims })
        : undefined;

      if (accountId) {
        return accountId;
      }
    }

    if (tokens.access_token) {
      let claims = this.parseJwtClaims({ token: tokens.access_token });
      return claims
        ? this.extractAccountIdFromClaims({ claims: claims })
        : undefined;
    }

    return undefined;
  }

  private parseJwtClaims(item: { token: string }): any | undefined {
    let { token } = item;

    let parts = token.split('.');

    if (parts.length !== 3) {
      return undefined;
    }

    try {
      return JSON.parse(Buffer.from(parts[1], 'base64url').toString());
    } catch {
      return undefined;
    }
  }

  private extractAccountIdFromClaims(item: {
    claims: any;
  }): string | undefined {
    let { claims } = item;

    return (
      claims.chatgpt_account_id ||
      claims['https://api.openai.com/auth']?.chatgpt_account_id ||
      claims.organizations?.[0]?.id
    );
  }

  private async persistRefreshedTokens(item: {
    userId: string;
    newState: CodexTokenState;
  }): Promise<void> {
    let { userId, newState } = item;

    let user = await this.usersService.getUserCheckExists({
      userId: userId
    });

    user.codexAuth = {
      openai: {
        type: 'oauth',
        refresh: newState.refresh,
        access: newState.access,
        expires: newState.expires,
        accountId: newState.accountId
      }
    };
    user.codexAuthUpdateTs = Date.now();
    user.codexAuthExpiresTs = newState.expires;

    await retry(
      async () =>
        await this.db.drizzle.transaction(
          async tx =>
            await this.db.packer.write({
              tx: tx,
              insertOrUpdate: {
                users: [user]
              }
            })
        ),
      getRetryOption(this.cs, this.logger)
    );
  }
}
