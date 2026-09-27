import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendCompleteUserRegistrationError = BackendError;

export let zToBackendCompleteUserRegistrationError = zBackendError;

assertTypesEqual<
  ToBackendCompleteUserRegistrationError,
  z.infer<typeof zToBackendCompleteUserRegistrationError>
>({ value: true });
