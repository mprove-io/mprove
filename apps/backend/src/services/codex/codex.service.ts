import os from 'node:os';
import { Injectable, Logger } from '@nestjs/common';
import { Result } from '@praha/byethrow';
import { z } from 'zod';
import { backendPackageJson } from '#backend/backend-package-json';
import { isCodexModelAvailable } from '#backend/services/codex/is-codex-model-available/is-codex-model-available';
import { DbService } from '#backend/services/db/db.service';
import { UsersService } from '#backend/services/db/users/users.service';
import { ServerError } from '#common/classes/server-error/server-error';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isDefinedAndNotEmpty } from '#common/functions/is-defined-and-not-empty/is-defined-and-not-empty';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { BuildCodexFetchError } from '#common/types/backend/function-errors/build-codex-fetch-error';
import type { ExchangeDeviceAuthCodeError } from '#common/types/backend/function-errors/exchange-device-auth-code-error';
import type { LoadAuthError } from '#common/types/backend/function-errors/load-auth-error';
import type { PersistRefreshedTokensError } from '#common/types/backend/function-errors/persist-refreshed-tokens-error';
import type { PollDeviceAuthError } from '#common/types/backend/function-errors/poll-device-auth-error';
import type { PrewarmCodexAuthError } from '#common/types/backend/function-errors/prewarm-codex-auth-error';
import type { RefreshAccessTokenError } from '#common/types/backend/function-errors/refresh-access-token-error';
import type { StartDeviceAuthError } from '#common/types/backend/function-errors/start-device-auth-error';
import type { ValidateExpiresInError } from '#common/types/backend/function-errors/validate-expires-in-error';
import type { CodexAuthOpenai } from '#common/types/backend/parts/codex/codex-auth-openai';
import type { CodexDeviceAuthStatus } from '#common/types/backend/parts/codex/codex-device-auth-status';
import {
  type CodexModel,
  zCodexModel
} from '#common/types/backend/parts/codex/codex-model';

// Reference: external/opencode/packages/opencode/src/plugin/codex.ts
const CODEX_CLIENT_ID = 'app_EMoamEEZ73f0CkXaXp7hrann';

const CODEX_ISSUER = 'https://auth.openai.com';

const CODEX_API_ENDPOINT = 'https://chatgpt.com/backend-api/codex/responses';

const CODEX_MODELS_ENDPOINT = 'https://chatgpt.com/backend-api/codex/models';

const CODEX_DEVICE_VERIFICATION_URL = `${CODEX_ISSUER}/codex/device`;

const CODEX_DEVICE_REDIRECT_URI = `${CODEX_ISSUER}/deviceauth/callback`;

// Reference: external/opencode/packages/opencode/src/plugin/codex.ts lines 589-594
const CODEX_ORIGINATOR = 'mprove';

// Refresh Codex auth before expiry, ahead of opencode's at-expiry refresh
// (external/opencode/packages/opencode/src/plugin/codex.ts line 410). Keeps
// the backend as the sole refresher, avoiding refresh_token rotation races.
const CODEX_AUTH_REFRESH_BUFFER_SEC = 5 * 60 * 60;

const CODEX_AUTH_REFRESH_BUFFER_MS = CODEX_AUTH_REFRESH_BUFFER_SEC * 1000;

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

export interface CodexDeviceAuthStart {
  deviceAuthId: string;
  userCode: string;
  intervalSec: number;
  verificationUrl: string;
}

export type CodexModelsResult = {
  codexModels: CodexModel[];
  errorMessage?: string;
};

@Injectable()
export class CodexService {
  constructor(
    private usersService: UsersService,
    private logger: Logger,
    private db: DbService
  ) {}
  async prewarmCodexAuth(item: {
    userId: string;
  }): Result.ResultAsync<void, PrewarmCodexAuthError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind('auth', v => this.loadAuth({ userId: v.userId })),
      Result.bind('tokens', async v =>
        v.auth.access &&
        v.auth.expires > Date.now() + CODEX_AUTH_REFRESH_BUFFER_MS
          ? Result.succeed(undefined)
          : this.refreshAccessToken({ refreshToken: v.auth.refresh })
      ),
      Result.bind('expiresIn', v =>
        isUndefined(v.tokens)
          ? Result.succeed(undefined)
          : this.validateExpiresIn({ expiresIn: v.tokens.expires_in })
      ),
      Result.bind('accountId', v =>
        Result.succeed(
          isUndefined(v.tokens)
            ? undefined
            : this.extractAccountId({ tokens: v.tokens }) || v.auth.accountId
        )
      ),
      Result.andThrough(v =>
        isUndefined(v.tokens)
          ? Result.succeed()
          : this.persistRefreshedTokens({
              userId: v.userId,
              newState: {
                access: v.tokens.access_token,
                refresh: v.tokens.refresh_token,
                expires: Date.now() + v.expiresIn * 1000,
                accountId: v.accountId
              }
            })
      ),
      Result.map((v): void => undefined)
    );
  }
  async buildCodexFetch(item: {
    userId: string;
    sessionId: string;
  }): Result.ResultAsync<typeof fetch, BuildCodexFetchError> {
    let { userId, sessionId } = item;

    let authResult: Result.Result<CodexAuthOpenai, LoadAuthError> =
      await this.loadAuth({ userId: userId });

    if (Result.isFailure(authResult)) {
      return authResult;
    }

    let auth: CodexAuthOpenai = authResult.value;
    let accessToken = auth.access;
    let accountId = auth.accountId;
    // Reference: external/opencode/packages/opencode/src/plugin/codex.ts lines 589-594
    let userAgent = `mprove/${CODEX_USER_AGENT_VERSION} (${os.platform()} ${os.release()}; ${os.arch()})`;
    // Reference: external/opencode/packages/opencode/src/plugin/codex.ts lines 389-466
    let codexFetch: typeof fetch = async (
      requestInput: RequestInfo | URL,
      init?: RequestInit
    ): Promise<Response> => {
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

    return Result.succeed(codexFetch);
  }
  async getModels(item: { userId: string }): Promise<CodexModelsResult> {
    let { userId } = item;
    try {
      let prewarmAuth: Result.Result<void, PrewarmCodexAuthError> =
        await this.prewarmCodexAuth({ userId: userId });

      if (Result.isFailure(prewarmAuth)) {
        throw new ServerError({
          message: prewarmAuth.error.code,
          customData:
            'customData' in prewarmAuth.error
              ? prewarmAuth.error.customData
              : undefined
        });
      }

      let authResult: Result.Result<CodexAuthOpenai, LoadAuthError> =
        await this.loadAuth({ userId: userId });

      if (Result.isFailure(authResult)) {
        throw new ServerError({ message: authResult.error.code });
      }

      let auth: CodexAuthOpenai = authResult.value;
      if (!isDefinedAndNotEmpty(auth.access)) {
        throw new Error('Codex access token is missing');
      }
      let url: URL = new URL(CODEX_MODELS_ENDPOINT);
      url.searchParams.set('client_version', CODEX_USER_AGENT_VERSION);
      let headers: Headers = new Headers({
        authorization: `Bearer ${auth.access}`,
        originator: CODEX_ORIGINATOR,
        version: CODEX_USER_AGENT_VERSION,
        'User-Agent': `mprove/${CODEX_USER_AGENT_VERSION} (${os.platform()} ${os.release()}; ${os.arch()})`
      });
      if (isDefined(auth.accountId)) {
        headers.set('ChatGPT-Account-Id', auth.accountId);
      }
      let response: Response = await fetch(url, {
        headers: headers,
        signal: AbortSignal.timeout(10000)
      });
      if (!response.ok) {
        throw new Error(`Codex models returned ${response.status}`);
      }
      let responseJson: unknown = await response.json();
      let parsed: {
        models: CodexModel[];
      } = z
        .object({
          models: z.array(zCodexModel)
        })
        .parse(responseJson);
      let codexModels: CodexModel[] = parsed.models.filter(codexModel =>
        isCodexModelAvailable({ codexModel: codexModel })
      );
      let result: CodexModelsResult = {
        codexModels: codexModels
      };
      return result;
    } catch (error) {
      let isInvalidResponse: boolean = error instanceof z.ZodError;
      let isSignInRequired: boolean =
        error instanceof ServerError &&
        error.message === 'BACKEND_CODEX_AUTH_SIGN_IN_REQUIRED';
      let errorDetail: string = isInvalidResponse
        ? 'Codex returned an invalid models response'
        : isSignInRequired
          ? 'Sign in to ChatGPT on your profile page to refresh Codex auth'
          : error instanceof ServerError
            ? 'Codex authentication failed'
            : error instanceof Error
              ? error.message
              : 'Unknown error';
      let errorMessage: string = `Failed to get Codex models: ${errorDetail}`;
      this.logger.warn(errorMessage);
      let result: CodexModelsResult = {
        codexModels: [],
        errorMessage: errorMessage
      };
      return result;
    }
  }
  private validateExpiresIn(item: {
    expiresIn?: number;
  }): Result.Result<number, ValidateExpiresInError> {
    let { expiresIn } = item;

    if (isUndefined(expiresIn)) {
      return Result.fail({
        code: 'BACKEND_CODEX_AUTH_TOKEN_EXPIRES_IN_IS_MISSING'
      });
    }

    if (expiresIn < CODEX_AUTH_REFRESH_BUFFER_SEC) {
      return Result.fail({
        code: 'BACKEND_CODEX_AUTH_TOKEN_EXPIRES_IN_IS_TOO_SHORT',
        customData: {
          expiresInSec: expiresIn,
          minExpiresInSec: CODEX_AUTH_REFRESH_BUFFER_SEC
        }
      });
    }

    return Result.succeed(expiresIn);
  }
  private async loadAuth(item: {
    userId: string;
  }): Result.ResultAsync<CodexAuthOpenai, LoadAuthError> {
    return Result.pipe(
      Result.succeed(item),
      // Always read fresh user data from DB (multi-pod safe)
      Result.bind('user', v =>
        this.usersService.getUserCheckExists({ userId: v.userId })
      ),
      Result.andThen(v =>
        isUndefined(v.user.codexAuth)
          ? Result.fail({ code: 'BACKEND_USER_PROFILE_CODEX_AUTH_NOT_SET' })
          : Result.succeed(v.user.codexAuth.openai)
      )
    );
  }
  // Reference: external/opencode/packages/opencode/src/plugin/codex.ts lines 501-519
  async startDeviceAuth(): Result.ResultAsync<
    CodexDeviceAuthStart,
    StartDeviceAuthError
  > {
    let response: Response = await fetch(
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
      let bodyText: string = await response
        .text()
        .catch(() => '<failed to read body>');

      return Result.fail({
        code: 'BACKEND_CODEX_DEVICE_AUTH_START_FAILED',
        customData: { status: response.status, body: bodyText }
      });
    }
    let parsed: {
      device_auth_id: string;
      user_code: string;
      interval: string;
    } = await response.json();

    let intervalSec: number = Math.max(parseInt(parsed.interval, 10) || 5, 1);

    let codexDeviceAuthStart: CodexDeviceAuthStart = {
      deviceAuthId: parsed.device_auth_id,
      userCode: parsed.user_code,
      intervalSec: intervalSec,
      verificationUrl: CODEX_DEVICE_VERIFICATION_URL
    };

    return Result.succeed(codexDeviceAuthStart);
  }
  // Reference: external/opencode/packages/opencode/src/plugin/codex.ts lines 528-577
  async pollDeviceAuth(item: {
    userId: string;
    deviceAuthId: string;
    userCode: string;
  }): Result.ResultAsync<CodexDeviceAuthStatus, PollDeviceAuthError> {
    let { userId, deviceAuthId, userCode } = item;
    let response: Response = await fetch(
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
      return Result.succeed('Pending');
    }
    if (!response.ok) {
      return Result.succeed('Failed');
    }
    let parsed: {
      authorization_code: string;
      code_verifier: string;
    } = await response.json();
    return Result.pipe(
      Result.succeed({
        userId: userId,
        authorizationCode: parsed.authorization_code,
        codeVerifier: parsed.code_verifier
      }),
      Result.bind('tokens', v =>
        this.exchangeDeviceAuthCode({
          authorizationCode: v.authorizationCode,
          codeVerifier: v.codeVerifier
        })
      ),
      Result.bind('expiresIn', v =>
        this.validateExpiresIn({ expiresIn: v.tokens.expires_in })
      ),
      Result.bind('newState', v => {
        let newState: CodexTokenState = {
          access: v.tokens.access_token,
          refresh: v.tokens.refresh_token,
          expires: Date.now() + v.expiresIn * 1000,
          accountId: this.extractAccountId({ tokens: v.tokens })
        };

        return Result.succeed(newState);
      }),
      Result.andThrough(v =>
        this.persistRefreshedTokens({
          userId: v.userId,
          newState: v.newState
        })
      ),
      Result.map((v): CodexDeviceAuthStatus => 'Authorized')
    );
  }
  // Reference: external/opencode/packages/opencode/src/plugin/codex.ts lines 546-556
  private async exchangeDeviceAuthCode(item: {
    authorizationCode: string;
    codeVerifier: string;
  }): Result.ResultAsync<CodexTokenResponse, ExchangeDeviceAuthCodeError> {
    let { authorizationCode, codeVerifier } = item;
    let response: Response = await fetch(`${CODEX_ISSUER}/oauth/token`, {
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
      let bodyText: string = await response
        .text()
        .catch(() => '<failed to read body>');

      return Result.fail({
        code: 'BACKEND_CODEX_DEVICE_AUTH_START_FAILED',
        customData: { status: response.status, body: bodyText }
      });
    }
    let tokens: CodexTokenResponse = await response.json();

    return Result.succeed(tokens);
  }
  // Reference: external/opencode/packages/opencode/src/plugin/codex.ts lines 131-145

  private async refreshAccessToken(item: {
    refreshToken: string;
  }): Result.ResultAsync<CodexTokenResponse, RefreshAccessTokenError> {
    let { refreshToken } = item;

    let response: Response = await fetch(`${CODEX_ISSUER}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: CODEX_CLIENT_ID
      }).toString()
    });

    if (!response.ok) {
      let bodyText: string = await response
        .text()
        .catch(() => '<failed to read body>');

      let body: unknown;

      try {
        body = JSON.parse(bodyText);
      } catch {
        body = bodyText;
      }

      let isSignInRequired = response.status === 401;

      return isSignInRequired
        ? Result.fail({
            code: 'BACKEND_CODEX_AUTH_SIGN_IN_REQUIRED',
            customData: { status: response.status, body: body }
          })
        : Result.fail({
            code: 'BACKEND_PROMPT_FAILED',
            customData: { status: response.status, body: body }
          });
    }

    let tokens: CodexTokenResponse = await response.json();

    return Result.succeed(tokens);
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
  }): Result.ResultAsync<void, PersistRefreshedTokensError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind('user', v =>
        this.usersService.getUserCheckExists({ userId: v.userId })
      ),
      Result.map(v => {
        v.user.codexAuth = {
          openai: {
            type: 'oauth',
            refresh: v.newState.refresh,
            access: v.newState.access,
            expires: v.newState.expires,
            accountId: v.newState.accountId
          }
        };

        v.user.codexAuthUpdateTs = Date.now();

        v.user.codexAuthExpiresTs = v.newState.expires;
        return v;
      }),
      Result.andThrough(v =>
        this.db.write({ insertOrUpdate: { users: [v.user] } })
      ),
      Result.map((v): void => undefined)
    );
  }
}
