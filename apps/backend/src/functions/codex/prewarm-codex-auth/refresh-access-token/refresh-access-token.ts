import { Result } from '@praha/byethrow';
import type { CodexTokenResponse } from '#backend/functions/codex/poll-device-auth/exchange-device-auth-code/exchange-device-auth-code';
import {
  CODEX_CLIENT_ID,
  CODEX_ISSUER
} from '#backend/functions/codex/start-device-auth/start-device-auth';
import type { RefreshAccessTokenError } from '#common/types/backend/function-errors/refresh-access-token-error';

// Reference: external/opencode/packages/opencode/src/plugin/codex.ts lines 131-145
export async function refreshAccessToken(item: {
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
