import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendSetUserNameError = BackendError;

export let zToBackendSetUserNameError = zBackendError;

assertTypesEqual<
  ToBackendSetUserNameError,
  z.infer<typeof zToBackendSetUserNameError>
>({ value: true });
