import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendSetUserUiError = BackendError;

export let zToBackendSetUserUiError = zBackendError;

assertTypesEqual<
  ToBackendSetUserUiError,
  z.infer<typeof zToBackendSetUserUiError>
>({ value: true });
