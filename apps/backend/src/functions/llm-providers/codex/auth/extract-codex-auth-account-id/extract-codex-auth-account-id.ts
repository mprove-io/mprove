import { extractCodexAuthAccountIdFromClaims } from '#backend/functions/llm-providers/codex/auth/extract-codex-auth-account-id/extract-codex-auth-account-id-from-claims/extract-codex-auth-account-id-from-claims';
import { parseJwtClaims } from '#backend/functions/llm-providers/codex/auth/extract-codex-auth-account-id/parse-jwt-claims/parse-jwt-claims';
import type { CodexTokenResponse } from '#backend/functions/llm-providers/codex/auth/poll-codex-auth-device/exchange-codex-auth-device-code/exchange-codex-auth-device-code';

// Reference: external/opencode/packages/opencode/src/plugin/codex.ts lines 59-88
export function extractCodexAuthAccountId(item: {
  tokens: CodexTokenResponse;
}): string | undefined {
  let { tokens } = item;

  if (tokens.id_token) {
    let claims: any = parseJwtClaims({
      token: tokens.id_token
    });

    let accountId = claims
      ? extractCodexAuthAccountIdFromClaims({
          claims: claims
        })
      : undefined;

    if (accountId) {
      return accountId;
    }
  }

  if (tokens.access_token) {
    let claims: any = parseJwtClaims({
      token: tokens.access_token
    });

    return claims
      ? extractCodexAuthAccountIdFromClaims({
          claims: claims
        })
      : undefined;
  }

  return undefined;
}
