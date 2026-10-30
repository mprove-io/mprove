import { Result } from '@praha/byethrow';
import { extractCodexAuthAccountId } from '#backend/functions/llm-providers/codex/auth/extract-codex-auth-account-id/extract-codex-auth-account-id';
import {
  type CodexTokenState,
  persistCodexAuthTokens
} from '#backend/functions/llm-providers/codex/auth/persist-codex-auth-tokens/persist-codex-auth-tokens';
import { exchangeCodexAuthDeviceCode } from '#backend/functions/llm-providers/codex/auth/poll-codex-auth-device/exchange-codex-auth-device-code/exchange-codex-auth-device-code';
import { CODEX_ISSUER } from '#backend/functions/llm-providers/codex/auth/start-codex-auth-device/start-codex-auth-device';
import { validateCodexAuthExpiresIn } from '#backend/functions/llm-providers/codex/auth/validate-codex-auth-expires-in/validate-codex-auth-expires-in';
import { CODEX_USER_AGENT_VERSION } from '#backend/functions/llm-providers/codex/build-codex-fetch/build-codex-fetch';
import type { DbService } from '#backend/services/db/db.service';
import type { PollCodexAuthDeviceError } from '#common/types/backend/function-errors/poll-codex-auth-device-error';
import type { CodexDeviceAuthStatus } from '#common/types/backend/parts/codex/codex-device-auth-status';

// Reference: external/opencode/packages/opencode/src/plugin/codex.ts lines 528-577
export async function pollCodexAuthDevice(item: {
  userId: string;
  deviceAuthId: string;
  userCode: string;
  db: DbService;
}): Result.ResultAsync<CodexDeviceAuthStatus, PollCodexAuthDeviceError> {
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
      exchangeCodexAuthDeviceCode({
        authorizationCode: v.authorizationCode,
        codeVerifier: v.codeVerifier
      })
    ),
    Result.bind('expiresIn', v =>
      validateCodexAuthExpiresIn({
        expiresIn: v.tokens.expires_in
      })
    ),
    Result.bind('newState', v => {
      let newState: CodexTokenState = {
        access: v.tokens.access_token,
        refresh: v.tokens.refresh_token,
        expires: Date.now() + v.expiresIn * 1000,
        accountId: extractCodexAuthAccountId({
          tokens: v.tokens
        })
      };

      return Result.succeed(newState);
    }),
    Result.andThrough(v =>
      persistCodexAuthTokens({
        userId: v.userId,
        newState: v.newState,
        db: v.db
      })
    ),
    Result.map((v): CodexDeviceAuthStatus => 'Authorized')
  );
}
