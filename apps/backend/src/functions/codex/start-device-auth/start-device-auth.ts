import { Result } from '@praha/byethrow';
import { CODEX_USER_AGENT_VERSION } from '#backend/functions/codex/build-codex-fetch/build-codex-fetch';
import type { StartDeviceAuthError } from '#common/types/backend/function-errors/start-device-auth-error';

export type CodexDeviceAuthStart = {
  deviceAuthId: string;
  userCode: string;
  intervalSec: number;
  verificationUrl: string;
};

export const CODEX_ISSUER = 'https://auth.openai.com';

const CODEX_DEVICE_VERIFICATION_URL = `${CODEX_ISSUER}/codex/device`;

// Reference: external/opencode/packages/opencode/src/plugin/codex.ts
export const CODEX_CLIENT_ID = 'app_EMoamEEZ73f0CkXaXp7hrann';

// Reference: external/opencode/packages/opencode/src/plugin/codex.ts lines 501-519
export async function startDeviceAuth(): Result.ResultAsync<
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
