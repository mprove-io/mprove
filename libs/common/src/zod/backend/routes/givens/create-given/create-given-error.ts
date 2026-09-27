import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendCreateGivenError = BackendError;

export let zToBackendCreateGivenError = zBackendError;

assertTypesEqual<
  ToBackendCreateGivenError,
  z.infer<typeof zToBackendCreateGivenError>
>({ value: true });
