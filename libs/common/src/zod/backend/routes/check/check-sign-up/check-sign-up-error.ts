import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendCheckSignUpError = BackendError;

export let zToBackendCheckSignUpError = zBackendError;

assertTypesEqual<
  ToBackendCheckSignUpError,
  z.infer<typeof zToBackendCheckSignUpError>
>({ value: true });
