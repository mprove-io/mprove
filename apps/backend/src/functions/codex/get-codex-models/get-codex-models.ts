import os from 'node:os';
import type { Logger } from '@nestjs/common';
import { Result } from '@praha/byethrow';
import { z } from 'zod';
import {
  CODEX_ORIGINATOR,
  CODEX_USER_AGENT_VERSION
} from '#backend/functions/codex/build-codex-fetch/build-codex-fetch';
import { isCodexModelAvailable } from '#backend/functions/codex/get-codex-models/is-codex-model-available/is-codex-model-available';
import { loadAuth } from '#backend/functions/codex/load-auth/load-auth';
import { prewarmCodexAuth } from '#backend/functions/codex/prewarm-codex-auth/prewarm-codex-auth';
import type { DbService } from '#backend/services/db/db.service';
import { ServerError } from '#common/classes/server-error/server-error';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isDefinedAndNotEmpty } from '#common/functions/is-defined-and-not-empty/is-defined-and-not-empty';
import type { LoadAuthError } from '#common/types/backend/function-errors/load-auth-error';
import type { PrewarmCodexAuthError } from '#common/types/backend/function-errors/prewarm-codex-auth-error';
import type { CodexAuthOpenai } from '#common/types/backend/parts/codex/codex-auth-openai';
import {
  type CodexModel,
  zCodexModel
} from '#common/types/backend/parts/codex/codex-model';

export type GetCodexModelsOutput = {
  codexModels: CodexModel[];
  errorMessage?: string;
};

const CODEX_MODELS_ENDPOINT = 'https://chatgpt.com/backend-api/codex/models';

export async function getCodexModels(item: {
  userId: string;
  logger: Logger;
  db: DbService;
}): Promise<GetCodexModelsOutput> {
  let { userId, logger, db } = item;

  try {
    let prewarmAuth: Result.Result<void, PrewarmCodexAuthError> =
      await prewarmCodexAuth({
        userId: userId,
        db: db
      });

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
      await loadAuth({
        userId: userId,
        db: db
      });

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
      isCodexModelAvailable({
        codexModel: codexModel
      })
    );

    let result: GetCodexModelsOutput = {
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

    logger.warn(errorMessage);

    let result: GetCodexModelsOutput = {
      codexModels: [],
      errorMessage: errorMessage
    };

    return result;
  }
}
