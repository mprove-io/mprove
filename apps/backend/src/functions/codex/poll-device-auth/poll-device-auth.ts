import { Result } from '@praha/byethrow';
import { CODEX_USER_AGENT_VERSION } from '#backend/functions/codex/build-codex-fetch/build-codex-fetch';
import { extractAccountId } from '#backend/functions/codex/extract-account-id/extract-account-id';
import {
  type CodexTokenState,
  persistRefreshedTokens
} from '#backend/functions/codex/persist-refreshed-tokens/persist-refreshed-tokens';
import { exchangeDeviceAuthCode } from '#backend/functions/codex/poll-device-auth/exchange-device-auth-code/exchange-device-auth-code';
import { CODEX_ISSUER } from '#backend/functions/codex/start-device-auth/start-device-auth';
import { validateExpiresIn } from '#backend/functions/codex/validate-expires-in/validate-expires-in';
import type { DbService } from '#backend/services/db/db.service';
import type { PollDeviceAuthError } from '#common/types/backend/function-errors/poll-device-auth-error';
import type { CodexDeviceAuthStatus } from '#common/types/backend/parts/codex/codex-device-auth-status';

// Reference: external/opencode/packages/opencode/src/plugin/codex.ts lines 528-577
export async function pollDeviceAuth(item: {
  userId: string;
  deviceAuthId: string;
  userCode: string;
  db: DbService;
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
      codeVerifier: parsed.code_verifier,
      db: item.db
    }),
    Result.bind('tokens', v =>
      exchangeDeviceAuthCode({
        authorizationCode: v.authorizationCode,
        codeVerifier: v.codeVerifier
      })
    ),
    Result.bind('expiresIn', v =>
      validateExpiresIn({
        expiresIn: v.tokens.expires_in
      })
    ),
    Result.bind('newState', v => {
      let newState: CodexTokenState = {
        access: v.tokens.access_token,
        refresh: v.tokens.refresh_token,
        expires: Date.now() + v.expiresIn * 1000,
        accountId: extractAccountId({
          tokens: v.tokens
        })
      };

      return Result.succeed(newState);
    }),
    Result.andThrough(v =>
      persistRefreshedTokens({
        userId: v.userId,
        newState: v.newState,
        db: v.db
      })
    ),
    Result.map((v): CodexDeviceAuthStatus => 'Authorized')
  );
}
