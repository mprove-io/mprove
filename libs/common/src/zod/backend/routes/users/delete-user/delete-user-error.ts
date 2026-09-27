import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendDeleteUserError = BackendError;

export let zToBackendDeleteUserError = zBackendError;

assertTypesEqual<
  ToBackendDeleteUserError,
  z.infer<typeof zToBackendDeleteUserError>
>({ value: true });
