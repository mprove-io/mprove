import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendStartUserCodexAuthError = BackendError;

export let zToBackendStartUserCodexAuthError = zBackendError;

assertTypesEqual<
  ToBackendStartUserCodexAuthError,
  z.infer<typeof zToBackendStartUserCodexAuthError>
>({ value: true });
