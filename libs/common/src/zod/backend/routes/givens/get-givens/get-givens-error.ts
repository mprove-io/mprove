import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendGetGivensError = BackendError;

export let zToBackendGetGivensError = zBackendError;

assertTypesEqual<
  ToBackendGetGivensError,
  z.infer<typeof zToBackendGetGivensError>
>({ value: true });
