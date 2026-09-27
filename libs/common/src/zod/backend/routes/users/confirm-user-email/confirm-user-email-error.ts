import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendConfirmUserEmailError = BackendError;

export let zToBackendConfirmUserEmailError = zBackendError;

assertTypesEqual<
  ToBackendConfirmUserEmailError,
  z.infer<typeof zToBackendConfirmUserEmailError>
>({ value: true });
