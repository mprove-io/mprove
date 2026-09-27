import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendGetReportsError = BackendError;

export let zToBackendGetReportsError = zBackendError;

assertTypesEqual<
  ToBackendGetReportsError,
  z.infer<typeof zToBackendGetReportsError>
>({ value: true });
