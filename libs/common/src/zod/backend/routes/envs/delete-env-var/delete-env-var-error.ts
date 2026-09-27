import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendDeleteEnvVarError = BackendError;

export let zToBackendDeleteEnvVarError = zBackendError;

assertTypesEqual<
  ToBackendDeleteEnvVarError,
  z.infer<typeof zToBackendDeleteEnvVarError>
>({ value: true });
