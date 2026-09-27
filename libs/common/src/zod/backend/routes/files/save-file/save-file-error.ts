import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendSaveFileError = BackendError;

export let zToBackendSaveFileError = zBackendError;

assertTypesEqual<
  ToBackendSaveFileError,
  z.infer<typeof zToBackendSaveFileError>
>({ value: true });
