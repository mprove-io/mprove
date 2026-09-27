import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendGetQueriesError = BackendError;

export let zToBackendGetQueriesError = zBackendError;

assertTypesEqual<
  ToBackendGetQueriesError,
  z.infer<typeof zToBackendGetQueriesError>
>({ value: true });
