import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendResendUserEmailError = BackendError;

export let zToBackendResendUserEmailError = zBackendError;

assertTypesEqual<
  ToBackendResendUserEmailError,
  z.infer<typeof zToBackendResendUserEmailError>
>({ value: true });
