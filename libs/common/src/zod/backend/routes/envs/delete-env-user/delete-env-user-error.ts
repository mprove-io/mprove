import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendDeleteEnvUserError = BackendError;

export let zToBackendDeleteEnvUserError = zBackendError;

assertTypesEqual<
  ToBackendDeleteEnvUserError,
  z.infer<typeof zToBackendDeleteEnvUserError>
>({ value: true });
