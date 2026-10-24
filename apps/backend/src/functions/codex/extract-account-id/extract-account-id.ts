import { extractAccountIdFromClaims } from '#backend/functions/codex/extract-account-id/extract-account-id-from-claims/extract-account-id-from-claims';
import { parseJwtClaims } from '#backend/functions/codex/extract-account-id/parse-jwt-claims/parse-jwt-claims';
import type { CodexTokenResponse } from '#backend/functions/codex/poll-device-auth/exchange-device-auth-code/exchange-device-auth-code';

// Reference: external/opencode/packages/opencode/src/plugin/codex.ts lines 59-88
export function extractAccountId(item: {
  tokens: CodexTokenResponse;
}): string | undefined {
  let { tokens } = item;

  if (tokens.id_token) {
    let claims: any = parseJwtClaims({
      token: tokens.id_token
    });

    let accountId = claims
      ? extractAccountIdFromClaims({
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
      ? extractAccountIdFromClaims({
          claims: claims
        })
      : undefined;
  }

  return undefined;
}
