import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendGetUserGivensError = BackendError;

export let zToBackendGetUserGivensError = zBackendError;

assertTypesEqual<
  ToBackendGetUserGivensError,
  z.infer<typeof zToBackendGetUserGivensError>
>({ value: true });
