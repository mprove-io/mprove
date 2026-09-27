import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendDeleteProjectError = BackendError;

export let zToBackendDeleteProjectError = zBackendError;

assertTypesEqual<
  ToBackendDeleteProjectError,
  z.infer<typeof zToBackendDeleteProjectError>
>({ value: true });
