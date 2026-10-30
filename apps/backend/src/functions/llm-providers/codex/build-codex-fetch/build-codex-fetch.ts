import os from 'node:os';
import { Result } from '@praha/byethrow';
import { backendPackageJson } from '#backend/backend-package-json';
import { loadCodexAuth } from '#backend/functions/llm-providers/codex/auth/load-codex-auth/load-codex-auth';
import type { DbService } from '#backend/services/db/db.service';
import type { BuildCodexFetchError } from '#common/types/backend/function-errors/build-codex-fetch-error';
import type { LoadCodexAuthError } from '#common/types/backend/function-errors/load-codex-auth-error';
import type { CodexAuthOpenai } from '#common/types/backend/parts/codex/codex-auth-openai';

export const CODEX_USER_AGENT_VERSION: string = backendPackageJson.version;

// Reference: external/opencode/packages/opencode/src/plugin/codex.ts lines 589-594
export const CODEX_ORIGINATOR = 'mprove';

const CODEX_API_ENDPOINT = 'https://chatgpt.com/backend-api/codex/responses';

export async function buildCodexFetch(item: {
  userId: string;
  sessionId: string;
  db: DbService;
}): Result.ResultAsync<typeof fetch, BuildCodexFetchError> {
  let { userId, sessionId, db } = item;

  let authResult: Result.Result<CodexAuthOpenai, LoadCodexAuthError> =
    await loadCodexAuth({
      userId: userId,
      db: db
    });

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
    let headers: Headers = new Headers();

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
