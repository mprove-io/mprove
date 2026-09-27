import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendGetQueryError = BackendError;

export let zToBackendGetQueryError = zBackendError;

assertTypesEqual<
  ToBackendGetQueryError,
  z.infer<typeof zToBackendGetQueryError>
>({ value: true });
