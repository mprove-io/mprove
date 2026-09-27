import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendGetStructError = BackendError;

export let zToBackendGetStructError = zBackendError;

assertTypesEqual<
  ToBackendGetStructError,
  z.infer<typeof zToBackendGetStructError>
>({ value: true });
