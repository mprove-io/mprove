import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendDeleteFileError = BackendError;

export let zToBackendDeleteFileError = zBackendError;

assertTypesEqual<
  ToBackendDeleteFileError,
  z.infer<typeof zToBackendDeleteFileError>
>({ value: true });
