import { Result } from '@praha/byethrow';
import {
  CODEX_CLIENT_ID,
  CODEX_ISSUER
} from '#backend/functions/llm-providers/codex/auth/start-codex-auth-device/start-codex-auth-device';
import type { ExchangeCodexAuthDeviceCodeError } from '#common/types/backend/function-errors/exchange-codex-auth-device-code-error';

export type CodexTokenResponse = {
  id_token: string;
  access_token: string;
  refresh_token: string;
  expires_in?: number;
};

const CODEX_DEVICE_REDIRECT_URI = `${CODEX_ISSUER}/deviceauth/callback`;

// Reference: external/opencode/packages/opencode/src/plugin/codex.ts lines 546-556
export async function exchangeCodexAuthDeviceCode(item: {
  authorizationCode: string;
  codeVerifier: string;
}): Result.ResultAsync<CodexTokenResponse, ExchangeCodexAuthDeviceCodeError> {
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
