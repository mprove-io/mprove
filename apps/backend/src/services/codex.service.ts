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
import { CodexDeviceAuthStatusEnum } from '#common/enums/codex-device-auth-status.enum';
import { ErEnum } from '#common/enums/er.enum';
import { isUndefined } from '#common/functions/is-undefined';
import { ServerError } from '#common/models/server-error';
import type { CodexAuthOpenai } from '#common/zod/backend/codex-auth';

// Reference: external/opencode/packages/opencode/src/plugin/codex.ts
const CODEX_CLIENT_ID = 'app_EMoamEEZ73f0CkXaXp7hrann';
const CODEX_ISSUER = 'https://auth.openai.com';
const CODEX_API_ENDPOINT = 'https://chatgpt.com/backend-api/codex/responses';
const CODEX_DEVICE_VERIFICATION_URL = `${CODEX_ISSUER}/codex/device`;
const CODEX_DEVICE_REDIRECT_URI = `${CODEX_ISSUER}/deviceauth/callback`;

// Reference: external/opencode/packages/opencode/src/plugin/codex.ts lines 589-594
const CODEX_ORIGINATOR = 'mprove';

// Refresh Codex auth before expiry, ahead of opencode's at-expiry refresh
// (external/opencode/packages/opencode/src/plugin/codex.ts line 410). Keeps
// the backend as the sole refresher, avoiding refresh_token rotation races.
const CODEX_AUTH_REFRESH_BUFFER_SEC = 5 * 60 * 60;
const CODEX_AUTH_REFRESH_BUFFER_MS = CODEX_AUTH_REFRESH_BUFFER_SEC * 1000;

let __dirname = dirname(fileURLToPath(import.meta.url));

let backendPackageJson = fse.readJsonSync(
  resolve(__dirname, '../../package.json')
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

interface CodexDeviceAuthStart {
  deviceAuthId: string;
  userCode: string;
  intervalSec: number;
  verificationUrl: string;
}

@Injectable()
export class CodexService {
  constructor(
    private usersService: UsersService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  async prewarmCodexAuth(item: { userId: string }): Promise<void> {
    let { userId } = item;

    let auth = await this.loadAuth({ userId: userId });

    let isFresh =
      auth.access && auth.expires > Date.now() + CODEX_AUTH_REFRESH_BUFFER_MS;

    if (isFresh) {
      return;
    }

    let tokens = await this.refreshAccessToken({
      refreshToken: auth.refresh
    });

    let expiresIn = this.validateExpiresIn({ expiresIn: tokens.expires_in });

    let newAccountId =
      this.extractAccountId({ tokens: tokens }) || auth.accountId;

    let newState: CodexTokenState = {
      access: tokens.access_token,
      refresh: tokens.refresh_token,
      expires: Date.now() + expiresIn * 1000,
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

  private validateExpiresIn(item: { expiresIn: number | undefined }): number {
    let { expiresIn } = item;

    if (isUndefined(expiresIn)) {
      throw new ServerError({
        message: ErEnum.BACKEND_CODEX_AUTH_TOKEN_EXPIRES_IN_IS_MISSING
      });
    }

    if (expiresIn < CODEX_AUTH_REFRESH_BUFFER_SEC) {
      throw new ServerError({
        message: ErEnum.BACKEND_CODEX_AUTH_TOKEN_EXPIRES_IN_IS_TOO_SHORT,
        customData: {
          expiresInSec: expiresIn,
          minExpiresInSec: CODEX_AUTH_REFRESH_BUFFER_SEC
        }
      });
    }

    return expiresIn;
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

  // Reference: external/opencode/packages/opencode/src/plugin/codex.ts lines 501-519
  async startDeviceAuth(): Promise<CodexDeviceAuthStart> {
    let response = await fetch(
      `${CODEX_ISSUER}/api/accounts/deviceauth/usercode`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': `mprove/${CODEX_USER_AGENT_VERSION}`
        },
        body: JSON.stringify({ client_id: CODEX_CLIENT_ID })
      }
    );

    if (!response.ok) {
      let bodyText = await response.text().catch(() => '<failed to read body>');

      throw new ServerError({
        message: ErEnum.BACKEND_CODEX_DEVICE_AUTH_START_FAILED,
        customData: {
          status: response.status,
          body: bodyText
        }
      });
    }

    let parsed = (await response.json()) as {
      device_auth_id: string;
      user_code: string;
      interval: string;
    };

    let intervalSec = Math.max(parseInt(parsed.interval, 10) || 5, 1);

    let codexDeviceAuthStart: CodexDeviceAuthStart = {
      deviceAuthId: parsed.device_auth_id,
      userCode: parsed.user_code,
      intervalSec: intervalSec,
      verificationUrl: CODEX_DEVICE_VERIFICATION_URL
    };

    return codexDeviceAuthStart;
  }

  // Reference: external/opencode/packages/opencode/src/plugin/codex.ts lines 528-577
  async pollDeviceAuth(item: {
    userId: string;
    deviceAuthId: string;
    userCode: string;
  }): Promise<CodexDeviceAuthStatusEnum> {
    let { userId, deviceAuthId, userCode } = item;

    let response = await fetch(
      `${CODEX_ISSUER}/api/accounts/deviceauth/token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': `mprove/${CODEX_USER_AGENT_VERSION}`
        },
        body: JSON.stringify({
          device_auth_id: deviceAuthId,
          user_code: userCode
        })
      }
    );

    if (response.status === 403 || response.status === 404) {
      return CodexDeviceAuthStatusEnum.Pending;
    }

    if (!response.ok) {
      return CodexDeviceAuthStatusEnum.Failed;
    }

    let parsed = (await response.json()) as {
      authorization_code: string;
      code_verifier: string;
    };

    let tokens = await this.exchangeDeviceAuthCode({
      authorizationCode: parsed.authorization_code,
      codeVerifier: parsed.code_verifier
    });

    let expiresIn = this.validateExpiresIn({ expiresIn: tokens.expires_in });

    let newState: CodexTokenState = {
      access: tokens.access_token,
      refresh: tokens.refresh_token,
      expires: Date.now() + expiresIn * 1000,
      accountId: this.extractAccountId({ tokens: tokens })
    };

    await this.persistRefreshedTokens({
      userId: userId,
      newState: newState
    });

    return CodexDeviceAuthStatusEnum.Authorized;
  }

  // Reference: external/opencode/packages/opencode/src/plugin/codex.ts lines 546-556
  private async exchangeDeviceAuthCode(item: {
    authorizationCode: string;
    codeVerifier: string;
  }): Promise<CodexTokenResponse> {
    let { authorizationCode, codeVerifier } = item;

    let response = await fetch(`${CODEX_ISSUER}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: authorizationCode,
        redirect_uri: CODEX_DEVICE_REDIRECT_URI,
        client_id: CODEX_CLIENT_ID,
        code_verifier: codeVerifier
      }).toString()
    });

    if (!response.ok) {
      let bodyText = await response.text().catch(() => '<failed to read body>');

      throw new ServerError({
        message: ErEnum.BACKEND_CODEX_DEVICE_AUTH_START_FAILED,
        customData: {
          status: response.status,
          body: bodyText
        }
      });
    }

    return response.json();
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
      let bodyText = await response.text().catch(() => '<failed to read body>');

      let body: unknown;
      try {
        body = JSON.parse(bodyText);
      } catch {
        body = bodyText;
      }

      let isSignInRequired = response.status === 401;

      throw new ServerError({
        message: isSignInRequired
          ? ErEnum.BACKEND_CODEX_AUTH_SIGN_IN_REQUIRED
          : ErEnum.BACKEND_PROMPT_FAILED,
        customData: {
          status: response.status,
          body: body
        }
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
