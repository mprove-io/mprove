import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendDeleteUserApiKeyError = BackendError;

export let zToBackendDeleteUserApiKeyError = zBackendError;

assertTypesEqual<
  ToBackendDeleteUserApiKeyError,
  z.infer<typeof zToBackendDeleteUserApiKeyError>
>({ value: true });
