import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendCheckLastNavError = BackendError;

export let zToBackendCheckLastNavError = zBackendError;

assertTypesEqual<
  ToBackendCheckLastNavError,
  z.infer<typeof zToBackendCheckLastNavError>
>({ value: true });
