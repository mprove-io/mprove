import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendSeedRecordsError = BackendError;

export let zToBackendSeedRecordsError = zBackendError;

assertTypesEqual<
  ToBackendSeedRecordsError,
  z.infer<typeof zToBackendSeedRecordsError>
>({ value: true });
