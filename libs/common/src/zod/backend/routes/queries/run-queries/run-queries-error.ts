import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendRunQueriesError = BackendError;

export let zToBackendRunQueriesError = zBackendError;

assertTypesEqual<
  ToBackendRunQueriesError,
  z.infer<typeof zToBackendRunQueriesError>
>({ value: true });
