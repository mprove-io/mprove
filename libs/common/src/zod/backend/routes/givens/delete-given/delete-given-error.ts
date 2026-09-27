import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendDeleteGivenError = BackendError;

export let zToBackendDeleteGivenError = zBackendError;

assertTypesEqual<
  ToBackendDeleteGivenError,
  z.infer<typeof zToBackendDeleteGivenError>
>({ value: true });
