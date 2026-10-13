import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendSandboxOpencodeRefreshFailedError,
  zBackendSandboxOpencodeRefreshFailedError
} from '#common/types/backend/errors/backend-sandbox-opencode-refresh-failed-error';

export type RestartOpencodeServerError =
  BackendSandboxOpencodeRefreshFailedError;

export let zRestartOpencodeServerError =
  zBackendSandboxOpencodeRefreshFailedError;

assertTypesEqual<
  RestartOpencodeServerError,
  z.infer<typeof zRestartOpencodeServerError>
>({ value: true });
