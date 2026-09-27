import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendResetUserPasswordError = BackendError;

export let zToBackendResetUserPasswordError = zBackendError;

assertTypesEqual<
  ToBackendResetUserPasswordError,
  z.infer<typeof zToBackendResetUserPasswordError>
>({ value: true });
